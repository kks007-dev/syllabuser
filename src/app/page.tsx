'use client';

import { useState } from 'react';
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
  const { toast } = useToast();

  const handleFileUpload = async (file: File) => {
    setStep('loading');
    setError(null);
    setFileName(file.name);
    const result = await processSyllabus(file.name);
    if (result.success) {
      setExtractedDates(result.data);
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

      <main className="flex flex-col flex-grow items-center justify-center p-4 sm:p-8">
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
