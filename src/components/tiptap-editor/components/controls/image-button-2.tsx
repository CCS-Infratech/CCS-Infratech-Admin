import React from 'react';

import { useImage } from '../../hooks/use-image';
import useModal from '../../hooks/use-modal';
import { MenuButton } from '../menu-button';
import { MediaSelectionDialog } from '@/components/modal/media-gallary';

const ImageButton = () => {
  const { canInsert, insert } = useImage();
  const { open, handleOpen, handleClose } = useModal();

  const handleImageSelect = (
    selectedImages: { key: string; url: string }[]
  ) => {
    if (selectedImages && selectedImages.length > 0) {
      const image = selectedImages[0];
      insert({ src: image.url });
      handleClose();
    }
  };

  return (
    <>
      <MenuButton
        icon='Image'
        tooltip='Image'
        disabled={!canInsert}
        onClick={handleOpen}
      />
      <MediaSelectionDialog
        open={open}
        onOpenChange={handleClose}
        onSelect={handleImageSelect}
        multiple={false}
        title='Insert Image'
      />
    </>
  );
};

export default ImageButton;
