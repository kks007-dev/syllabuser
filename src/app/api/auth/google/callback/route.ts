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

    // Redirect back to the main page with tokens in URL params for client-side storage
    const redirectUrl = new URL('/', url.origin);
    redirectUrl.searchParams.set('auth_success', 'true');
    redirectUrl.searchParams.set('access_token', tokens.access_token || '');
    if (tokens.refresh_token) {
      redirectUrl.searchParams.set('refresh_token', tokens.refresh_token);
    }
    redirectUrl.searchParams.set('scope', tokens.scope || '');
    redirectUrl.searchParams.set('token_type', tokens.token_type || '');
    if (tokens.expiry_date) {
      redirectUrl.searchParams.set('expiry_date', tokens.expiry_date.toString());
    }

    return NextResponse.redirect(redirectUrl);

  } catch (error) {
    console.error('Error exchanging authorization code for tokens:', error);
    const errorUrl = new URL('/', url.origin);
    errorUrl.searchParams.set('auth_error', 'true');
    return NextResponse.redirect(errorUrl);
  }
}