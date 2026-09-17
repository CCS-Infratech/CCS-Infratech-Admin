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
import { toast } from 'sonner';
import { Loader2, Save } from 'lucide-react';

import {
  settingsService,
  SiteSettings,
  UpdateSiteSettings
} from '@/http/settings';

const emptySettings: UpdateSiteSettings = {
  companyName: '',
  companyDescription: '',

  phone: '',
  phone2: '',

  email: '',
  email2: '',

  whatsapp: '',

  websiteUrl: '',

  address: '',

  registeredOffice: '',
  corporateOffice: '',

  facebookUrl: '',
  instagramUrl: '',
  youtubeUrl: '',
  linkedinUrl: '',
  twitterUrl: '',

  logoUrl: '',
  faviconUrl: '',

  footerText: '',

  mapUrl: '',
  googleMapUrl: '',

  workingHours: ''
};

export default function SettingsPage() {
  const [settings, setSettings] =
    useState<UpdateSiteSettings>(emptySettings);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);

        const data = await settingsService.getSettings();

        setSettings({
          companyName: data.companyName ?? '',
          companyDescription: data.companyDescription ?? '',

          phone: data.phone ?? '',
          phone2: data.phone2 ?? '',

          email: data.email ?? '',
          email2: data.email2 ?? '',

          whatsapp: data.whatsapp ?? '',

          websiteUrl: data.websiteUrl ?? '',

          address: data.address ?? '',

          registeredOffice: data.registeredOffice ?? '',
          corporateOffice: data.corporateOffice ?? '',

          facebookUrl: data.facebookUrl ?? '',
          instagramUrl: data.instagramUrl ?? '',
          youtubeUrl: data.youtubeUrl ?? '',
          linkedinUrl: data.linkedinUrl ?? '',
          twitterUrl: data.twitterUrl ?? '',

          logoUrl: data.logoUrl ?? '',
          faviconUrl: data.faviconUrl ?? '',

          footerText: data.footerText ?? '',

          mapUrl: data.mapUrl ?? '',
          googleMapUrl: data.googleMapUrl ?? '',

          workingHours: data.workingHours ?? ''
        });
      } catch (error) {
        console.error('Failed to load settings:', error);
        toast.error('Failed to load website settings');
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const updateField = (
    field: keyof UpdateSiteSettings,
    value: string
  ) => {
    setSettings((current) => ({
      ...current,
      [field]: value
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setSaving(true);

      await settingsService.updateSettings(settings);

      toast.success('Website settings updated successfully');
    } catch (error) {
      console.error('Failed to update settings:', error);
      toast.error('Failed to update website settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <div className='flex min-h-[400px] items-center justify-center'>
          <Loader2 className='h-7 w-7 animate-spin' />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <form
        onSubmit={handleSubmit}
        className='flex flex-1 flex-col space-y-6'
      >
        {/* Page Header */}
        <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>
              Website Settings
            </h2>

            <p className='text-muted-foreground mt-1'>
              Manage CCS INFRATECH website information, contact details,
              offices and social media.
            </p>
          </div>

          <Button type='submit' disabled={saving}>
            {saving ? (
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            ) : (
              <Save className='mr-2 h-4 w-4' />
            )}

            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>

        {/* Company Information */}
        <Card>
          <CardHeader>
            <CardTitle>Company Information</CardTitle>

            <CardDescription>
              Basic company information displayed throughout the website.
            </CardDescription>
          </CardHeader>

          <CardContent className='grid gap-5'>
            <div className='grid gap-2'>
              <Label htmlFor='companyName'>
                Company Name
              </Label>

              <Input
                id='companyName'
                value={settings.companyName ?? ''}
                onChange={(event) =>
                  updateField('companyName', event.target.value)
                }
                placeholder='CCS INFRATECH'
              />
            </div>

            <div className='grid gap-2'>
              <Label htmlFor='companyDescription'>
                Company Description
              </Label>

              <Textarea
                id='companyDescription'
                rows={4}
                value={settings.companyDescription ?? ''}
                onChange={(event) =>
                  updateField(
                    'companyDescription',
                    event.target.value
                  )
                }
                placeholder='Company description...'
              />
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>

            <CardDescription>
              Phone numbers, email addresses and WhatsApp contact.
            </CardDescription>
          </CardHeader>

          <CardContent className='grid gap-5 md:grid-cols-2'>
            <div className='grid gap-2'>
              <Label htmlFor='phone'>
                Primary Phone
              </Label>

              <Input
                id='phone'
                value={settings.phone ?? ''}
                onChange={(event) =>
                  updateField('phone', event.target.value)
                }
                placeholder='+91 XXXXX XXXXX'
              />
            </div>

            <div className='grid gap-2'>
              <Label htmlFor='phone2'>
                Secondary Phone
              </Label>

              <Input
                id='phone2'
                value={settings.phone2 ?? ''}
                onChange={(event) =>
                  updateField('phone2', event.target.value)
                }
                placeholder='+91 XXXXX XXXXX'
              />
            </div>

            <div className='grid gap-2'>
              <Label htmlFor='email'>
                Primary Email
              </Label>

              <Input
                id='email'
                type='email'
                value={settings.email ?? ''}
                onChange={(event) =>
                  updateField('email', event.target.value)
                }
                placeholder='info@ccsinfratech.com'
              />
            </div>

            <div className='grid gap-2'>
              <Label htmlFor='email2'>
                Secondary Email
              </Label>

              <Input
                id='email2'
                type='email'
                value={settings.email2 ?? ''}
                onChange={(event) =>
                  updateField('email2', event.target.value)
                }
                placeholder='contact@ccsinfratech.com'
              />
            </div>

            <div className='grid gap-2 md:col-span-2'>
              <Label htmlFor='whatsapp'>
                WhatsApp Number
              </Label>

              <Input
                id='whatsapp'
                value={settings.whatsapp ?? ''}
                onChange={(event) =>
                  updateField('whatsapp', event.target.value)
                }
                placeholder='+91 XXXXX XXXXX'
              />
            </div>

            <div className='grid gap-2 md:col-span-2'>
              <Label htmlFor='websiteUrl'>
                Website URL
              </Label>

              <Input
                id='websiteUrl'
                value={settings.websiteUrl ?? ''}
                onChange={(event) =>
                  updateField(
                    'websiteUrl',
                    event.target.value
                  )
                }
                placeholder='https://www.ccsinfratech.com'
              />
            </div>
          </CardContent>
        </Card>

        {/* Addresses */}
        <Card>
          <CardHeader>
            <CardTitle>Office Addresses</CardTitle>

            <CardDescription>
              Addresses displayed on the website contact and footer
              sections.
            </CardDescription>
          </CardHeader>

          <CardContent className='grid gap-5'>
            <div className='grid gap-2'>
              <Label htmlFor='address'>
                Main Address
              </Label>

              <Textarea
                id='address'
                rows={3}
                value={settings.address ?? ''}
                onChange={(event) =>
                  updateField('address', event.target.value)
                }
                placeholder='Main company address'
              />
            </div>

            <div className='grid gap-2'>
              <Label htmlFor='registeredOffice'>
                Registered Office
              </Label>

              <Textarea
                id='registeredOffice'
                rows={4}
                value={settings.registeredOffice ?? ''}
                onChange={(event) =>
                  updateField(
                    'registeredOffice',
                    event.target.value
                  )
                }
                placeholder='Registered office address'
              />
            </div>

            <div className='grid gap-2'>
              <Label htmlFor='corporateOffice'>
                Corporate Office
              </Label>

              <Textarea
                id='corporateOffice'
                rows={4}
                value={settings.corporateOffice ?? ''}
                onChange={(event) =>
                  updateField(
                    'corporateOffice',
                    event.target.value
                  )
                }
                placeholder='Corporate office address'
              />
            </div>
          </CardContent>
        </Card>

        {/* Social Media */}
        <Card>
          <CardHeader>
            <CardTitle>Social Media</CardTitle>

            <CardDescription>
              Social media profile URLs used by the website footer.
            </CardDescription>
          </CardHeader>

          <CardContent className='grid gap-5 md:grid-cols-2'>
            <div className='grid gap-2'>
              <Label htmlFor='facebookUrl'>
                Facebook
              </Label>

              <Input
                id='facebookUrl'
                value={settings.facebookUrl ?? ''}
                onChange={(event) =>
                  updateField(
                    'facebookUrl',
                    event.target.value
                  )
                }
                placeholder='https://facebook.com/...'
              />
            </div>

            <div className='grid gap-2'>
              <Label htmlFor='instagramUrl'>
                Instagram
              </Label>

              <Input
                id='instagramUrl'
                value={settings.instagramUrl ?? ''}
                onChange={(event) =>
                  updateField(
                    'instagramUrl',
                    event.target.value
                  )
                }
                placeholder='https://instagram.com/...'
              />
            </div>

            <div className='grid gap-2'>
              <Label htmlFor='youtubeUrl'>
                YouTube
              </Label>

              <Input
                id='youtubeUrl'
                value={settings.youtubeUrl ?? ''}
                onChange={(event) =>
                  updateField(
                    'youtubeUrl',
                    event.target.value
                  )
                }
                placeholder='https://youtube.com/...'
              />
            </div>

            <div className='grid gap-2'>
              <Label htmlFor='linkedinUrl'>
                LinkedIn
              </Label>

              <Input
                id='linkedinUrl'
                value={settings.linkedinUrl ?? ''}
                onChange={(event) =>
                  updateField(
                    'linkedinUrl',
                    event.target.value
                  )
                }
                placeholder='https://linkedin.com/...'
              />
            </div>

            <div className='grid gap-2 md:col-span-2'>
              <Label htmlFor='twitterUrl'>
                Twitter / X
              </Label>

              <Input
                id='twitterUrl'
                value={settings.twitterUrl ?? ''}
                onChange={(event) =>
                  updateField(
                    'twitterUrl',
                    event.target.value
                  )
                }
                placeholder='https://x.com/...'
              />
            </div>
          </CardContent>
        </Card>

        {/* Branding */}
        <Card>
          <CardHeader>
            <CardTitle>Branding</CardTitle>

            <CardDescription>
              Logo, favicon and footer information.
            </CardDescription>
          </CardHeader>

          <CardContent className='grid gap-5'>
            <div className='grid gap-2'>
              <Label htmlFor='logoUrl'>
                Logo URL
              </Label>

              <Input
                id='logoUrl'
                value={settings.logoUrl ?? ''}
                onChange={(event) =>
                  updateField('logoUrl', event.target.value)
                }
                placeholder='https://.../logo.png'
              />
            </div>

            <div className='grid gap-2'>
              <Label htmlFor='faviconUrl'>
                Favicon URL
              </Label>

              <Input
                id='faviconUrl'
                value={settings.faviconUrl ?? ''}
                onChange={(event) =>
                  updateField(
                    'faviconUrl',
                    event.target.value
                  )
                }
                placeholder='https://.../favicon.ico'
              />
            </div>

            <div className='grid gap-2'>
              <Label htmlFor='footerText'>
                Footer Text
              </Label>

              <Textarea
                id='footerText'
                rows={3}
                value={settings.footerText ?? ''}
                onChange={(event) =>
                  updateField(
                    'footerText',
                    event.target.value
                  )
                }
                placeholder='Footer text...'
              />
            </div>
          </CardContent>
        </Card>

        {/* Maps & Working Hours */}
        <Card>
          <CardHeader>
            <CardTitle>Maps & Working Hours</CardTitle>

            <CardDescription>
              Map links and business working hours.
            </CardDescription>
          </CardHeader>

          <CardContent className='grid gap-5'>
            <div className='grid gap-2'>
              <Label htmlFor='mapUrl'>
                Map URL
              </Label>

              <Input
                id='mapUrl'
                value={settings.mapUrl ?? ''}
                onChange={(event) =>
                  updateField('mapUrl', event.target.value)
                }
                placeholder='https://maps.google.com/...'
              />
            </div>

            <div className='grid gap-2'>
              <Label htmlFor='googleMapUrl'>
                Google Maps Embed URL
              </Label>

              <Input
                id='googleMapUrl'
                value={settings.googleMapUrl ?? ''}
                onChange={(event) =>
                  updateField(
                    'googleMapUrl',
                    event.target.value
                  )
                }
                placeholder='Google Maps embed URL'
              />
            </div>

            <div className='grid gap-2'>
              <Label htmlFor='workingHours'>
                Working Hours
              </Label>

              <Textarea
                id='workingHours'
                rows={3}
                value={settings.workingHours ?? ''}
                onChange={(event) =>
                  updateField(
                    'workingHours',
                    event.target.value
                  )
                }
                placeholder='Monday - Saturday: 10:00 AM - 7:00 PM'
              />
            </div>
          </CardContent>
        </Card>

        {/* Bottom Save */}
        <div className='flex justify-end pb-6'>
          <Button type='submit' disabled={saving}>
            {saving ? (
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            ) : (
              <Save className='mr-2 h-4 w-4' />
            )}

            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </PageContainer>
  );
}
