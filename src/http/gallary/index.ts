import { get } from 'http';
import api from '../axiosInstance';

export const galleryService = {
  createGallery: async (galleryData: {
    name: string;
    slug: string;
    description?: string;
    isActive?: boolean;
    images?: Array<{
      url: string;
      filename: string;
      alt?: string;
      caption?: string;
      sortOrder?: number;
    }>;
  }): Promise<any> => {
    const response = await api.post<any>('/gallary/create', galleryData);
    return response.data;
  },

  getAllGalleries: async (): Promise<any[]> => {
    const response = await api.get<any[]>('/gallary');
    return response.data;
  },

  getGalleryById: async (id: string): Promise<any> => {
    const response = await api.get<any>(`/gallary/${id}`);
    return response.data.data;
  },

  updateGallery: async (
    id: string,
    galleryData: {
      name: string;
      slug: string;
      description?: string;
      isActive?: boolean;
      images?: Array<{
        id?: string;
        url: string;
        filename: string;
        alt?: string;
        caption?: string;
        sortOrder?: number;
      }>;
    }
  ): Promise<any> => {
    const response = await api.put<any>(`/gallary/${id}`, galleryData);
    return response.data.gallery;
  },

  deleteGallery: async (id: string): Promise<any> => {
    const response = await api.delete<any>(`/gallary/${id}`);
    return response.data;
  },

  deleteGalleryImage: async (id: string): Promise<any> => {
    const response = await api.delete<any>(`/gallary/gallary-images/${id}`);
    return response.data;
  }
};
