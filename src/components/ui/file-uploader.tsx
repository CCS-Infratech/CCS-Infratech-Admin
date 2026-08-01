// components/ui/file-uploader.tsx
'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Loader2,
  Upload,
  X,
  FileText,
  Image as ImageIcon,
  File
} from 'lucide-react';
import { toast } from 'sonner';

interface FileUploaderProps {
  value: string;
  onValueChange: (value: string) => void;
  accept?: string;
  maxSize?: number; // in MB
}

export function FileUploader({
  value,
  onValueChange,
  accept = '*',
  maxSize = 30 // Default to 5MB
}: FileUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [fileName, setFileName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const maxSizeBytes = maxSize * 1024 * 1024;

  const isImage = accept.includes('image');
  const isPdf = accept.includes('pdf');

  // Mock upload to simulate server upload
  const mockUploadFile = async (file: File): Promise<string> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // In a real app, you would upload the file to your server/S3
    // This is just a mock for the UI example
    const timestamp = Date.now();
    const ext = file.name.split('.').pop();
    return isImage
      ? `https://ccs-infratech.s3.amazonaws.com/projects/images/${timestamp}-${file.name}`
      : `https://ccs-infratech.s3.amazonaws.com/projects/brochures/${timestamp}-${file.name}`;
  };

  // Handle file selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size
    if (file.size > maxSizeBytes) {
      toast.error(`File is too large. Maximum size is ${maxSize}MB.`);
      return;
    }

    try {
      setIsUploading(true);
      setFileName(file.name);

      // In a real implementation, you would upload to your server here
      const fileUrl = await mockUploadFile(file);

      // Pass the URL to the parent component
      onValueChange(fileUrl);
      toast.success('File uploaded successfully');

      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Error uploading file. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  // Clear the selected file
  const clearFile = () => {
    onValueChange('');
    setFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className='space-y-2'>
      <div className='flex items-center space-x-2'>
        <input
          type='file'
          ref={fileInputRef}
          onChange={handleFileChange}
          accept={accept}
          className='hidden'
          disabled={isUploading}
        />

        <Button
          type='button'
          variant='outline'
          size='sm'
          className='flex-1'
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          {isUploading ? (
            <>
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              Uploading...
            </>
          ) : (
            <>
              <Upload className='mr-2 h-4 w-4' />
              {value ? 'Change File' : 'Upload File'}
            </>
          )}
        </Button>

        {value && !isUploading && (
          <Button
            type='button'
            variant='ghost'
            size='sm'
            onClick={clearFile}
            className='text-red-500 hover:text-red-700'
          >
            <X className='h-4 w-4' />
          </Button>
        )}
      </div>

      {/* Display the selected file */}
      {value && (
        <div className='bg-muted/20 rounded-md border p-3'>
          <div className='flex items-center space-x-2 text-sm'>
            {isImage ? (
              <ImageIcon className='h-4 w-4 text-amber-500' />
            ) : isPdf ? (
              <FileText className='h-4 w-4 text-amber-500' />
            ) : (
              <File className='h-4 w-4 text-amber-500' />
            )}
            <span className='max-w-[300px] truncate text-gray-700'>
              {fileName || value.split('/').pop() || value}
            </span>
          </div>

          {isImage && value && (
            <div className='mt-2 h-24 overflow-hidden rounded border'>
              <div className='flex h-full w-full items-center justify-center bg-gray-100 text-xs text-gray-500'>
                Image Preview (not available in this mock)
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
