'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { projectService } from '@/http/project';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import {
  Building,
  FileText,
  LayoutDashboard,
  MapPin,
  Star,
  Loader2,
  Plus,
  Image as ImageIcon,
  File,
  X,
  ImagePlus,
  Menu
} from 'lucide-react';
import { DatePicker } from '@/components/ui/date-picker';
import { MediaSelectionDialog } from '@/components/modal/media-gallary';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

interface MediaObject {
  key: string;
  size: number;
  lastModified: string;
  url: string;
  type: string;
}

interface MediumImageUploadProps {
  value: MediaObject | null;
  onChange: (media: MediaObject | null) => void;
  label: string;
  acceptType?: 'image' | 'pdf' | 'any';
}

const PREDEFINED_AMENITIES = [
  {
    id: 'car-parks',
    name: 'Car Parks',
    imageUrl:
      'https://ccs-infratech.s3.amazonaws.com/blogs/1769796244253-car-parks.png'
  },
  {
    id: 'vanity',
    name: 'Vanity',
    imageUrl:
      'https://ccs-infratech.s3.amazonaws.com/blogs/1769796243105-vanitiy.png'
  },
  {
    id: 'wardrobe',
    name: 'Wardrobe',
    imageUrl:
      'https://ccs-infratech.s3.amazonaws.com/blogs/1769796242090-wardrobe.png'
  },
  {
    id: 'security',
    name: 'Security',
    imageUrl:
      'https://ccs-infratech.s3.amazonaws.com/blogs/1769795953837-sec.png'
  },
  {
    id: 'gym',
    name: 'Gym',
    imageUrl:
      'https://ccs-infratech.s3.amazonaws.com/blogs/1769797400978-gym.png'
  },
  {
    id: 'swimming',
    name: 'Swimming Pool',
    imageUrl:
      'https://ccs-infratech.s3.amazonaws.com/blogs/1769797404504-swiming.png'
  },
  {
    id: 'track',
    name: 'Running Track',
    imageUrl:
      'https://ccs-infratech.s3.amazonaws.com/blogs/1769797406638-track.png'
  },
  {
    id: 'indoor-games',
    name: 'Indoor Games',
    imageUrl:
      'https://ccs-infratech.s3.amazonaws.com/blogs/1769797550716-indoor-games.png'
  },
  {
    id: 'multipurpose-hall',
    name: 'Multipurpose Hall',
    imageUrl:
      'https://ccs-infratech.s3.amazonaws.com/blogs/1769797587516-multipurpose-hall.png'
  }
];

