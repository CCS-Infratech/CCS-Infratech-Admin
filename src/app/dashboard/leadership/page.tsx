'use client';

import { FormEvent, useEffect, useState } from 'react';

import PageContainer from '@/components/layout/page-container';

import { Button } from '@/components/ui/button';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';

import {
  Loader2,
  Pencil,
  Plus,
  Trash2,
  Users
} from 'lucide-react';

import { toast } from 'sonner';

import {
  leadershipService,
  Leadership,
  CreateLeadership,
  UpdateLeadership
} from '@/http/leadership';

import { MediaSelectionDialog } from '@/components/modal/media-gallary';

const PUBLIC_SITE_URL = 'https://www.ccsinfratech.com';

const emptyForm: CreateLeadership = {
  name: '',
  designation: '',
  imageUrl: '',
  experience: '',
  bio: '',
  isActive: true,
  sortOrder: 0
};

/**
 * Converts an image path stored for the public CCS website
 * into a URL that the Admin panel can display.
 *
 * Examples:
 *
 * /images/person.png
 * -> https://www.ccsinfratech.com/images/person.png
 *
 * /images/zeeshan.JPG
 * -> https://www.ccsinfratech.com/images/zeeshan.JPG
 *
 * Full URLs are returned unchanged.
 */
function getPublicImageUrl(
  imageUrl: string | null
): string | null {
  if (!imageUrl) {
    return null;
  }

  if (
    imageUrl.startsWith('http://') ||
    imageUrl.startsWith('https://')
  ) {
    return imageUrl;
  }

  if (imageUrl.startsWith('/')) {
    return `${PUBLIC_SITE_URL}${imageUrl}`;
  }

  return `${PUBLIC_SITE_URL}/${imageUrl}`;
}

