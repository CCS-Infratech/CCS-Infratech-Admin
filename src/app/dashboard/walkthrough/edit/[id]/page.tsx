'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  IconEye,
  IconPhoto,
  IconPlayerPlay,
  IconTrash,
} from '@tabler/icons-react';
import { toast } from 'sonner';

import PageContainer from '@/components/layout/page-container';
import { MediaSelectionDialog } from '@/components/modal/media-gallary';
import { Button, buttonVariants } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import {
  walkthroughService,
  type UpdateWalkthrough,
  type Walkthrough,
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

export default function EditWalkthroughPage() {
  const params = useParams();
  const router = useRouter();

  const walkthroughId = params.id as string;

  const [walkthrough, setWalkthrough] =
    useState<Walkthrough | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [mediaDialogOpen, setMediaDialogOpen] = useState(false);

  useEffect(() => {
    const loadWalkthrough = async () => {
      if (!walkthroughId) return;

      try {
        setLoading(true);

        const data =
          await walkthroughService.getWalkthroughById(
            walkthroughId
          );

        setWalkthrough(data);
      } catch (error) {
        console.error(
          'Failed to load walkthrough:',
          error
        );
        toast.error('Failed to load walkthrough');
        router.push('/dashboard/walkthrough');
      } finally {
        setLoading(false);
      }
    };

    loadWalkthrough();
  }, [router, walkthroughId]);

  const updateField = (
    field: keyof Walkthrough,
    value: string | boolean | number | null
  ) => {
    setWalkthrough((current) =>
      current
        ? {
            ...current,
            [field]: value,
          }
        : current
    );
  };

  const handleMediaSelection = (
    selectedImages: { url: string }[]
  ) => {
    if (selectedImages.length === 0) return;

    updateField(
      'thumbnail',
      selectedImages[0].url
    );

    setMediaDialogOpen(false);

    toast.success('Walkthrough thumbnail selected');
  };

  const handleSave = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!walkthrough) return;

    if (!walkthrough.title.trim()) {
      toast.error('Title is required');
      return;
    }

    if (!walkthrough.videoUrl.trim()) {
      toast.error('Video URL is required');
      return;
    }

    if (!walkthrough.thumbnail.trim()) {
      toast.error('Thumbnail is required');
      return;
    }

    try {
      setSaving(true);

      const payload: UpdateWalkthrough = {
        title: walkthrough.title.trim(),
        description:
          walkthrough.description?.trim() || null,
        videoUrl: walkthrough.videoUrl.trim(),
        thumbnail: walkthrough.thumbnail.trim(),
        isActive: Boolean(walkthrough.isActive),
        sortOrder:
          typeof walkthrough.sortOrder === 'number'
            ? walkthrough.sortOrder
            : 0,
      };

      const updated =
        await walkthroughService.updateWalkthrough(
          walkthrough.id,
          payload
        );

      setWalkthrough(updated);

      toast.success(
        'Walkthrough updated successfully'
      );
    } catch (error) {
      console.error(
        'Failed to update walkthrough:',
        error
      );
      toast.error('Failed to update walkthrough');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!walkthrough) return;

    const confirmed = window.confirm(
      `Delete "${walkthrough.title}" permanently?`
    );

    if (!confirmed) return;

    try {
      setDeleting(true);

      await walkthroughService.deleteWalkthrough(
        walkthrough.id
      );

      toast.success(
        'Walkthrough deleted successfully'
      );

      router.push('/dashboard/walkthrough');
    } catch (error) {
      console.error(
        'Failed to delete walkthrough:',
        error
      );
      toast.error('Failed to delete walkthrough');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <div className='flex min-h-[400px] items-center justify-center'>
          <div className='h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-black' />
        </div>
      </PageContainer>
    );
  }

  if (!walkthrough) {
    return (
      <PageContainer>
        <div className='flex min-h-[400px] flex-col items-center justify-center'>
          <p className='text-sm text-gray-500'>
            Walkthrough not found.
          </p>

          <Button
            type='button'
            variant='outline'
            className='mt-4'
            onClick={() =>
              router.push('/dashboard/walkthrough')
            }
          >
            Back to Walkthroughs
          </Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-6'>
        <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <Heading
            title='Edit Walkthrough'
            description='Update the walkthrough details, video, thumbnail, and publishing settings.'
          />

          <div className='flex items-center gap-2'>
            <Button
              type='button'
              variant='outline'
              onClick={() =>
                router.push('/dashboard/walkthrough')
              }
              disabled={saving || deleting}
            >
              Back
            </Button>

            <Button
              type='button'
              variant='destructive'
              onClick={handleDelete}
              disabled={saving || deleting}
            >
              <IconTrash className='mr-2 h-4 w-4' />
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>

        <Separator className='bg-gray-100' />

        <form
          onSubmit={handleSave}
          className='max-w-5xl space-y-8'
        >
          <div className='rounded-xl border border-gray-200 bg-white p-6 shadow-sm'>
            <div className='space-y-6'>
              <div className='grid gap-2'>
                <Label htmlFor='title'>
                  Walkthrough Title
                </Label>

                <Input
                  id='title'
                  value={walkthrough.title}
                  onChange={(event) =>
                    updateField(
                      'title',
                      event.target.value
                    )
                  }
                  placeholder='Amor Project Overview'
                  disabled={saving || deleting}
                  required
                />
              </div>

              <div className='grid gap-2'>
                <Label htmlFor='description'>
                  Description
                </Label>

                <Textarea
                  id='description'
                  value={walkthrough.description ?? ''}
                  onChange={(event) =>
                    updateField(
                      'description',
                      event.target.value
                    )
                  }
                  placeholder='Describe what visitors will see in this walkthrough.'
                  className='min-h-28'
                  disabled={saving || deleting}
                />
              </div>
            </div>
          </div>

          <div className='rounded-xl border border-gray-200 bg-white p-6 shadow-sm'>
            <div className='space-y-6'>
              <div>
                <h2 className='text-lg font-semibold text-gray-900'>
                  Walkthrough Video
                </h2>

                <p className='mt-1 text-sm text-gray-500'>
                  Enter the hosted video URL used by the
                  public video player.
                </p>
              </div>

              <div className='flex gap-2'>
                <Input
                  id='videoUrl'
                  type='url'
                  value={walkthrough.videoUrl}
                  onChange={(event) =>
                    updateField(
                      'videoUrl',
                      event.target.value
                    )
                  }
                  placeholder='https://...'
                  disabled={saving || deleting}
                  required
                />

                <a
                  href={walkthrough.videoUrl}
                  target='_blank'
                  rel='noreferrer'
                  className={cn(
                    buttonVariants({
                      variant: 'outline',
                    }),
                    'shrink-0'
                  )}
                  title='Open video'
                >
                  <IconEye className='h-4 w-4' />
                </a>
              </div>

              {walkthrough.videoUrl && (
                <div className='overflow-hidden rounded-xl border bg-black'>
                  <div className='flex items-center gap-2 border-b border-zinc-800 bg-zinc-950 px-4 py-3 text-white'>
                    <IconPlayerPlay className='h-4 w-4' />
                    <span className='text-sm font-medium'>
                      Video Preview
                    </span>
                  </div>

                  <video
                    key={walkthrough.videoUrl}
                    src={walkthrough.videoUrl}
                    controls
                    playsInline
                    className='aspect-video w-full'
                  >
                    Your browser does not support video
                    playback.
                  </video>
                </div>
              )}
            </div>
          </div>

          <div className='rounded-xl border border-gray-200 bg-white p-6 shadow-sm'>
            <div className='space-y-6'>
              <div>
                <h2 className='text-lg font-semibold text-gray-900'>
                  Thumbnail
                </h2>

                <p className='mt-1 text-sm text-gray-500'>
                  Select an image from the media library or
                  enter an image URL manually.
                </p>
              </div>

              <div className='flex flex-col gap-3 sm:flex-row'>
                <Input
                  value={walkthrough.thumbnail}
                  onChange={(event) =>
                    updateField(
                      'thumbnail',
                      event.target.value
                    )
                  }
                  placeholder='/images/DayView.png or image URL'
                  disabled={saving || deleting}
                  className='flex-1'
                />

                <Button
                  type='button'
                  variant='outline'
                  onClick={() =>
                    setMediaDialogOpen(true)
                  }
                  disabled={saving || deleting}
                >
                  <IconPhoto className='mr-2 h-4 w-4' />
                  Select Image
                </Button>
              </div>

              {walkthrough.thumbnail ? (
                <div className='overflow-hidden rounded-xl border bg-gray-50'>
                  <div className='flex items-center gap-2 border-b px-4 py-3'>
                    <IconPhoto className='h-4 w-4 text-gray-500' />

                    <span className='text-sm font-medium text-gray-700'>
                      Thumbnail Preview
                    </span>
                  </div>

                  <div className='aspect-video overflow-hidden'>
                    <img
                      src={getPreviewImageUrl(
                        walkthrough.thumbnail
                      )}
                      alt={walkthrough.title}
                      className='h-full w-full object-cover'
                      onError={(event) => {
                        event.currentTarget.style.display =
                          'none';
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div className='flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 p-10 text-center'>
                  <IconPhoto className='h-10 w-10 text-gray-400' />

                  <p className='mt-3 text-sm font-medium text-gray-600'>
                    No thumbnail selected
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className='grid gap-6 rounded-xl border border-gray-200 bg-white p-6 sm:grid-cols-2'>
            <div className='grid gap-2'>
              <Label htmlFor='sortOrder'>
                Display Order
              </Label>

              <Input
                id='sortOrder'
                type='number'
                min='0'
                value={walkthrough.sortOrder}
                onChange={(event) =>
                  updateField(
                    'sortOrder',
                    Number(event.target.value) || 0
                  )
                }
                disabled={saving || deleting}
              />

              <p className='text-xs text-gray-500'>
                Lower numbers appear first.
              </p>
            </div>

            <div className='flex items-center gap-3 pt-7'>
              <input
                id='isActive'
                type='checkbox'
                checked={Boolean(
                  walkthrough.isActive
                )}
                onChange={(event) =>
                  updateField(
                    'isActive',
                    event.target.checked
                  )
                }
                disabled={saving || deleting}
                className='h-4 w-4 rounded border-gray-300'
              />

              <div>
                <Label
                  htmlFor='isActive'
                  className='cursor-pointer'
                >
                  Publish walkthrough
                </Label>

                <p className='mt-1 text-xs text-gray-500'>
                  Published walkthroughs appear on the
                  public website.
                </p>
              </div>
            </div>
          </div>

          <div className='flex justify-end gap-3 pb-8'>
            <Button
              type='button'
              variant='outline'
              onClick={() =>
                router.push('/dashboard/walkthrough')
              }
              disabled={saving || deleting}
            >
              Cancel
            </Button>

            <Button
              type='submit'
              disabled={saving || deleting}
              className='bg-black text-white hover:bg-gray-800'
            >
              {saving ? 'Saving...' : 'Save Changes'}
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
