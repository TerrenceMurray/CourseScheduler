import { apiClient } from './client';
import type { GenerateRequest, GenerateResponse, SchedulerConfig } from '@/types/api';

export const schedulerApi = {
  generate: (config?: SchedulerConfig) =>
    apiClient.post<GenerateResponse>('/scheduler/generate', { config }),

  generateAndSave: (data: GenerateRequest) =>
    apiClient.post<GenerateResponse>('/scheduler/generate-and-save', data),
};
