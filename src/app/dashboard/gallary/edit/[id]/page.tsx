'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import PageContainer from '@/components/layout/page-container';
import { Button, buttonVariants } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { galleryService } from '@/http/gallary';
import { cn } from '@/lib/utils';
import {
  IconArrowLeft,
  IconTrash,
  IconX,
  IconGripVertical,
  IconPlus,
  IconPhoto
} from '@tabler/icons-react';
import Link from 'next/link';
import { Save } from 'lucide-react';
import { MediaSelectionDialog } from '@/components/modal/media-gallary';
import { toast } from 'sonner';

// Define type-safe interfaces
interface GalleryImage {
  id: string;
  url: string;
  filename: string;
  alt?: string;
  caption?: string;
  sortOrder: number;
  galleryId: string;
  createdAt: string;
  updatedAt: string;
  isNew?: boolean;
}

interface Gallery {
  id: string;
  name: string;
  description: string;
  slug: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  images: GalleryImage[];
}

interface MediaImage {
  key: string;
  url: string;
}

// Component for each image item
const GalleryImageItem = ({
  image,
  onDelete,
  onUpdate,
  isUploading
}: {
  image: GalleryImage;
  onDelete: (id: string) => void;
  onUpdate: (id: string, data: Partial<GalleryImage>) => void;
  isUploading: boolean;
}) => {
  const handleDelete = useCallback(() => {
    onDelete(image.id);
  }, [image.id, onDelete]);

  const handleAltChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onUpdate(image.id, { alt: e.target.value });
    },
    [image.id, onUpdate]
  );

  const handleCaptionChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onUpdate(image.id, { caption: e.target.value });
    },
    [image.id, onUpdate]
  );

  return (
    <div className='relative flex gap-4 rounded-lg border border-gray-200 bg-white p-4'>
      <div className='flex-shrink-0 cursor-grab'>
        <IconGripVertical className='h-5 w-5 text-gray-400' />
      </div>

      <div className='relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md bg-gray-100'>
        <img
          src={image.url}
          alt={image.alt || 'Gallery image'}
          className='h-full w-full object-cover'
        />

        {isUploading && image.isNew && (
          <div className='absolute inset-0 flex items-center justify-center bg-black/30'>
            <div className='h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent'></div>
          </div>
        )}
      </div>

      <div className='flex flex-1 flex-col space-y-3'>
        <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
          <div>
            <Label htmlFor={`alt-${image.id}`} className='text-xs'>
              Alt Text
            </Label>
            <Input
              id={`alt-${image.id}`}
              value={image.alt || ''}
              onChange={handleAltChange}
              placeholder='Descriptive alt text'
              className='mt-1'
            />
          </div>
          <div>
            <Label htmlFor={`caption-${image.id}`} className='text-xs'>
              Caption
            </Label>
            <Input
              id={`caption-${image.id}`}
              value={image.caption || ''}
              onChange={handleCaptionChange}
              placeholder='Optional caption'
              className='mt-1'
            />
          </div>
        </div>
      </div>

      <button
        onClick={handleDelete}
        className='absolute top-2 right-2 rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600'
        aria-label={`Remove ${image.filename}`}
      >
        <IconX className='h-4 w-4' />
        <span className='sr-only'>Remove image</span>
      </button>
    </div>
  );
};

