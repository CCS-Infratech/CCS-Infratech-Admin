'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { MediaSelectionDialog } from '@/components/modal/media-gallary';
import { ImagePlus } from 'lucide-react';

type MediaFile = {
  url: string;
};

interface BlogCoverImageFieldProps {
  value: string;
  onChange: (url: string) => void;
}

export function BlogCoverImageField({
  value,
  onChange
}: BlogCoverImageFieldProps) {
  const [isMediaDialogOpen, setIsMediaDialogOpen] = useState(false);

  const handleSelect = (selected: MediaFile[]) => {
    if (selected.length > 0) {
      onChange(selected[0].url);
      setIsMediaDialogOpen(false);
    }
  };

  return (
    <div className='space-y-2'>
      <Label>Cover Image</Label>
      <p className='text-muted-foreground text-xs leading-relaxed'>
        This image appears on the blog listing, admin table, and the top of the
        article. Landscape photos work best.
      </p>

      {value ? (
        <div className='relative overflow-hidden rounded-2xl border border-gray-100'>
          <img
            src={value}
            alt='Blog cover'
            className='h-48 w-full object-cover'
          />
          <div className='absolute top-3 right-3 flex gap-2'>
            <Button
              type='button'
              size='sm'
              variant='secondary'
              onClick={() => setIsMediaDialogOpen(true)}
              className='h-8 rounded-full bg-white/95 px-3 text-xs font-medium shadow-lg backdrop-blur-sm hover:bg-white'
            >
              Replace
            </Button>
            <Button
              type='button'
              size='sm'
              variant='secondary'
              onClick={() => onChange('')}
              className='h-8 rounded-full bg-white/95 px-3 text-xs font-medium shadow-lg backdrop-blur-sm hover:bg-red-50 hover:text-red-600'
            >
              Remove
            </Button>
          </div>
        </div>
      ) : (
        <button
          type='button'
          onClick={() => setIsMediaDialogOpen(true)}
          className='group flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gradient-to-br from-gray-50 to-white py-10 transition-all hover:border-amber-500 hover:from-amber-50 hover:to-white'
        >
          <div className='flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm transition-transform group-hover:scale-110'>
            <ImagePlus className='h-5 w-5 text-gray-400 group-hover:text-amber-600' />
          </div>
          <p className='mt-3 text-sm font-medium text-gray-700 group-hover:text-amber-600'>
            Upload cover image
          </p>
          <p className='mt-1 text-xs text-gray-500'>
            Click to browse or upload from the media library
          </p>
        </button>
      )}

      <MediaSelectionDialog
        open={isMediaDialogOpen}
        onOpenChange={setIsMediaDialogOpen}
        onSelect={handleSelect}
        multiple={false}
        title='Select Blog Cover Image'
        acceptedTypes={['image']}
      />
    </div>
  );
}
