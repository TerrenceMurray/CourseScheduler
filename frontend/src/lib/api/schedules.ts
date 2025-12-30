import { apiClient } from './client';
import type { Schedule, ScheduleCreate, ScheduleUpdate } from '@/types/api';

export const schedulesApi = {
  list: () => apiClient.get<Schedule[]>('/schedules'),

  getById: (id: string) => apiClient.get<Schedule>(`/schedules/${id}`),

  create: (data: ScheduleCreate) => apiClient.post<Schedule>('/schedules', data),

  update: (id: string, data: ScheduleUpdate) =>
    apiClient.put<Schedule>(`/schedules/${id}`, data),

  delete: (id: string) => apiClient.delete(`/schedules/${id}`),
};
