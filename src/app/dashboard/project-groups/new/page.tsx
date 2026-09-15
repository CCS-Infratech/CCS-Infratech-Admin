import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import ProjectGroupForm from '@/features/project-groups/components/project-group-form';

export const metadata = {
  title: 'Dashboard: New Project Group'
};

export default function NewProjectGroupPage() {
  return (
    <PageContainer scrollable>
      <div className='flex flex-1 flex-col space-y-4'>
        <Heading
          title='New Project Group'
          description='Create a group that can hold multiple projects.'
        />
        <Separator />
        <ProjectGroupForm />
      </div>
    </PageContainer>
  );
}
