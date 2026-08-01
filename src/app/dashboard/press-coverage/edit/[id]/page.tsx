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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { pressService } from '@/http/press';
import { cn } from '@/lib/utils';
import {
  IconArrowLeft,
  IconTrash,
  IconX,
  IconGripVertical,
  IconPlus,
  IconPhoto,
  IconLink,
  IconInfoCircle,
  IconAlertCircle
} from '@tabler/icons-react';
import Link from 'next/link';
import { Save, Loader2 } from 'lucide-react';
import { MediaSelectionDialog } from '@/components/modal/media-gallary';
import { toast } from 'sonner';

// ============================================================================
// TypeScript Interfaces
// ============================================================================

interface PressItem {
  id: string;
  title: string;
  publicationName?: string;
  publicationDate?: string;
  url?: string | null;
  imageUrl?: string;
  excerpt?: string;
  sortOrder: number;
  pressId: string;
  createdAt?: string;
  updatedAt?: string;
  isNew?: boolean;
}

interface Press {
  id: string;
  name: string;
  description: string;
  slug: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  items: PressItem[];
}

interface MediaImage {
  key: string;
  url: string;
}

interface PressItemComponentProps {
  item: PressItem;
  onDelete: (id: string) => void;
  onUpdate: (id: string, data: Partial<PressItem>) => void;
  isUploading: boolean;
}

interface PressEditFormProps {
  onSave: (press: Press) => Promise<void>;
}

// ============================================================================
// Utility Functions
// ============================================================================

const generateSlugFromText = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
};

const formatDateForInput = (date: string | undefined): string => {
  if (!date) return '';
  return date.split('T')[0];
};

const formatDateForAPI = (date: string): string => {
  return new Date(`${date.split('T')[0]}T00:00:00Z`).toISOString();
};

// ============================================================================
// Press Item Component
// ============================================================================

const PressItemComponent: React.FC<PressItemComponentProps> = React.memo(
  ({ item, onDelete, onUpdate, isUploading }) => {
    const handleDelete = useCallback(() => {
      onDelete(item.id);
    }, [item.id, onDelete]);

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        onUpdate(item.id, { [name]: value });
      },
      [item.id, onUpdate]
    );

    return (
      <div className='relative flex gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900'>
        {/* Drag Handle */}
        <div className='flex-shrink-0 cursor-grab active:cursor-grabbing'>
          <IconGripVertical className='h-5 w-5 text-gray-400 dark:text-zinc-500' />
        </div>

        {/* Image Preview */}
        {item.imageUrl && (
          <div className='relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md bg-gray-100 dark:bg-zinc-800'>
            <img
              src={item.imageUrl}
              alt={item.title || 'Press item image'}
              className='h-full w-full object-cover'
              loading='lazy'
            />

            {isUploading && item.isNew && (
              <div className='absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm'>
                <Loader2 className='h-5 w-5 animate-spin text-white' />
              </div>
            )}
          </div>
        )}

        {/* Form Fields */}
        <div className='flex flex-1 flex-col space-y-3'>
          <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
            {/* Title */}
            <div>
              <Label
                htmlFor={`title-${item.id}`}
                className='text-xs font-medium text-zinc-900 dark:text-zinc-100'
              >
                Title <span className='text-red-500'>*</span>
              </Label>
              <Input
                id={`title-${item.id}`}
                name='title'
                value={item.title || ''}
                onChange={handleChange}
                placeholder='Enter article title'
                className='mt-1'
                required
                maxLength={200}
              />
            </div>

            {/* Publication Name */}
            <div>
              <Label
                htmlFor={`publicationName-${item.id}`}
                className='text-xs font-medium text-zinc-900 dark:text-zinc-100'
              >
                Publication Name
              </Label>
              <Input
                id={`publicationName-${item.id}`}
                name='publicationName'
                value={item.publicationName || ''}
                onChange={handleChange}
                placeholder='e.g. The New York Times'
                className='mt-1'
                maxLength={100}
              />
            </div>

            {/* Publication Date */}
            <div>
              <Label
                htmlFor={`publicationDate-${item.id}`}
                className='text-xs font-medium text-zinc-900 dark:text-zinc-100'
              >
                Publication Date
              </Label>
              <Input
                id={`publicationDate-${item.id}`}
                name='publicationDate'
                type='date'
                value={formatDateForInput(item.publicationDate)}
                onChange={handleChange}
                className='mt-1'
                max={new Date().toISOString().split('T')[0]}
              />
            </div>

            {/* Article URL */}
            <div>
              <Label
                htmlFor={`url-${item.id}`}
                className='text-xs font-medium text-zinc-900 dark:text-zinc-100'
              >
                Article URL
              </Label>
              <div className='relative mt-1'>
                <Input
                  id={`url-${item.id}`}
                  name='url'
                  type='url'
                  value={item.url || ''}
                  onChange={handleChange}
                  placeholder='https://example.com/article'
                  className='pr-8'
                  pattern='https?://.*'
                />
                <IconLink className='pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-zinc-500' />
              </div>
            </div>

            {/* Excerpt */}
            <div className='sm:col-span-2'>
              <Label
                htmlFor={`excerpt-${item.id}`}
                className='text-xs font-medium text-zinc-900 dark:text-zinc-100'
              >
                Excerpt
              </Label>
              <Textarea
                id={`excerpt-${item.id}`}
                name='excerpt'
                value={item.excerpt || ''}
                onChange={handleChange}
                placeholder='A brief excerpt from the article'
                className='mt-1 h-20 resize-none'
                maxLength={500}
              />
              {item.excerpt && (
                <p className='mt-1 text-xs text-gray-500 dark:text-zinc-400'>
                  {item.excerpt.length}/500 characters
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Delete Button */}
        <button
          onClick={handleDelete}
          className='absolute top-2 right-2 rounded-full p-1.5 text-gray-400 transition-all hover:bg-red-50 hover:text-red-600 dark:text-zinc-500 dark:hover:bg-red-950/30 dark:hover:text-red-400'
          aria-label={`Remove ${item.title || 'item'}`}
          type='button'
        >
          <IconX className='h-4 w-4' />
        </button>
      </div>
    );
  }
);

