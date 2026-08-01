import ProjectEditForm from '@/components/forms/project-edit-form';

export default async function EditProjectPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <ProjectEditForm projectId={id} />;
}
