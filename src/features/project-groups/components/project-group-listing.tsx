'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { projectGroupService } from '@/http/project-group';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { IconEdit, IconFolders, IconPlus, IconTrash } from '@tabler/icons-react';

interface ProjectGroup {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  _count?: { projects: number };
}

export default function ProjectGroupListing() {
  const [groups, setGroups] = useState<ProjectGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const response = await projectGroupService.getProjectGroups();
      setGroups(response.data || []);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load project groups');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (
      !window.confirm(
        `Delete "${name}"? Projects in this group will not be deleted.`
      )
    ) {
      return;
    }

    try {
      setDeletingId(id);
      await projectGroupService.deleteProjectGroup(id);
      toast.success('Project group deleted');
      setGroups((prev) => prev.filter((group) => group.id !== id));
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete project group');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
        {[...Array(3)].map((_, index) => (
          <div
            key={index}
            className='h-40 animate-pulse rounded-2xl bg-gray-100'
          />
        ))}
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className='flex h-80 flex-col items-center justify-center rounded-xl bg-gray-50/50 px-8 py-12'>
        <div className='rounded-full bg-gray-100/80 p-5'>
          <IconFolders className='h-8 w-8 text-gray-400' stroke={1.5} />
        </div>
        <h3 className='mt-6 text-base font-medium text-gray-700'>
          No project groups yet
        </h3>
        <p className='mt-2 max-w-md text-center text-sm text-gray-500'>
          Create a group like Amor to organize projects in the website navbar.
        </p>
        <Link
          href='/dashboard/project-groups/new'
          className={cn(
            buttonVariants({ variant: 'default' }),
            'mt-6 bg-black text-white hover:bg-gray-800'
          )}
        >
          <IconPlus className='mr-1.5 h-4 w-4' stroke={2} />
          New Group
        </Link>
      </div>
    );
  }

  return (
    <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
      {groups.map((group) => (
        <div
          key={group.id}
          className='rounded-2xl border border-gray-100 bg-white p-5 shadow-sm'
        >
          <div className='mb-3 flex items-start justify-between gap-3'>
            <div>
              <h3 className='text-lg font-semibold text-gray-900'>
                {group.name}
              </h3>
              <p className='text-xs text-gray-400'>/{group.slug}</p>
            </div>
            <span
              className={cn(
                'rounded-full px-2.5 py-1 text-xs font-medium',
                group.isActive
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-gray-100 text-gray-500'
              )}
            >
              {group.isActive ? 'Visible' : 'Hidden'}
            </span>
          </div>
          <p className='mb-4 line-clamp-2 text-sm text-gray-500'>
            {group.description || 'No description'}
          </p>
          <div className='flex items-center justify-between'>
            <span className='text-xs text-gray-400'>
              {group._count?.projects || 0} project
              {(group._count?.projects || 0) === 1 ? '' : 's'}
            </span>
            <div className='flex items-center gap-2'>
              <Link
                href={`/dashboard/project-groups/${group.id}`}
                className='rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900'
              >
                <IconEdit className='h-4 w-4' />
              </Link>
              <button
                type='button'
                disabled={deletingId === group.id}
                onClick={() => handleDelete(group.id, group.name)}
                className='rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50'
              >
                <IconTrash className='h-4 w-4' />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
