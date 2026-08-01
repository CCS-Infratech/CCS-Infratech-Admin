'use client';
import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { Column, ColumnDef } from '@tanstack/react-table';
import {
  CalendarDays,
  CheckCircle2,
  Eye,
  FileText,
  XCircle
} from 'lucide-react';
import { Blog } from '../blog-listing';
import { CellAction } from './cell-action';
import Image from 'next/image';
import Link from 'next/link';

const PUBLISHED_OPTIONS = [
  { label: 'Published', value: 'true' },
  { label: 'Draft', value: 'false' }
];

export const columns: ColumnDef<Blog>[] = [
  {
    id: 'title',
    accessorKey: 'title',
    header: ({ column }: { column: Column<Blog, unknown> }) => (
      <DataTableColumnHeader column={column} title='Title' />
    ),
    cell: ({ row }) => {
      const hasImage = row.original.images && row.original.images.length > 0;
      const imageUrl = hasImage
        ? row.original.images[0].url
        : '/assets/blog-placeholder.jpg';

      const blogId = row.original.id; // Get the blog ID

      console.log('Image URL:', imageUrl);

      return (
        <Link
          href={`/dashboard/blog/${blogId}`}
          className='hover:bg-muted/20 block w-full rounded-sm transition-colors'
        >
          <div className='flex gap-3'>
            <div className='relative h-10 w-16 flex-shrink-0 overflow-hidden rounded-md'>
              {hasImage ? (
                <img
                  src={imageUrl}
                  alt={row.getValue('title')}
                  className='h-full w-full object-cover'
                />
              ) : (
                <div className='bg-muted/30 flex h-full w-full items-center justify-center'>
                  <FileText className='text-muted-foreground h-5 w-5' />
                </div>
              )}
            </div>
            <div className='space-y-0.5'>
              <div className='line-clamp-1 text-base font-medium'>
                {(row.getValue('title') as string).substring(0, 50) + '...'}
              </div>
              <div className='text-muted-foreground truncate text-xs'>
                {row.original.slug.substring(0, 60) + '...'}
              </div>
            </div>
          </div>
        </Link>
      );
    },
    meta: {
      label: 'Title',
      placeholder: 'Search blogs...',
      variant: 'text',
      icon: FileText
    },
    enableColumnFilter: true
  },
  {
    id: 'published',
    accessorKey: 'published',
    header: ({ column }: { column: Column<Blog, unknown> }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ row }) => {
      const isPublished = row.getValue<boolean>('published');

      return isPublished ? (
        <div className='flex items-center'>
          <Badge className='gap-1.5 border-emerald-200 bg-emerald-100 px-2 text-emerald-700 hover:bg-emerald-200 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'>
            <CheckCircle2 className='h-3.5 w-3.5' />
            <span>Published</span>
          </Badge>
        </div>
      ) : (
        <div className='flex items-center'>
          <Badge
            variant='outline'
            className='gap-1.5 border-amber-200 bg-amber-50 px-2 text-amber-600 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-400'
          >
            <XCircle className='h-3.5 w-3.5' />
            <span>Draft</span>
          </Badge>
        </div>
      );
    },
    enableColumnFilter: true,
    meta: {
      label: 'Status',
      variant: 'multiSelect',
      options: PUBLISHED_OPTIONS
    }
  },
  {
    id: 'viewCount',
    accessorKey: 'viewCount',
    header: ({ column }: { column: Column<Blog, unknown> }) => (
      <DataTableColumnHeader column={column} title='Views' />
    ),
    cell: ({ row }) => {
      const views = row.getValue<number>('viewCount');

      // Style based on view count
      let viewStyle = 'text-muted-foreground';
      if (views > 50) viewStyle = 'text-blue-600 font-medium';
      else if (views > 10) viewStyle = 'text-emerald-600';

      return (
        <div className={`flex items-center gap-1.5 ${viewStyle}`}>
          <Eye className='h-4 w-4' />
          <span>{views.toLocaleString()}</span>
        </div>
      );
    }
  },
  {
    id: 'publishedAt',
    accessorKey: 'publishedAt',
    header: ({ column }: { column: Column<Blog, unknown> }) => (
      <DataTableColumnHeader column={column} title='Published' />
    ),
    cell: ({ row }) => {
      const date = row.getValue<string>('publishedAt');

      if (!date) {
        return (
          <div className='text-muted-foreground text-sm italic'>
            Not published
          </div>
        );
      }

      const publishDate = new Date(date);
      const formattedDate = new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }).format(publishDate);

      return (
        <div className='text-muted-foreground flex items-center gap-1.5'>
          <CalendarDays className='h-4 w-4' />
          <span>{formattedDate}</span>
        </div>
      );
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <div className='text-right'>
        <CellAction data={row.original} />
      </div>
    ),
    header: () => null,
    enableSorting: false,
    enableHiding: false,
    size: 40,
    maxSize: 40
  }
];
