import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import ProjectGroupForm from '@/features/project-groups/components/project-group-form';

export const metadata = {
  title: 'Dashboard: Edit Project Group'
};

export default async function EditProjectGroupPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <PageContainer scrollable>
      <div className='flex flex-1 flex-col space-y-4'>
        <Heading
          title='Edit Project Group'
          description='Update the group shown in the website navbar.'
        />
        <Separator />
        <ProjectGroupForm groupId={id} />
      </div>
    </PageContainer>
  );
}
