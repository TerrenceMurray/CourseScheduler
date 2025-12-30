import { apiClient } from './client';
import type { Room, RoomCreate, RoomUpdate } from '@/types/api';

export const roomsApi = {
  list: () => apiClient.get<Room[]>('/rooms'),

  getById: (id: string) => apiClient.get<Room>(`/rooms/${id}`),

  create: (data: RoomCreate) => apiClient.post<Room>('/rooms', data),

  update: (id: string, data: RoomUpdate) =>
    apiClient.put<Room>(`/rooms/${id}`, data),

  delete: (id: string) => apiClient.delete(`/rooms/${id}`),
};
