import { google } from 'googleapis';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(new URL('/', url.origin)); // Redirect if no code
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    console.error('Missing Google API credentials in environment variables.');
    return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 });
  }

  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    redirectUri
  );

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // TODO: Securely store the tokens (access_token, refresh_token, expiry_date)
    // In a real application, you would associate these tokens with a user in your database.
    console.log('Successfully obtained tokens:', tokens);

    // Redirect the user back to the main page or a success page
    return NextResponse.redirect(new URL('/', url.origin));

  } catch (error) {
    console.error('Error exchanging authorization code for tokens:', error);
    return NextResponse.json({ error: 'Authentication failed.' }, { status: 500 });
  }
}