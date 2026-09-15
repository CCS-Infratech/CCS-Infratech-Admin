import PageContainer from '@/components/layout/page-container';
import { buttonVariants } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import ProjectGroupListing from '@/features/project-groups/components/project-group-listing';
import { cn } from '@/lib/utils';
import { IconPlus } from '@tabler/icons-react';
import Link from 'next/link';

export const metadata = {
  title: 'Dashboard: Project Groups'
};

export default function ProjectGroupsPage() {
  return (
    <PageContainer scrollable={false}>
      <div className='flex flex-1 flex-col space-y-4'>
        <div className='flex items-start justify-between'>
          <Heading
            title='Project Groups'
            description='Groups appear in the website navbar. Assign projects to a group to list them together.'
          />
          <Link
            href='/dashboard/project-groups/new'
            className={cn(buttonVariants(), 'bg-amber-600 text-xs md:text-sm')}
          >
            <IconPlus className='mr-2 h-4 w-4' /> Add Group
          </Link>
        </div>
        <Separator />
        <ProjectGroupListing />
      </div>
    </PageContainer>
  );
}
