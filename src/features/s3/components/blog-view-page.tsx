'use client';

import { useEffect, useState } from 'react';
import TiptapEditor from '@/components/tiptap-editor';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { blogService } from '@/http/blogs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Trash2, ImageIcon } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction
} from '@/components/ui/alert-dialog';

export default function BlogViewPage({ blogId }: { blogId: string }) {
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [published, setPublished] = useState(false);
  const [content, setContent] = useState('');
  const [images, setImages] = useState<any[]>([]);
  const [imageToDelete, setImageToDelete] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchBlog() {
      try {
        setIsLoading(true);
        const response = await blogService.getBlog(blogId);
        const blog = response.data;

        if (blog) {
          setTitle(blog.title || '');
          setSummary(blog.summary || '');
          setContent(blog.content || '');
          setPublished(blog.published || false);
          setImages(blog.images || []);
        }
      } catch (error) {
        console.error('Error fetching blog:', error);
        toast.error('Failed to load blog post');
      } finally {
        setIsLoading(false);
      }
    }

    fetchBlog();
  }, [blogId]);

  const handleEditorUpdate = (html: string) => {
    setContent(html);
  };

  const handleUpdate = async () => {
    if (!title.trim()) {
      toast.error('Please enter a title for your blog post');
      return;
    }

    if (!content.trim()) {
      toast.error('Please add some content to your blog post');
      return;
    }

    try {
      setIsSubmitting(true);

      await blogService.updateBlog(blogId, {
        title,
        content,
        summary,
        published
      });

      toast.success('Blog post updated successfully!');

      // Redirect to blog list
      router.push('/dashboard/blog');
    } catch (error) {
      console.error('Failed to update blog post:', error);
      toast.error('Failed to update blog post');
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteImage = async (imageId: string) => {
    try {
      setIsDeleting(true);
      // Assuming you have an endpoint to delete blog images
      await blogService.deleteImage(imageId);

      // Update the local state by removing the deleted image
      setImages(images.filter((img) => img.id !== imageId));
      toast.success('Image deleted successfully');
    } catch (error) {
      console.error('Failed to delete image:', error);
      toast.error('Failed to delete image');
    } finally {
      setIsDeleting(false);
      setImageToDelete(null);
    }
  };

  if (isLoading) {
    return (
      <Card className='mx-auto flex h-full w-full flex-col'>
        <CardHeader className='flex justify-between'>
          <div className='bg-muted h-8 w-40 animate-pulse rounded'></div>
          <div className='flex gap-2'>
            <div className='bg-muted h-10 w-20 animate-pulse rounded'></div>
            <div className='bg-muted h-10 w-32 animate-pulse rounded'></div>
          </div>
        </CardHeader>
        <CardContent className='grow overflow-y-auto px-4 pb-6'>
          <div className='space-y-6'>
            {/* Title field skeleton */}
            <div className='space-y-2'>
              <div className='bg-muted h-5 w-16 animate-pulse rounded'></div>
              <div className='bg-muted h-10 w-full animate-pulse rounded'></div>
            </div>

            {/* Summary and Published skeletons */}
            <div className='flex justify-between'>
              <div className='w-[70%] space-y-2'>
                <div className='bg-muted h-5 w-20 animate-pulse rounded'></div>
                <div className='bg-muted h-24 w-full animate-pulse rounded'></div>
              </div>
              <div className='flex items-center space-x-2'>
                <div className='bg-muted h-6 w-10 animate-pulse rounded'></div>
                <div className='bg-muted h-5 w-20 animate-pulse rounded'></div>
              </div>
            </div>

            {/* Content editor skeleton */}
            <div className='space-y-2'>
              <div className='bg-muted h-5 w-20 animate-pulse rounded'></div>
              <div className='bg-muted/30 h-[400px] w-full animate-pulse rounded border'></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className='mx-auto flex h-full w-full flex-col'>
        <CardHeader className='flex justify-between'>
          <CardTitle className='text-left text-2xl font-bold'>
            View/Edit Blog
          </CardTitle>
          <div className='flex gap-2'>
            <Button
              variant='outline'
              onClick={() => router.push('/dashboard/blog')}
            >
              Cancel
            </Button>
            <Button
              className='bg-amber-500 hover:bg-amber-600'
              onClick={handleUpdate}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Updating...' : 'Update Blog Post'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className='grow overflow-y-auto px-4 pb-6'>
          <div className='space-y-6'>
            <div className='space-y-2'>
              <Label htmlFor='title'>Title</Label>
              <Input
                id='title'
                placeholder='Enter blog title'
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className='flex justify-between'>
              <div className='w-[70%] space-y-2'>
                <Label htmlFor='summary'>Summary</Label>
                <Textarea
                  id='summary'
                  placeholder='Enter a brief summary'
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  rows={3}
                />
              </div>
              <div className='flex items-center space-x-2'>
                <Switch
                  id='published'
                  checked={published}
                  onCheckedChange={setPublished}
                />
                <Label htmlFor='published'>Published</Label>
              </div>
            </div>

            {/* Images Section */}
            <div className='space-y-4 border-t border-gray-200 pt-4'>
              <div className='flex items-center'>
                <Label className='text-lg font-medium'>Blog Images</Label>
                <span className='ml-2 text-sm text-gray-500'>
                  ({images.length} image{images.length !== 1 ? 's' : ''})
                </span>
              </div>

              {images.length > 0 ? (
                <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
                  {images.map((image) => (
                    <div
                      key={image.id}
                      className='overflow-hidden rounded-md border shadow-sm transition-shadow hover:shadow-md'
                    >
                      <div className='relative aspect-video bg-gray-100'>
                        <img
                          src={image.url}
                          alt={image.alt || 'Blog image'}
                          className='h-full w-full object-cover'
                        />
                      </div>
                      <div className='bg-white p-3'>
                        <div className='flex items-center justify-between'>
                          <div className='overflow-hidden'>
                            <p
                              className='truncate text-sm font-medium'
                              title={image.filename}
                            >
                              {image.filename}
                            </p>
                            {image.caption && (
                              <p className='truncate text-xs text-gray-500'>
                                {image.caption}
                              </p>
                            )}
                          </div>
                          <Button
                            variant='ghost'
                            size='icon'
                            className='text-red-500 hover:bg-red-50 hover:text-red-700'
                            onClick={() => setImageToDelete(image.id)}
                          >
                            <Trash2 size={18} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className='rounded-md border bg-gray-50 p-12 text-center'>
                  <ImageIcon className='mx-auto mb-3 h-12 w-12 text-gray-400' />
                  <h3 className='text-sm font-medium text-gray-900'>
                    No images
                  </h3>
                  <p className='mt-1 text-xs text-gray-500'>
                    This blog post doesn't have any images yet.
                  </p>
                </div>
              )}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='content'>Content</Label>
              <div className='rounded-md border'>
                <TiptapEditor
                  onUpdate={handleEditorUpdate}
                  content={content}
                  minHeight={400}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog
        open={!!imageToDelete}
        onOpenChange={(open) => !open && setImageToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this image from the blog. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                if (imageToDelete) {
                  deleteImage(imageToDelete);
                }
              }}
              className='bg-red-500 text-white hover:bg-red-600'
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete Image'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
