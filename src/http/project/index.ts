import api from '../axiosInstance';

export const projectService = {
  getProjects: async (params?: any): Promise<any> => {
    const response = await api.get<any>('/projects', { params });
    console.log('response', response);
    return response.data;
  },

  getPublishedProjects: async (params?: any): Promise<any> => {
    const response = await api.get<any>('/projects/published', { params });
    return response.data;
  },

  getProject: async (identifier: string): Promise<any> => {
    const response = await api.get<any>(`/projects/${identifier}`);
    return response.data;
  },

  createProject: async (data: any): Promise<any> => {
    const response = await api.post<any>('/projects', data);
    return response.data;
  },

  updateProject: async (id: string, data: any): Promise<any> => {
    const response = await api.put<any>(`/projects/${id}`, data);
    return response.data;
  },

  deleteProject: async (id: string): Promise<any> => {
    const response = await api.delete<any>(`/projects/${id}`);
    return response.data;
  }
};
