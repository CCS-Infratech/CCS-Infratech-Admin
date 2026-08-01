'use client';

import { useState } from 'react';
import TiptapEditor from '@/components/tiptap-editor';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { blogService } from '@/http/blogs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function ProductForm({ pageTitle }: { pageTitle: string }) {
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [published, setPublished] = useState(false);
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleEditorUpdate = (html: string) => {
    setContent(html);
  };

  const handleSubmit = async () => {
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

      await blogService.createBlog({
        title,
        content,
        summary,
        published
      });

      toast.success('Your blog post has been created successfully!');

      // Reset form
      setTitle('');
      setSummary('');
      setContent('');
      setPublished(false);
      router.push('/dashboard/blog');
    } catch (error) {
      console.error('Failed to create blog post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className='mx-auto flex h-full w-full flex-col'>
      <CardHeader className='flex justify-between'>
        <CardTitle className='text-left text-2xl font-bold'>
          {pageTitle}
        </CardTitle>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className='ml-auto'
        >
          {isSubmitting ? 'Creating...' : 'Create Blog Post'}
        </Button>
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
              <Label htmlFor='published'>Publish immediately</Label>
            </div>
          </div>
          <div className='space-y-2'>
            <Label htmlFor='content'>Content</Label>
            <div className='rounded-md border'>
              <TiptapEditor onUpdate={handleEditorUpdate} minHeight={400} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
