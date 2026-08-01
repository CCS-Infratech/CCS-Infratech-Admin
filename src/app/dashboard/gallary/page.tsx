'use client';

import React, { useState, useEffect, useRef } from 'react';
import PageContainer from '@/components/layout/page-container';
import { buttonVariants } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import { galleryService } from '@/http/gallary';
import { cn } from '@/lib/utils';
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconEye,
  IconPhoto,
  IconDotsVertical,
  IconX
} from '@tabler/icons-react';
import Link from 'next/link';

// Define type-safe interfaces based on the API response
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

interface GalleryResponse {
  success: boolean;
  data: Gallery[];
}
// Gallery card component
const GalleryCard = ({
  gallery,
  onDelete
}: {
  gallery: Gallery;
  onDelete: (id: string) => void;
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        menuRef.current &&
        buttonRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  return (
    <div
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-lg bg-white',
        'transition-all duration-300 ease-out hover:translate-y-[-4px]',
        'ring-1 ring-gray-100 hover:shadow-lg'
      )}
    >
      <div className='relative aspect-[5/3] overflow-hidden bg-gray-50'>
        {gallery.images && gallery.images.length > 0 ? (
          <div className='grid h-full grid-cols-3 grid-rows-2 gap-[2px] overflow-hidden'>
            {gallery.images
              .slice(0, Math.min(5, gallery.images.length))
              .map((image, index) => (
                <div
                  key={image.id}
                  className={cn(
                    'relative overflow-hidden bg-gray-100',
                    index === 0 ? 'col-span-2 row-span-2' : ''
                  )}
                >
                  <img
                    src={image.url}
                    alt={image.alt || gallery.name}
                    className='h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105'
                  />
                </div>
              ))}
          </div>
        ) : (
          <div className='flex h-full items-center justify-center p-6 text-gray-300'>
            <IconPhoto className='h-12 w-12' stroke={1} />
          </div>
        )}

        {/* Status indicator */}
        <div
          className={cn(
            'absolute top-3 right-3 flex h-2.5 w-2.5 items-center justify-center rounded-full',
            gallery.isActive ? 'bg-emerald-500' : 'bg-gray-400'
          )}
        >
          <span className='sr-only'>
            {gallery.isActive ? 'Active' : 'Draft'}
          </span>
        </div>
      </div>

      <div className='flex flex-1 flex-col p-5'>
        <div className='mb-2 flex items-start justify-between'>
          <h3 className='line-clamp-1 text-lg leading-tight font-medium tracking-tight text-gray-900'>
            {gallery.name}
          </h3>
          <div className='relative z-10'>
            <button
              ref={buttonRef}
              className='rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600'
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(!menuOpen);
              }}
            >
              <IconDotsVertical className='h-4 w-4' />
              <span className='sr-only'>Menu</span>
            </button>

            {menuOpen && (
              <div
                ref={menuRef}
                className='ring-opacity-5 absolute top-0 right-0 z-50 mt-8 w-48 overflow-hidden rounded-md bg-white py-1 shadow-xl focus:outline-none'
                style={{ transform: 'translateY(-50%)' }}
              >
                <div className='flex items-center justify-between border-b border-gray-100 px-4 py-2'>
                  <span className='text-xs font-medium text-gray-500'>
                    Actions
                  </span>
                  <button
                    onClick={() => setMenuOpen(false)}
                    className='rounded-full p-0.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                  >
                    <IconX size={14} />
                  </button>
                </div>
                <Link
                  href={`/dashboard/gallary/edit/${gallery.id}`}
                  className='flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
                >
                  <IconEdit className='mr-2 h-4 w-4' />
                  Edit Gallery
                </Link>
              </div>
            )}
          </div>
        </div>

        <p className='mb-4 line-clamp-2 text-sm font-light text-gray-500'>
          {gallery.description || 'No description provided'}
        </p>

        <div className='mt-auto flex items-center justify-between text-xs text-gray-400'>
          <div className='flex items-center'>
            <span className='font-medium'>
              {gallery.images?.length || 0} image
              {gallery.images?.length !== 1 ? 's' : ''}
            </span>
          </div>
          <span>
            {new Date(gallery.createdAt).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })}
          </span>
        </div>
      </div>
    </div>
  );
};

