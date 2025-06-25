# Syllabus Calendar Generator

A Next.js application that extracts important dates from syllabi and adds them to Google Calendar.

## Features

- Upload and analyze syllabus documents
- Extract important dates (exams, assignments, deadlines)
- Connect to Google Calendar via OAuth
- Automatically add events to your Google Calendar
- Modern, responsive UI with animations

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Google Calendar API Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Calendar API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Calendar API"
   - Click on it and press "Enable"

4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Choose "Web application"
   - Add authorized redirect URIs:
     - `http://localhost:9002/api/auth/google/callback` (for development)
     - `https://yourdomain.com/api/auth/google/callback` (for production)

5. Copy your Client ID and Client Secret

### 3. Environment Variables

Create a `.env.local` file in the root directory:

```env
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:9002/api/auth/google/callback
```

### 4. Run the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:9002`.

## Usage

1. Upload a syllabus document (PDF, DOCX, or TXT)
2. Wait for the AI to extract important dates
3. Click "Connect Google Calendar" to authenticate
4. Click "Add to Calendar" to add all events to your Google Calendar

## API Routes

- `GET /api/auth/google` - Initiates Google OAuth flow
- `GET /api/auth/google/callback` - Handles OAuth callback and token exchange
- `POST /api/calendar/events` - Creates calendar events using Google Calendar API

## Technologies Used

- Next.js 15
- React 18
- TypeScript
- Tailwind CSS
- Framer Motion
- Google Calendar API
- Google OAuth 2.0

## Development

```bash
# Run development server
npm run dev

# Run type checking
npm run typecheck

# Run linting
npm run lint

# Build for production
npm run build
```

## Security Notes

- OAuth tokens are stored in localStorage (for demo purposes)
- In production, consider using secure server-side session management
- Always use HTTPS in production
- Implement proper token refresh mechanisms for production use
