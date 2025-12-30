import { apiClient } from './client';
import type { CourseSession, CourseSessionCreate, CourseSessionUpdate } from '@/types/api';

export const sessionsApi = {
  list: () => apiClient.get<CourseSession[]>('/sessions'),

  getById: (id: string) => apiClient.get<CourseSession>(`/sessions/${id}`),

  create: (data: CourseSessionCreate) => apiClient.post<CourseSession>('/sessions', data),

  update: (id: string, data: CourseSessionUpdate) =>
    apiClient.put<CourseSession>(`/sessions/${id}`, data),

  delete: (id: string) => apiClient.delete(`/sessions/${id}`),
};
