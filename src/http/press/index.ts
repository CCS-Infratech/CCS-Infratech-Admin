import { get } from 'http';
import api from '../axiosInstance';

export const pressService = {
  createPress: async (pressData: {
    name: string;
    slug: string;
    description?: string;
    isActive?: boolean;
    items?: Array<{
      title: string;
      publicationName?: string;
      publicationDate?: string | Date;
      url: string;
      imageUrl?: string;
      excerpt?: string;
      sortOrder?: number;
    }>;
  }): Promise<any> => {
    const response = await api.post<any>('/press', pressData);
    return response.data;
  },

  getAllPress: async (): Promise<any[]> => {
    const response = await api.get<any[]>('/press');
    return response.data;
  },

  getPressById: async (id: string): Promise<any> => {
    const response = await api.get<any>(`/press/${id}`);
    return response.data.data;
  },

  updatePress: async (
    id: string,
    pressData: {
      name: string;
      slug: string;
      description?: string;
      isActive?: boolean;
      items?: Array<{
        id?: string;
        title: string;
        publicationName?: string;
        publicationDate?: string | Date;
        url: string;
        imageUrl?: string;
        excerpt?: string;
        sortOrder?: number;
      }>;
    }
  ): Promise<any> => {
    const response = await api.put<any>(`/press/${id}`, pressData);
    return response.data.press;
  },

  deletePress: async (id: string): Promise<any> => {
    const response = await api.delete<any>(`/press/${id}`);
    return response.data;
  },

  deletePressItem: async (id: string): Promise<any> => {
    const response = await api.delete<any>(`/press/press-items/${id}`);
    return response.data;
  }
};
