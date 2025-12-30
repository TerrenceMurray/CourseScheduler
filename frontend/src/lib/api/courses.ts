import { apiClient } from './client';
import type { Course, CourseCreate, CourseUpdate, CourseSession } from '@/types/api';

export const coursesApi = {
  list: () => apiClient.get<Course[]>('/courses'),

  getById: (id: string) => apiClient.get<Course>(`/courses/${id}`),

  create: (data: CourseCreate) => apiClient.post<Course>('/courses', data),

  update: (id: string, data: CourseUpdate) =>
    apiClient.put<Course>(`/courses/${id}`, data),

  delete: (id: string) => apiClient.delete(`/courses/${id}`),

  getSessions: (id: string) => apiClient.get<CourseSession[]>(`/courses/${id}/sessions`),
};
