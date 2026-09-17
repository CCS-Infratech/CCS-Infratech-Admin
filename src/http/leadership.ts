import axios from 'axios';

const api = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api/v1`,
  withCredentials: true
});

export interface Leadership {
  id: string;
  name: string;
  designation: string;
  imageUrl: string | null;
  experience: string | null;
  bio: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLeadership {
  name: string;
  designation: string;
  imageUrl?: string | null;
  experience?: string | null;
  bio?: string | null;
  isActive?: boolean;
  sortOrder?: number;
}

export interface UpdateLeadership {
  name?: string;
  designation?: string;
  imageUrl?: string | null;
  experience?: string | null;
  bio?: string | null;
  isActive?: boolean;
  sortOrder?: number;
}

export const leadershipService = {
  async getPublicLeadership(): Promise<Leadership[]> {
    const response = await api.get('/leadership');

    return response.data.data || [];
  },

  async getAllLeadership(): Promise<Leadership[]> {
    const response = await api.get('/leadership/admin');

    return response.data.data || [];
  },

  async createLeadership(
    data: CreateLeadership
  ): Promise<Leadership> {
    const response = await api.post('/leadership', data);

    return response.data.data;
  },

  async updateLeadership(
    id: string,
    data: UpdateLeadership
  ): Promise<Leadership> {
    const response = await api.put(
      `/leadership/${id}`,
      data
    );

    return response.data.data;
  },

  async deleteLeadership(id: string): Promise<void> {
    await api.delete(`/leadership/${id}`);
  }
};
