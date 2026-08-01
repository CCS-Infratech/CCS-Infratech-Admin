import api from '../axiosInstance';

export const blogService = {
  getBlogs: async (params?: any): Promise<any> => {
    const response = await api.get<any>('/blog', { params });
    return response.data;
  },

  getBlog: async (identifier: string): Promise<any> => {
    const response = await api.get<any>(`/blog/${identifier}`);
    return response.data;
  },

  createBlog: async (data: any): Promise<any> => {
    const response = await api.post<any>('/blog', data);
    return response.data;
  },

  updateBlog: async (id: string, data: any): Promise<any> => {
    const response = await api.put<any>(`/blog/${id}`, data);
    return response.data;
  },

  deleteBlog: async (id: string): Promise<any> => {
    const response = await api.delete<any>(`/blog/${id}`);
    return response.data;
  },

  deleteImage: async (id: string): Promise<any> => {
    const response = await api.delete<any>(`/images/${id}`);
    return response.data;
  }
};
