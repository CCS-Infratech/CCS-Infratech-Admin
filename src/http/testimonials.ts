import axios from 'axios';

const api = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api/v1`,
  withCredentials: true
});

export interface Testimonial {
  id: string;
  author: string;
  role: string;
  content: string;
  imageUrl: string | null;
  rating: number;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTestimonial {
  author: string;
  role: string;
  content: string;
  imageUrl?: string | null;
  rating?: number;
  isActive?: boolean;
  sortOrder?: number;
}

export interface UpdateTestimonial {
  author?: string;
  role?: string;
  content?: string;
  imageUrl?: string | null;
  rating?: number;
  isActive?: boolean;
  sortOrder?: number;
}

export const testimonialService = {
  async getPublicTestimonials(): Promise<Testimonial[]> {
    const response = await api.get('/testimonials');

    return response.data.data || [];
  },

  async getAllTestimonials(): Promise<Testimonial[]> {
    const response = await api.get('/testimonials/admin');

    return response.data.data || [];
  },

  async createTestimonial(
    data: CreateTestimonial
  ): Promise<Testimonial> {
    const response = await api.post('/testimonials', data);

    return response.data.data;
  },

  async updateTestimonial(
    id: string,
    data: UpdateTestimonial
  ): Promise<Testimonial> {
    const response = await api.put(
      `/testimonials/${id}`,
      data
    );

    return response.data.data;
  },

  async deleteTestimonial(id: string): Promise<void> {
    await api.delete(`/testimonials/${id}`);
  }
};
