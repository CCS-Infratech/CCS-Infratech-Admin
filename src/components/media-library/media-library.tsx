import './style.scss';
import MediaGallery from './media-gallery';
import { imageService } from '@/http/image';
import React, { useEffect, useRef, useState } from 'react';
import Button from '@/components/tiptap-editor/components/ui/button';

interface MediaLibraryProps {
  onInsert?: (image: ImageData) => void;
  onClose?: () => void;
}

interface ImageData {
  id?: string;
  url: string;
  created_at?: string;
  bytes?: number;
  format: string;
  display_name: string;
  width: number;
  height: number;
}

const MediaLibrary: React.FC<MediaLibraryProps> = ({ onInsert, onClose }) => {
  const [loading, setLoading] = useState(true); // Start with loading true
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState<ImageData[]>([]);
  const [previews, setPreviews] = useState<ImageData[]>([]);
  const [selected, setSelected] = useState<ImageData | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  // Fetch images on component mount
  useEffect(() => {
    const fetchImages = async () => {
      setLoading(true);
      try {
        const fetchedImages = await imageService.getImages();
        setImages(fetchedImages);
        setError(null);
      } catch (err) {
        console.error('Error fetching images:', err);
        setError('Failed to load images. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  const handleUploadClick = () => {
    const confirmUpload = window.confirm(
      'Please avoid uploading too many images unnecessarily to save storage space. Also, ensure your images comply with copyright rules. Do you wish to continue?'
    );

    if (confirmUpload) {
      fileInput.current?.click();
    }
  };

  const loadImage = (file: File): Promise<ImageData> => {
    return new Promise((resolve) => {
      const url = URL.createObjectURL(file);
      const image = new Image();
      image.onload = () => {
        resolve({
          url,
          width: image.width,
          height: image.height,
          format: file.type.split('/')[1],
          display_name: file.name.split(/\.\w+$/)[0]
        });
      };
      image.src = url;
    });
  };

  const uploadImage = async (file: File) => {
    if (!file.type.startsWith('image/')) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      // Use the image service for upload
      return await imageService.uploadImage(formData);
    } catch (error) {
      console.error('Upload error:', error);
      setError('Failed to upload image. Please try again.');
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError(null);

    const previewPromises = Array.from(files).map(loadImage);
    const loadedPreviews = await Promise.all(previewPromises);
    setPreviews(loadedPreviews);

    const uploadPromises = Array.from(files).map(uploadImage);
    const uploadImages = await Promise.all(uploadPromises);
    const validImages = uploadImages.filter(Boolean);

    loadedPreviews.forEach((preview) => URL.revokeObjectURL(preview.url));
    setPreviews([]);

    if (validImages.length > 0) {
      setImages((prev) => [...validImages, ...prev]);

      // Auto-select the first uploaded image for convenience
      if (!selected) {
        setSelected(validImages[0]);
      }
    }

    setUploading(false);

    // Reset file input
    if (fileInput.current) {
      fileInput.current.value = '';
    }
  };

  // Handle drag events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setError(null);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = e.dataTransfer.files;

      setUploading(true);

      // Show previews
      const previewPromises = Array.from(files).map(loadImage);
      const loadedPreviews = await Promise.all(previewPromises);
      setPreviews(loadedPreviews);

      // Upload files
      const uploadPromises = Array.from(files).map(uploadImage);
      const uploadImages = await Promise.all(uploadPromises);
      const validImages = uploadImages.filter(Boolean);

      // Cleanup previews
      loadedPreviews.forEach((preview) => URL.revokeObjectURL(preview.url));
      setPreviews([]);

      if (validImages.length > 0) {
        setImages((prev) => [...validImages, ...prev]);

        // Auto-select the first uploaded image
        if (!selected) {
          setSelected(validImages[0]);
        }
      }

      setUploading(false);
    }
  };

  const handleFinish = () => selected !== null && onInsert?.(selected);

  return (
    <div className='media-library' onDragEnter={handleDrag}>
      <header className='media-library__header'>
        <h2>Assets</h2>
        <Button disabled={loading || uploading} onClick={handleUploadClick}>
          {uploading ? 'Uploading...' : 'Upload'}
        </Button>
      </header>

      {dragActive && (
        <div
          className='media-library__dropzone'
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className='media-library__dropzone-content'>
            <div className='media-library__upload-icon'>
              <svg
                width='40'
                height='40'
                viewBox='0 0 24 24'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  d='M12 5V19M12 5L6 11M12 5L18 11'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              </svg>
            </div>
            <p>Drop your images here</p>
          </div>
        </div>
      )}

      <div
        className='media-library__content'
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {loading ? (
          <div className='media-library__spinner' aria-label='Loading images' />
        ) : error ? (
          <div className='media-library__error'>
            <p>{error}</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        ) : images.length === 0 ? (
          <div className='media-library__empty'>
            <div className='media-library__upload-hint'>
              <p>
                No images found. Drag and drop images here or use the upload
                button above.
              </p>
            </div>
          </div>
        ) : (
          <>
            <MediaGallery
              data={[...previews, ...images]}
              onSelect={setSelected}
              selected={selected}
            />
          </>
        )}

        {uploading && (
          <div className='media-library__upload-overlay'>
            <div
              className='media-library__spinner'
              aria-label='Uploading images'
            />
            <p>Uploading images...</p>
          </div>
        )}
      </div>

      <footer className='media-library__footer'>
        <Button
          variant='outline'
          className='media-library__btn media-library__btn--cancel'
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button
          className='media-library__btn media-library__btn--finish'
          disabled={!selected || loading || uploading}
          onClick={handleFinish}
        >
          Insert
        </Button>
      </footer>

      <input
        style={{ display: 'none' }}
        type='file'
        multiple
        accept='image/*'
        ref={fileInput}
        onChange={handleFileChange}
      />
    </div>
  );
};

export default MediaLibrary;
