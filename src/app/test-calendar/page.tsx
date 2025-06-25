'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle } from 'lucide-react';

export default function TestCalendarPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const checkAuthStatus = () => {
    const storedTokens = localStorage.getItem('google_tokens');
    if (storedTokens) {
      try {
        const tokens = JSON.parse(storedTokens);
        if (tokens.expiry_date && Date.now() > tokens.expiry_date) {
          localStorage.removeItem('google_tokens');
          setIsAuthenticated(false);
        } else {
          setIsAuthenticated(true);
        }
      } catch {
        setIsAuthenticated(false);
      }
    } else {
      setIsAuthenticated(false);
    }
  };

  const testCalendarConnection = async () => {
    setIsLoading(true);
    setTestResult(null);

    try {
      const storedTokens = localStorage.getItem('google_tokens');
      if (!storedTokens) {
        throw new Error('No authentication tokens found');
      }

      const tokens = JSON.parse(storedTokens);
      
      // Test with a simple event
      const testEvent = {
        summary: 'Test Event - Syllabus Calendar',
        description: 'This is a test event to verify Google Calendar integration',
        start: {
          date: new Date().toISOString().split('T')[0],
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        end: {
          date: new Date().toISOString().split('T')[0],
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
      };

      const response = await fetch('/api/calendar/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          events: [testEvent],
          tokens,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create test event');
      }

      const result = await response.json();
      setTestResult(`Success! Test event created. ${result.successfulEvents} events added.`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setTestResult(`Error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const connectGoogleCalendar = () => {
    window.location.href = '/api/auth/google';
  };

  const logout = () => {
    localStorage.removeItem('google_tokens');
    setIsAuthenticated(false);
    setTestResult(null);
  };

  // Check auth status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Google Calendar Integration Test</CardTitle>
            <CardDescription>
              Test the Google Calendar API integration and authentication
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Authentication Status:</span>
              <div className="flex items-center gap-2">
                {isAuthenticated ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-green-600">Connected</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <span className="text-red-600">Not Connected</span>
                  </>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              {!isAuthenticated ? (
                <Button onClick={connectGoogleCalendar}>
                  Connect Google Calendar
                </Button>
              ) : (
                <>
                  <Button onClick={testCalendarConnection} disabled={isLoading}>
                    {isLoading ? 'Testing...' : 'Test Calendar Connection'}
                  </Button>
                  <Button onClick={logout} variant="outline">
                    Disconnect
                  </Button>
                </>
              )}
            </div>

            {testResult && (
              <Alert>
                <AlertDescription>{testResult}</AlertDescription>
              </Alert>
            )}

            <div className="mt-8 p-4 bg-muted rounded-lg">
              <h3 className="font-medium mb-2">Setup Instructions:</h3>
              <ol className="text-sm space-y-1 list-decimal list-inside">
                <li>Make sure you have set up your Google Cloud Console credentials</li>
                <li>Add your credentials to the .env.local file</li>
                <li>Click "Connect Google Calendar" to authenticate</li>
                <li>Click "Test Calendar Connection" to verify the integration</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 