PressItemComponent.displayName = 'PressItemComponent';

// ============================================================================
// Press Edit Form Component
// ============================================================================

const PressEditForm: React.FC<PressEditFormProps> = ({ onSave }) => {
  const router = useRouter();
  const params = useParams();
  const pressId = params.id as string;
  const isNewPress = pressId === 'new';

  // State Management
  const [loading, setLoading] = useState<boolean>(!isNewPress);
  const [saving, setSaving] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [mediaDialogOpen, setMediaDialogOpen] = useState(false);
  const [currentItemId, setCurrentItemId] = useState<string | null>(null);

  const [press, setPress] = useState<Press>({
    id: '',
    name: '',
    description: '',
    slug: '',
    isActive: true,
    items: []
  });

  const hasItem = useMemo(() => press.items.length > 0, [press.items.length]);

  // Fetch Press Data
  useEffect(() => {
    if (isNewPress) {
      setLoading(false);
      return;
    }

    const fetchPress = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await pressService.getPressById(pressId);
        setPress(data);
      } catch (err: any) {
        console.error('Error fetching press:', err);
        const errorMessage =
          err.response?.data?.message || 'Failed to load press details';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchPress();
  }, [pressId, isNewPress]);

  // Handle Input Changes
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setPress((prev) => ({ ...prev, [name]: value }));
    },
    []
  );

  // Handle Switch Changes
  const handleSwitchChange = useCallback((checked: boolean) => {
    setPress((prev) => ({ ...prev, isActive: checked }));
  }, []);

  // Generate Slug
  const generateSlug = useCallback(() => {
    if (!press.name.trim()) {
      toast.error('Please enter a section name first');
      return;
    }
    const slug = generateSlugFromText(press.name);
    setPress((prev) => ({ ...prev, slug }));
    toast.success('Slug generated successfully');
  }, [press.name]);

  // Open Media Dialog
  const openMediaDialog = useCallback((itemId: string | null) => {
    setCurrentItemId(itemId);
    setMediaDialogOpen(true);
  }, []);

  // Handle Media Selection
  const handleMediaSelection = useCallback(
    (selectedImages: MediaImage[]) => {
      if (selectedImages.length === 0) {
        setMediaDialogOpen(false);
        return;
      }

      const existingItem = hasItem ? press.items[0] : null;

      const newItem: PressItem = {
        id: existingItem?.id || `temp-${Date.now()}`,
        title: existingItem?.title || '',
        publicationName: existingItem?.publicationName || '',
        publicationDate:
          existingItem?.publicationDate ||
          new Date().toISOString().split('T')[0],
        url: existingItem?.url || '',
        imageUrl: selectedImages[0].url,
        excerpt: existingItem?.excerpt || '',
        sortOrder: 0,
        pressId: press.id || '',
        isNew: !existingItem || existingItem.id.startsWith('temp-')
      };

      setPress((prev) => ({
        ...prev,
        items: [newItem]
      }));

      setMediaDialogOpen(false);
      toast.success('Image selected successfully');
    },
    [hasItem, press.id, press.items]
  );

  // Add Empty Press Item
  const addEmptyPressItem = useCallback(() => {
    if (hasItem) {
      toast.warning('Only one press item is allowed per section');
      return;
    }

    const newItem: PressItem = {
      id: `temp-${Date.now()}`,
      title: '',
      publicationName: '',
      publicationDate: new Date().toISOString().split('T')[0],
      url: '',
      imageUrl: '',
      excerpt: '',
      sortOrder: 0,
      pressId: press.id || '',
      isNew: true
    };

    setPress((prev) => ({
      ...prev,
      items: [newItem]
    }));

    toast.success('Press item added');
  }, [hasItem, press.id]);

  // Update Press Item
  const handleItemUpdate = useCallback(
    (id: string, data: Partial<PressItem>) => {
      setPress((prev) => ({
        ...prev,
        items: prev.items.map((item) =>
          item.id === id ? { ...item, ...data } : item
        )
      }));
    },
    []
  );

  // Delete Press Item
  const handleItemDelete = useCallback(
    async (id: string) => {
      const confirmDelete = window.confirm(
        'Are you sure you want to remove this press item?'
      );
      if (!confirmDelete) return;

      if (isNewPress || id.startsWith('temp-')) {
        setPress((prev) => ({
          ...prev,
          items: prev.items.filter((item) => item.id !== id)
        }));
        toast.success('Press item removed');
        return;
      }

      try {
        await pressService.deletePressItem(id);
        setPress((prev) => ({
          ...prev,
          items: prev.items.filter((item) => item.id !== id)
        }));
        toast.success('Press item removed successfully');
      } catch (error: any) {
        console.error('Error deleting press item:', error);
        toast.error(
          error.response?.data?.message || 'Failed to remove press item'
        );
      }
    },
    [isNewPress]
  );

  // Validate Form
  const validateForm = (): boolean => {
    if (!press.name.trim()) {
      toast.error('Press section name is required');
      return false;
    }

    if (!press.slug.trim()) {
      toast.error('Press section slug is required');
      return false;
    }

    if (press.items.length === 0) {
      toast.error('You must add at least one press item');
      return false;
    }

    if (press.items.length > 1) {
      toast.error('Only one press item is allowed per section');
      return false;
    }

    const item = press.items[0];
    if (!item.title.trim()) {
      toast.error('Press item title is required');
      return false;
    }

    if (item.url && !item.url.match(/^https?:\/\/.+/)) {
      toast.error('Please enter a valid URL starting with http:// or https://');
      return false;
    }

    return true;
  };

  // Save Press
  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);

      const formattedPress: any = {
        name: press.name.trim(),
        slug: press.slug.trim(),
        description: press.description.trim(),
        isActive: press.isActive,
        items: press.items.map((item, index) => {
          const formattedItem: any = {
            title: item.title.trim(),
            publicationName: item.publicationName?.trim() || '',
            publicationDate: item.publicationDate
              ? formatDateForAPI(item.publicationDate)
              : null,
            url: item.url?.trim() || null,
            imageUrl: item.imageUrl?.trim() || '',
            excerpt: item.excerpt?.trim() || '',
            sortOrder: index
          };

          if (!item.id.startsWith('temp-')) {
            formattedItem.id = item.id;
          }

          return formattedItem;
        })
      };

      await onSave(formattedPress);
    } catch (err: any) {
      console.error('Error saving press:', err);
      toast.error(
        err.response?.data?.message || 'Failed to save press section'
      );
    } finally {
      setSaving(false);
    }
  };

  // Sorted Items
  const sortedItems = useMemo(() => {
    return [...press.items].sort((a, b) => a.sortOrder - b.sortOrder);
  }, [press.items]);

  // Loading State
  if (loading) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <div className='flex flex-col items-center space-y-4'>
          <Loader2 className='h-8 w-8 animate-spin text-gray-600 dark:text-zinc-400' />
          <p className='text-sm text-gray-600 dark:text-zinc-400'>
            Loading press details...
          </p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <Alert variant='destructive' className='max-w-md'>
          <IconAlertCircle className='h-4 w-4' />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
          <Button
            onClick={() => router.back()}
            variant='outline'
            className='mt-4'
          >
            Go Back
          </Button>
        </Alert>
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
        multiple={false}
        title='Select Image for Press Item'
      />

      {/* Press Section Details */}
      <div className='space-y-4 rounded-lg border border-gray-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900'>
        <h2 className='text-xl font-semibold text-zinc-900 dark:text-zinc-100'>
          Press Section Details
        </h2>

        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
          {/* Section Name */}
          <div className='space-y-2'>
            <Label htmlFor='name' className='font-medium'>
              Section Name <span className='text-red-500'>*</span>
            </Label>
            <Input
              id='name'
              name='name'
              value={press.name}
              onChange={handleInputChange}
              placeholder='Enter press section name'
              required
              maxLength={100}
            />
          </div>

          {/* Slug */}
          <div className='space-y-2'>
            <Label htmlFor='slug' className='font-medium'>
              Slug <span className='text-red-500'>*</span>
            </Label>
            <div className='flex gap-2'>
              <Input
                id='slug'
                name='slug'
                value={press.slug}
                onChange={handleInputChange}
                placeholder='press-section-slug'
                required
                pattern='[a-z0-9-]+'
                maxLength={100}
              />
              <Button
                variant='outline'
                onClick={generateSlug}
                className='flex-shrink-0'
                type='button'
                disabled={!press.name.trim()}
              >
                Generate
              </Button>
            </div>
          </div>

          {/* Description */}
          <div className='space-y-2 sm:col-span-2'>
            <Label htmlFor='description' className='font-medium'>
              Description
            </Label>
            <Textarea
              id='description'
              name='description'
              value={press.description}
              onChange={handleInputChange}
              placeholder='Enter press section description'
              className='min-h-24 resize-none'
              maxLength={500}
            />
            {press.description && (
              <p className='text-xs text-gray-500 dark:text-zinc-400'>
                {press.description.length}/500 characters
              </p>
            )}
          </div>

          {/* Active Status */}
          <div className='flex items-center space-x-2'>
            <Switch
              id='isActive'
              checked={press.isActive}
              onCheckedChange={handleSwitchChange}
            />
            <Label htmlFor='isActive' className='font-medium'>
              Section is active
            </Label>
          </div>
        </div>
      </div>

      <Separator className='my-6 bg-gray-200 dark:bg-zinc-800' />

      {/* Press Item */}
      <div className='space-y-4 rounded-lg border border-gray-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900'>
        <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div className='flex items-center gap-2'>
            <h2 className='text-xl font-semibold text-zinc-900 dark:text-zinc-100'>
              Press Item
            </h2>
            <div className='rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-950/30 dark:text-blue-400'>
              <div className='flex items-center gap-1'>
                <IconInfoCircle className='h-3 w-3' />
                <span>One item per section</span>
              </div>
            </div>
          </div>

          {!hasItem && (
            <div className='flex flex-wrap gap-2'>
              <Button
                type='button'
                onClick={addEmptyPressItem}
                variant='outline'
                size='sm'
              >
                <IconPlus className='mr-2 h-4 w-4' />
                Add Item
              </Button>

              <Button
                type='button'
                onClick={() => openMediaDialog('new')}
                variant='outline'
                size='sm'
              >
                <IconPhoto className='mr-2 h-4 w-4' />
                Add with Image
              </Button>
            </div>
          )}
        </div>

        <div className='space-y-3'>
          {sortedItems.length === 0 ? (
            <div className='flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 p-12 text-center dark:border-zinc-700 dark:bg-zinc-900/50'>
              <div className='rounded-full bg-gray-100 p-3 dark:bg-zinc-800'>
                <IconLink className='h-6 w-6 text-gray-400 dark:text-zinc-500' />
              </div>
              <p className='mt-4 text-sm font-medium text-gray-600 dark:text-zinc-400'>
                No press item added yet
              </p>
              <p className='mt-1 text-xs text-gray-500 dark:text-zinc-500'>
                Add a press item using the buttons above
              </p>
              <div className='mt-4 flex gap-3'>
                <Button
                  variant='outline'
                  onClick={addEmptyPressItem}
                  type='button'
                  size='sm'
                >
                  <IconPlus className='mr-2 h-4 w-4' />
                  Add Item
                </Button>

                <Button
                  variant='outline'
                  onClick={() => openMediaDialog('new')}
                  type='button'
                  size='sm'
                >
                  <IconPhoto className='mr-2 h-4 w-4' />
                  Add with Image
                </Button>
              </div>
            </div>
          ) : (
            <div className='space-y-3'>
              {sortedItems.map((item) => (
                <PressItemComponent
                  key={item.id}
                  item={item}
                  onDelete={handleItemDelete}
                  onUpdate={handleItemUpdate}
                  isUploading={uploading}
                />
              ))}

              {hasItem && (
                <div className='flex justify-end gap-2 pt-2'>
                  <Button
                    type='button'
                    onClick={() => openMediaDialog(press.items[0].id)}
                    variant='outline'
                    size='sm'
                  >
                    <IconPhoto className='mr-2 h-4 w-4' />
                    Change Image
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Hidden Save Button for External Trigger */}
      <button
        className='hidden'
        onClick={handleSave}
        id='savePressButton'
        aria-hidden='true'
      />
    </div>
  );
};

// ============================================================================
// Main Page Component
// ============================================================================

export default function PressEditPage() {
  const params = useParams();
  const router = useRouter();
  const pressId = params.id as string;
  const isNewPress = pressId === 'new';
  const [saving, setSaving] = useState(false);

  const handleSave = async (press: any) => {
    try {
      setSaving(true);

      if (isNewPress) {
        await pressService.createPress(press);
        toast.success('Press section created successfully');
      } else {
        await pressService.updatePress(pressId, press);
        toast.success('Press section updated successfully');
      }

      router.push('/dashboard/press-coverage');
    } catch (err: any) {
      console.error('Error saving press section:', err);
      toast.error(
        err.response?.data?.message || 'Failed to save press section'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = useCallback(async () => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this press section permanently? This action cannot be undone.'
    );

    if (!confirmDelete || isNewPress) return;

    try {
      setSaving(true);
      await pressService.deletePress(pressId);
      toast.success('Press section deleted successfully');
      router.push('/dashboard/press-coverage');
    } catch (error: any) {
      console.error('Error deleting press section:', error);
      toast.error(
        error.response?.data?.message || 'Failed to delete press section'
      );
    } finally {
      setSaving(false);
    }
  }, [pressId, isNewPress, router]);

  const triggerSave = useCallback(() => {
    document.getElementById('savePressButton')?.click();
  }, []);

  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-6'>
        {/* Header */}
        <div className='flex flex-col space-y-4 sm:flex-row sm:items-start sm:justify-between sm:space-y-0'>
          <Heading
            title={isNewPress ? 'Create Press Section' : 'Edit Press Section'}
            description={
              isNewPress
                ? 'Create a new press and media coverage section.'
                : 'Edit press section details and manage press item.'
            }
          />

          <div className='flex flex-wrap items-center gap-3'>
            <Link
              href='/dashboard/press-coverage'
              className={cn(buttonVariants({ variant: 'outline' }))}
            >
              <IconArrowLeft className='mr-2 h-4 w-4' />
              Back
            </Link>

            {!isNewPress && (
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
              className='bg-black text-white hover:bg-gray-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200'
            >
              {saving && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
              {!saving && <Save className='mr-2 h-4 w-4' />}
              {isNewPress ? 'Create Section' : 'Save Changes'}
            </Button>
          </div>
        </div>

        <Separator className='bg-gray-200 dark:bg-zinc-800' />

        {/* Form */}
        <PressEditForm onSave={handleSave} />
      </div>
    </PageContainer>
  );
}
