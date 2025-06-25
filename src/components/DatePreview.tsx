'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { GoogleCalendarIcon } from '@/components/icons/GoogleCalendarIcon';
import { Check, Link, UploadCloud, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export interface ExtractedDate {
  date: string;
  type: string;
  description: string;
}

interface DatePreviewProps {
  dates: ExtractedDate[];
  fileName: string;
  onAddToCalendar: () => void;
  onReset: () => void;
  courseName: string;
}

export function DatePreview({ dates, fileName, onAddToCalendar, onReset, courseName }: DatePreviewProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const { toast } = useToast();
  
  const handleConnect = () => {
    // Save extracted events, file name, and course name to localStorage
    localStorage.setItem('pending_events', JSON.stringify(dates));
    localStorage.setItem('pending_file_name', fileName);
    localStorage.setItem('pending_course_name', courseName);
    window.location.href = '/api/auth/google';
  };

  const handleAddEvents = async () => {
    setIsAdding(true);
    setAuthError(null);

    try {
      // Get stored tokens
      const storedTokens = localStorage.getItem('google_tokens');
      if (!storedTokens) {
        throw new Error('No authentication tokens found. Please connect your Google Calendar first.');
      }

      const tokens = JSON.parse(storedTokens);
      
      // Check if token is expired
      if (tokens.expiry_date && Date.now() > tokens.expiry_date) {
        localStorage.removeItem('google_tokens');
        throw new Error('Authentication expired. Please reconnect your Google Calendar.');
      }

      // Convert dates to calendar events
      const events = dates.map(date => ({
        summary: `${date.type}: ${date.description}`,
        description: `From syllabus: ${fileName}`,
        start: {
          date: format(new Date(date.date), 'yyyy-MM-dd'),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        end: {
          date: format(new Date(date.date), 'yyyy-MM-dd'),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 }, // 1 day before
            { method: 'popup', minutes: 60 }, // 1 hour before
          ],
        },
      }));

      // Send events to API
      const response = await fetch('/api/calendar/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          events,
          tokens,
          courseName,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add events to calendar');
      }

      const result = await response.json();
      
      if (result.successfulEvents > 0) {
        onAddToCalendar();
        toast({
          title: 'Events Added Successfully!',
          description: `${result.successfulEvents} out of ${result.totalEvents} events were added to your Google Calendar.`,
          variant: 'default',
          className: 'bg-green-600 text-white border-green-700',
        });
      } else {
        throw new Error('No events were added to the calendar');
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setAuthError(errorMessage);
      toast({
        title: 'Failed to Add Events',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsAdding(false);
    }
  };

  const isAuthenticated = () => {
    const storedTokens = localStorage.getItem('google_tokens');
    if (!storedTokens) return false;
    
    try {
      const tokens = JSON.parse(storedTokens);
      if (tokens.expiry_date && Date.now() > tokens.expiry_date) {
        localStorage.removeItem('google_tokens');
        return false;
      }
      return true;
    } catch {
      return false;
    }
  };

  const getBadgeVariant = (type: string) => {
    if (type.toLowerCase().includes('test') || type.toLowerCase().includes('exam')) {
      return 'destructive';
    }
    if (type.toLowerCase().includes('assignment') || type.toLowerCase().includes('proposal') || type.toLowerCase().includes('report')) {
      return 'default';
    }
    return 'secondary';
  };

  return (
    <Card className="w-full animate-fade-in-up shadow-2xl shadow-primary/10">
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle className="text-2xl">Extracted Schedule</CardTitle>
                <CardDescription>From: {fileName}</CardDescription>
            </div>
            <Button variant="ghost" onClick={onReset}>
                <UploadCloud className="mr-2 h-4 w-4" />
                Upload New
            </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="max-h-[40vh] overflow-y-auto pr-2">
            <Table>
                <TableHeader className="sticky top-0 bg-card z-10">
                    <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {dates.map((item, index) => (
                    <TableRow key={index}>
                        <TableCell className="font-medium whitespace-nowrap">{format(new Date(item.date), 'EEE, MMM d, yyyy')}</TableCell>
                        <TableCell>
                        <Badge variant={getBadgeVariant(item.type)}>{item.type}</Badge>
                        </TableCell>
                        <TableCell>{item.description}</TableCell>
                    </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-muted/50 p-6 rounded-b-lg">
        <p className="text-sm text-muted-foreground">{dates.length} events found. Ready to add them to your calendar?</p>
        
        {authError && (
          <div className="w-full mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{authError}</span>
            </div>
          </div>
        )}
        
        <div className="flex gap-2">
          {!isAuthenticated() ? (
            <Button onClick={handleConnect} variant="secondary">
              <GoogleCalendarIcon className="mr-2 h-5 w-5" /> Connect Google Calendar
            </Button>
          ) : (
            <div className="flex items-center gap-2 text-sm font-medium text-green-600 p-2 rounded-md bg-green-100">
                <Check />
                <span>Google Calendar Connected</span>
            </div>
          )}
          <Button 
            onClick={handleAddEvents} 
            disabled={!isAuthenticated() || isAdding} 
            className="bg-gradient-to-r from-primary to-primary/80 text-white"
          >
            {isAdding ? 'Adding Events...' : 'Add to Calendar'}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
