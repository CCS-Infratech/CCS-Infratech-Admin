import api from '../axiosInstance';

export const authService = {
  register: async (data: any): Promise<any> => {
    const response = await api.post<any>('/auth/register', data);
    return response.data;
  },

  login: async (data: any): Promise<any> => {
    const response = await api.post<any>('/auth/login', data);
    return response.data;
  },

  logout: async (): Promise<any> => {
    const response = await api.post<any>('/auth/logout');
    return response.data;
  },

  getCurrentUser: async (): Promise<any> => {
    const response = await api.get<any>('/user/me');
    return response.data;
  }
};
