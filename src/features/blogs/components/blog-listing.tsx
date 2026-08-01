'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { BlogTable } from './blog-tables';
import { columns } from './blog-tables/columns';
import { blogService } from '@/http/blogs';

export interface Blog {
  id: string;
  title: string;
  slug: string;
  content: string;
  summary: string;
  published: boolean;
  publishedAt: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  viewCount: number;
  author: {
    id: string;
    username: string;
    email: string;
  };
  images: any[];
}

export default function BlogListingPage() {
  const searchParams = useSearchParams();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [totalBlogs, setTotalBlogs] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true);

      // Get params from URL
      const page = searchParams.get('page') || '1';
      const search = searchParams.get('title');
      const pageLimit = searchParams.get('perPage') || '10';
      const published = searchParams.get('published');

      const filters = {
        page: parseInt(page),
        limit: parseInt(pageLimit),
        ...(search && { search }),
        ...(published && { published })
      };

      try {
        const data = await blogService.getBlogs(filters);
        console.log('blogs', data);

        // Safely extract values with fallbacks
        setTotalBlogs(data?.pagination?.total || data?.total || 0);
        setBlogs(data?.data || []);
        setError(null);
      } catch (error) {
        console.error('Error fetching blog data:', error);
        setError('Failed to load blogs');
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, [searchParams]);

  if (loading) {
    return (
      <div className='w-full space-y-3 rounded-md'>
        {/* Table header skeleton */}
        <div className='flex items-center justify-between pb-4'>
          <div className='h-8 w-48 animate-pulse rounded-md bg-gray-200 dark:bg-gray-700'></div>
          <div className='h-9 w-32 animate-pulse rounded-md bg-gray-200 dark:bg-gray-700'></div>
        </div>

        {/* Table header row */}
        <div className='flex rounded-t-md bg-gray-50 p-2 dark:bg-gray-800'>
          <div className='h-6 w-8 animate-pulse rounded bg-gray-200 dark:bg-gray-700'></div>
          <div className='ml-3 h-6 w-56 animate-pulse rounded bg-gray-200 dark:bg-gray-700'></div>
          <div className='ml-3 h-6 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700'></div>
          <div className='ml-3 h-6 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700'></div>
          <div className='ml-3 h-6 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700'></div>
          <div className='ml-auto h-6 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700'></div>
        </div>

        {/* Table rows */}
        {[...Array(5)].map((_, index) => (
          <div
            key={index}
            className='flex border-b p-4 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-900'
          >
            <div className='h-6 w-8 animate-pulse rounded bg-gray-200 dark:bg-gray-700'></div>
            <div className='ml-3 h-6 w-64 animate-pulse rounded bg-gray-200 dark:bg-gray-700'></div>
            <div className='ml-3 h-6 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700'></div>
            <div className='ml-3 h-6 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700'></div>
            <div className='ml-3 h-6 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700'></div>
            <div className='ml-auto h-6 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700'></div>
          </div>
        ))}

        {/* Pagination skeleton */}
        <div className='mt-4 flex items-center justify-between'>
          <div className='h-5 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700'></div>
          <div className='flex space-x-1'>
            {[...Array(3)].map((_, index) => (
              <div
                key={index}
                className='h-8 w-8 animate-pulse rounded-md bg-gray-200 dark:bg-gray-700'
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex flex-col items-center justify-center p-8 text-center'>
        <h3 className='mb-2 text-xl font-semibold'>Could not load blogs</h3>
        <p className='text-muted-foreground'>
          There was an error loading the blog data. Please try again later.
        </p>
      </div>
    );
  }

  return <BlogTable data={blogs} totalItems={totalBlogs} columns={columns} />;
}
