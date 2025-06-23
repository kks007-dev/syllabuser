'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { GoogleCalendarIcon } from '@/components/icons/GoogleCalendarIcon';
import { Check, Link, UploadCloud } from 'lucide-react';

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
}

export function DatePreview({ dates, fileName, onAddToCalendar, onReset }: DatePreviewProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  
  const handleConnect = () => {
    // Simulate OAuth flow
    setIsConnected(true);
  };

  const handleAddEvents = () => {
    setIsAdding(true);
    setTimeout(() => {
      onAddToCalendar();
      setIsAdding(false);
    }, 1500);
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
        <div className="flex gap-2">
          {!isConnected ? (
            <Button onClick={handleConnect} variant="secondary">
              <GoogleCalendarIcon className="mr-2 h-5 w-5" /> Connect Google Calendar
            </Button>
          ) : (
            <div className="flex items-center gap-2 text-sm font-medium text-green-600 p-2 rounded-md bg-green-100">
                <Check />
                <span>Google Calendar Connected</span>
            </div>
          )}
          <Button onClick={handleAddEvents} disabled={!isConnected || isAdding} className="bg-gradient-to-r from-primary to-primary/80 text-white">
            {isAdding ? 'Adding Events...' : 'Add to Calendar'}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
