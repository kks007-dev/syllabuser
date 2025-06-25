'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export interface GoogleTokens {
  access_token: string;
  refresh_token?: string;
  scope: string;
  token_type: string;
  expiry_date?: number;
}

export const useGoogleAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [tokens, setTokens] = useState<GoogleTokens | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();

  // Check for authentication success on mount
  useEffect(() => {
    const authSuccess = searchParams.get('auth_success');
    const authError = searchParams.get('auth_error');

    if (authSuccess === 'true') {
      const newTokens: GoogleTokens = {
        access_token: searchParams.get('access_token') || '',
        refresh_token: searchParams.get('refresh_token') || undefined,
        scope: searchParams.get('scope') || '',
        token_type: searchParams.get('token_type') || '',
        expiry_date: searchParams.get('expiry_date') ? parseInt(searchParams.get('expiry_date')!) : undefined,
      };

      if (newTokens.access_token) {
        setTokens(newTokens);
        setIsAuthenticated(true);
        localStorage.setItem('google_tokens', JSON.stringify(newTokens));
        
        // Clean up URL params
        const url = new URL(window.location.href);
        url.search = '';
        window.history.replaceState({}, '', url.toString());
      }
    } else if (authError === 'true') {
      console.error('Google authentication failed');
      setIsAuthenticated(false);
      
      // Clean up URL params
      const url = new URL(window.location.href);
      url.search = '';
      window.history.replaceState({}, '', url.toString());
    }
  }, [searchParams]);

  // Check for existing tokens on mount
  useEffect(() => {
    const storedTokens = localStorage.getItem('google_tokens');
    if (storedTokens) {
      try {
        const parsedTokens: GoogleTokens = JSON.parse(storedTokens);
        
        // Check if token is expired
        if (parsedTokens.expiry_date && Date.now() > parsedTokens.expiry_date) {
          localStorage.removeItem('google_tokens');
          setIsAuthenticated(false);
          setTokens(null);
        } else {
          setTokens(parsedTokens);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Error parsing stored tokens:', error);
        localStorage.removeItem('google_tokens');
      }
    }
  }, []);

  const initiateAuth = () => {
    setIsLoading(true);
    window.location.href = '/api/auth/google';
  };

  const logout = () => {
    localStorage.removeItem('google_tokens');
    setTokens(null);
    setIsAuthenticated(false);
  };

  const addEventsToCalendar = async (events: any[]) => {
    if (!tokens) {
      throw new Error('No authentication tokens available');
    }

    try {
      const response = await fetch('/api/calendar/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          events,
          tokens,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add events to calendar');
      }

      return await response.json();
    } catch (error) {
      console.error('Error adding events to calendar:', error);
      throw error;
    }
  };

  return {
    isAuthenticated,
    tokens,
    isLoading,
    initiateAuth,
    logout,
    addEventsToCalendar,
  };
}; 