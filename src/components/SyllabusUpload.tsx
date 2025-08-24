'use client';

import { useState, type DragEvent, useRef } from 'react';
import { UploadCloud, Check } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { GoogleCalendarIcon } from '@/components/icons/GoogleCalendarIcon';
import { cn } from '@/lib/utils';

interface SyllabusUploadProps {
  onFileUpload: (file: File) => void;
}

export function SyllabusUpload({ onFileUpload }: SyllabusUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleConnect = () => {
    window.location.href = '/api/auth/google';
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

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      onFileUpload(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileUpload(files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-6">
      {/* Google Calendar Connection */}
      <Card className="shadow-lg shadow-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GoogleCalendarIcon className="h-5 w-5" />
            Google Calendar Integration
          </CardTitle>
          <CardDescription>
            Connect your Google Calendar to automatically add extracted events
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isAuthenticated() ? (
            <Button onClick={handleConnect} variant="outline" className="w-full">
              <GoogleCalendarIcon className="mr-2 h-4 w-4" />
              Connect Google Calendar
            </Button>
          ) : (
            <div className="flex items-center gap-2 text-sm font-medium text-green-600 p-3 rounded-md bg-green-50 border border-green-200">
              <Check className="h-4 w-4" />
              <span>Google Calendar Connected</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Syllabus Upload */}
      <Card className="shadow-2xl shadow-primary/10">
        <CardHeader>
          <CardTitle>Upload Your Syllabus</CardTitle>
          <CardDescription>We'll analyze your PDF and extract all the important dates.</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            onClick={handleClick}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            className={cn(
              'flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-300 ease-in-out',
              isDragging ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50 hover:bg-accent/50'
            )}
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
              <UploadCloud className={cn('w-12 h-12 mb-4 text-muted-foreground transition-transform duration-300', isDragging && 'scale-110 text-primary')} />
              <p className="mb-2 text-sm text-foreground">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-muted-foreground">PDF files only (max 5MB)</p>
            </div>
            <Input
              ref={fileInputRef}
              id="dropzone-file"
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
