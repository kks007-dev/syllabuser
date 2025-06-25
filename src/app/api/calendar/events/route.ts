import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';

export interface CalendarEvent {
  summary: string;
  description?: string;
  start: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  reminders?: {
    useDefault: boolean;
    overrides?: Array<{
      method: string;
      minutes: number;
    }>;
  };
}

export async function POST(request: NextRequest) {
  try {
    const { events, tokens, courseName } = await request.json();

    if (!tokens || !tokens.access_token) {
      return NextResponse.json(
        { error: 'No valid authentication tokens provided' },
        { status: 401 }
      );
    }

    if (!events || !Array.isArray(events)) {
      return NextResponse.json(
        { error: 'No events provided or invalid format' },
        { status: 400 }
      );
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI;

    if (!clientId || !clientSecret || !redirectUri) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      redirectUri
    );

    oauth2Client.setCredentials(tokens);
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // Use courseName as calendar name, fallback to 'Syllabus Events', and truncate to 100 chars
    const CALENDAR_SUMMARY = (courseName || 'Syllabus Events').slice(0, 100);
    const CALENDAR_DESCRIPTION = 'All syllabus-related events'.slice(0, 1024);

    // 1. Check if the calendar already exists
    let calendarId: string | null = null;
    const calendarList = await calendar.calendarList.list();
    const existing = calendarList.data.items?.find(
      (cal) => cal.summary === CALENDAR_SUMMARY
    );
    if (existing && existing.id) {
      calendarId = existing.id;
    } else {
      // 2. Create the calendar if it doesn't exist
      const newCal = await calendar.calendars.insert({
        requestBody: {
          summary: CALENDAR_SUMMARY,
          description: CALENDAR_DESCRIPTION,
        },
      });
      calendarId = newCal.data.id || '';
    }

    // 3. Add events to the new calendar
    const results = [];
    for (const event of events) {
      try {
        const response = await calendar.events.insert({
          calendarId,
          requestBody: event,
        });
        results.push({
          success: true,
          event: response.data,
          summary: event.summary,
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        results.push({
          success: false,
          error: errorMessage,
          summary: event.summary,
        });
      }
    }

    const successfulEvents = results.filter((r) => r.success);
    const failedEvents = results.filter((r) => !r.success);

    return NextResponse.json({
      success: true,
      totalEvents: events.length,
      successfulEvents: successfulEvents.length,
      failedEvents: failedEvents.length,
      results,
      calendarId,
    });
  } catch (error) {
    console.error('Error in calendar events API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 