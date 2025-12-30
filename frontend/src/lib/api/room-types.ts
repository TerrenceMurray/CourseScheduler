import { apiClient } from './client';
import type { RoomType, RoomTypeCreate, RoomTypeUpdate } from '@/types/api';

export const roomTypesApi = {
  list: () => apiClient.get<RoomType[]>('/room-types'),

  getByName: (name: string) =>
    apiClient.get<RoomType>(`/room-types/${encodeURIComponent(name)}`),

  create: (data: RoomTypeCreate) => apiClient.post<RoomType>('/room-types', data),

  update: (name: string, data: RoomTypeUpdate) =>
    apiClient.put<RoomType>(`/room-types/${encodeURIComponent(name)}`, data),

  delete: (name: string) => apiClient.delete(`/room-types/${encodeURIComponent(name)}`),
};
