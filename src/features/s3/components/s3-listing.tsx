'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { ProjectTable } from './blog-tables/index';
import { columns } from './blog-tables/columns';
import { projectService } from '@/http/project';

export interface Project {
  id: string;
  title: string;
  slug: string;
  content: string;
  description: string;
  clientName: string | null;
  projectUrl: string | null;
  completionDate: string | null;
  featured: boolean;
  published: boolean;
  publishedAt: string | null;
  viewCount: number;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  // Other properties...
  author: {
    id: string;
    username: string;
    email: string;
  };
  images: any[];
  specifications: any[];
  amenities: any[];
}

export default function ProjectListingPage() {
  const searchParams = useSearchParams();
  const [projects, setProjects] = useState<Project[]>([]);
  const [totalProjects, setTotalProjects] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);

      // Get params from URL using useSearchParams instead of searchParamsCache
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
        const data = await projectService.getProjects(filters);
        console.log('projects', data);

        setTotalProjects(data?.pagination?.total || data?.total || 0);
        setProjects(data?.data || []);
        setError(null);
      } catch (error) {
        console.error('Error fetching project data:', error);
        setError('Failed to load projects');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
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
        <h3 className='mb-2 text-xl font-semibold'>Could not load projects</h3>
        <p className='text-muted-foreground'>
          There was an error loading the project data. Please try again later.
        </p>
      </div>
    );
  }

  return (
    <ProjectTable
      data={projects}
      totalItems={totalProjects}
      columns={columns}
    />
  );
}