export default function LeadershipPage() {
  const [members, setMembers] = useState<Leadership[]>([]);
  const [loading, setLoading] = useState(true);

  const [dialogOpen, setDialogOpen] =
    useState(false);

  const [editingMember, setEditingMember] =
    useState<Leadership | null>(null);

  const [form, setForm] =
    useState<CreateLeadership>(emptyForm);

  const [saving, setSaving] = useState(false);
  const [mediaDialogOpen, setMediaDialogOpen] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] =
    useState(false);

  const [memberToDelete, setMemberToDelete] =
    useState<Leadership | null>(null);

  const [deleting, setDeleting] = useState(false);

  const loadMembers = async () => {
    try {
      setLoading(true);

      const data =
        await leadershipService.getAllLeadership();

      setMembers(data);
    } catch (error) {
      console.error(
        'Failed to load leadership:',
        error
      );

      toast.error(
        'Failed to load leadership members'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, []);

  const openCreateDialog = () => {
    setEditingMember(null);

    setForm({
      ...emptyForm,
      sortOrder: members.length + 1
    });

    setDialogOpen(true);
  };

  const openEditDialog = (
    member: Leadership
  ) => {
    setEditingMember(member);

    setForm({
      name: member.name,
      designation: member.designation,
      imageUrl: member.imageUrl ?? '',
      experience: member.experience ?? '',
      bio: member.bio ?? '',
      isActive: member.isActive,
      sortOrder: member.sortOrder
    });

    setDialogOpen(true);
  };

  const closeDialog = () => {
    if (saving) {
      return;
    }

    setDialogOpen(false);
    setEditingMember(null);
    setForm({ ...emptyForm });
  };

  const updateField = (
    field: keyof CreateLeadership,
    value: string | boolean | number
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value
    }));
  };

  const handleMediaSelection = (selectedImages: { url: string }[]) => {
    if (selectedImages.length === 0) {
      return;
    }

    updateField('imageUrl', selectedImages[0].url);
    setMediaDialogOpen(false);

    toast.success('Leadership image selected');
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!form.name.trim()) {
      toast.error('Name is required');
      return;
    }

    if (!form.designation.trim()) {
      toast.error('Designation is required');
      return;
    }

    try {
      setSaving(true);

      if (editingMember) {
        const updateData: UpdateLeadership = {
          name: form.name.trim(),

          designation:
            form.designation.trim(),

          imageUrl:
            form.imageUrl?.trim() || null,

          experience:
            form.experience?.trim() || null,

          bio:
            form.bio?.trim() || null,

          isActive:
            Boolean(form.isActive),

          sortOrder:
            typeof form.sortOrder === 'number'
              ? form.sortOrder
              : 0
        };

        await leadershipService.updateLeadership(
          editingMember.id,
          updateData
        );

        toast.success(
          'Leadership member updated successfully'
        );
      } else {
        const createData: CreateLeadership = {
          name: form.name.trim(),

          designation:
            form.designation.trim(),

          imageUrl:
            form.imageUrl?.trim() || null,

          experience:
            form.experience?.trim() || null,

          bio:
            form.bio?.trim() || null,

          isActive:
            Boolean(form.isActive),

          sortOrder:
            typeof form.sortOrder === 'number'
              ? form.sortOrder
              : 0
        };

        await leadershipService.createLeadership(
          createData
        );

        toast.success(
          'Leadership member created successfully'
        );
      }

      setDialogOpen(false);
      setEditingMember(null);
      setForm({ ...emptyForm });

      await loadMembers();
    } catch (error) {
      console.error(
        'Failed to save leadership member:',
        error
      );

      toast.error(
        'Failed to save leadership member'
      );
    } finally {
      setSaving(false);
    }
  };

  const openDeleteDialog = (
    member: Leadership
  ) => {
    setMemberToDelete(member);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!memberToDelete) {
      return;
    }

    try {
      setDeleting(true);

      await leadershipService.deleteLeadership(
        memberToDelete.id
      );

      toast.success(
        'Leadership member deleted successfully'
      );

      setDeleteDialogOpen(false);
      setMemberToDelete(null);

      await loadMembers();
    } catch (error) {
      console.error(
        'Failed to delete leadership member:',
        error
      );

      toast.error(
        'Failed to delete leadership member'
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-6'>

        {/* Header */}
        <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>
              Leadership & Partners
            </h2>

            <p className='text-muted-foreground mt-1'>
              Manage the leadership and partner profiles displayed
              on the CCS INFRATECH website.
            </p>
          </div>

          <Button
            onClick={openCreateDialog}
          >
            <Plus className='mr-2 h-4 w-4' />
            Add Member
          </Button>
        </div>

        {/* Members */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Users className='h-5 w-5' />
              Team Members
            </CardTitle>

            <CardDescription>
              Add, edit, reorder or disable leadership profiles.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className='flex min-h-[300px] items-center justify-center'>
                <Loader2 className='h-7 w-7 animate-spin' />
              </div>
            ) : members.length === 0 ? (
              <div className='flex min-h-[250px] flex-col items-center justify-center text-center'>
                <Users className='text-muted-foreground mb-3 h-10 w-10' />

                <h3 className='font-semibold'>
                  No leadership members yet
                </h3>

                <p className='text-muted-foreground mt-1 text-sm'>
                  Add your first partner or leadership member.
                </p>

                <Button
                  className='mt-4'
                  onClick={openCreateDialog}
                >
                  <Plus className='mr-2 h-4 w-4' />
                  Add Member
                </Button>
              </div>
            ) : (
              <div className='overflow-x-auto rounded-md border'>
                <table className='w-full text-sm'>
                  <thead>
                    <tr className='bg-muted/50 border-b'>
                      <th className='px-4 py-3 text-left font-medium'>
                        Member
                      </th>

                      <th className='px-4 py-3 text-left font-medium'>
                        Designation
                      </th>

                      <th className='px-4 py-3 text-left font-medium'>
                        Experience
                      </th>

                      <th className='px-4 py-3 text-left font-medium'>
                        Order
                      </th>

                      <th className='px-4 py-3 text-left font-medium'>
                        Status
                      </th>

                      <th className='px-4 py-3 text-right font-medium'>
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {members.map((member) => {
                      const imageUrl =
                        getPublicImageUrl(
                          member.imageUrl
                        );

                      return (
                        <tr
                          key={member.id}
                          className='hover:bg-muted/30 border-b last:border-0'
                        >
                          {/* Member */}
                          <td className='px-4 py-3'>
                            <div className='flex items-center gap-3'>
                              <div className='bg-muted flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full'>
                                {imageUrl ? (
                                  <img
                                    src={imageUrl}
                                    alt={member.name}
                                    className='h-full w-full object-cover'
                                    onError={(event) => {
                                      event.currentTarget.style.display =
                                        'none';
                                    }}
                                  />
                                ) : (
                                  <Users className='text-muted-foreground h-5 w-5' />
                                )}
                              </div>

                              <div>
                                <div className='font-medium'>
                                  {member.name}
                                </div>

                                {member.bio && (
                                  <div className='text-muted-foreground max-w-[280px] truncate text-xs'>
                                    {member.bio}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Designation */}
                          <td className='px-4 py-3'>
                            {member.designation}
                          </td>

                          {/* Experience */}
                          <td className='px-4 py-3'>
                            {member.experience || '—'}
                          </td>

                          {/* Order */}
                          <td className='px-4 py-3'>
                            {member.sortOrder}
                          </td>

                          {/* Status */}
                          <td className='px-4 py-3'>
                            {member.isActive ? (
                              <Badge
                                variant='outline'
                                className='border-emerald-200 bg-emerald-50 text-emerald-700'
                              >
                                Active
                              </Badge>
                            ) : (
                              <Badge
                                variant='outline'
                                className='border-gray-200 bg-gray-50 text-gray-600'
                              >
                                Inactive
                              </Badge>
                            )}
                          </td>

                          {/* Actions */}
                          <td className='px-4 py-3'>
                            <div className='flex justify-end gap-2'>
                              <Button
                                variant='outline'
                                size='icon'
                                onClick={() =>
                                  openEditDialog(member)
                                }
                                title='Edit member'
                              >
                                <Pencil className='h-4 w-4' />
                              </Button>

                              <Button
                                variant='outline'
                                size='icon'
                                onClick={() =>
                                  openDeleteDialog(member)
                                }
                                title='Delete member'
                              >
                                <Trash2 className='h-4 w-4 text-red-500' />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create / Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            closeDialog();
          }
        }}
      >
        <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-[650px]'>
          <DialogHeader>
            <DialogTitle>
              {editingMember
                ? 'Edit Leadership Member'
                : 'Add Leadership Member'}
            </DialogTitle>

            <DialogDescription>
              Manage the profile information shown on the public website.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={handleSubmit}
            className='space-y-5'
          >
            {/* Name */}
            <div className='grid gap-2'>
              <Label htmlFor='name'>
                Name *
              </Label>

              <Input
                id='name'
                value={form.name}
                onChange={(event) =>
                  updateField(
                    'name',
                    event.target.value
                  )
                }
                placeholder='Faisal Aslam'
              />
            </div>

            {/* Designation */}
            <div className='grid gap-2'>
              <Label htmlFor='designation'>
                Designation *
              </Label>

              <Input
                id='designation'
                value={form.designation}
                onChange={(event) =>
                  updateField(
                    'designation',
                    event.target.value
                  )
                }
                placeholder='President'
              />
            </div>

            {/* Image */}
            <div className='grid gap-2'>
              <Label htmlFor='imageUrl'>
                Leadership Image
              </Label>

              <div className='flex flex-col gap-2 sm:flex-row'>
                <Input
                  id='imageUrl'
                  value={form.imageUrl ?? ''}
                  onChange={(event) =>
                    updateField(
                      'imageUrl',
                      event.target.value
                    )
                  }
                  placeholder='/images/person.png or image URL'
                  className='flex-1'
                />

                <Button
                  type='button'
                  variant='outline'
                  onClick={() => setMediaDialogOpen(true)}
                  disabled={saving}
                  className='shrink-0'
                >
                  Select Image
                </Button>
              </div>

              <p className='text-muted-foreground text-xs'>
                Select an existing image or upload a new one from the media
                library. You can also enter an image URL manually.
              </p>

              {form.imageUrl && (
                <div className='mt-2 overflow-hidden rounded-lg border bg-muted/20'>
                  <img
                    src={getPublicImageUrl(form.imageUrl) ?? ''}
                    alt='Leadership image preview'
                    className='h-40 w-full object-cover'
                    onError={(event) => {
                      event.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>

            {/* Experience */}
            <div className='grid gap-2'>
              <Label htmlFor='experience'>
                Experience
              </Label>

              <Input
                id='experience'
                value={form.experience ?? ''}
                onChange={(event) =>
                  updateField(
                    'experience',
                    event.target.value
                  )
                }
                placeholder='18+ Years'
              />
            </div>

            {/* Display Order */}
            <div className='grid gap-2'>
              <Label htmlFor='sortOrder'>
                Display Order
              </Label>

              <Input
                id='sortOrder'
                type='number'
                value={form.sortOrder ?? 0}
                onChange={(event) =>
                  updateField(
                    'sortOrder',
                    Number(event.target.value)
                  )
                }
                min={0}
              />

              <p className='text-muted-foreground text-xs'>
                Lower numbers appear first.
              </p>
            </div>

            {/* Bio */}
            <div className='grid gap-2'>
              <Label htmlFor='bio'>
                Bio
              </Label>

              <Textarea
                id='bio'
                rows={5}
                value={form.bio ?? ''}
                onChange={(event) =>
                  updateField(
                    'bio',
                    event.target.value
                  )
                }
                placeholder='Short profile description...'
              />
            </div>

            {/* Active */}
            <div className='flex items-center justify-between rounded-lg border p-4'>
              <div>
                <Label htmlFor='isActive'>
                  Active
                </Label>

                <p className='text-muted-foreground text-xs'>
                  Show this member on the public website.
                </p>
              </div>

              <Switch
                id='isActive'
                checked={Boolean(form.isActive)}
                onCheckedChange={(checked) =>
                  updateField(
                    'isActive',
                    checked
                  )
                }
              />
            </div>

            {/* Footer */}
            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={closeDialog}
                disabled={saving}
              >
                Cancel
              </Button>

              <Button
                type='submit'
                disabled={saving}
              >
                {saving ? (
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                ) : (
                  <SaveIcon />
                )}

                {saving
                  ? 'Saving...'
                  : editingMember
                    ? 'Update Member'
                    : 'Add Member'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Leadership Image Selection */}
      <MediaSelectionDialog
        open={mediaDialogOpen}
        onOpenChange={setMediaDialogOpen}
        onSelect={handleMediaSelection}
        title='Select Leadership Image'
      />

      {/* Delete Dialog */}
      <AlertDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete Leadership Member?
            </AlertDialogTitle>

            <AlertDialogDescription>
              This will permanently delete{' '}
              <strong>
                {memberToDelete?.name}
              </strong>{' '}
              from the leadership list.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={deleting}
            >
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className='bg-red-600 hover:bg-red-700'
            >
              {deleting ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className='mr-2 h-4 w-4' />
                  Delete
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  );
}

function SaveIcon() {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='16'
      height='16'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      className='mr-2'
    >
      <path d='M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z' />
      <polyline points='17 21 17 13 7 13 7 21' />
      <polyline points='7 3 7 8 15 8' />
    </svg>
  );
}