const MediumImageUpload = ({
  value,
  onChange,
  label,
  acceptType = 'image'
}: MediumImageUploadProps) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isMediaDialogOpen, setIsMediaDialogOpen] = useState(false);

  const handleImageSelection = (selectedMedia: MediaObject[]) => {
    if (selectedMedia.length > 0) {
      onChange(selectedMedia[0]);
      setIsMediaDialogOpen(false);
    }
  };

  if (value) {
    return (
      <div
        className='group relative my-3'
        onMouseEnter={() => setShowMenu(true)}
        onMouseLeave={() => setShowMenu(false)}
      >
        <div className='relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm'>
          {acceptType === 'image' ? (
            <img
              src={value.url}
              alt={value.key}
              className='h-auto w-full object-cover'
            />
          ) : (
            <div className='flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-8 sm:p-12'>
              <div className='text-center'>
                <div className='mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm sm:h-16 sm:w-16'>
                  <File className='h-6 w-6 text-gray-400 sm:h-8 sm:w-8' />
                </div>
                <p className='text-xs font-medium text-gray-900 sm:text-sm'>
                  {value.key.split('/').pop()}
                </p>
                {value.size && (
                  <p className='mt-1 text-xs text-gray-500'>
                    {(value.size / 1024).toFixed(2)} KB
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {showMenu && (
          <div className='absolute top-2 right-2 z-10 flex gap-1.5 sm:top-3 sm:right-3 sm:gap-2'>
            <Button
              type='button'
              size='sm'
              variant='secondary'
              onClick={() => setIsMediaDialogOpen(true)}
              className='h-8 rounded-full bg-white/95 px-3 text-xs font-medium shadow-lg backdrop-blur-sm hover:bg-white sm:h-9 sm:px-4'
            >
              Replace
            </Button>
            <Button
              type='button'
              size='sm'
              variant='secondary'
              onClick={() => onChange(null)}
              className='h-8 rounded-full bg-white/95 px-3 text-xs font-medium shadow-lg backdrop-blur-sm hover:bg-red-50 hover:text-red-600 sm:h-9 sm:px-4'
            >
              Remove
            </Button>
          </div>
        )}

        <MediaSelectionDialog
          open={isMediaDialogOpen}
          onOpenChange={setIsMediaDialogOpen}
          onSelect={handleImageSelection as any}
          multiple={false}
          title={`Select ${acceptType === 'pdf' ? 'PDF' : 'Image'}`}
        />
      </div>
    );
  }

  return (
    <div className='my-3'>
      <button
        type='button'
        onClick={() => setIsMediaDialogOpen(true)}
        className='group flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gradient-to-br from-gray-50 to-white py-8 transition-all hover:border-[#b07d17] hover:from-[#b07d17]/5 hover:to-white sm:py-12'
      >
        <div className='flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm transition-transform group-hover:scale-110 sm:h-14 sm:w-14'>
          <Plus className='h-5 w-5 text-gray-400 group-hover:text-[#b07d17] sm:h-6 sm:w-6' />
        </div>
        <p className='mt-3 text-xs font-medium text-gray-700 group-hover:text-[#b07d17] sm:mt-4 sm:text-sm'>
          {acceptType === 'pdf' ? 'Upload PDF' : 'Upload Image'}
        </p>
        <p className='mt-1 text-xs text-gray-500'>Click to browse files</p>
      </button>

      <MediaSelectionDialog
        open={isMediaDialogOpen}
        onOpenChange={setIsMediaDialogOpen}
        onSelect={handleImageSelection as any}
        multiple={false}
        title={`Select ${acceptType === 'pdf' ? 'PDF' : 'Image'}`}
      />
    </div>
  );
};

interface GalleryImageItemProps {
  image: MediaObject;
  index: number;
  onRemove: () => void;
  onSetFeatured: () => void;
  isFeatured: boolean;
}

const GalleryImageItem = ({
  image,
  onRemove,
  onSetFeatured,
  isFeatured
}: GalleryImageItemProps) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div
      className='group relative aspect-square overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all hover:shadow-md'
      onMouseEnter={() => setShowMenu(true)}
      onMouseLeave={() => setShowMenu(false)}
    >
      <img
        src={image.url}
        alt={image.key}
        className='h-full w-full object-cover transition-transform group-hover:scale-105'
      />

      {isFeatured && (
        <div className='absolute top-2 left-2 rounded-full bg-gradient-to-r from-[#b07d17] to-[#c89420] px-2.5 py-1 text-xs font-semibold text-white shadow-lg sm:top-3 sm:left-3 sm:px-3'>
          Featured
        </div>
      )}

      {showMenu && (
        <div className='absolute inset-0 flex items-center justify-center gap-1.5 bg-gradient-to-t from-black/60 via-black/40 to-transparent backdrop-blur-[2px] sm:gap-2'>
          <Button
            type='button'
            size='sm'
            variant='secondary'
            onClick={onSetFeatured}
            className='h-8 rounded-full bg-white/95 px-3 text-xs font-medium shadow-lg backdrop-blur-sm hover:bg-white sm:h-9 sm:px-4'
          >
            {isFeatured ? 'Unset' : 'Set Featured'}
          </Button>
          <Button
            type='button'
            size='sm'
            variant='secondary'
            onClick={onRemove}
            className='h-8 rounded-full bg-white/95 px-3 text-xs font-medium shadow-lg backdrop-blur-sm hover:bg-red-50 hover:text-red-600 sm:h-9 sm:px-4'
          >
            <X className='h-4 w-4' />
          </Button>
        </div>
      )}
    </div>
  );
};

export default function ProjectForm({ pageTitle }: { pageTitle: string }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [logoUrl, setLogoUrl] = useState<MediaObject | null>(null);
  const [content, setContent] = useState('');
  const [featured, setFeatured] = useState(false);
  const [published, setPublished] = useState(false);
  const [status, setStatus] = useState<'UNDER_CONSTRUCTION' | 'COMPLETED'>(
    'UNDER_CONSTRUCTION'
  );
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  const [galleryImages, setGalleryImages] = useState<
    Array<{ image: MediaObject; isFeatured: boolean }>
  >([]);
  const [isGalleryDialogOpen, setIsGalleryDialogOpen] = useState(false);

  const [overviewHeadline, setOverviewHeadline] = useState('');
  const [overviewDescription, setOverviewDescription] = useState('');
  const [location, setLocation] = useState('');
  const [completionDate, setCompletionDate] = useState<Date | undefined>(
    undefined
  );

  const [sitePlanHeadline, setSitePlanHeadline] = useState('');
  const [sitePlanImage, setSitePlanImage] = useState<MediaObject | null>(null);
  const [sitePlanBrochureUrl, setSitePlanBrochureUrl] =
    useState<MediaObject | null>(null);

  const [currentPlanHeadline, setCurrentPlanHeadline] = useState('');
  const [currentPlanImage, setCurrentPlanImage] = useState<MediaObject | null>(
    null
  );
  const [currentPlanBrochureUrl, setCurrentPlanBrochureUrl] =
    useState<MediaObject | null>(null);

  const [unitPlanHeadline, setUnitPlanHeadline] = useState('');
  const [unitPlanImage, setUnitPlanImage] = useState<MediaObject | null>(null);
  const [unitPlanBrochureUrl, setUnitPlanBrochureUrl] =
    useState<MediaObject | null>(null);

  const [mapUrl, setMapUrl] = useState('');
  const [nearbyAttractions, setNearbyAttractions] = useState('');
  const [locationDetails, setLocationDetails] = useState('');

  const [specifications, setSpecifications] = useState<
    { title: string; description: string; imageUrl: MediaObject | null }[]
  >([{ title: '', description: '', imageUrl: null }]);

  const [amenities, setAmenities] = useState<
    { name: string; imageUrl: MediaObject | null }[]
  >([{ name: '', imageUrl: null }]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  const handleGalleryImageSelection = (selectedMedia: MediaObject[]) => {
    const remainingSlots = 6 - galleryImages.length;
    const imagesToAdd = selectedMedia.slice(0, remainingSlots);
    const newImages = imagesToAdd.map((img) => ({
      image: img,
      isFeatured: false
    }));
    setGalleryImages([...galleryImages, ...newImages]);
    setIsGalleryDialogOpen(false);
  };

  const removeGalleryImage = (index: number) => {
    setGalleryImages(galleryImages.filter((_, i) => i !== index));
  };

  const toggleFeaturedImage = (index: number) => {
    setGalleryImages(
      galleryImages.map((img, i) => ({
        ...img,
        isFeatured: i === index ? !img.isFeatured : img.isFeatured
      }))
    );
  };

  const addSpecification = () => {
    setSpecifications([
      ...specifications,
      { title: '', description: '', imageUrl: null }
    ]);
  };

  const updateSpecification = (
    index: number,
    field: string,
    value: string | MediaObject | null
  ) => {
    const updatedSpecs = [...specifications];
    updatedSpecs[index] = { ...updatedSpecs[index], [field]: value };
    setSpecifications(updatedSpecs);
  };

  const removeSpecification = (index: number) => {
    if (specifications.length > 1)
      setSpecifications(specifications.filter((_, i) => i !== index));
  };

  const addAmenity = () => {
    setAmenities([...amenities, { name: '', imageUrl: null }]);
  };

  const updateAmenity = (
    index: number,
    field: string,
    value: string | MediaObject | null
  ) => {
    const updatedAmenities = [...amenities];
    updatedAmenities[index] = { ...updatedAmenities[index], [field]: value };
    setAmenities(updatedAmenities);
  };

  const removeAmenity = (index: number) => {
    if (amenities.length > 1)
      setAmenities(amenities.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error('Please enter a title for the project');
      return;
    }

    if (!description.trim()) {
      toast.error('Please enter a description for the project');
      return;
    }

    try {
      setIsSubmitting(true);

      const filteredSpecs = specifications
        .filter((spec) => spec.title.trim() && spec.description.trim())
        .map((spec) => ({
          title: spec.title,
          description: spec.description,
          imageUrl: spec.imageUrl ? spec.imageUrl.url : null
        }));

      const filteredAmenities = selectedAmenities.map((id) => {
        const amenity = PREDEFINED_AMENITIES.find((a) => a.id === id);
        return {
          name: amenity!.name,
          imageUrl: amenity!.imageUrl
        };
      });
      const formattedGalleryImages = galleryImages.map((item, index) => ({
        url: item.image.url,
        filename: item.image.key.split('/').pop() || '',
        isFeatured: item.isFeatured,
        displayOrder: index
      }));

      await projectService.createProject({
        title,
        description,
        logoUrl: logoUrl ? logoUrl.url : null,
        content,
        status,
        completionDate: completionDate || null,
        featured,
        published,
        overviewHeadline,
        overviewDescription,
        location,
        sitePlanHeadline,
        sitePlanImage: sitePlanImage ? sitePlanImage.url : null,
        sitePlanBrochureUrl: sitePlanBrochureUrl
          ? sitePlanBrochureUrl.url
          : null,
        currentPlanHeadline,
        currentPlanImage: currentPlanImage ? currentPlanImage.url : null,
        currentPlanBrochureUrl: currentPlanBrochureUrl
          ? currentPlanBrochureUrl.url
          : null,
        unitPlanHeadline,
        unitPlanImage: unitPlanImage ? unitPlanImage.url : null,
        unitPlanBrochureUrl: unitPlanBrochureUrl
          ? unitPlanBrochureUrl.url
          : null,
        mapUrl,
        nearbyAttractions,
        locationDetails,
        specifications: filteredSpecs.length ? filteredSpecs : undefined,
        amenities: filteredAmenities.length ? filteredAmenities : undefined,
        images: formattedGalleryImages.length
          ? formattedGalleryImages
          : undefined
      });

      toast.success('Your project has been created successfully!');
      router.push('/dashboard/projects');
    } catch (error: any) {
      console.error('Failed to create project:', error);
      toast.error(error.message || 'Failed to create project');
    } finally {
      setIsSubmitting(false);
    }
  };

  const sections = [
    { id: 'basic', label: 'Basic Info', icon: LayoutDashboard },
    { id: 'gallery', label: 'Gallery', icon: ImagePlus },
    { id: 'overview', label: 'Overview', icon: FileText },
    { id: 'plans', label: 'Plans', icon: ImageIcon },
    { id: 'location', label: 'Location', icon: MapPin },
    { id: 'specs', label: 'Specifications', icon: Building },
    { id: 'amenities', label: 'Amenities', icon: Star }
  ];

  const NavigationContent = ({ onItemClick }: { onItemClick?: () => void }) => (
    <nav className='space-y-1.5'>
      {sections.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => {
            setActiveTab(id);
            onItemClick?.();
          }}
          className={`group flex w-full items-center rounded-xl px-4 py-3 text-sm font-medium transition-all ${
            activeTab === id
              ? 'bg-gradient-to-r from-[#b07d17] to-[#c89420] text-white shadow-lg shadow-[#b07d17]/30'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
          }`}
        >
          <Icon
            className={`mr-3 h-4 w-4 transition-transform group-hover:scale-110 ${activeTab === id ? 'text-white' : 'text-gray-400'}`}
          />
          {label}
        </button>
      ))}
    </nav>
  );

  return (
    <div className='flex h-screen overflow-hidden bg-gradient-to-br from-gray-50 to-white'>
      {/* Desktop Sidebar */}
      <div className='hidden w-64 flex-shrink-0 border-r border-gray-100 bg-white/80 backdrop-blur-xl lg:block xl:w-72'>
        <div className='flex h-full flex-col p-4 lg:p-6'>
          <div className='mb-6 lg:mb-8'>
            <h2 className='text-lg font-bold tracking-tight text-gray-900 lg:text-xl'>
              {pageTitle}
            </h2>
            <p className='mt-1 text-xs text-gray-500 lg:text-sm'>
              Manage your project details
            </p>
          </div>
          <div className='flex-1 overflow-y-auto pb-6'>
            <NavigationContent />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className='flex flex-1 flex-col overflow-hidden'>
        {/* Fixed Header */}
        <div className='flex-shrink-0 border-b border-gray-100 bg-white/80 backdrop-blur-xl'>
          <div className='flex items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4'>
            <div className='flex items-center gap-3'>
              {/* Mobile Menu Button */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant='ghost' size='sm' className='lg:hidden'>
                    <Menu className='h-5 w-5' />
                  </Button>
                </SheetTrigger>
                <SheetContent side='left' className='w-72 p-6'>
                  <div className='mb-6'>
                    <h2 className='text-lg font-bold tracking-tight text-gray-900'>
                      {pageTitle}
                    </h2>
                    <p className='mt-1 text-sm text-gray-500'>
                      Manage your project details
                    </p>
                  </div>
                  <NavigationContent
                    onItemClick={() => setMobileMenuOpen(false)}
                  />
                </SheetContent>
              </Sheet>

              <div>
                <h1 className='text-base font-bold text-gray-900 sm:text-lg lg:text-xl'>
                  {pageTitle}
                </h1>
                <p className='mt-0.5 hidden text-xs text-gray-500 sm:block sm:text-sm'>
                  Create and publish your project
                </p>
              </div>
            </div>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className='rounded-lg bg-gradient-to-r from-[#b07d17] to-[#c89420] px-4 text-sm font-medium shadow-lg shadow-[#b07d17]/30 transition-all hover:shadow-xl hover:shadow-[#b07d17]/40 sm:rounded-xl sm:px-6'
            >
              {isSubmitting ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  <span className='hidden sm:inline'>Publishing...</span>
                  <span className='sm:hidden'>...</span>
                </>
              ) : (
                <>
                  <span className='hidden sm:inline'>Publish Project</span>
                  <span className='sm:hidden'>Publish</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Scrollable Content Area with Bottom Padding */}
        <div className='flex-1 overflow-y-auto'>
          <div className='mx-auto w-full max-w-3xl px-4 py-6 pb-24 sm:px-6 sm:py-8'>
            {/* Basic Info */}
            {activeTab === 'basic' && (
              <div className='space-y-4 sm:space-y-5'>
                <div className='rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:rounded-2xl sm:p-6'>
                  <Label className='mb-2 block text-sm font-semibold text-gray-900 sm:mb-3'>
                    Project Title
                  </Label>
                  <Input
                    placeholder='Enter project title'
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className='rounded-lg border-gray-200 text-sm focus:border-[#b07d17] focus:ring-[#b07d17] sm:rounded-xl sm:text-base'
                  />
                </div>

                <div className='rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:rounded-2xl sm:p-6'>
                  <Label className='mb-2 block text-sm font-semibold text-gray-900 sm:mb-3'>
                    Description
                  </Label>
                  <Textarea
                    placeholder='Brief description of the project'
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className='rounded-lg border-gray-200 text-sm focus:border-[#b07d17] focus:ring-[#b07d17] sm:rounded-xl sm:text-base'
                  />
                </div>

                <div className='rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:rounded-2xl sm:p-6'>
                  <Label className='mb-2 block text-sm font-semibold text-gray-900 sm:mb-3'>
                    Project Logo
                  </Label>
                  <MediumImageUpload
                    value={logoUrl}
                    onChange={setLogoUrl}
                    label='Upload Logo'
                    acceptType='image'
                  />
                </div>

                <div className='rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:rounded-2xl sm:p-6'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <Label className='text-sm font-semibold text-gray-900'>
                        Featured Project
                      </Label>
                      <p className='mt-1 text-xs text-gray-500 sm:text-sm'>
                        Display this on the homepage
                      </p>
                    </div>
                    <Switch checked={featured} onCheckedChange={setFeatured} />
                  </div>
                </div>

                <div className='rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:rounded-2xl sm:p-6'>
                  <Label className='mb-2 block text-sm font-semibold text-gray-900 sm:mb-3'>
                    Project Status
                  </Label>
                  <Select
                    value={status}
                    onValueChange={(v) =>
                      setStatus(v as 'UNDER_CONSTRUCTION' | 'COMPLETED')
                    }
                  >
                    <SelectTrigger className='rounded-lg border-gray-200 focus:border-[#b07d17] focus:ring-[#b07d17]'>
                      <SelectValue placeholder='Select status' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='UNDER_CONSTRUCTION'>
                        Under Construction
                      </SelectItem>
                      <SelectItem value='COMPLETED'>Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className='rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:rounded-2xl sm:p-6'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <Label className='text-sm font-semibold text-gray-900'>
                        Publish Immediately
                      </Label>
                      <p className='mt-1 text-xs text-gray-500 sm:text-sm'>
                        Make project visible now
                      </p>
                    </div>
                    <Switch
                      checked={published}
                      onCheckedChange={setPublished}
                    />
                  </div>
                </div>

                <div className='mb-16 rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:rounded-2xl sm:p-6'>
                  <Label className='mb-2 block text-sm font-semibold text-gray-900 sm:mb-3'>
                    Content
                  </Label>
                  <Textarea
                    placeholder='Write detailed project content here...'
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={10}
                    className='rounded-lg border-gray-200 font-mono text-xs leading-relaxed focus:border-[#b07d17] focus:ring-[#b07d17] sm:rounded-xl sm:text-sm'
                  />
                </div>
              </div>
            )}

            {/* Gallery */}
            {activeTab === 'gallery' && (
              <div className='rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:rounded-2xl sm:p-6'>
                <div className='mb-4 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between'>
                  <div>
                    <h3 className='text-base font-bold text-gray-900 sm:text-lg'>
                      Project Gallery
                    </h3>
                    <p className='mt-1 text-xs text-gray-500 sm:text-sm'>
                      Add up to 6 images · {galleryImages.length} of 6 used
                    </p>
                  </div>
                  {galleryImages.length < 6 && (
                    <Button
                      onClick={() => setIsGalleryDialogOpen(true)}
                      size='sm'
                      className='w-full rounded-lg bg-gradient-to-r from-[#b07d17] to-[#c89420] shadow-lg shadow-[#b07d17]/30 sm:w-auto sm:rounded-xl'
                    >
                      <ImagePlus className='mr-2 h-4 w-4' />
                      Add Images
                    </Button>
                  )}
                </div>

                {galleryImages.length === 0 ? (
                  <button
                    onClick={() => setIsGalleryDialogOpen(true)}
                    className='group flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gradient-to-br from-gray-50 to-white py-16 transition-all hover:border-[#b07d17] hover:from-[#b07d17]/5 hover:to-white sm:py-20'
                  >
                    <div className='flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-lg transition-transform group-hover:scale-110 sm:h-20 sm:w-20'>
                      <ImagePlus className='h-8 w-8 text-gray-400 group-hover:text-[#b07d17] sm:h-10 sm:w-10' />
                    </div>
                    <p className='mt-4 text-sm font-semibold text-gray-700 group-hover:text-[#b07d17] sm:mt-5 sm:text-base'>
                      Add Gallery Images
                    </p>
                    <p className='mt-2 text-xs text-gray-500 sm:text-sm'>
                      Click to upload up to 6 images
                    </p>
                  </button>
                ) : (
                  <div className='grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3'>
                    {galleryImages.map((item, index) => (
                      <GalleryImageItem
                        key={index}
                        image={item.image}
                        index={index}
                        onRemove={() => removeGalleryImage(index)}
                        onSetFeatured={() => toggleFeaturedImage(index)}
                        isFeatured={item.isFeatured}
                      />
                    ))}
                    {galleryImages.length < 6 && (
                      <button
                        onClick={() => setIsGalleryDialogOpen(true)}
                        className='group flex aspect-square flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gradient-to-br from-gray-50 to-white transition-all hover:border-[#b07d17] hover:from-[#b07d17]/5 hover:to-white'
                      >
                        <Plus className='mb-2 h-8 w-8 text-gray-400 transition-transform group-hover:scale-110 group-hover:text-[#b07d17] sm:h-10 sm:w-10' />
                        <span className='text-xs font-medium text-gray-600 group-hover:text-[#b07d17] sm:text-sm'>
                          Add More
                        </span>
                      </button>
                    )}
                  </div>
                )}

                <MediaSelectionDialog
                  open={isGalleryDialogOpen}
                  onOpenChange={setIsGalleryDialogOpen}
                  onSelect={handleGalleryImageSelection as any}
                  multiple={true}
                  title='Select Gallery Images'
                />
              </div>
            )}

            {/* Overview */}
            {activeTab === 'overview' && (
              <div className='space-y-4 sm:space-y-5'>
                <div className='rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:rounded-2xl sm:p-6'>
                  <Label className='mb-2 block text-sm font-semibold text-gray-900 sm:mb-3'>
                    Overview Headline
                  </Label>
                  <Input
                    placeholder='Main headline for overview section'
                    value={overviewHeadline}
                    onChange={(e) => setOverviewHeadline(e.target.value)}
                    className='rounded-lg border-gray-200 text-sm focus:border-[#b07d17] focus:ring-[#b07d17] sm:rounded-xl sm:text-base'
                  />
                </div>

                <div className='rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:rounded-2xl sm:p-6'>
                  <Label className='mb-2 block text-sm font-semibold text-gray-900 sm:mb-3'>
                    Overview Description
                  </Label>
                  <Textarea
                    placeholder='Detailed overview of the project'
                    value={overviewDescription}
                    onChange={(e) => setOverviewDescription(e.target.value)}
                    rows={6}
                    className='rounded-lg border-gray-200 text-sm leading-relaxed focus:border-[#b07d17] focus:ring-[#b07d17] sm:rounded-xl sm:text-base'
                  />
                </div>

                <div className='rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:rounded-2xl sm:p-6'>
                  <Label className='mb-2 block text-sm font-semibold text-gray-900 sm:mb-3'>
                    Location
                  </Label>
                  <Input
                    placeholder='City, State, Country'
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className='rounded-lg border-gray-200 text-sm focus:border-[#b07d17] focus:ring-[#b07d17] sm:rounded-xl sm:text-base'
                  />
                </div>

                <div className='rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:rounded-2xl sm:p-6'>
                  <Label className='mb-2 block text-sm font-semibold text-gray-900 sm:mb-3'>
                    Completion Date
                  </Label>
                  <DatePicker
                    date={completionDate}
                    onSelect={setCompletionDate}
                  />
                </div>
              </div>
            )}

            {/* Plans */}
            {activeTab === 'plans' && (
              <div className='space-y-4 sm:space-y-5'>
                <div className='rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:rounded-2xl sm:p-6'>
                  <h3 className='mb-4 text-sm font-bold text-gray-900 sm:mb-5 sm:text-base'>
                    Site Plan
                  </h3>
                  <div className='space-y-4'>
                    <div>
                      <Label className='mb-2 block text-sm font-semibold text-gray-700 sm:mb-3'>
                        Headline
                      </Label>
                      <Input
                        placeholder='Site plan headline'
                        value={sitePlanHeadline}
                        onChange={(e) => setSitePlanHeadline(e.target.value)}
                        className='rounded-lg border-gray-200 text-sm focus:border-[#b07d17] focus:ring-[#b07d17] sm:rounded-xl sm:text-base'
                      />
                    </div>
                    <div>
                      <Label className='mb-2 block text-sm font-semibold text-gray-700 sm:mb-3'>
                        Image
                      </Label>
                      <MediumImageUpload
                        value={sitePlanImage}
                        onChange={setSitePlanImage}
                        label='Site Plan Image'
                        acceptType='image'
                      />
                    </div>
                    <div>
                      <Label className='mb-2 block text-sm font-semibold text-gray-700 sm:mb-3'>
                        Brochure (PDF)
                      </Label>
                      <MediumImageUpload
                        value={sitePlanBrochureUrl}
                        onChange={setSitePlanBrochureUrl}
                        label='Site Plan Brochure'
                        acceptType='pdf'
                      />
                    </div>
                  </div>
                </div>

                <div className='rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:rounded-2xl sm:p-6'>
                  <h3 className='mb-4 text-sm font-bold text-gray-900 sm:mb-5 sm:text-base'>
                    Current Plan
                  </h3>
                  <div className='space-y-4'>
                    <div>
                      <Label className='mb-2 block text-sm font-semibold text-gray-700 sm:mb-3'>
                        Headline
                      </Label>
                      <Input
                        placeholder='Current plan headline'
                        value={currentPlanHeadline}
                        onChange={(e) => setCurrentPlanHeadline(e.target.value)}
                        className='rounded-lg border-gray-200 text-sm focus:border-[#b07d17] focus:ring-[#b07d17] sm:rounded-xl sm:text-base'
                      />
                    </div>
                    <div>
                      <Label className='mb-2 block text-sm font-semibold text-gray-700 sm:mb-3'>
                        Image
                      </Label>
                      <MediumImageUpload
                        value={currentPlanImage}
                        onChange={setCurrentPlanImage}
                        label='Current Plan Image'
                        acceptType='image'
                      />
                    </div>
                    <div>
                      <Label className='mb-2 block text-sm font-semibold text-gray-700 sm:mb-3'>
                        Brochure (PDF)
                      </Label>
                      <MediumImageUpload
                        value={currentPlanBrochureUrl}
                        onChange={setCurrentPlanBrochureUrl}
                        label='Current Plan Brochure'
                        acceptType='pdf'
                      />
                    </div>
                  </div>
                </div>

                <div className='rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:rounded-2xl sm:p-6'>
                  <h3 className='mb-4 text-sm font-bold text-gray-900 sm:mb-5 sm:text-base'>
                    Unit Plan
                  </h3>
                  <div className='space-y-4'>
                    <div>
                      <Label className='mb-2 block text-sm font-semibold text-gray-700 sm:mb-3'>
                        Headline
                      </Label>
                      <Input
                        placeholder='Unit plan headline'
                        value={unitPlanHeadline}
                        onChange={(e) => setUnitPlanHeadline(e.target.value)}
                        className='rounded-lg border-gray-200 text-sm focus:border-[#b07d17] focus:ring-[#b07d17] sm:rounded-xl sm:text-base'
                      />
                    </div>
                    <div>
                      <Label className='mb-2 block text-sm font-semibold text-gray-700 sm:mb-3'>
                        Image
                      </Label>
                      <MediumImageUpload
                        value={unitPlanImage}
                        onChange={setUnitPlanImage}
                        label='Unit Plan Image'
                        acceptType='image'
                      />
                    </div>
                    <div>
                      <Label className='mb-2 block text-sm font-semibold text-gray-700 sm:mb-3'>
                        Brochure (PDF)
                      </Label>
                      <MediumImageUpload
                        value={unitPlanBrochureUrl}
                        onChange={setUnitPlanBrochureUrl}
                        label='Unit Plan Brochure'
                        acceptType='pdf'
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Location */}
            {activeTab === 'location' && (
              <div className='space-y-4 sm:space-y-5'>
                <div className='rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:rounded-2xl sm:p-6'>
                  <Label className='mb-2 block text-sm font-semibold text-gray-900 sm:mb-3'>
                    Map URL
                  </Label>
                  <Input
                    placeholder='Google Maps embed URL'
                    value={mapUrl}
                    onChange={(e) => setMapUrl(e.target.value)}
                    className='rounded-lg border-gray-200 text-sm focus:border-[#b07d17] focus:ring-[#b07d17] sm:rounded-xl sm:text-base'
                  />
                </div>

                <div className='rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:rounded-2xl sm:p-6'>
                  <Label className='mb-2 block text-sm font-semibold text-gray-900 sm:mb-3'>
                    Nearby Attractions
                  </Label>
                  <Textarea
                    placeholder='List nearby landmarks, shopping centers, schools, etc.'
                    value={nearbyAttractions}
                    onChange={(e) => setNearbyAttractions(e.target.value)}
                    rows={5}
                    className='rounded-lg border-gray-200 text-sm leading-relaxed focus:border-[#b07d17] focus:ring-[#b07d17] sm:rounded-xl sm:text-base'
                  />
                </div>

                <div className='rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:rounded-2xl sm:p-6'>
                  <Label className='mb-2 block text-sm font-semibold text-gray-900 sm:mb-3'>
                    Location Details
                  </Label>
                  <Textarea
                    placeholder='Additional location information, accessibility, parking, etc.'
                    value={locationDetails}
                    onChange={(e) => setLocationDetails(e.target.value)}
                    rows={5}
                    className='rounded-lg border-gray-200 text-sm leading-relaxed focus:border-[#b07d17] focus:ring-[#b07d17] sm:rounded-xl sm:text-base'
                  />
                </div>
              </div>
            )}

            {/* Specifications */}
            {activeTab === 'specs' && (
              <div className='space-y-4 sm:space-y-5'>
                <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
                  <div>
                    <h3 className='text-base font-bold text-gray-900 sm:text-lg'>
                      Specifications & Features
                    </h3>
                    <p className='mt-1 text-xs text-gray-500 sm:text-sm'>
                      Add project specifications
                    </p>
                  </div>
                  <Button
                    onClick={addSpecification}
                    size='sm'
                    className='w-full rounded-lg bg-gradient-to-r from-[#b07d17] to-[#c89420] shadow-lg shadow-[#b07d17]/30 sm:w-auto sm:rounded-xl'
                  >
                    <Plus className='mr-2 h-4 w-4' />
                    Add
                  </Button>
                </div>

                {specifications.map((spec, index) => (
                  <div
                    key={index}
                    className='rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:rounded-2xl sm:p-6'
                  >
                    <div className='mb-4 flex items-center justify-between'>
                      <span className='text-xs font-medium text-gray-500 sm:text-sm'>
                        Specification {index + 1}
                      </span>
                      {specifications.length > 1 && (
                        <Button
                          onClick={() => removeSpecification(index)}
                          variant='ghost'
                          size='sm'
                          className='text-red-600 hover:bg-red-50 hover:text-red-700'
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                    <div className='space-y-4'>
                      <Input
                        placeholder='Specification title'
                        value={spec.title}
                        onChange={(e) =>
                          updateSpecification(index, 'title', e.target.value)
                        }
                        className='rounded-lg border-gray-200 text-sm focus:border-[#b07d17] focus:ring-[#b07d17] sm:rounded-xl sm:text-base'
                      />
                      <Textarea
                        placeholder='Detailed description'
                        value={spec.description}
                        onChange={(e) =>
                          updateSpecification(
                            index,
                            'description',
                            e.target.value
                          )
                        }
                        rows={3}
                        className='rounded-lg border-gray-200 text-sm leading-relaxed focus:border-[#b07d17] focus:ring-[#b07d17] sm:rounded-xl sm:text-base'
                      />
                      <MediumImageUpload
                        value={spec.imageUrl}
                        onChange={(media) =>
                          updateSpecification(index, 'imageUrl', media)
                        }
                        label='Specification Image'
                        acceptType='image'
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Amenities */}
            {activeTab === 'amenities' && (
              <div className='mb-16 space-y-4 sm:space-y-5'>
                <div>
                  <h3 className='text-base font-bold text-gray-900 sm:text-lg'>
                    Amenities
                  </h3>
                  <p className='mt-1 text-xs text-gray-500 sm:text-sm'>
                    Select available amenities for this project
                  </p>
                </div>

                <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4'>
                  {PREDEFINED_AMENITIES.map((amenity) => {
                    const isSelected = selectedAmenities.includes(amenity.id);

                    return (
                      <button
                        key={amenity.id}
                        type='button'
                        onClick={() => {
                          setSelectedAmenities((prev) =>
                            isSelected
                              ? prev.filter((id) => id !== amenity.id)
                              : [...prev, amenity.id]
                          );
                        }}
                        className={`group relative overflow-hidden rounded-2xl border-2 transition-all ${
                          isSelected
                            ? 'border-[#b07d17] bg-gradient-to-br from-[#b07d17]/10 to-[#c89420]/5 shadow-lg shadow-[#b07d17]/20'
                            : 'border-gray-200 bg-white hover:border-[#b07d17]/50 hover:shadow-md'
                        }`}
                      >
                        <div className='flex items-center gap-4 p-4 sm:p-5'>
                          <div className='relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-gray-50 sm:h-20 sm:w-20'>
                            <img
                              src={amenity.imageUrl}
                              alt={amenity.name}
                              className='h-full w-full object-cover transition-transform group-hover:scale-110'
                            />
                          </div>

                          <div className='flex-1 text-left'>
                            <h4
                              className={`text-sm font-semibold transition-colors sm:text-base ${
                                isSelected ? 'text-[#b07d17]' : 'text-gray-900'
                              }`}
                            >
                              {amenity.name}
                            </h4>
                          </div>

                          <div
                            className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                              isSelected
                                ? 'border-[#b07d17] bg-[#b07d17]'
                                : 'border-gray-300 bg-white'
                            }`}
                          >
                            {isSelected && (
                              <svg
                                className='h-4 w-4 text-white'
                                fill='none'
                                viewBox='0 0 24 24'
                                stroke='currentColor'
                                strokeWidth={3}
                              >
                                <path
                                  strokeLinecap='round'
                                  strokeLinejoin='round'
                                  d='M5 13l4 4L19 7'
                                />
                              </svg>
                            )}
                          </div>
                        </div>

                        {isSelected && (
                          <div className='absolute top-0 right-0 rounded-bl-lg bg-gradient-to-r from-[#b07d17] to-[#c89420] px-2.5 py-1'>
                            <span className='text-xs font-semibold text-white'>
                              Selected
                            </span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {selectedAmenities.length > 0 && (
                  <div className='rounded-xl border border-gray-100 bg-gradient-to-br from-[#b07d17]/5 to-white p-4 sm:p-5'>
                    <p className='text-xs font-medium text-gray-700 sm:text-sm'>
                      <span className='font-bold text-[#b07d17]'>
                        {selectedAmenities.length}
                      </span>{' '}
                      amenities selected
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
