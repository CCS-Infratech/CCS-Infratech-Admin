import axios from 'axios';

const api = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api/v1`,
  withCredentials: true
});

export interface Walkthrough {
  id: string;
  title: string;
  description: string | null;
  videoUrl: string;
  thumbnail: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWalkthrough {
  title: string;
  description?: string | null;
  videoUrl: string;
  thumbnail: string;
  isActive?: boolean;
  sortOrder?: number;
}

export interface UpdateWalkthrough {
  title?: string;
  description?: string | null;
  videoUrl?: string;
  thumbnail?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export const walkthroughService = {
  async getAllWalkthroughs(): Promise<Walkthrough[]> {
    const response = await api.get('/walkthrough');

    return response.data.data || [];
  },

  async getPublishedWalkthroughs(): Promise<Walkthrough[]> {
    const response = await api.get('/walkthrough/published');

    return response.data.data || [];
  },

  async getWalkthroughById(id: string): Promise<Walkthrough> {
    const response = await api.get(`/walkthrough/${id}`);

    return response.data.data;
  },

  async createWalkthrough(
    data: CreateWalkthrough
  ): Promise<Walkthrough> {
    const response = await api.post('/walkthrough', data);

    return response.data.data;
  },

  async updateWalkthrough(
    id: string,
    data: UpdateWalkthrough
  ): Promise<Walkthrough> {
    const response = await api.put(
      `/walkthrough/${id}`,
      data
    );

    return response.data.data;
  },

  async deleteWalkthrough(id: string): Promise<void> {
    await api.delete(`/walkthrough/${id}`);
  }
};
