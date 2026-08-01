'use client';

import { Button, buttonVariants } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import { cn } from '@/lib/utils';
import {
  IconUpload,
  IconEye,
  IconCheck,
  IconX,
  IconPhoto,
  IconFileTypePdf,
  IconFile,
  IconCloudUpload,
  IconTrash,
  IconSearch,
  IconFilter,
  IconDownload,
  IconLoader2
} from '@tabler/icons-react';
import Image from 'next/image';
import { Suspense, useState, useEffect, useRef, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { imageService } from '@/http/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';

interface MediaSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (selectedFiles: MediaFile[]) => void;
  multiple?: boolean;
  title?: string;
  acceptedTypes?: ('image' | 'pdf' | 'all')[];
}

interface MediaFile {
  key: string;
  url: string;
  type?: 'image' | 'pdf' | 'other';
  size?: number;
  lastModified?: Date;
}

interface UploadFile {
  file: File;
  preview: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  type: 'image' | 'pdf' | 'other';
}

const getFileType = (filename: string): 'image' | 'pdf' | 'other' => {
  const ext = filename.toLowerCase().split('.').pop();
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(ext || '')) {
    return 'image';
  }
  if (ext === 'pdf') {
    return 'pdf';
  }
  return 'other';
};

const formatFileSize = (bytes?: number): string => {
  if (!bytes) return 'Unknown size';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

function FileTypeIcon({
  type,
  className
}: {
  type: 'image' | 'pdf' | 'other';
  className?: string;
}) {
  switch (type) {
    case 'image':
      return <IconPhoto className={cn('text-blue-500', className)} />;
    case 'pdf':
      return <IconFileTypePdf className={cn('text-red-500', className)} />;
    default:
      return <IconFile className={cn('text-gray-500', className)} />;
  }
}

function MediaUpload({ onUploadComplete }: { onUploadComplete: () => void }) {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFiles = useCallback((selectedFiles: File[]) => {
    const newFiles: UploadFile[] = selectedFiles.map((file) => {
      const type = getFileType(file.name);
      let preview = '';

      if (type === 'image') {
        preview = URL.createObjectURL(file);
      }

      return {
        file,
        preview,
        progress: 0,
        status: 'pending' as const,
        type
      };
    });

    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    processFiles(Array.from(e.target.files));
    e.target.value = '';
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      const droppedFiles = Array.from(e.dataTransfer.files).filter((file) => {
        const type = getFileType(file.name);
        return type === 'image' || type === 'pdf';
      });

      if (droppedFiles.length > 0) {
        processFiles(droppedFiles);
      }
    },
    [processFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const removeFile = (index: number) => {
    setFiles((prev) => {
      const newFiles = [...prev];
      if (newFiles[index].preview) {
        URL.revokeObjectURL(newFiles[index].preview);
      }
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const clearAll = () => {
    files.forEach((f) => {
      if (f.preview) URL.revokeObjectURL(f.preview);
    });
    setFiles([]);
  };

  const handleUpload = async () => {
    if (!files.length) return;

    setUploading(true);
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < files.length; i++) {
      if (files[i].status === 'success') continue;

      setFiles((prev) => {
        const newFiles = [...prev];
        newFiles[i] = { ...newFiles[i], status: 'uploading', progress: 0 };
        return newFiles;
      });

      try {
        const formData = new FormData();
        formData.append('file', files[i].file);

        const progressInterval = setInterval(() => {
          setFiles((prev) => {
            const newFiles = [...prev];
            if (newFiles[i].progress < 90) {
              newFiles[i] = {
                ...newFiles[i],
                progress: newFiles[i].progress + 10
              };
            }
            return newFiles;
          });
        }, 100);

        await imageService.uploadImage(formData);

        clearInterval(progressInterval);

        setFiles((prev) => {
          const newFiles = [...prev];
          newFiles[i] = { ...newFiles[i], status: 'success', progress: 100 };
          return newFiles;
        });
        successCount++;
      } catch (error) {
        console.error('Upload failed:', error);
        setFiles((prev) => {
          const newFiles = [...prev];
          newFiles[i] = { ...newFiles[i], status: 'error', progress: 0 };
          return newFiles;
        });
        errorCount++;
      }
    }

    setUploading(false);

    if (successCount > 0) {
      toast.success(`${successCount} file(s) uploaded successfully`);
      setTimeout(() => {
        setFiles((prev) => prev.filter((f) => f.status !== 'success'));
        onUploadComplete();
      }, 1500);
    }

    if (errorCount > 0) {
      toast.error(`${errorCount} file(s) failed to upload`);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const pendingFiles = files.filter((f) => f.status !== 'success');

  return (
    <div className='space-y-4'>
      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          'relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center transition-all duration-200 sm:rounded-xl sm:p-8 md:p-10',
          isDragOver
            ? 'border-primary bg-primary/5 scale-[1.01]'
            : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50',
          'group cursor-pointer'
        )}
        onClick={triggerFileInput}
      >
        <div
          className={cn(
            'mb-3 rounded-full p-2.5 transition-all duration-200 sm:mb-4 sm:p-3',
            isDragOver ? 'bg-primary/10' : 'bg-muted group-hover:bg-primary/5'
          )}
        >
          <IconCloudUpload
            className={cn(
              'h-8 w-8 transition-colors duration-200 sm:h-10 sm:w-10',
              isDragOver
                ? 'text-primary'
                : 'text-muted-foreground group-hover:text-primary'
            )}
          />
        </div>
        <h3 className='text-sm font-semibold sm:text-base'>
          {isDragOver ? 'Drop files here' : 'Drag & drop files here'}
        </h3>
        <p className='text-muted-foreground mt-1.5 mb-2.5 px-2 text-xs sm:mt-2 sm:mb-3 sm:text-sm'>
          or click to browse from your computer
        </p>
        <div className='flex flex-wrap justify-center gap-1.5 sm:gap-2'>
          <Badge
            variant='secondary'
            className='text-[10px] font-normal sm:text-xs'
          >
            <IconPhoto className='mr-0.5 h-2.5 w-2.5 sm:mr-1 sm:h-3 sm:w-3' />{' '}
            JPG, PNG, GIF, WebP
          </Badge>
          <Badge
            variant='secondary'
            className='text-[10px] font-normal sm:text-xs'
          >
            <IconFileTypePdf className='mr-0.5 h-2.5 w-2.5 sm:mr-1 sm:h-3 sm:w-3' />{' '}
            PDF
          </Badge>
        </div>
        <p className='text-muted-foreground mt-2.5 text-[10px] sm:mt-3 sm:text-xs'>
          Maximum file size: 10MB
        </p>

        <input
          type='file'
          ref={fileInputRef}
          className='hidden'
          onChange={handleFileChange}
          accept='image/*,.pdf'
          multiple
        />
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className='space-y-3'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-1.5 sm:gap-2'>
              <h4 className='text-xs font-semibold sm:text-sm'>
                Selected Files
              </h4>
              <Badge variant='outline' className='text-[10px] sm:text-xs'>
                {files.length}
              </Badge>
            </div>
            <Button
              variant='ghost'
              size='sm'
              onClick={clearAll}
              disabled={uploading}
              className='text-destructive hover:text-destructive h-7 text-[10px] sm:h-8 sm:text-xs'
            >
              <IconTrash className='mr-1 h-3 w-3' />
              <span className='xs:inline hidden sm:hidden md:inline'>
                Clear All
              </span>
              <span className='xs:hidden sm:inline md:hidden'>Clear</span>
            </Button>
          </div>

          <ScrollArea className='h-[280px] sm:h-[320px]'>
            <div className='space-y-2 pr-3 sm:space-y-2.5 sm:pr-4'>
              {files.map((file, index) => (
                <div
                  key={`${file.file.name}-${index}`}
                  className={cn(
                    'flex items-center gap-2 rounded-lg border p-2 transition-all sm:gap-3 sm:p-2.5',
                    file.status === 'success' &&
                      'border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950',
                    file.status === 'error' &&
                      'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950',
                    file.status === 'uploading' &&
                      'border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950'
                  )}
                >
                  {/* Preview */}
                  <div className='bg-muted relative h-11 w-11 flex-shrink-0 overflow-hidden rounded-md sm:h-12 sm:w-12'>
                    {file.type === 'image' && file.preview ? (
                      <Image
                        src={file.preview}
                        alt={file.file.name}
                        fill
                        className='object-cover'
                      />
                    ) : (
                      <div className='flex h-full w-full items-center justify-center'>
                        <FileTypeIcon
                          type={file.type}
                          className='h-5 w-5 sm:h-6 sm:w-6'
                        />
                      </div>
                    )}
                  </div>

                  {/* File Info */}
                  <div className='min-w-0 flex-1'>
                    <p className='truncate text-xs font-medium sm:text-sm'>
                      {file.file.name}
                    </p>
                    <div className='mt-0.5 flex items-center gap-1.5 sm:gap-2'>
                      <span className='text-muted-foreground text-[10px] sm:text-xs'>
                        {formatFileSize(file.file.size)}
                      </span>
                      <Badge
                        variant='outline'
                        className='text-[9px] capitalize sm:text-[10px]'
                      >
                        {file.type}
                      </Badge>
                    </div>

                    {/* Progress Bar */}
                    {file.status === 'uploading' && (
                      <Progress value={file.progress} className='mt-1.5 h-1' />
                    )}
                  </div>

                  {/* Status / Actions */}
                  <div className='flex items-center gap-1'>
                    {file.status === 'success' && (
                      <div className='rounded-full bg-green-500 p-0.5 sm:p-1'>
                        <IconCheck className='h-3 w-3 text-white' />
                      </div>
                    )}
                    {file.status === 'error' && (
                      <Badge
                        variant='destructive'
                        className='text-[9px] sm:text-[10px]'
                      >
                        Failed
                      </Badge>
                    )}
                    {file.status === 'uploading' && (
                      <IconLoader2 className='text-primary h-4 w-4 animate-spin' />
                    )}
                    {(file.status === 'pending' || file.status === 'error') && (
                      <Button
                        variant='ghost'
                        size='icon'
                        className='h-7 w-7'
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(index);
                        }}
                        disabled={uploading}
                      >
                        <IconX className='h-3.5 w-3.5' />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <Button
            onClick={handleUpload}
            disabled={uploading || pendingFiles.length === 0}
            className='w-full text-xs sm:text-sm'
            size='default'
          >
            {uploading ? (
              <>
                <IconLoader2 className='mr-1.5 h-3.5 w-3.5 animate-spin sm:mr-2 sm:h-4 sm:w-4' />
                Uploading...
              </>
            ) : (
              <>
                <IconUpload className='mr-1.5 h-3.5 w-3.5 sm:mr-2 sm:h-4 sm:w-4' />
                Upload {pendingFiles.length} File
                {pendingFiles.length !== 1 ? 's' : ''}
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

function MediaGallery({
  onSelect,
  multiple = false,
  refreshTrigger,
  acceptedTypes = ['all']
}: {
  onSelect: (selectedFiles: MediaFile[]) => void;
  multiple?: boolean;
  refreshTrigger: number;
  acceptedTypes?: ('image' | 'pdf' | 'all')[];
}) {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [filteredFiles, setFilteredFiles] = useState<MediaFile[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<{
    [key: string]: boolean;
  }>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'image' | 'pdf'>('all');

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        setLoading(true);
        const fetchedFiles = await imageService.getAllS3Images();

        const processedFiles: MediaFile[] = (fetchedFiles || []).map(
          (file: any) => ({
            ...file,
            type: getFileType(file.key)
          })
        );

        setFiles(processedFiles);
        setFilteredFiles(processedFiles);
      } catch (error) {
        console.error('Error fetching files:', error);
        toast.error('Failed to load media files');
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, [refreshTrigger]);

  useEffect(() => {
    let result = files;

    // Apply type filter
    if (filterType !== 'all') {
      result = result.filter((file) => file.type === filterType);
    }

    // Apply search filter
    if (searchQuery) {
      result = result.filter((file) =>
        file.key.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredFiles(result);
  }, [files, filterType, searchQuery]);

  const handleSelect = (file: MediaFile) => {
    if (multiple) {
      setSelectedFiles((prev) => ({
        ...prev,
        [file.key]: !prev[file.key]
      }));
    } else {
      setSelectedFiles({ [file.key]: true });
      onSelect([file]);
    }
  };

  const handleConfirmSelection = () => {
    const selected = files.filter((file) => selectedFiles[file.key]);
    onSelect(selected);
  };

  const handleClearSelection = () => {
    setSelectedFiles({});
  };

  const selectedCount = Object.values(selectedFiles).filter(Boolean).length;

  if (loading) {
    return (
      <div className='space-y-3 sm:space-y-4'>
        <div className='flex gap-2'>
          <div className='bg-muted h-9 flex-1 animate-pulse rounded-md' />
          <div className='bg-muted h-9 w-28 animate-pulse rounded-md sm:w-32' />
        </div>
        <div className='grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3 lg:grid-cols-4'>
          {[...Array(8)].map((_, i) => (
            <div key={i} className='space-y-1.5 sm:space-y-2'>
              <div className='bg-muted aspect-video animate-pulse rounded-lg' />
              <div className='bg-muted h-3 w-3/4 animate-pulse rounded' />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!files || files.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-12'>
        <div className='bg-muted mb-3 rounded-full p-3 sm:mb-4 sm:p-4'>
          <IconPhoto className='text-muted-foreground h-9 w-9 sm:h-10 sm:w-10' />
        </div>
        <h3 className='text-sm font-semibold sm:text-base'>
          No media files found
        </h3>
        <p className='text-muted-foreground mt-1.5 px-4 text-center text-xs sm:mt-2 sm:text-sm'>
          Upload some files to get started
        </p>
      </div>
    );
  }

  return (
    <div className='relative flex h-full flex-col overflow-hidden'>
      {/* Search and Filter Bar - Fixed */}
      <div className='mb-3 flex-shrink-0 space-y-2 sm:mb-4 sm:flex sm:flex-row sm:gap-3 sm:space-y-0'>
        <div className='relative flex-1'>
          <IconSearch className='text-muted-foreground absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 sm:left-3 sm:h-4 sm:w-4' />
          <Input
            placeholder='Search files...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='h-9 pl-8 text-xs sm:pl-9 sm:text-sm'
          />
        </div>
        <Select
          value={filterType}
          onValueChange={(value: 'all' | 'image' | 'pdf') =>
            setFilterType(value)
          }
        >
          <SelectTrigger className='h-9 w-full text-xs sm:w-32 sm:text-sm'>
            <IconFilter className='mr-1 h-3.5 w-3.5 sm:mr-1.5 sm:h-4 sm:w-4' />
            <SelectValue placeholder='Filter by type' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all' className='text-xs sm:text-sm'>
              All Files
            </SelectItem>
            <SelectItem value='image' className='text-xs sm:text-sm'>
              Images
            </SelectItem>
            <SelectItem value='pdf' className='text-xs sm:text-sm'>
              PDFs
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results Count - Fixed */}
      <div className='text-muted-foreground mb-2.5 flex-shrink-0 text-[10px] sm:mb-3 sm:text-xs'>
        Showing {filteredFiles.length} of {files.length} files
        {selectedCount > 0 && multiple && (
          <span className='text-primary ml-1.5 font-medium sm:ml-2'>
            • {selectedCount} selected
          </span>
        )}
      </div>

      {/* File Grid - Scrollable Area */}
      {filteredFiles.length === 0 ? (
        <div className='flex-1 py-8 text-center'>
          <p className='text-muted-foreground px-4 text-xs sm:text-sm'>
            No files match your search criteria
          </p>
        </div>
      ) : (
        <div className='relative min-h-0 flex-1 overflow-hidden'>
          <ScrollArea className='h-full w-full'>
            <div className='grid grid-cols-2 gap-2 pr-3 pb-3 sm:gap-3 sm:pr-4 md:grid-cols-3 lg:grid-cols-4'>
              {filteredFiles.map((file) => (
                <div
                  key={file.key}
                  className={cn(
                    'group bg-card relative cursor-pointer overflow-hidden rounded-lg border-2 shadow-sm transition-all duration-150 hover:shadow-md',
                    selectedFiles[file.key]
                      ? 'border-primary ring-primary/20 ring-2'
                      : 'hover:border-muted-foreground/20 border-transparent'
                  )}
                  onClick={() => handleSelect(file)}
                >
                  {/* Preview */}
                  <div className='bg-muted relative aspect-video overflow-hidden'>
                    {file.type === 'image' ? (
                      <Image
                        src={file.url}
                        alt={file.key}
                        fill
                        className='object-cover transition-transform duration-200 group-hover:scale-105'
                        sizes='(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw'
                      />
                    ) : (
                      <div className='flex h-full w-full flex-col items-center justify-center gap-1 p-2 sm:gap-1.5 sm:p-3'>
                        <FileTypeIcon
                          type={file.type!}
                          className='h-7 w-7 sm:h-9 sm:w-9'
                        />
                        <span className='text-muted-foreground text-[9px] uppercase sm:text-[10px]'>
                          {file.type}
                        </span>
                      </div>
                    )}

                    {/* Selection Indicator */}
                    {selectedFiles[file.key] && (
                      <div className='bg-primary absolute top-1 right-1 rounded-full p-0.5 shadow-lg sm:top-1.5 sm:right-1.5 sm:p-1'>
                        <IconCheck className='h-2.5 w-2.5 text-white sm:h-3 sm:w-3' />
                      </div>
                    )}

                    {/* Hover Overlay */}
                    <div className='absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity duration-150 group-hover:opacity-100'>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <a
                              href={file.url}
                              target='_blank'
                              rel='noopener noreferrer'
                              onClick={(e) => e.stopPropagation()}
                              className='rounded-full bg-white p-1.5 transition-transform hover:scale-110 sm:p-2'
                            >
                              <IconEye className='h-3 w-3 text-gray-900 sm:h-3.5 sm:w-3.5' />
                            </a>
                          </TooltipTrigger>
                          <TooltipContent>View</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>

                  {/* File Info */}
                  <div className='p-1.5 sm:p-2'>
                    <p className='truncate text-[10px] font-medium sm:text-xs'>
                      {file.key}
                    </p>
                    <div className='mt-0.5 flex items-center gap-1 sm:mt-1'>
                      <Badge
                        variant='secondary'
                        className='text-[8px] capitalize sm:text-[9px]'
                      >
                        <FileTypeIcon
                          type={file.type!}
                          className='mr-0.5 h-2 w-2'
                        />
                        {file.type}
                      </Badge>
                      {file.size && (
                        <span className='text-muted-foreground text-[8px] sm:text-[9px]'>
                          {formatFileSize(file.size)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Sticky Selection Footer */}
      {multiple && selectedCount > 0 && (
        <div className='bg-background/95 supports-[backdrop-filter]:bg-background/90 absolute right-0 bottom-0 left-0 z-10 border-t p-3 backdrop-blur-sm sm:p-4'>
          <div className='flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center sm:gap-3'>
            <span className='text-xs font-medium sm:text-sm'>
              {selectedCount} file{selectedCount !== 1 ? 's' : ''} selected
            </span>
            <div className='flex w-full gap-2 sm:w-auto'>
              <Button
                variant='outline'
                size='sm'
                onClick={handleClearSelection}
                className='h-8 flex-1 text-xs sm:h-9 sm:flex-none sm:text-sm'
              >
                Clear
              </Button>
              <Button
                size='sm'
                onClick={handleConfirmSelection}
                className='h-8 flex-1 text-xs sm:h-9 sm:flex-none sm:text-sm'
              >
                <IconCheck className='mr-1 h-3.5 w-3.5 sm:mr-1.5 sm:h-4 sm:w-4' />
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function MediaSelectionDialog({
  open,
  onOpenChange,
  onSelect,
  multiple = false,
  title = 'Media Library',
  acceptedTypes = ['all']
}: MediaSelectionDialogProps) {
  const [activeTab, setActiveTab] = useState('browse');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleUploadComplete = () => {
    setRefreshTrigger((prev) => prev + 1);
    setActiveTab('browse');
  };

  const handleSelect = (selectedFiles: MediaFile[]) => {
    onSelect(selectedFiles);
    if (!multiple) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='flex h-[85vh] max-h-[85vh] w-[calc(100vw-1.5rem)] max-w-[calc(100vw-1.5rem)] flex-col overflow-hidden p-0 sm:h-[80vh] sm:max-h-[80vh] sm:w-[calc(100vw-2rem)] sm:max-w-3xl md:max-w-4xl lg:max-w-5xl'>
        {/* Fixed Header */}
        <div className='flex-shrink-0 space-y-2 border-b p-4 sm:space-y-3 sm:p-6'>
          <DialogHeader className='space-y-1.5 sm:space-y-2'>
            <DialogTitle className='flex items-center gap-1.5 text-base sm:gap-2 sm:text-lg'>
              <IconPhoto className='text-primary h-4 w-4 sm:h-5 sm:w-5' />
              {title}
            </DialogTitle>
            <DialogDescription className='text-xs sm:text-sm'>
              {multiple
                ? 'Select one or more files from your media library or upload new ones.'
                : 'Select a file from your media library or upload a new one.'}
            </DialogDescription>
          </DialogHeader>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className='w-full'
          >
            <TabsList className='grid h-8 w-full grid-cols-2 sm:h-9'>
              <TabsTrigger
                value='browse'
                className='gap-1 text-[10px] sm:gap-1.5 sm:text-xs'
              >
                <IconPhoto className='h-3 w-3 sm:h-3.5 sm:w-3.5' />
                <span className='xs:inline hidden'>Browse Library</span>
                <span className='xs:hidden'>Browse</span>
              </TabsTrigger>
              <TabsTrigger
                value='upload'
                className='gap-1 text-[10px] sm:gap-1.5 sm:text-xs'
              >
                <IconUpload className='h-3 w-3 sm:h-3.5 sm:w-3.5' />
                <span className='xs:inline hidden'>Upload New</span>
                <span className='xs:hidden'>Upload</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Scrollable Content Area */}
        <div className='relative min-h-0 flex-1 overflow-hidden'>
          <Tabs value={activeTab} className='h-full'>
            <TabsContent value='browse' className='m-0 h-full p-4 sm:p-6'>
              <Suspense
                fallback={<DataTableSkeleton columnCount={4} rowCount={4} />}
              >
                <MediaGallery
                  onSelect={handleSelect}
                  multiple={multiple}
                  refreshTrigger={refreshTrigger}
                  acceptedTypes={acceptedTypes}
                />
              </Suspense>
            </TabsContent>

            <TabsContent
              value='upload'
              className='m-0 h-full overflow-y-auto p-4 sm:p-6'
            >
              <MediaUpload onUploadComplete={handleUploadComplete} />
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