// Gallery listing component - Client Component
const GalleryListingPage = () => {
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGalleries = async () => {
      try {
        const data: any = await galleryService.getAllGalleries();
        const galleryData = data.data || [];
        setGalleries(Array.isArray(galleryData) ? galleryData : []);
      } catch (err) {
        console.error('Error fetching galleries:', err);
        setError('Failed to load galleries');
      } finally {
        setLoading(false);
      }
    };

    fetchGalleries();
  }, []);

  const handleDeleteGallery = async (galleryId: string) => {
    try {
      // Assuming you have a delete method in your service
      // await galleryService.deleteGallery(galleryId);
      setGalleries(galleries.filter((gallery) => gallery.id !== galleryId));
    } catch (error) {
      console.error('Error deleting gallery:', error);
      alert('Failed to delete gallery. Please try again.');
    }
  };

  if (loading)
    return <DataTableSkeleton columnCount={5} rowCount={8} filterCount={2} />;

  if (error) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <div className='rounded-lg bg-white p-8 shadow-sm'>
          <div className='mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50'>
            <IconPhoto className='h-6 w-6 text-red-500' />
          </div>
          <h3 className='text-center text-lg font-medium'>{error}</h3>
          <p className='mt-2 text-center text-sm text-gray-500'>
            We couldn't load your galleries right now.
          </p>
          <button
            onClick={() => window.location.reload()}
            className={cn(
              buttonVariants({ variant: 'outline' }),
              'mx-auto mt-4 block'
            )}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!galleries || galleries.length === 0) {
    return (
      <div className='flex h-80 flex-col items-center justify-center rounded-xl bg-gray-50/50 px-8 py-12'>
        <div className='rounded-full bg-gray-100/80 p-5'>
          <IconPhoto className='h-8 w-8 text-gray-400' stroke={1.5} />
        </div>
        <h3 className='mt-6 text-base font-medium text-gray-700'>
          Your gallery collection is empty
        </h3>
        <p className='mt-2 max-w-md text-center text-sm text-gray-500'>
          Create your first gallery to organize and showcase your images
          beautifully.
        </p>
        <Link
          href='/dashboard/gallary/new'
          className={cn(
            buttonVariants({ variant: 'default' }),
            'mt-6 bg-black text-white hover:bg-gray-800'
          )}
        >
          <IconPlus className='mr-1.5 h-4 w-4' stroke={2} />
          New Gallery
        </Link>
      </div>
    );
  }

  return (
    <div className='space-y-10'>
      <div className='grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3'>
        {galleries.map((gallery) => (
          <GalleryCard
            key={gallery.id}
            gallery={gallery}
            onDelete={handleDeleteGallery}
          />
        ))}
      </div>
    </div>
  );
};

// Main page component
export default function GalleryPage() {
  return (
    <PageContainer scrollable={false}>
      <div className='flex flex-1 flex-col space-y-6'>
        <div className='flex flex-col items-start justify-between space-y-4 pb-2 sm:flex-row sm:space-y-0 sm:pb-0'>
          <Heading
            title='Galleries'
            description='Create and manage your image collections.'
          />
          <Link
            href='/dashboard/gallary/new'
            className={cn(
              buttonVariants(),
              'bg-black text-white hover:bg-gray-800'
            )}
          >
            <IconPlus className='mr-2 h-4 w-4' stroke={2} />
            New Gallery
          </Link>
        </div>
        <Separator className='bg-gray-100' />
        <GalleryListingPage />
      </div>
    </PageContainer>
  );
}
