'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  IconCheck,
  IconEye,
  IconLibraryPhoto,
  IconLink,
  IconLoader2,
  IconPlayerPlay,
  IconRefresh,
  IconSearch,
  IconTrash,
  IconUpload,
  IconVideo,
  IconVideoOff
} from '@tabler/icons-react';
import { toast } from 'sonner';

import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ALLOWED_VIDEO_TYPES,
  MAX_VIDEO_SIZE,
  videoService,
  type LibraryVideo
} from '@/http/video';
import { cn } from '@/lib/utils';

interface VideoUploadFieldProps {
  /** Current video URL stored on the record. */
  value: string;
  /** Called whenever the URL changes (typed, uploaded, picked or cleared). */
  onChange: (url: string) => void;
  /** Disable the whole field while the parent form is busy. */
  disabled?: boolean;
  /** Tell the parent an upload is running so it can block submit. */
  onUploadingChange?: (uploading: boolean) => void;
}

const formatFileSize = (bytes: number): string => {
  if (!bytes) return '';
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
};

const formatDate = (value?: string): string => {
  if (!value) return '';

  try {
    return new Date(value).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return '';
  }
};

export function VideoUploadField({
  value,
  onChange,
  disabled = false,
  onUploadingChange
}: VideoUploadFieldProps) {
  const [mode, setMode] = useState<'library' | 'upload' | 'url'>('library');

  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeFile, setActiveFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const [library, setLibrary] = useState<LibraryVideo[]>([]);
  const [loadingLibrary, setLoadingLibrary] = useState(false);
  const [libraryLoaded, setLibraryLoaded] = useState(false);
  const [search, setSearch] = useState('');
  const [deletingKey, setDeletingKey] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Let the parent form know when an upload is in flight.
  useEffect(() => {
    onUploadingChange?.(uploading);
  }, [uploading, onUploadingChange]);

  // Cancel a running upload if the component goes away.
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const loadLibrary = useCallback(async (showToast = false) => {
    setLoadingLibrary(true);

    try {
      const videos = await videoService.getAllVideos();

      setLibrary(videos);
      setLibraryLoaded(true);

      if (showToast) {
        toast.success('Video library refreshed');
      }
    } catch (error: any) {
      console.error('Failed to load video library:', error);
      toast.error(error?.message || 'Failed to load the video library');
    } finally {
      setLoadingLibrary(false);
    }
  }, []);

  // Load the list the first time the library tab is opened.
  useEffect(() => {
    if (mode === 'library' && !libraryLoaded && !loadingLibrary) {
      void loadLibrary();
    }
  }, [mode, libraryLoaded, loadingLibrary, loadLibrary]);

  const filteredLibrary = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return library;

    return library.filter((video) =>
      video.displayName.toLowerCase().includes(term)
    );
  }, [library, search]);

  const startUpload = useCallback(
    async (file: File) => {
      if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
        toast.error('Use an MP4, WebM, MOV, OGG, AVI or MKV file.');
        return;
      }

      if (file.size > MAX_VIDEO_SIZE) {
        toast.error('That video is larger than the 1 GB limit.');
        return;
      }

      const controller = new AbortController();
      abortRef.current = controller;

      setActiveFile(file);
      setProgress(0);
      setUploading(true);

      try {
        const { url } = await videoService.uploadVideo(file, {
          signal: controller.signal,
          onProgress: setProgress
        });

        onChange(url);
        toast.success('Video uploaded');

        // Keep the library in step so the new file is pickable right away.
        void loadLibrary();
      } catch (error: any) {
        if (controller.signal.aborted) {
          toast.info('Upload cancelled');
        } else {
          console.error('Video upload failed:', error);
          toast.error(error?.message || 'Failed to upload video');
        }

        setActiveFile(null);
      } finally {
        setUploading(false);
        setProgress(0);
        abortRef.current = null;

        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    },
    [onChange, loadLibrary]
  );

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);

    if (disabled || uploading) return;

    const file = event.dataTransfer.files?.[0];
    if (file) void startUpload(file);
  };

  const handleDelete = async (video: LibraryVideo) => {
    setDeletingKey(video.key);

    try {
      await videoService.deleteVideo(video.key);

      setLibrary((current) =>
        current.filter((item) => item.key !== video.key)
      );

      // If the deleted file was the selected one, clear the field.
      if (value === video.url) {
        onChange('');
      }

      toast.success('Video deleted');
    } catch (error: any) {
      console.error('Failed to delete video:', error);
      toast.error(error?.message || 'Failed to delete video');
    } finally {
      setDeletingKey(null);
    }
  };

  const cancelUpload = () => {
    abortRef.current?.abort();
  };

  const clearVideo = () => {
    onChange('');
    setActiveFile(null);
  };

  const controlsDisabled = disabled || uploading;

  return (
    <div className='space-y-4'>
      <Tabs
        value={mode}
        onValueChange={(next) =>
          setMode(next as 'library' | 'upload' | 'url')
        }
      >
        <TabsList className='grid w-full max-w-xl grid-cols-3'>
          <TabsTrigger value='library' disabled={uploading}>
            <IconLibraryPhoto className='mr-2 h-4 w-4' />
            Video Library
          </TabsTrigger>

          <TabsTrigger value='upload' disabled={uploading}>
            <IconUpload className='mr-2 h-4 w-4' />
            Upload New
          </TabsTrigger>

          <TabsTrigger value='url' disabled={uploading}>
            <IconLink className='mr-2 h-4 w-4' />
            Paste URL
          </TabsTrigger>
        </TabsList>

        {/* ---------------- Library ---------------- */}
        <TabsContent value='library' className='mt-4'>
          <div className='rounded-xl border border-gray-200 bg-white'>
            <div className='flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center'>
              <div className='relative flex-1'>
                <IconSearch className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400' />

                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder='Search uploaded videos'
                  className='pl-9'
                  disabled={controlsDisabled}
                />
              </div>

              <Button
                type='button'
                variant='outline'
                onClick={() => void loadLibrary(true)}
                disabled={controlsDisabled || loadingLibrary}
                className='shrink-0'
              >
                <IconRefresh
                  className={cn(
                    'mr-2 h-4 w-4',
                    loadingLibrary && 'animate-spin'
                  )}
                />
                Refresh
              </Button>
            </div>

            {loadingLibrary && library.length === 0 ? (
              <div className='flex flex-col items-center justify-center p-12 text-center'>
                <IconLoader2 className='h-8 w-8 animate-spin text-gray-400' />
                <p className='mt-3 text-sm text-gray-500'>
                  Loading your videos...
                </p>
              </div>
            ) : filteredLibrary.length === 0 ? (
              <div className='flex flex-col items-center justify-center p-12 text-center'>
                <IconVideoOff className='h-10 w-10 text-gray-400' />

                <p className='mt-3 text-sm font-medium text-gray-600'>
                  {search
                    ? 'No videos match that search'
                    : 'No videos uploaded yet'}
                </p>

                {!search && (
                  <Button
                    type='button'
                    variant='outline'
                    className='mt-4'
                    onClick={() => setMode('upload')}
                    disabled={controlsDisabled}
                  >
                    <IconUpload className='mr-2 h-4 w-4' />
                    Upload your first video
                  </Button>
                )}
              </div>
            ) : (
              <ScrollArea className='h-[26rem]'>
                <div className='grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3'>
                  {filteredLibrary.map((video) => {
                    const isSelected = value === video.url;
                    const isDeleting = deletingKey === video.key;

                    return (
                      <div
                        key={video.key}
                        className={cn(
                          'group overflow-hidden rounded-xl border bg-white transition-all',
                          isSelected
                            ? 'border-black ring-2 ring-black/10'
                            : 'border-gray-200 hover:border-gray-400',
                          isDeleting && 'opacity-50'
                        )}
                      >
                        <div className='relative bg-black'>
                          <video
                            src={video.url}
                            preload='metadata'
                            muted
                            playsInline
                            controls
                            className='aspect-video w-full'
                          />

                          {isSelected && (
                            <span className='absolute top-2 right-2 flex items-center gap-1 rounded-full bg-black px-2 py-1 text-xs font-medium text-white'>
                              <IconCheck className='h-3 w-3' />
                              Selected
                            </span>
                          )}
                        </div>

                        <div className='space-y-2 p-3'>
                          <p
                            className='truncate text-sm font-medium text-gray-800'
                            title={video.displayName}
                          >
                            {video.displayName}
                          </p>

                          <p className='text-xs text-gray-500'>
                            {formatFileSize(video.size)}
                            {video.lastModified
                              ? ` · ${formatDate(video.lastModified)}`
                              : ''}
                          </p>

                          <div className='flex gap-2 pt-1'>
                            <Button
                              type='button'
                              size='sm'
                              variant={isSelected ? 'secondary' : 'default'}
                              className='flex-1'
                              disabled={controlsDisabled || isDeleting}
                              onClick={() => {
                                onChange(video.url);
                                toast.success('Video selected');
                              }}
                            >
                              {isSelected ? 'Selected' : 'Use this'}
                            </Button>

                            <Button
                              type='button'
                              size='sm'
                              variant='outline'
                              className='text-red-600 hover:bg-red-50 hover:text-red-700'
                              disabled={controlsDisabled || isDeleting}
                              onClick={() => void handleDelete(video)}
                              title='Delete from S3'
                            >
                              {isDeleting ? (
                                <IconLoader2 className='h-4 w-4 animate-spin' />
                              ) : (
                                <IconTrash className='h-4 w-4' />
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </div>
        </TabsContent>

        {/* ---------------- Upload ---------------- */}
        <TabsContent value='upload' className='mt-4'>
          <div
            onDragOver={(event) => {
              event.preventDefault();
              if (!controlsDisabled) setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            className={cn(
              'flex flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center transition-colors',
              isDragOver
                ? 'border-black bg-gray-50'
                : 'border-gray-300 bg-gray-50/60',
              controlsDisabled && 'opacity-70'
            )}
          >
            <input
              ref={fileInputRef}
              type='file'
              accept={ALLOWED_VIDEO_TYPES.join(',')}
              className='hidden'
              disabled={controlsDisabled}
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void startUpload(file);
              }}
            />

            {uploading ? (
              <div className='w-full max-w-md space-y-3'>
                <div className='flex items-center justify-center gap-2 text-sm font-medium text-gray-700'>
                  <IconLoader2 className='h-4 w-4 animate-spin' />
                  Uploading {activeFile?.name}
                </div>

                <Progress value={progress} className='h-2' />

                <div className='flex items-center justify-between text-xs text-gray-500'>
                  <span>{progress}%</span>
                  <span>
                    {activeFile ? formatFileSize(activeFile.size) : ''}
                  </span>
                </div>

                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={cancelUpload}
                >
                  Cancel upload
                </Button>
              </div>
            ) : (
              <>
                <IconVideo className='h-10 w-10 text-gray-400' />

                <p className='mt-3 text-sm font-medium text-gray-700'>
                  Drag a video here, or choose a file
                </p>

                <p className='mt-1 text-xs text-gray-500'>
                  MP4, WebM, MOV, OGG, AVI or MKV — up to 1 GB
                </p>

                <Button
                  type='button'
                  variant='outline'
                  className='mt-4'
                  disabled={controlsDisabled}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <IconUpload className='mr-2 h-4 w-4' />
                  Choose video
                </Button>
              </>
            )}
          </div>
        </TabsContent>

        {/* ---------------- Paste URL ---------------- */}
        <TabsContent value='url' className='mt-4'>
          <div className='flex gap-2'>
            <Input
              id='videoUrl'
              type='url'
              value={value}
              onChange={(event) => onChange(event.target.value)}
              placeholder='https://...'
              disabled={controlsDisabled}
            />

            {value && (
              <a
                href={value}
                target='_blank'
                rel='noreferrer'
                className={cn(
                  buttonVariants({ variant: 'outline' }),
                  'shrink-0'
                )}
                title='Open video'
              >
                <IconEye className='h-4 w-4' />
              </a>
            )}
          </div>

          <p className='text-muted-foreground mt-2 text-xs'>
            Use a hosted video URL that should open in the website video
            player.
          </p>
        </TabsContent>
      </Tabs>

      {/* ---------------- Selected video ---------------- */}
      {value && !uploading && (
        <div className='overflow-hidden rounded-xl border bg-black'>
          <div className='flex items-center justify-between gap-2 border-b border-zinc-800 bg-zinc-950 px-4 py-3 text-white'>
            <div className='flex items-center gap-2'>
              <IconPlayerPlay className='h-4 w-4' />
              <span className='text-sm font-medium'>Selected Video</span>
            </div>

            <Button
              type='button'
              variant='ghost'
              size='sm'
              className='text-zinc-300 hover:bg-zinc-800 hover:text-white'
              onClick={clearVideo}
              disabled={disabled}
            >
              <IconTrash className='mr-2 h-4 w-4' />
              Remove
            </Button>
          </div>

          <video
            key={value}
            src={value}
            controls
            playsInline
            preload='metadata'
            className='aspect-video w-full'
          >
            Your browser does not support video playback.
          </video>

          <p className='truncate border-t border-zinc-800 px-4 py-2 text-xs text-zinc-400'>
            {value}
          </p>
        </div>
      )}
    </div>
  );
}

export default VideoUploadField;
