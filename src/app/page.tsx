'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { SyllabusUpload } from '@/components/SyllabusUpload';
import { DatePreview, type ExtractedDate } from '@/components/DatePreview';
import { processSyllabus } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

type AppStep = 'upload' | 'loading' | 'preview' | 'error';

export default function Home() {
  const [step, setStep] = useState<AppStep>('upload');
  const [extractedDates, setExtractedDates] = useState<ExtractedDate[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [courseName, setCourseName] = useState<string>('Syllabus Events');
  const { toast } = useToast();
  const [userName, setUserName] = useState<string>('');
  const [nameSubmitted, setNameSubmitted] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const [typedName, setTypedName] = useState('');
  const [typing, setTyping] = useState(false);

  // Handle authentication success/error from URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const authSuccess = urlParams.get('auth_success');
    const authError = urlParams.get('auth_error');

    if (authSuccess === 'true') {
      // Store tokens from URL params
      const tokens = {
        access_token: urlParams.get('access_token') || '',
        refresh_token: urlParams.get('refresh_token') || undefined,
        scope: urlParams.get('scope') || '',
        token_type: urlParams.get('token_type') || '',
        expiry_date: urlParams.get('expiry_date') ? parseInt(urlParams.get('expiry_date')!) : undefined,
      };

      if (tokens.access_token) {
        localStorage.setItem('google_tokens', JSON.stringify(tokens));
        toast({
          title: 'Google Calendar Connected!',
          description: 'You can now add events to your calendar.',
          variant: 'default',
          className: 'bg-green-600 text-white border-green-700',
        });
      }

      // Restore pending events if present
      const pendingEvents = localStorage.getItem('pending_events');
      const pendingFileName = localStorage.getItem('pending_file_name');
      const pendingCourseName = localStorage.getItem('pending_course_name');
      if (pendingEvents && pendingFileName) {
        setExtractedDates(JSON.parse(pendingEvents));
        setFileName(pendingFileName);
        setCourseName(pendingCourseName || 'Syllabus Events');
        setStep('preview');
        // Clean up
        localStorage.removeItem('pending_events');
        localStorage.removeItem('pending_file_name');
        localStorage.removeItem('pending_course_name');
      }

      // Clean up URL params
      const url = new URL(window.location.href);
      url.search = '';
      window.history.replaceState({}, '', url.toString());
    } else if (authError === 'true') {
      toast({
        title: 'Authentication Failed',
        description: 'Failed to connect to Google Calendar. Please try again.',
        variant: 'destructive',
      });

      // Clean up URL params
      const url = new URL(window.location.href);
      url.search = '';
      window.history.replaceState({}, '', url.toString());
    }
  }, [toast]);

  // Load name from localStorage if present
  useEffect(() => {
    const storedName = localStorage.getItem('user_name');
    if (storedName) {
      setUserName(storedName);
      setNameSubmitted(true);
      setShowWelcome(true);
    }
  }, []);

  // Typewriter effect for greeting
  useEffect(() => {
    if (nameSubmitted && userName && !showWelcome) {
      setTyping(true);
      let i = 0;
      setTypedName('');
      const interval = setInterval(() => {
        setTypedName((prev) => prev + userName[i]);
        i++;
        if (i >= userName.length) {
          clearInterval(interval);
          setTyping(false);
          setTimeout(() => setShowWelcome(true), 400);
        }
      }, 80);
      return () => clearInterval(interval);
    }
  }, [nameSubmitted, userName, showWelcome]);

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userName.trim().length > 0) {
      setNameSubmitted(true);
      localStorage.setItem('user_name', userName.trim());
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleNameSubmit(e as any);
    }
  };

  const handleFileUpload = async (file: File) => {
    setStep('loading');
    setError(null);
    setFileName(file.name);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch('/api/syllabus/analyze', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      if (result.success) {
        setExtractedDates(result.data);
        setCourseName(result.courseName || 'Syllabus Events');
        setStep('preview');
        toast({
          title: 'Syllabus Analyzed!',
          description: "We've extracted the key dates from your document.",
          variant: 'default',
          className: 'bg-green-600 text-white border-green-700',
        });
      } else {
        setError(result.error);
        setStep('error');
      }
    } catch (error) {
      setError('Failed to analyze the syllabus.');
      setStep('error');
    }
  };

  const handleReset = () => {
    setStep('upload');
    setExtractedDates([]);
    setError(null);
    setFileName('');
  };

  const handleAddToCalendar = () => {
    toast({
      title: 'Events Added!',
      description: 'Your important dates have been added to your Google Calendar.',
      action: <CheckCircle className="text-white" />,
      variant: 'default',
      className: 'bg-green-600 text-white border-green-700',
    });
  };

  const renderStep = () => {
    switch (step) {
      case 'loading':
        return (
          <motion.div
            key="loading"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center flex flex-col items-center gap-4"
          >
            <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-primary"></div>
            <h2 className="text-2xl font-semibold text-foreground">Analyzing Syllabus...</h2>
            <p className="text-muted-foreground">Our AI is reading your syllabus: {fileName}</p>
          </motion.div>
        );
      case 'preview':
        return (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-4xl"
          >
            <DatePreview
              dates={extractedDates}
              onAddToCalendar={handleAddToCalendar}
              onReset={handleReset}
              fileName={fileName}
              courseName={courseName}
              onDatesChange={setExtractedDates}
            />
          </motion.div>
        );
      case 'error':
        return (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md"
          >
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Analysis Failed</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <button
              onClick={handleReset}
              className="mt-4 w-full text-sm font-medium text-primary hover:underline"
            >
              Try again with another file
            </button>
          </motion.div>
        );
      case 'upload':
      default:
        return (
          <motion.div
            key="upload"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md"
          >
            <SyllabusUpload onFileUpload={handleFileUpload} />
          </motion.div>
        );
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-black via-primary/50 to-background -z-10"></div>

      {/* Dashboard Header */}
      <div className="w-full flex flex-col items-center py-8 mb-8">
        <div className="max-w-2xl w-full px-4 text-center">
          {!nameSubmitted ? (
            <form onSubmit={handleNameSubmit} className="flex flex-col items-center gap-4">
              <label htmlFor="user_name" className="text-2xl font-bold">What's your name?</label>
              <input
                id="user_name"
                type="text"
                value={userName}
                onChange={e => setUserName(e.target.value)}
                className="px-4 py-2 rounded-lg border border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary text-lg bg-background text-foreground"
                placeholder="Enter your name"
                autoFocus
                ref={inputRef}
                onKeyDown={handleInputKeyDown}
              />
            </form>
          ) : (
            <>
              <motion.h1
                className="text-3xl sm:text-4xl font-bold mb-1"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
              >
                Hey{' '}
                <span className="text-white">
                  {typing ? <span>{typedName}<span className="animate-pulse">|</span></span> : userName}
                </span>{' '}👋
              </motion.h1>
              <AnimatePresence>
                {showWelcome && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.7 }}
                  >
                    <p className="text-lg text-muted-foreground mb-2">Welcome to your Syllabus-to-Schedule Dashboard.</p>
                    <p className="text-base text-muted-foreground">Upload your syllabus below and let AI extract all your important dates. Then, sync them to your Google Calendar in one click!</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </div>
      </div>

      <main className="flex flex-col flex-grow items-center justify-center  ">
        <div className="w-full flex justify-center">
          <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>
        </div>
      </main>

      <footer className="w-full text-center p-4 text-sm text-muted-foreground">
        <p>Built for students, by students (and some clever AI).</p>
      </footer>
    </div>
  );
}
