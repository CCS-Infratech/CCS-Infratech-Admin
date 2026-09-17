import axios from 'axios';

const api = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api/v1`,
  withCredentials: true
});

export interface SiteSettings {
  id: number;

  companyName: string | null;
  companyDescription: string | null;

  phone: string | null;
  phone2: string | null;

  email: string | null;
  email2: string | null;

  whatsapp: string | null;

  websiteUrl: string | null;

  address: string | null;

  registeredOffice: string | null;
  corporateOffice: string | null;

  facebookUrl: string | null;
  instagramUrl: string | null;
  youtubeUrl: string | null;
  linkedinUrl: string | null;
  twitterUrl: string | null;

  logoUrl: string | null;
  faviconUrl: string | null;

  footerText: string | null;

  mapUrl: string | null;
  googleMapUrl: string | null;

  workingHours: string | null;

  createdAt: string;
  updatedAt: string;
}

export type UpdateSiteSettings = Omit<
  SiteSettings,
  'id' | 'createdAt' | 'updatedAt'
>;

export const settingsService = {
  async getSettings(): Promise<SiteSettings> {
    const response = await api.get('/settings');

    return response.data.data;
  },

  async updateSettings(
    data: Partial<UpdateSiteSettings>
  ): Promise<SiteSettings> {
    const response = await api.put('/settings', data);

    return response.data.data;
  }
};
