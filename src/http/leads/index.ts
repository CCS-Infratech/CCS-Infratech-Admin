import api from '../axiosInstance';

export interface Lead {
  id: string;
  type: 'CONTACT' | 'LEAD' | 'SITE_VISIT';
  status: 'NEW' | 'CONTACTED' | 'FOLLOW_UP' | 'CONVERTED' | 'CLOSED';
  name: string;
  phone: string;
  email: string | null;
  project: string | null;
  propertyType: string | null;
  budget: string | null;
  visitDate: string | null;
  visitTime: string | null;
  message: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LeadResponse {
  success: boolean;
  data: Lead[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const leadService = {
  getLeads: async (
    params?: Record<string, string | number>
  ): Promise<LeadResponse> => {
    const response = await api.get<LeadResponse>(
      '/leads',
      { params }
    );

    return response.data;
  },

  getLead: async (id: string) => {
    const response = await api.get(
      `/leads/${id}`
    );

    return response.data;
  },

  updateStatus: async (
    id: string,
    status: Lead['status']
  ) => {
    const response = await api.patch(
      `/leads/${id}`,
      { status }
    );

    return response.data;
  },

  deleteLead: async (id: string) => {
    const response = await api.delete(
      `/leads/${id}`
    );

    return response.data;
  }
};
