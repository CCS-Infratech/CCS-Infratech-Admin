'use client';

import React, { useState, ChangeEvent, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { IconPhoto } from '@tabler/icons-react';
import { X, Trash2, Move } from 'lucide-react';
import { galleryService } from '@/http/gallary';
import { MediaSelectionDialog } from '@/components/modal/media-gallary';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface GalleryFormData {
  name: string;
  description: string;
  slug: string;
}

interface SelectedImage {
  key: string;
  url: string;
  alt?: string;
  caption?: string;
}

const GalleryCreator: React.FC = () => {
  const [gallery, setGallery] = useState<GalleryFormData>({
    name: '',
    description: '',
    slug: ''
  });
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isMediaDialogOpen, setIsMediaDialogOpen] = useState<boolean>(false);

  const handleGalleryChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setGallery({ ...gallery, [name]: value });

    // Auto-generate slug when name changes
    if (name === 'name') {
      setGallery((prev) => ({
        ...prev,
        slug: value
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '')
      }));
    }
  };

  const handleImageSelection = (images: { key: string; url: string }[]) => {
    const newImages = images.map((img) => ({
      key: img.key,
      url: img.url,
      alt: '',
      caption: ''
    }));

    setSelectedImages(newImages);
    setIsMediaDialogOpen(false);
  };

  const handleImagePropertyChange = (
    key: string,
    field: 'alt' | 'caption',
    value: string
  ) => {
    setSelectedImages(
      selectedImages.map((img) =>
        img.key === key ? { ...img, [field]: value } : img
      )
    );
  };

  const removeImage = (key: string) => {
    setSelectedImages(selectedImages.filter((img) => img.key !== key));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const galleryData = {
        name: gallery.name,
        description: gallery.description,
        slug: gallery.slug,
        isActive: true,
        images: selectedImages.map((img, index) => ({
          url: img.url,
          filename: img.key,
          alt: img.alt || '',
          caption: img.caption || '',
          sortOrder: index
        }))
      };

      await galleryService.createGallery(galleryData);

      setGallery({ name: '', description: '', slug: '' });
      setSelectedImages([]);
      toast.success('Gallery created successfully!');
    } catch (error) {
      console.error('Error creating gallery:', error);
      alert('Failed to create gallery');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='hide-scrollbar mb-8 h-screen max-w-full overflow-auto px-9 py-16 font-sans'>
      <h1 className='mb-3 text-4xl font-bold text-gray-900'>
        Create a Gallery
      </h1>
      <p className='mb-16 max-w-xl text-lg text-gray-600'>
        Share your visual story with the world through a carefully curated
        gallery of images.
      </p>

      <form onSubmit={handleSubmit} className='space-y-12'>
        <div className='space-y-8'>
          <div className='space-y-3'>
            <label
              htmlFor='name'
              className='block text-base font-medium text-gray-700'
            >
              Gallery Title
            </label>
            <input
              type='text'
              id='name'
              name='name'
              value={gallery.name}
              onChange={handleGalleryChange}
              required
              placeholder='e.g. Urban Architecture of Tokyo'
              className='w-full border-0 border-b-2 border-gray-200 bg-transparent px-0 py-4 text-xl text-gray-800 transition duration-200 placeholder:font-light placeholder:text-gray-400 focus:border-black focus:ring-0'
            />
          </div>

          <div className='space-y-3'>
            <label
              htmlFor='description'
              className='block text-base font-medium text-gray-700'
            >
              Description
            </label>
            <textarea
              id='description'
              name='description'
              value={gallery.description}
              onChange={handleGalleryChange}
              placeholder='Tell the story behind these images...'
              rows={3}
              className='w-full resize-none border-0 border-b-2 border-gray-200 bg-transparent px-0 py-4 text-lg text-gray-800 transition duration-200 placeholder:font-light placeholder:text-gray-400 focus:border-black focus:ring-0'
            />
          </div>
        </div>

        <div
          className='group rounded-lg border-2 border-dashed border-gray-200 p-10 text-center transition-all hover:border-gray-400 hover:bg-gray-50/50'
          onClick={() => setIsMediaDialogOpen(true)}
        >
          <div className='flex cursor-pointer flex-col items-center'>
            <IconPhoto className='mb-5 h-14 w-14 text-gray-400 transition-transform group-hover:scale-110 group-hover:text-gray-600' />
            <h3 className='mb-2 font-serif text-xl text-gray-800'>
              Select images for your gallery
            </h3>
            <p className='mb-6 max-w-md text-base text-gray-500'>
              Choose from your media library to showcase in your gallery. You
              can add captions and alt text for each image.
            </p>
            <Button
              type='button'
              className='px-6 py-3 transition-all hover:shadow-md'
            >
              Select Images
            </Button>
          </div>
        </div>

        <MediaSelectionDialog
          open={isMediaDialogOpen}
          onOpenChange={setIsMediaDialogOpen}
          onSelect={handleImageSelection}
          multiple={true}
          title='Select Gallery Images'
        />

        {selectedImages.length > 0 && (
          <div className='pt-10'>
            <div className='mb-10 flex items-baseline justify-between border-b border-gray-200 pb-4'>
              <h2 className='font-serif text-2xl font-semibold text-gray-900'>
                Gallery Images
              </h2>
              <span className='text-gray-500'>
                {selectedImages.length} image
                {selectedImages.length !== 1 ? 's' : ''}
              </span>
            </div>

            <div className='grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3'>
              {selectedImages.map((img) => (
                <div
                  key={img.key}
                  className='group relative space-y-4 rounded-xl border border-gray-200 bg-white p-3 shadow-sm transition-all hover:shadow-md'
                >
                  <div className='relative aspect-[4/3] overflow-hidden rounded-lg bg-gray-50'>
                    <img
                      src={img.url}
                      alt={img.alt || 'Gallery preview'}
                      className='h-full w-full object-cover transition-transform duration-300 group-hover:scale-105'
                    />
                    <div className='absolute inset-0 bg-black opacity-0 transition-opacity group-hover:opacity-10'></div>
                    <button
                      type='button'
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage(img.key);
                      }}
                      className='bg-opacity-70 absolute top-2 right-2 cursor-pointer rounded-full bg-black p-1.5 text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100'
                    >
                      <Trash2 size={16} className='text-white' />
                    </button>
                  </div>
                  <div className='space-y-3 px-1'>
                    <div>
                      <label className='mb-1 block text-xs font-medium text-gray-500'>
                        Alt Text
                      </label>
                      <input
                        type='text'
                        placeholder='Describe this image for screen readers'
                        value={img.alt || ''}
                        onChange={(e) =>
                          handleImagePropertyChange(
                            img.key,
                            'alt',
                            e.target.value
                          )
                        }
                        className='w-full rounded-md border border-gray-200 px-3 py-1.5 text-sm focus:border-black focus:ring-0'
                      />
                    </div>
                    <div>
                      <label className='mb-1 block text-xs font-medium text-gray-500'>
                        Caption
                      </label>
                      <input
                        type='text'
                        placeholder='Add a visible caption (optional)'
                        value={img.caption || ''}
                        onChange={(e) =>
                          handleImagePropertyChange(
                            img.key,
                            'caption',
                            e.target.value
                          )
                        }
                        className='w-full rounded-md border border-gray-200 px-3 py-1.5 text-sm focus:border-black focus:ring-0'
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className='pt-8'>
          <button
            type='submit'
            className={cn(
              'mt-6 cursor-pointer px-8 py-4 text-base font-medium text-white transition duration-200',
              'bg-black hover:bg-gray-800 disabled:bg-gray-300 disabled:opacity-50',
              'relative overflow-hidden',
              isSubmitting ? 'cursor-wait' : ''
            )}
            disabled={
              isSubmitting ||
              !gallery.name ||
              !gallery.slug ||
              selectedImages.length === 0
            }
          >
            {isSubmitting ? (
              <>
                <span className='opacity-0'>Publish Gallery</span>
                <span className='absolute inset-0 flex items-center justify-center'>
                  Publishing...
                </span>
              </>
            ) : (
              'Publish Gallery'
            )}
          </button>

          {(gallery.name === '' ||
            gallery.slug === '' ||
            selectedImages.length === 0) && (
            <p className='mt-4 text-sm text-gray-500'>
              {gallery.name === '' && 'Please add a title for your gallery. '}
              {gallery.slug === '' && 'Please provide a URL slug. '}
              {selectedImages.length === 0 &&
                'Select at least one image to create your gallery.'}
            </p>
          )}
        </div>
      </form>
    </div>
  );
};

export default GalleryCreator;
