import { apiClient } from './client';
import type { Schedule, ScheduleCreate, ScheduleUpdate } from '@/types/api';

export const schedulesApi = {
  list: () => apiClient.get<Schedule[]>('/schedules'),

  listArchived: () => apiClient.get<Schedule[]>('/schedules/archived'),

  getById: (id: string) => apiClient.get<Schedule>(`/schedules/${id}`),

  create: (data: ScheduleCreate) => apiClient.post<Schedule>('/schedules', data),

  update: (id: string, data: ScheduleUpdate) =>
    apiClient.put<Schedule>(`/schedules/${id}`, data),

  delete: (id: string) => apiClient.delete(`/schedules/${id}`),

  setActive: (id: string) => apiClient.post<Schedule>(`/schedules/${id}/set-active`),

  archive: (id: string) => apiClient.post<Schedule>(`/schedules/${id}/archive`),

  unarchive: (id: string) => apiClient.post<Schedule>(`/schedules/${id}/unarchive`),
};
