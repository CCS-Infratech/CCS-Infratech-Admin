import api from '../axiosInstance';

export const projectGroupService = {
  getProjectGroups: async (): Promise<any> => {
    const response = await api.get<any>('/project-groups');
    return response.data;
  },

  getPublishedProjectGroups: async (): Promise<any> => {
    const response = await api.get<any>('/project-groups/published');
    return response.data;
  },

  getProjectGroup: async (id: string): Promise<any> => {
    const response = await api.get<any>(`/project-groups/${id}`);
    return response.data;
  },

  createProjectGroup: async (data: {
    name: string;
    description?: string;
    isActive?: boolean;
    sortOrder?: number;
  }): Promise<any> => {
    const response = await api.post<any>('/project-groups', data);
    return response.data;
  },

  updateProjectGroup: async (
    id: string,
    data: {
      name?: string;
      description?: string;
      isActive?: boolean;
      sortOrder?: number;
    }
  ): Promise<any> => {
    const response = await api.put<any>(`/project-groups/${id}`, data);
    return response.data;
  },

  deleteProjectGroup: async (id: string): Promise<any> => {
    const response = await api.delete<any>(`/project-groups/${id}`);
    return response.data;
  }
};
