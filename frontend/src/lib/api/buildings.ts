import { apiClient } from './client';
import type { Building, BuildingCreate, BuildingUpdate } from '@/types/api';

export const buildingsApi = {
  list: () => apiClient.get<Building[]>('/buildings'),

  getById: (id: string) => apiClient.get<Building>(`/buildings/${id}`),

  create: (data: BuildingCreate) => apiClient.post<Building>('/buildings', data),

  update: (id: string, data: BuildingUpdate) =>
    apiClient.put<Building>(`/buildings/${id}`, data),

  delete: (id: string) => apiClient.delete(`/buildings/${id}`),
};
