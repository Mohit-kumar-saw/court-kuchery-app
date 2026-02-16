import { api } from './api';

type LawyerFilters = {
  specialization?: string;
  sort?: string;
  page?: number;
  minPrice?: number;
  maxPrice?: number;
  onlineOnly?: boolean;
  limit?:number
};

export const lawyerService = {
  async getLawyers(filters: LawyerFilters = {}) {
    const response = await api.get('/lawyer', {
      params: filters,
    });

    return response.data;
  },

  async getLawyerById(id: string) {
    const response = await api.get(`/lawyer/${id}`);
    return response.data;
  },
};