// Gallery edit component
const GalleryEditForm = ({
  onSave
}: {
  onSave: (gallery: Gallery) => Promise<void>;
}) => {
  const router = useRouter();
  const params = useParams();
  const galleryId = params.id as string;
  const isNewGallery = galleryId === 'new';

  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [mediaDialogOpen, setMediaDialogOpen] = useState(false);

  const [gallery, setGallery] = useState<Gallery>({
    id: '',
    name: '',
    description: '',
    slug: '',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    images: []
  });

  useEffect(() => {
    // Skip loading for new galleries
    if (isNewGallery) {
      setLoading(false);
      return;
    }

    const fetchGallery = async () => {
      try {
        setLoading(true);
        const response: any = await galleryService.getGalleryById(galleryId);

        const galleryData = response?.data?.id
          ? response.data // full API response: { success, data: gallery }
          : response?.id
            ? response // already unwrapped: gallery directly
            : null;

        if (!galleryData) {
          throw new Error('No gallery data returned');
        }

        setGallery(galleryData);
      } catch (err) {
        console.error('Error fetching gallery:', err);
        setError('Failed to load gallery');
        toast.error('Failed to load gallery details');
      } finally {
        setLoading(false);
      }
    };

    fetchGallery();
  }, [galleryId, isNewGallery]);

  // Handle input changes
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setGallery((prev) => ({ ...prev, [name]: value }));
    },
    []
  );

  // Handle switch changes
  const handleSwitchChange = useCallback((checked: boolean) => {
    setGallery((prev) => ({ ...prev, isActive: checked }));
  }, []);

  // Generate slug from name
  const generateSlug = useCallback(() => {
    const slug = gallery.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    setGallery((prev) => ({ ...prev, slug }));
  }, [gallery.name]);

  // Handle media selection from dialog
  const handleMediaSelection = useCallback(
    (selectedImages: MediaImage[]) => {
      const newImages: GalleryImage[] = selectedImages.map((image, index) => ({
        id: `temp-${Date.now()}-${index}`,
        url: image.url,
        filename: image.key,
        alt: '',
        caption: '',
        sortOrder: gallery.images.length + index,
        galleryId: gallery.id || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isNew: true
      }));

      setGallery((prev) => ({
        ...prev,
        images: [...prev.images, ...newImages]
      }));

      setMediaDialogOpen(false);
    },
    [gallery.id, gallery.images.length]
  );

  // Update image details
  const handleImageUpdate = useCallback(
    (id: string, data: Partial<GalleryImage>) => {
      setGallery((prev) => ({
        ...prev,
        images: prev.images.map((image) =>
          image.id === id ? { ...image, ...data } : image
        )
      }));
    },
    []
  );

  const handleImageDelete = useCallback(
    async (id: string) => {
      if (isNewGallery || id.startsWith('temp-')) {
        setGallery((prev) => ({
          ...prev,
          images: prev.images.filter((image) => image.id !== id)
        }));
        return;
      }

      try {
        await galleryService.deleteGalleryImage(id);

        setGallery((prev) => ({
          ...prev,
          images: prev.images.filter((image) => image.id !== id)
        }));

        toast.success('Image removed from gallery');
      } catch (error) {
        console.error('Error deleting image:', error);
        toast.error('Failed to remove image');
      }
    },
    [isNewGallery]
  );

  // Save gallery
  const handleSave = async () => {
    try {
      setSaving(true);

      // Validate required fields
      if (!gallery.name) {
        toast.error('Gallery name is required');
        return;
      }

      if (!gallery.slug) {
        toast.error('Gallery slug is required');
        return;
      }

      // Process images - mark new images as no longer new for saving
      if (gallery.images.some((img) => img.isNew)) {
        setUploading(true);

        // Update the images to mark them as not new anymore for saving
        const updatedImages = gallery.images.map((image) => ({
          ...image,
          isNew: undefined
        }));

        setGallery((prev) => ({
          ...prev,
          images: updatedImages
        }));

        setUploading(false);
      }

      // Call the parent's onSave function
      await onSave(gallery);
    } catch (err) {
      console.error('Error saving gallery:', err);
      toast.error('Failed to save gallery');
    } finally {
      setSaving(false);
    }
  };

  // Memoize the image list to prevent unnecessary re-renders
  const sortedImages = useMemo(() => {
    return [...gallery.images].sort((a, b) => a.sortOrder - b.sortOrder);
  }, [gallery.images]);

  if (loading) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <div className='h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-black'></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <div className='rounded-lg bg-white p-8 shadow-sm'>
          <h3 className='text-center text-lg font-medium'>{error}</h3>
          <p className='mt-2 text-center text-sm text-gray-500'>
            We couldn't load the gallery details.
          </p>
          <button
            onClick={() => router.back()}
            className={cn(
              buttonVariants({ variant: 'outline' }),
              'mx-auto mt-4 block'
            )}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Media Selection Dialog */}
      <MediaSelectionDialog
        open={mediaDialogOpen}
        onOpenChange={setMediaDialogOpen}
        onSelect={handleMediaSelection}
        multiple={true}
        title='Select Images for Gallery'
      />

      <div className='space-y-6'>
        <div className='space-y-4'>
          <h2 className='text-xl font-medium'>Gallery Details</h2>

          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
            <div className='space-y-2'>
              <Label htmlFor='name'>Gallery Name</Label>
              <Input
                id='name'
                name='name'
                value={gallery.name}
                onChange={handleInputChange}
                placeholder='Enter gallery name'
                required
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='slug'>Slug</Label>
              <div className='flex gap-2'>
                <Input
                  id='slug'
                  name='slug'
                  value={gallery.slug}
                  onChange={handleInputChange}
                  placeholder='gallery-slug'
                  required
                />
                <Button
                  variant='outline'
                  onClick={generateSlug}
                  className='flex-shrink-0'
                  type='button'
                >
                  Generate
                </Button>
              </div>
            </div>

            <div className='space-y-2 sm:col-span-2'>
              <Label htmlFor='description'>Description</Label>
              <Textarea
                id='description'
                name='description'
                value={gallery.description}
                onChange={handleInputChange}
                placeholder='Enter gallery description'
                className='min-h-24'
              />
            </div>

            <div className='flex items-center space-x-2'>
              <Switch
                id='isActive'
                checked={gallery.isActive}
                onCheckedChange={handleSwitchChange}
              />
              <Label htmlFor='isActive'>Gallery is active</Label>
            </div>
          </div>
        </div>

        <Separator className='my-6' />

        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <h2 className='text-xl font-medium'>Gallery Images</h2>

            <div>
              <Button
                type='button'
                onClick={() => setMediaDialogOpen(true)}
                variant='outline'
              >
                <IconPhoto className='mr-2 h-4 w-4' />
                Select Images
              </Button>
            </div>
          </div>

          <div className='space-y-3'>
            {sortedImages.length === 0 ? (
              <div className='flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 p-12 text-center'>
                <div className='rounded-full bg-gray-100 p-3'>
                  <IconPhoto className='h-6 w-6 text-gray-400' />
                </div>
                <p className='mt-4 text-sm font-medium text-gray-600'>
                  No images added yet
                </p>
                <p className='mt-1 text-xs text-gray-500'>
                  Select images to display in this gallery
                </p>
                <Button
                  className='mt-4'
                  variant='outline'
                  onClick={() => setMediaDialogOpen(true)}
                  type='button'
                >
                  <IconPlus className='mr-2 h-4 w-4' />
                  Add Images
                </Button>
              </div>
            ) : (
              <div className='space-y-3'>
                {sortedImages.map((image) => (
                  <GalleryImageItem
                    key={image.id}
                    image={image}
                    onDelete={handleImageDelete}
                    onUpdate={handleImageUpdate}
                    isUploading={uploading}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Expose save function to parent component */}
      <button className='hidden' onClick={handleSave} id='saveGalleryButton' />
    </div>
  );
};

// Main page component
export default function GalleryEditPage() {
  const params = useParams();
  const router = useRouter();
  const galleryId = params.id as string;
  const isNewGallery = galleryId === 'new';
  const [saving, setSaving] = useState(false);

  const handleSave = async (gallery: Gallery) => {
    try {
      setSaving(true);

      // Prepare data for API - clean up temporary fields
      const galleryData = {
        ...gallery,
        images: gallery.images.map((image, index) => ({
          ...(image.id.startsWith('temp-')
            ? { id: undefined }
            : { id: image.id }),
          url: image.url,
          filename: image.filename,
          alt: image.alt,
          caption: image.caption,
          sortOrder: index,
          // Remove temporary fields
          isNew: undefined
        }))
      };

      if (isNewGallery) {
        await galleryService.createGallery(galleryData);
        toast.success('Gallery created successfully');
      } else {
        await galleryService.updateGallery(galleryId, galleryData);
        toast.success('Gallery updated successfully');
      }

      // Redirect to listing page
      router.push('/dashboard/gallary');
    } catch (err) {
      console.error('Error saving gallery:', err);
      toast.error('Failed to save gallery');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = useCallback(async () => {
    if (!isNewGallery && confirm(`Delete this gallery permanently?`)) {
      try {
        setSaving(true);
        await galleryService.deleteGallery(galleryId);
        toast.success('Gallery deleted successfully');
        router.push('/dashboard/gallary');
      } catch (error) {
        console.error('Error deleting gallery:', error);
        toast.error('Failed to delete gallery');
      } finally {
        setSaving(false);
      }
    }
  }, [galleryId, isNewGallery, router]);

  // Trigger save from the hidden button
  const triggerSave = useCallback(() => {
    document.getElementById('saveGalleryButton')?.click();
  }, []);

  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-6'>
        <div className='flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0'>
          <Heading
            title={isNewGallery ? 'Create Gallery' : 'Edit Gallery'}
            description={
              isNewGallery
                ? 'Create a new image gallery.'
                : 'Edit gallery details and manage images.'
            }
          />

          <div className='flex items-center gap-3'>
            <Link
              href='/dashboard/gallary'
              className={cn(buttonVariants({ variant: 'outline' }))}
            >
              <IconArrowLeft className='mr-2 h-4 w-4' />
              Back
            </Link>

            {!isNewGallery && (
              <Button
                variant='destructive'
                onClick={handleDelete}
                disabled={saving}
              >
                <IconTrash className='mr-2 h-4 w-4' />
                Delete
              </Button>
            )}

            <Button
              onClick={triggerSave}
              disabled={saving}
              className='bg-black text-white hover:bg-gray-800'
            >
              {saving && (
                <div className='mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent'></div>
              )}
              <Save className='mr-2 h-4 w-4' />
              {isNewGallery ? 'Create Gallery' : 'Save Changes'}
            </Button>
          </div>
        </div>
        <Separator className='bg-gray-100' />
        <GalleryEditForm onSave={handleSave} />
      </div>
    </PageContainer>
  );
}
