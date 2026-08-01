'use client';

import React, { useState, useEffect, useRef } from 'react';
import PageContainer from '@/components/layout/page-container';
import { buttonVariants } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import { pressService } from '@/http/press';
import { cn } from '@/lib/utils';
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconEye,
  IconNews,
  IconDotsVertical,
  IconX
} from '@tabler/icons-react';
import Link from 'next/link';

// Define type-safe interfaces based on the API response
interface PressItem {
  id: string;
  title: string;
  publicationName?: string;
  publicationDate?: string;
  url: string;
  imageUrl?: string;
  excerpt?: string;
  sortOrder: number;
  pressId: string;
  createdAt: string;
  updatedAt: string;
}

interface Press {
  id: string;
  name: string;
  description: string;
  slug: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  items: PressItem[];
}

interface PressResponse {
  pressCategories: Press[];
}

// Press card component
const PressCard = ({
  press,
  onDelete
}: {
  press: Press;
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
        {press.items && press.items.length > 0 ? (
          <div className='h-full overflow-hidden'>
            {/* Featured press item */}
            {press.items[0].imageUrl ? (
              <img
                src={press.items[0].imageUrl}
                alt={press.items[0].title}
                className='h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105'
              />
            ) : (
              <div className='flex h-full w-full items-center justify-center bg-gray-100 p-6'>
                <IconNews className='h-12 w-12 text-gray-300' stroke={1} />
              </div>
            )}

            {/* Publication overlay */}
            {press.items[0].publicationName && (
              <div className='absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/70 to-transparent p-4'>
                <div className='text-sm font-medium text-white'>
                  {press.items[0].publicationName}
                </div>
                {press.items[0].publicationDate && (
                  <div className='text-xs text-gray-200'>
                    {new Date(
                      press.items[0].publicationDate
                    ).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className='flex h-full items-center justify-center p-6 text-gray-300'>
            <IconNews className='h-12 w-12' stroke={1} />
          </div>
        )}

        {/* Status indicator */}
        <div
          className={cn(
            'absolute top-3 right-3 flex h-2.5 w-2.5 items-center justify-center rounded-full',
            press.isActive ? 'bg-emerald-500' : 'bg-gray-400'
          )}
        >
          <span className='sr-only'>{press.isActive ? 'Active' : 'Draft'}</span>
        </div>
      </div>

      <div className='flex flex-1 flex-col p-5'>
        <div className='mb-2 flex items-start justify-between'>
          <h3 className='line-clamp-1 text-lg leading-tight font-medium tracking-tight text-gray-900'>
            {press.name}
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
                  href={`/dashboard/press-coverage/edit/${press.id}`}
                  className='flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
                >
                  <IconEdit className='mr-2 h-4 w-4' />
                  Edit Press Category
                </Link>
              </div>
            )}
          </div>
        </div>

        <p className='mb-4 line-clamp-2 text-sm font-light text-gray-500'>
          {press.description || 'No description provided'}
        </p>

        <div className='mt-auto flex items-center justify-between text-xs text-gray-400'>
          <div className='flex items-center'>
            <span className='font-medium'>
              {press.items?.length || 0} article
              {press.items?.length !== 1 ? 's' : ''}
            </span>
          </div>
          <span>
            {new Date(press.createdAt).toLocaleDateString(undefined, {
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

// Press listing component - Client Component
const PressListingPage = () => {
  const [pressCategories, setPressCategories] = useState<Press[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPress = async () => {
      try {
        const response: any = await pressService.getAllPress();

        const pressData =
          response?.data?.pressCategories ??
          response?.pressCategories ??
          response?.data ??
          [];

        setPressCategories(Array.isArray(pressData) ? pressData : []);
      } catch (err) {
        console.error('Error fetching press categories:', err);
        setError('Failed to load press categories');
      } finally {
        setLoading(false);
      }
    };

    fetchPress();
  }, []);

  const handleDeletePress = async (pressId: string) => {
    try {
      // Assuming you have a delete method in your service
      // await pressService.deletePress(pressId);
      setPressCategories(
        pressCategories.filter((press) => press.id !== pressId)
      );
    } catch (error) {
      console.error('Error deleting press category:', error);
      alert('Failed to delete press category. Please try again.');
    }
  };

  if (loading)
    return <DataTableSkeleton columnCount={5} rowCount={8} filterCount={2} />;

  if (error) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <div className='rounded-lg bg-white p-8 shadow-sm'>
          <div className='mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50'>
            <IconNews className='h-6 w-6 text-red-500' />
          </div>
          <h3 className='text-center text-lg font-medium'>{error}</h3>
          <p className='mt-2 text-center text-sm text-gray-500'>
            We couldn't load your press categories right now.
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

  if (!pressCategories || pressCategories.length === 0) {
    return (
      <div className='flex h-80 flex-col items-center justify-center rounded-xl bg-gray-50/50 px-8 py-12'>
        <div className='rounded-full bg-gray-100/80 p-5'>
          <IconNews className='h-8 w-8 text-gray-400' stroke={1.5} />
        </div>
        <h3 className='mt-6 text-base font-medium text-gray-700'>
          Your press collection is empty
        </h3>
        <p className='mt-2 max-w-md text-center text-sm text-gray-500'>
          Create your first press category to organize and showcase media
          coverage and publications.
        </p>
        <Link
          href='/dashboard/press-coverage/new'
          className={cn(
            buttonVariants({ variant: 'default' }),
            'mt-6 bg-black text-white hover:bg-gray-800'
          )}
        >
          <IconPlus className='mr-1.5 h-4 w-4' stroke={2} />
          New Press Category
        </Link>
      </div>
    );
  }

  return (
    <div className='space-y-10'>
      <div className='grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3'>
        {pressCategories.map((press) => (
          <PressCard
            key={press.id}
            press={press}
            onDelete={handleDeletePress}
          />
        ))}
      </div>
    </div>
  );
};

// Main page component
export default function PressPage() {
  return (
    <PageContainer scrollable={false}>
      <div className='flex flex-1 flex-col space-y-6'>
        <div className='flex flex-col items-start justify-between space-y-4 pb-2 sm:flex-row sm:space-y-0 sm:pb-0'>
          <Heading
            title='Press & Coverage'
            description='Manage media mentions, articles, and press coverage.'
          />
          <Link
            href='/dashboard/press-coverage/new'
            className={cn(
              buttonVariants(),
              'bg-black text-white hover:bg-gray-800'
            )}
          >
            <IconPlus className='mr-2 h-4 w-4' stroke={2} />
            New Press Category
          </Link>
        </div>
        <Separator className='bg-gray-100' />
        <PressListingPage />
      </div>
    </PageContainer>
  );
}
