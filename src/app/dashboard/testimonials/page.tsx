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
  Star,
  MessageSquare,
  Save
} from 'lucide-react';

import { toast } from 'sonner';

import {
  testimonialService,
  Testimonial,
  CreateTestimonial,
  UpdateTestimonial
} from '@/http/testimonials';

import { MediaSelectionDialog } from '@/components/modal/media-gallary';

const PUBLIC_SITE_URL = 'https://www.ccsinfratech.com';

const emptyForm: CreateTestimonial = {
  author: '',
  role: '',
  content: '',
  imageUrl: '',
  rating: 5,
  isActive: true,
  sortOrder: 0
};

function getPublicImageUrl(
  imageUrl: string | null
): string | null {
  if (!imageUrl) return null;

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

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] =
    useState<Testimonial | null>(null);
  const [form, setForm] = useState<CreateTestimonial>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [mediaDialogOpen, setMediaDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [testimonialToDelete, setTestimonialToDelete] =
    useState<Testimonial | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadTestimonials = async () => {
    try {
      setLoading(true);
      const data = await testimonialService.getAllTestimonials();
      setTestimonials(data);
    } catch (error) {
      console.error('Failed to load testimonials:', error);
      toast.error('Failed to load testimonials');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTestimonials();
  }, []);

  const openCreateDialog = () => {
    setEditingTestimonial(null);
    setForm({
      ...emptyForm,
      sortOrder: testimonials.length + 1
    });
    setDialogOpen(true);
  };

  const openEditDialog = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial);
    setForm({
      author: testimonial.author,
      role: testimonial.role,
      content: testimonial.content,
      imageUrl: testimonial.imageUrl ?? '',
      rating: testimonial.rating,
      isActive: testimonial.isActive,
      sortOrder: testimonial.sortOrder
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    if (saving) return;

    setDialogOpen(false);
    setEditingTestimonial(null);
    setForm({ ...emptyForm });
  };

  const updateField = (
    field: keyof CreateTestimonial,
    value: string | boolean | number
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value
    }));
  };

  const handleMediaSelection = (
    selectedImages: { url: string }[]
  ) => {
    if (selectedImages.length === 0) return;

    updateField('imageUrl', selectedImages[0].url);
    setMediaDialogOpen(false);
    toast.success('Testimonial image selected');
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const author = form.author.trim();
    const role = form.role.trim();
    const content = form.content.trim();
    const rating = Number(form.rating);
    const sortOrder = Number(form.sortOrder);

    if (!author) {
      toast.error('Author name is required');
      return;
    }

    if (!role) {
      toast.error('Role is required');
      return;
    }

    if (!content) {
      toast.error('Testimonial content is required');
      return;
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      toast.error('Rating must be between 1 and 5');
      return;
    }

    if (!Number.isInteger(sortOrder) || sortOrder < 0) {
      toast.error('Display order must be 0 or greater');
      return;
    }

    try {
      setSaving(true);

      if (editingTestimonial) {
        const data: UpdateTestimonial = {
          author,
          role,
          content,
          imageUrl: form.imageUrl?.trim() || null,
          rating,
          isActive: Boolean(form.isActive),
          sortOrder
        };

        await testimonialService.updateTestimonial(
          editingTestimonial.id,
          data
        );

        toast.success('Testimonial updated successfully');
      } else {
        const data: CreateTestimonial = {
          author,
          role,
          content,
          imageUrl: form.imageUrl?.trim() || null,
          rating,
          isActive: Boolean(form.isActive),
          sortOrder
        };

        await testimonialService.createTestimonial(data);

        toast.success('Testimonial created successfully');
      }

      setDialogOpen(false);
      setEditingTestimonial(null);
      setForm({ ...emptyForm });
      await loadTestimonials();
    } catch (error) {
      console.error('Failed to save testimonial:', error);
      toast.error('Failed to save testimonial');
    } finally {
      setSaving(false);
    }
  };

  const openDeleteDialog = (testimonial: Testimonial) => {
    setTestimonialToDelete(testimonial);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!testimonialToDelete) return;

    try {
      setDeleting(true);

      await testimonialService.deleteTestimonial(
        testimonialToDelete.id
      );

      toast.success('Testimonial deleted successfully');

      setDeleteDialogOpen(false);
      setTestimonialToDelete(null);

      await loadTestimonials();
    } catch (error) {
      console.error('Failed to delete testimonial:', error);
      toast.error('Failed to delete testimonial');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-6'>
        <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>
              Testimonials
            </h2>

            <p className='text-muted-foreground mt-1'>
              Manage the testimonials displayed on the CCS INFRATECH website.
            </p>
          </div>

          <Button onClick={openCreateDialog}>
            <Plus className='mr-2 h-4 w-4' />
            Add Testimonial
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <MessageSquare className='h-5 w-5' />
              Customer Testimonials
            </CardTitle>

            <CardDescription>
              Add, edit, reorder or disable testimonials shown on the website.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className='flex min-h-[300px] items-center justify-center'>
                <Loader2 className='h-7 w-7 animate-spin' />
              </div>
            ) : testimonials.length === 0 ? (
              <div className='flex min-h-[250px] flex-col items-center justify-center text-center'>
                <MessageSquare className='text-muted-foreground mb-3 h-10 w-10' />

                <h3 className='font-semibold'>
                  No testimonials yet
                </h3>

                <p className='text-muted-foreground mt-1 text-sm'>
                  Add your first customer testimonial.
                </p>

                <Button className='mt-4' onClick={openCreateDialog}>
                  <Plus className='mr-2 h-4 w-4' />
                  Add Testimonial
                </Button>
              </div>
            ) : (
              <div className='overflow-x-auto rounded-md border'>
                <table className='w-full text-sm'>
                  <thead>
                    <tr className='bg-muted/50 border-b'>
                      <th className='px-4 py-3 text-left font-medium'>
                        Testimonial
                      </th>

                      <th className='px-4 py-3 text-left font-medium'>
                        Role
                      </th>

                      <th className='px-4 py-3 text-left font-medium'>
                        Rating
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
                    {testimonials.map((testimonial) => {
                      const imageUrl = getPublicImageUrl(
                        testimonial.imageUrl
                      );

                      return (
                        <tr
                          key={testimonial.id}
                          className='hover:bg-muted/30 border-b last:border-0'
                        >
                          <td className='px-4 py-3'>
                            <div className='flex items-center gap-3'>
                              <div className='bg-muted flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full'>
                                {imageUrl ? (
                                  <img
                                    src={imageUrl}
                                    alt={testimonial.author}
                                    className='h-full w-full object-cover'
                                    onError={(event) => {
                                      event.currentTarget.style.display =
                                        'none';
                                    }}
                                  />
                                ) : (
                                  <MessageSquare className='text-muted-foreground h-5 w-5' />
                                )}
                              </div>

                              <div className='min-w-0'>
                                <div className='font-medium'>
                                  {testimonial.author}
                                </div>

                                <div className='text-muted-foreground max-w-[360px] truncate text-xs'>
                                  {testimonial.content}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className='px-4 py-3'>
                            {testimonial.role}
                          </td>

                          <td className='px-4 py-3'>
                            <div className='flex gap-1'>
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`h-4 w-4 ${
                                    star <= testimonial.rating
                                      ? 'fill-primary text-primary'
                                      : 'text-muted-foreground'
                                  }`}
                                />
                              ))}
                            </div>
                          </td>

                          <td className='px-4 py-3'>
                            {testimonial.sortOrder}
                          </td>

                          <td className='px-4 py-3'>
                            {testimonial.isActive ? (
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

                          <td className='px-4 py-3'>
                            <div className='flex justify-end gap-2'>
                              <Button
                                variant='outline'
                                size='icon'
                                onClick={() =>
                                  openEditDialog(testimonial)
                                }
                                title='Edit testimonial'
                              >
                                <Pencil className='h-4 w-4' />
                              </Button>

                              <Button
                                variant='outline'
                                size='icon'
                                onClick={() =>
                                  openDeleteDialog(testimonial)
                                }
                                title='Delete testimonial'
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

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
      >
        <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-[650px]'>
          <DialogHeader>
            <DialogTitle>
              {editingTestimonial
                ? 'Edit Testimonial'
                : 'Add Testimonial'}
            </DialogTitle>

            <DialogDescription>
              Manage the testimonial shown on the public CCS INFRATECH website.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className='space-y-5'>
            <div className='grid gap-2'>
              <Label htmlFor='author'>Author *</Label>

              <Input
                id='author'
                value={form.author}
                onChange={(event) =>
                  updateField('author', event.target.value)
                }
                placeholder='Nikita'
              />
            </div>

            <div className='grid gap-2'>
              <Label htmlFor='role'>Role *</Label>

              <Input
                id='role'
                value={form.role}
                onChange={(event) =>
                  updateField('role', event.target.value)
                }
                placeholder='Real Estate Agent'
              />
            </div>

            <div className='grid gap-2'>
              <Label htmlFor='imageUrl'>Testimonial Image</Label>

              <div className='flex flex-col gap-2 sm:flex-row'>
                <Input
                  id='imageUrl'
                  value={form.imageUrl ?? ''}
                  onChange={(event) =>
                    updateField('imageUrl', event.target.value)
                  }
                  placeholder='/images/testimonials/person.jpg or image URL'
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
                Select an image from the media library or enter an image URL.
              </p>

              {form.imageUrl && (
                <div className='mt-2 overflow-hidden rounded-lg border bg-muted/20'>
                  <img
                    src={
                      getPublicImageUrl(form.imageUrl) ?? ''
                    }
                    alt='Testimonial preview'
                    className='h-40 w-full object-cover'
                    onError={(event) => {
                      event.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>

            <div className='grid gap-2'>
              <Label htmlFor='content'>Testimonial *</Label>

              <Textarea
                id='content'
                rows={6}
                value={form.content}
                onChange={(event) =>
                  updateField('content', event.target.value)
                }
                placeholder='Share the customer testimonial...'
              />
            </div>

            <div className='grid gap-2'>
              <Label htmlFor='rating'>Rating</Label>

              <Input
                id='rating'
                type='number'
                min={1}
                max={5}
                step={1}
                value={form.rating ?? 5}
                onChange={(event) =>
                  updateField(
                    'rating',
                    Number(event.target.value)
                  )
                }
              />

              <div className='flex gap-1'>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${
                      star <= Number(form.rating ?? 5)
                        ? 'fill-primary text-primary'
                        : 'text-muted-foreground'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className='grid gap-2'>
              <Label htmlFor='sortOrder'>Display Order</Label>

              <Input
                id='sortOrder'
                type='number'
                min={0}
                step={1}
                value={form.sortOrder ?? 0}
                onChange={(event) =>
                  updateField(
                    'sortOrder',
                    Number(event.target.value)
                  )
                }
              />

              <p className='text-muted-foreground text-xs'>
                Lower numbers appear first.
              </p>
            </div>

            <div className='flex items-center justify-between rounded-lg border p-4'>
              <div>
                <Label htmlFor='isActive'>Active</Label>

                <p className='text-muted-foreground text-xs'>
                  Show this testimonial on the public website.
                </p>
              </div>

              <Switch
                id='isActive'
                checked={Boolean(form.isActive)}
                onCheckedChange={(checked) =>
                  updateField('isActive', checked)
                }
              />
            </div>

            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={closeDialog}
                disabled={saving}
              >
                Cancel
              </Button>

              <Button type='submit' disabled={saving}>
                {saving ? (
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                ) : (
                  <Save className='mr-2 h-4 w-4' />
                )}

                {saving
                  ? 'Saving...'
                  : editingTestimonial
                    ? 'Update Testimonial'
                    : 'Add Testimonial'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <MediaSelectionDialog
        open={mediaDialogOpen}
        onOpenChange={setMediaDialogOpen}
        onSelect={handleMediaSelection}
        title='Select Testimonial Image'
      />

      <AlertDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete Testimonial?
            </AlertDialogTitle>

            <AlertDialogDescription>
              This will permanently delete{' '}
              <strong>{testimonialToDelete?.author}</strong>{' '}
              from the testimonials list.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>
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
