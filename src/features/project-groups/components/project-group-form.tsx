'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { projectGroupService } from '@/http/project-group';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface ProjectGroupFormProps {
  groupId?: string;
}

export default function ProjectGroupForm({ groupId }: ProjectGroupFormProps) {
  const isEdit = Boolean(groupId);
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [sortOrder, setSortOrder] = useState('0');
  const [loading, setLoading] = useState(isEdit);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!groupId) return;

    const fetchGroup = async () => {
      try {
        setLoading(true);
        const response = await projectGroupService.getProjectGroup(groupId);
        const group = response.data;
        setName(group.name || '');
        setDescription(group.description || '');
        setIsActive(group.isActive !== false);
        setSortOrder(String(group.sortOrder ?? 0));
      } catch (error: any) {
        toast.error(error.message || 'Failed to load project group');
      } finally {
        setLoading(false);
      }
    };

    fetchGroup();
  }, [groupId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Please enter a group name');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        name: name.trim(),
        description: description.trim(),
        isActive,
        sortOrder: Number(sortOrder) || 0
      };

      if (isEdit && groupId) {
        await projectGroupService.updateProjectGroup(groupId, payload);
        toast.success('Project group updated successfully');
      } else {
        await projectGroupService.createProjectGroup(payload);
        toast.success('Project group created successfully');
      }

      router.push('/dashboard/project-groups');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save project group');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <Loader2 className='h-6 w-6 animate-spin text-amber-600' />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className='mx-auto max-w-2xl space-y-6'>
      <div className='rounded-2xl border border-gray-100 bg-white p-6 shadow-sm'>
        <Label className='mb-2 block text-sm font-semibold text-gray-900'>
          Group Name
        </Label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder='e.g. Amor Reality'
          className='rounded-xl border-gray-200 focus:border-[#b07d17] focus:ring-[#b07d17]'
        />
        <p className='mt-2 text-xs text-gray-500'>
          This name appears in the website navbar under Projects.
        </p>
      </div>

      <div className='rounded-2xl border border-gray-100 bg-white p-6 shadow-sm'>
        <Label className='mb-2 block text-sm font-semibold text-gray-900'>
          Description
        </Label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder='Optional description for this project group'
          rows={4}
          className='rounded-xl border-gray-200 focus:border-[#b07d17] focus:ring-[#b07d17]'
        />
      </div>

      <div className='rounded-2xl border border-gray-100 bg-white p-6 shadow-sm'>
        <Label className='mb-2 block text-sm font-semibold text-gray-900'>
          Display Order
        </Label>
        <Input
          type='number'
          min={0}
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className='rounded-xl border-gray-200 focus:border-[#b07d17] focus:ring-[#b07d17]'
        />
        <p className='mt-2 text-xs text-gray-500'>
          Lower numbers appear first in the navbar.
        </p>
      </div>

      <div className='rounded-2xl border border-gray-100 bg-white p-6 shadow-sm'>
        <div className='flex items-center justify-between'>
          <div>
            <Label className='text-sm font-semibold text-gray-900'>
              Visible on website
            </Label>
            <p className='mt-1 text-sm text-gray-500'>
              Inactive groups stay hidden from the navbar and public pages.
            </p>
          </div>
          <Switch checked={isActive} onCheckedChange={setIsActive} />
        </div>
      </div>

      <div className='flex justify-end gap-3'>
        <Button
          type='button'
          variant='outline'
          onClick={() => router.push('/dashboard/project-groups')}
        >
          Cancel
        </Button>
        <Button
          type='submit'
          disabled={isSubmitting}
          className='bg-gradient-to-r from-[#b07d17] to-[#c89420] text-white'
        >
          {isSubmitting && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
          {isEdit ? 'Update Group' : 'Create Group'}
        </Button>
      </div>
    </form>
  );
}
