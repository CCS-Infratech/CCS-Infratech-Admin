'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { IconPhoto, IconPlayerPlay } from '@tabler/icons-react';
import { toast } from 'sonner';

import PageContainer from '@/components/layout/page-container';
import { VideoUploadField } from '@/components/media-library/video-upload-field';
import { MediaSelectionDialog } from '@/components/modal/media-gallary';
import { Button, buttonVariants } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import {
  walkthroughService,
  type CreateWalkthrough,
} from '@/http/walkthrough';
import { cn } from '@/lib/utils';

const getPreviewImageUrl = (thumbnail: string) => {
  if (!thumbnail) return '';

  if (
    thumbnail.startsWith('http://') ||
    thumbnail.startsWith('https://')
  ) {
    return thumbnail;
  }

  if (thumbnail.startsWith('/')) {
    return `https://www.ccsinfratech.com${thumbnail}`;
  }

  return `https://www.ccsinfratech.com/${thumbnail}`;
};

export default function NewWalkthroughPage() {
  const router = useRouter();

  const [form, setForm] = useState<CreateWalkthrough>({
    title: '',
    description: '',
    videoUrl: '',
    thumbnail: '',
    isActive: true,
    sortOrder: 0,
  });

  const [saving, setSaving] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [mediaDialogOpen, setMediaDialogOpen] = useState(false);

  const updateField = <K extends keyof CreateWalkthrough>(
    field: K,
    value: CreateWalkthrough[K]
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleMediaSelection = (
    selectedImages: { url: string }[]
  ) => {
    if (selectedImages.length === 0) return;

    updateField('thumbnail', selectedImages[0].url);
    setMediaDialogOpen(false);

    toast.success('Walkthrough thumbnail selected');
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!form.title?.trim()) {
      toast.error('Title is required');
      return;
    }

    if (uploadingVideo) {
      toast.error('Wait for the video upload to finish');
      return;
    }

    if (!form.videoUrl?.trim()) {
      toast.error('Upload a video or enter a video URL');
      return;
    }

    if (!form.thumbnail?.trim()) {
      toast.error('Thumbnail is required');
      return;
    }

    try {
      setSaving(true);

      const payload: CreateWalkthrough = {
        title: form.title.trim(),
        description: form.description?.trim() || null,
        videoUrl: form.videoUrl.trim(),
        thumbnail: form.thumbnail.trim(),
        isActive: Boolean(form.isActive),
        sortOrder:
          typeof form.sortOrder === 'number'
            ? form.sortOrder
            : 0,
      };

      await walkthroughService.createWalkthrough(payload);

      toast.success('Walkthrough created successfully');
      router.push('/dashboard/walkthrough');
    } catch (error) {
      console.error('Failed to create walkthrough:', error);
      toast.error('Failed to create walkthrough');
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-6'>
        <div className='flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between'>
          <Heading
            title='Create Walkthrough'
            description='Add a project walkthrough video to the website.'
          />

          <Button
            type='button'
            variant='outline'
            onClick={() => router.push('/dashboard/walkthrough')}
            disabled={saving}
          >
            Back
          </Button>
        </div>

        <Separator className='bg-gray-100' />

        <form
          onSubmit={handleSubmit}
          className='max-w-4xl space-y-8'
        >
          <div className='rounded-xl border border-gray-200 bg-white p-6 shadow-sm'>
            <div className='space-y-6'>
              <div className='grid gap-2'>
                <Label htmlFor='title'>Walkthrough Title</Label>
                <Input
                  id='title'
                  value={form.title}
                  onChange={(event) =>
                    updateField('title', event.target.value)
                  }
                  placeholder='Amor Project Overview'
                  disabled={saving}
                  required
                />
              </div>

              <div className='grid gap-2'>
                <Label htmlFor='description'>Description</Label>
                <Textarea
                  id='description'
                  value={form.description ?? ''}
                  onChange={(event) =>
                    updateField(
                      'description',
                      event.target.value
                    )
                  }
                  placeholder='Describe what visitors will see in this walkthrough.'
                  className='min-h-28'
                  disabled={saving}
                />
              </div>

              <div className='grid gap-2'>
                <Label>Walkthrough Video</Label>

                <VideoUploadField
                  value={form.videoUrl}
                  onChange={(url) =>
                    updateField('videoUrl', url)
                  }
                  disabled={saving}
                  onUploadingChange={setUploadingVideo}
                />
              </div>
            </div>
          </div>

          <div className='rounded-xl border border-gray-200 bg-white p-6 shadow-sm'>
            <div className='space-y-6'>
              <div>
                <h2 className='text-lg font-semibold text-gray-900'>
                  Thumbnail
                </h2>
                <p className='mt-1 text-sm text-gray-500'>
                  Select an existing image from the media
                  library or enter an image URL manually.
                </p>
              </div>

              <div className='flex flex-col gap-3 sm:flex-row'>
                <Input
                  value={form.thumbnail}
                  onChange={(event) =>
                    updateField(
                      'thumbnail',
                      event.target.value
                    )
                  }
                  placeholder='/images/DayView.png or image URL'
                  disabled={saving}
                  className='flex-1'
                />

                <Button
                  type='button'
                  variant='outline'
                  onClick={() => setMediaDialogOpen(true)}
                  disabled={saving}
                >
                  <IconPhoto className='mr-2 h-4 w-4' />
                  Select Image
                </Button>
              </div>

              {form.thumbnail && (
                <div className='overflow-hidden rounded-xl border bg-gray-50'>
                  <div className='flex items-center gap-2 border-b px-4 py-3'>
                    <IconPhoto className='h-4 w-4 text-gray-500' />
                    <span className='text-sm font-medium text-gray-700'>
                      Thumbnail Preview
                    </span>
                  </div>

                  <div className='aspect-video overflow-hidden'>
                    <img
                      src={getPreviewImageUrl(form.thumbnail)}
                      alt='Walkthrough thumbnail preview'
                      className='h-full w-full object-cover'
                      onError={(event) => {
                        event.currentTarget.style.display =
                          'none';
                      }}
                    />
                  </div>
                </div>
              )}

              {!form.thumbnail && (
                <div className='flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 p-10 text-center'>
                  <IconPlayerPlay className='h-10 w-10 text-gray-400' />
                  <p className='mt-3 text-sm font-medium text-gray-600'>
                    No thumbnail selected
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className='grid gap-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:grid-cols-2'>
            <div className='grid gap-2'>
              <Label htmlFor='sortOrder'>Display Order</Label>
              <Input
                id='sortOrder'
                type='number'
                min='0'
                value={form.sortOrder ?? 0}
                onChange={(event) =>
                  updateField(
                    'sortOrder',
                    Number(event.target.value) || 0
                  )
                }
                disabled={saving}
              />
              <p className='text-muted-foreground text-xs'>
                Lower numbers appear first.
              </p>
            </div>

            <div className='flex items-center gap-3 pt-7'>
              <input
                id='isActive'
                type='checkbox'
                checked={Boolean(form.isActive)}
                onChange={(event) =>
                  updateField(
                    'isActive',
                    event.target.checked
                  )
                }
                disabled={saving}
                className='h-4 w-4 rounded border-gray-300'
              />

              <div>
                <Label
                  htmlFor='isActive'
                  className='cursor-pointer'
                >
                  Publish walkthrough
                </Label>
                <p className='text-muted-foreground mt-1 text-xs'>
                  Published walkthroughs are shown on the public
                  website.
                </p>
              </div>
            </div>
          </div>

          <div className='flex justify-end gap-3 pb-8'>
            <button
              type='button'
              onClick={() =>
                router.push('/dashboard/walkthrough')
              }
              disabled={saving}
              className={cn(
                buttonVariants({ variant: 'outline' })
              )}
            >
              Cancel
            </button>

            <Button
              type='submit'
              disabled={saving || uploadingVideo}
              className='bg-black text-white hover:bg-gray-800'
            >
              {saving
                ? 'Creating...'
                : uploadingVideo
                  ? 'Uploading video...'
                  : 'Create Walkthrough'}
            </Button>
          </div>
        </form>

        <MediaSelectionDialog
          open={mediaDialogOpen}
          onOpenChange={setMediaDialogOpen}
          onSelect={handleMediaSelection}
          title='Select Walkthrough Thumbnail'
        />
      </div>
    </PageContainer>
  );
}
