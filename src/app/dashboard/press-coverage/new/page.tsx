'use client';

import React, { useState, ChangeEvent, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, Calendar, Link as LinkIcon } from 'lucide-react';
import { pressService } from '@/http/press';
import { MediaSelectionDialog } from '@/components/modal/media-gallary';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

const PressCreator: React.FC = () => {
  const [press, setPress] = useState<any>({
    name: '',
    description: '',
    slug: ''
  });
  const [pressItem, setPressItem] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isMediaDialogOpen, setIsMediaDialogOpen] = useState<boolean>(false);

  const router = useRouter();

  // For press item form
  const [newItem, setNewItem] = useState<Omit<any, 'id'>>({
    title: '',
    publicationName: '',
    publicationDate: new Date().toISOString().split('T')[0],
    url: '', // ADDED URL FIELD
    imageUrl: '',
    excerpt: ''
  });

  const handlePressChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setPress({ ...press, [name]: value });

    // Auto-generate slug when name changes
    if (name === 'name') {
      setPress((prev: any) => ({
        ...prev,
        slug: value
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '')
      }));
    }
  };

  const handleNewItemChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNewItem({ ...newItem, [name]: value });
  };

  const handleImageSelection = (images: { key: string; url: string }[]) => {
    if (images.length > 0) {
      setNewItem({
        ...newItem,
        imageUrl: images[0].url
      });
    }
    setIsMediaDialogOpen(false);
  };

  const addPressItem = () => {
    if (!newItem.title) {
      toast.error('Title is required for press item');
      return;
    }

    // Validate URL if provided
    if (newItem.url && !newItem.url.match(/^https?:\/\/.+/)) {
      toast.error('Please enter a valid URL starting with http:// or https://');
      return;
    }

    setPressItem({
      id: `temp-${Date.now()}`,
      ...newItem
    });

    // Reset the form
    setNewItem({
      title: '',
      publicationName: '',
      publicationDate: new Date().toISOString().split('T')[0],
      url: '', // RESET URL FIELD
      imageUrl: '',
      excerpt: ''
    });
  };

  const removePressItem = () => {
    setPressItem(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const pressData: any = {
        name: press.name,
        description: press.description,
        slug: press.slug,
        isActive: true,
        items: pressItem
          ? [
              {
                title: pressItem.title,
                publicationName: pressItem.publicationName,
                publicationDate: new Date(
                  `${pressItem.publicationDate}T00:00:00Z`
                ).toISOString(),
                url: pressItem.url || null,
                imageUrl: pressItem.imageUrl || '',
                excerpt: pressItem.excerpt || '',
                sortOrder: 0
              }
            ]
          : []
      };

      const res = await pressService.createPress(pressData);

      setPress({ name: '', description: '', slug: '' });
      setPressItem(null);
      toast.success('Press category created successfully!');

      if (res) {
        router.push('/dashboard/press-coverage');
      }
    } catch (error) {
      console.error('Error creating press category:', error);
      toast.error('Failed to create press category');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='hide-scrollbar mb-8 h-screen max-w-full overflow-auto px-9 py-16 font-sans'>
      <h1 className='mb-3 text-4xl font-bold text-gray-900 dark:text-white'>
        Create Press & Coverage Section
      </h1>
      <p className='mb-16 max-w-xl text-lg text-gray-600 dark:text-gray-400'>
        Showcase media coverage, press mention, and publication featuring your
        work.
      </p>

      <form onSubmit={handleSubmit} className='space-y-12'>
        <div className='space-y-8'>
          <div className='space-y-3'>
            <label
              htmlFor='name'
              className='block text-base font-medium text-gray-700 dark:text-gray-300'
            >
              Section Title
            </label>
            <input
              type='text'
              id='name'
              name='name'
              value={press.name}
              onChange={handlePressChange}
              required
              placeholder='e.g. Media Coverage, Press Mentions, etc.'
              className='w-full border-0 border-b-2 border-gray-200 bg-transparent px-0 py-4 text-xl text-gray-800 transition duration-200 placeholder:font-light placeholder:text-gray-400 focus:border-black focus:ring-0 dark:border-gray-700 dark:text-gray-200 dark:placeholder:text-gray-500 dark:focus:border-white'
            />
          </div>

          <div className='space-y-3'>
            <label
              htmlFor='description'
              className='block text-base font-medium text-gray-700 dark:text-gray-300'
            >
              Description
            </label>
            <textarea
              id='description'
              name='description'
              value={press.description}
              onChange={handlePressChange}
              placeholder='A short description about this press collection...'
              rows={3}
              className='w-full resize-none border-0 border-b-2 border-gray-200 bg-transparent px-0 py-4 text-lg text-gray-800 transition duration-200 placeholder:font-light placeholder:text-gray-400 focus:border-black focus:ring-0 dark:border-gray-700 dark:text-gray-200 dark:placeholder:text-gray-500 dark:focus:border-white'
            />
          </div>
        </div>

        {/* Add Press Item Section - Only show if no item exists yet */}
        {!pressItem && (
          <div className='rounded-lg border-2 border-gray-200 bg-white p-8 dark:border-gray-700 dark:bg-zinc-900'>
            <h2 className='mb-6 font-serif text-2xl font-semibold text-gray-900 dark:text-white'>
              Add Press Item
            </h2>

            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
              <div className='space-y-4'>
                <div>
                  <label className='mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300'>
                    Article/Mention Title*
                  </label>
                  <input
                    type='text'
                    name='title'
                    value={newItem.title}
                    onChange={handleNewItemChange}
                    placeholder='Title of the article or mention'
                    className='w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-black focus:ring-0 dark:border-gray-600 dark:bg-zinc-800 dark:text-gray-100 dark:focus:border-white'
                  />
                </div>

                <div>
                  <label className='mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300'>
                    Publication Name
                  </label>
                  <input
                    type='text'
                    name='publicationName'
                    value={newItem.publicationName}
                    onChange={handleNewItemChange}
                    placeholder='e.g. The New York Times'
                    className='w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-black focus:ring-0 dark:border-gray-600 dark:bg-zinc-800 dark:text-gray-100 dark:focus:border-white'
                  />
                </div>

                <div>
                  <label className='mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300'>
                    Publication Date
                  </label>
                  <input
                    type='date'
                    name='publicationDate'
                    value={newItem.publicationDate}
                    onChange={handleNewItemChange}
                    max={new Date().toISOString().split('T')[0]}
                    className='w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-black focus:ring-0 dark:border-gray-600 dark:bg-zinc-800 dark:text-gray-100 dark:focus:border-white'
                  />
                </div>

                {/* URL FIELD - ADDED */}
                <div>
                  <label className='mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300'>
                    Article URL
                  </label>
                  <div className='relative'>
                    <input
                      type='url'
                      name='url'
                      value={newItem.url || ''}
                      onChange={handleNewItemChange}
                      placeholder='https://example.com/article'
                      pattern='https?://.*'
                      className='w-full rounded-md border border-gray-300 bg-white px-4 py-2 pr-10 text-gray-900 focus:border-black focus:ring-0 dark:border-gray-600 dark:bg-zinc-800 dark:text-gray-100 dark:focus:border-white'
                    />
                    <LinkIcon className='pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500' />
                  </div>
                </div>
              </div>

              <div className='space-y-4'>
                <div>
                  <label className='mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300'>
                    Featured Image
                  </label>
                  <div className='flex gap-2'>
                    <input
                      type='text'
                      name='imageUrl'
                      value={newItem.imageUrl || ''}
                      onChange={handleNewItemChange}
                      placeholder='Image URL or select from media'
                      className='w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-black focus:ring-0 dark:border-gray-600 dark:bg-zinc-800 dark:text-gray-100 dark:focus:border-white'
                      readOnly
                    />
                    <Button
                      type='button'
                      variant='outline'
                      onClick={() => setIsMediaDialogOpen(true)}
                    >
                      Select
                    </Button>
                  </div>
                </div>

                <div>
                  <label className='mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300'>
                    Excerpt
                  </label>
                  <textarea
                    name='excerpt'
                    value={newItem.excerpt || ''}
                    onChange={handleNewItemChange}
                    placeholder='A brief excerpt from the article'
                    rows={3}
                    maxLength={500}
                    className='h-[130px] w-full resize-none rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-black focus:ring-0 dark:border-gray-600 dark:bg-zinc-800 dark:text-gray-100 dark:focus:border-white'
                  />
                  {newItem.excerpt && (
                    <p className='mt-1 text-xs text-gray-500 dark:text-gray-400'>
                      {newItem.excerpt.length}/500 characters
                    </p>
                  )}
                </div>
              </div>
            </div>

            <Button
              type='button'
              onClick={addPressItem}
              className='mt-6 bg-black text-white hover:bg-gray-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200'
              disabled={!newItem.title}
            >
              Add Press Item
            </Button>
          </div>
        )}

        <MediaSelectionDialog
          open={isMediaDialogOpen}
          onOpenChange={setIsMediaDialogOpen}
          onSelect={handleImageSelection}
          multiple={false}
          title='Select Featured Image'
        />

        {/* Press Item Display */}
        {pressItem && (
          <div className='pt-8'>
            <div className='mb-6 flex items-baseline justify-between border-b border-gray-200 pb-4 dark:border-gray-700'>
              <h2 className='font-serif text-2xl font-semibold text-gray-900 dark:text-white'>
                Press Item
              </h2>
            </div>

            <div className='space-y-6'>
              <div className='group relative overflow-hidden rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-gray-700 dark:bg-zinc-900'>
                <div className='flex flex-col gap-6 md:flex-row md:gap-8'>
                  {pressItem.imageUrl && (
                    <div className='relative h-40 w-full overflow-hidden rounded-lg md:h-auto md:w-48'>
                      <img
                        src={pressItem.imageUrl}
                        alt={pressItem.title}
                        className='h-full w-full object-cover'
                      />
                    </div>
                  )}

                  <div className='flex flex-1 flex-col'>
                    <div className='mb-3 flex items-start justify-between'>
                      <div className='flex-1'>
                        <h3 className='text-lg font-bold text-gray-900 dark:text-white'>
                          {pressItem.title}
                        </h3>
                        {pressItem.publicationName && (
                          <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
                            {pressItem.publicationName}
                          </p>
                        )}
                      </div>
                      <button
                        type='button'
                        onClick={removePressItem}
                        className='rounded-full bg-gray-100 p-2 text-gray-500 hover:bg-gray-200 hover:text-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300'
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className='mb-3 flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400'>
                      {pressItem.publicationDate && (
                        <div className='flex items-center'>
                          <Calendar size={14} className='mr-1' />
                          {new Date(
                            pressItem.publicationDate
                          ).toLocaleDateString()}
                        </div>
                      )}
                      {/* DISPLAY URL IF EXISTS */}
                      {pressItem.url && (
                        <a
                          href={pressItem.url}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='flex items-center text-blue-600 hover:underline dark:text-blue-400'
                        >
                          <LinkIcon size={14} className='mr-1' />
                          View Article
                        </a>
                      )}
                    </div>

                    {pressItem.excerpt && (
                      <p className='mt-2 line-clamp-3 text-sm text-gray-600 dark:text-gray-400'>
                        {pressItem.excerpt}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className='pb-8'>
          <button
            type='submit'
            className={cn(
              'mt-6 cursor-pointer rounded-md px-8 py-4 text-base font-medium text-white transition duration-200',
              'bg-black hover:bg-gray-800 disabled:bg-gray-300 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200',
              'relative overflow-hidden',
              isSubmitting ? 'cursor-wait' : ''
            )}
            disabled={isSubmitting || !press.name || !press.slug || !pressItem}
          >
            {isSubmitting ? (
              <>
                <span className='opacity-0'>Publish Press Section</span>
                <span className='absolute inset-0 flex items-center justify-center'>
                  <span className='mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent'></span>
                  Publishing...
                </span>
              </>
            ) : (
              'Publish Press Section'
            )}
          </button>

          {(press.name === '' || press.slug === '' || !pressItem) && (
            <p className='mt-4 text-sm text-gray-500 dark:text-gray-400'>
              {press.name === '' &&
                'Please add a title for your press section. '}
              {press.slug === '' && 'Please provide a URL slug. '}
              {!pressItem && 'Add a press item to create your press section.'}
            </p>
          )}
        </div>
      </form>
    </div>
  );
};

export default PressCreator;
