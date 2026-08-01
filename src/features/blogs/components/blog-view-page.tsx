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
    </>
  );
}
