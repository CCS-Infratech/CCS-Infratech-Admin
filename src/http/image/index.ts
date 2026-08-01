import api from '../axiosInstance';

export const imageService = {
  uploadImage: async (formData: FormData): Promise<any> => {
    const response = await api.post<any>('/images/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      timeout: 60000
    });
    return response.data;
  },

  getImages: async (): Promise<any[]> => {
    const response = await api.get<any[]>('/images');
    return response.data;
  },

  deleteImage: async (id: string): Promise<any> => {
    const response = await api.delete<any>(`/images/${id}`);
    return response.data;
  },

  getAllS3Images: async (): Promise<any[]> => {
    const response = await api.get<any[]>('/images/getAllS3Images');
    return response.data;
  },

  deleteS3Image: async (key: string): Promise<any> => {
    const response = await api.delete<any>('/images/deleteS3Image', {
      params: { key }
    });
    return response.data;
  }
};
