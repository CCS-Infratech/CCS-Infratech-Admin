'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import {
  IconEdit,
  IconEye,
  IconPlayerPlay,
  IconPlus,
  IconTrash,
} from '@tabler/icons-react';
import { toast } from 'sonner';

import PageContainer from '@/components/layout/page-container';
import { buttonVariants } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import {
  walkthroughService,
  type Walkthrough,
} from '@/http/walkthrough';
import { cn } from '@/lib/utils';

const resolveThumbnailUrl = (thumbnail: string) => {
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

const WalkthroughCard = ({
  walkthrough,
  onDelete,
}: {
  walkthrough: Walkthrough;
  onDelete: (id: string) => void;
}) => {
  const thumbnailUrl = resolveThumbnailUrl(walkthrough.thumbnail);

  return (
    <div className='overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md'>
      <div className='relative aspect-video overflow-hidden bg-gray-100'>
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={walkthrough.title}
            className='h-full w-full object-cover'
          />
        ) : (
          <div className='flex h-full w-full items-center justify-center'>
            <IconPlayerPlay
              className='h-12 w-12 text-gray-400'
              stroke={1.5}
            />
          </div>
        )}

        <div className='absolute top-3 right-3'>
          <span
            className={cn(
              'rounded-full px-3 py-1 text-xs font-medium shadow-sm',
              walkthrough.isActive
                ? 'bg-emerald-500 text-white'
                : 'bg-gray-700 text-white'
            )}
          >
            {walkthrough.isActive ? 'Published' : 'Draft'}
          </span>
        </div>

        <div className='absolute bottom-3 left-3'>
          <span className='rounded-full bg-black/70 px-3 py-1 text-xs font-medium text-white'>
            Order {walkthrough.sortOrder}
          </span>
        </div>
      </div>

      <div className='flex flex-col p-5'>
        <h3 className='line-clamp-1 text-lg font-semibold text-gray-900'>
          {walkthrough.title}
        </h3>

        <p className='mt-2 line-clamp-3 text-sm leading-6 text-gray-500'>
          {walkthrough.description || 'No description provided'}
        </p>

        <div className='mt-4 truncate text-xs text-gray-400'>
          {walkthrough.videoUrl}
        </div>

        <div className='mt-5 flex items-center gap-2 border-t border-gray-100 pt-4'>
          <Link
            href={`/dashboard/walkthrough/edit/${walkthrough.id}`}
            className={cn(
              buttonVariants({ variant: 'outline' }),
              'flex-1'
            )}
          >
            <IconEdit className='mr-2 h-4 w-4' />
            Edit
          </Link>

          <a
            href={walkthrough.videoUrl}
            target='_blank'
            rel='noreferrer'
            className={cn(
              buttonVariants({ variant: 'outline' })
            )}
            title='Preview video'
          >
            <IconEye className='h-4 w-4' />
          </a>

          <button
            type='button'
            onClick={() => onDelete(walkthrough.id)}
            className={cn(
              buttonVariants({ variant: 'outline' }),
              'border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700'
            )}
            title='Delete walkthrough'
          >
            <IconTrash className='h-4 w-4' />
          </button>
        </div>
      </div>
    </div>
  );
};

const WalkthroughListing = () => {
  const [walkthroughs, setWalkthroughs] = useState<Walkthrough[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWalkthroughs = useCallback(async () => {
    try {
      setLoading(true);

      const data = await walkthroughService.getAllWalkthroughs();
      setWalkthroughs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching walkthroughs:', error);
      toast.error('Failed to load walkthroughs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWalkthroughs();
  }, [fetchWalkthroughs]);

  const handleDelete = async (id: string) => {
    const walkthrough = walkthroughs.find(
      (item) => item.id === id
    );

    if (!walkthrough) return;

    const confirmed = window.confirm(
      `Delete "${walkthrough.title}" permanently?`
    );

    if (!confirmed) return;

    try {
      await walkthroughService.deleteWalkthrough(id);

      setWalkthroughs((current) =>
        current.filter((item) => item.id !== id)
      );

      toast.success('Walkthrough deleted successfully');
    } catch (error) {
      console.error('Error deleting walkthrough:', error);
      toast.error('Failed to delete walkthrough');
    }
  };

  if (loading) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <div className='h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-black' />
      </div>
    );
  }

  if (walkthroughs.length === 0) {
    return (
      <div className='flex h-80 flex-col items-center justify-center rounded-xl bg-gray-50/50 px-8 py-12 text-center'>
        <div className='rounded-full bg-gray-100/80 p-5'>
          <IconPlayerPlay
            className='h-8 w-8 text-gray-400'
            stroke={1.5}
          />
        </div>

        <h3 className='mt-6 text-base font-medium text-gray-700'>
          No walkthroughs yet
        </h3>

        <p className='mt-2 max-w-md text-sm text-gray-500'>
          Create your first project walkthrough with a video,
          thumbnail, and description.
        </p>

        <Link
          href='/dashboard/walkthrough/new'
          className={cn(
            buttonVariants(),
            'mt-6 bg-black text-white hover:bg-gray-800'
          )}
        >
          <IconPlus className='mr-2 h-4 w-4' />
          New Walkthrough
        </Link>
      </div>
    );
  }

  return (
    <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
      {walkthroughs.map((walkthrough) => (
        <WalkthroughCard
          key={walkthrough.id}
          walkthrough={walkthrough}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
};

export default function WalkthroughPage() {
  return (
    <PageContainer scrollable={false}>
      <div className='flex flex-1 flex-col space-y-6'>
        <div className='flex flex-col items-start justify-between space-y-4 pb-2 sm:flex-row sm:items-center sm:space-y-0 sm:pb-0'>
          <Heading
            title='Walkthrough'
            description='Create and manage project walkthrough videos.'
          />

          <Link
            href='/dashboard/walkthrough/new'
            className={cn(
              buttonVariants(),
              'bg-black text-white hover:bg-gray-800'
            )}
          >
            <IconPlus className='mr-2 h-4 w-4' />
            New Walkthrough
          </Link>
        </div>

        <Separator className='bg-gray-100' />

        <WalkthroughListing />
      </div>
    </PageContainer>
  );
}
