import { useMutation, useQueryClient } from '@tanstack/react-query';
import { schedulerApi } from '@/lib/api';
import type { GenerateRequest, SchedulerConfig } from '@/types/api';
import { toast } from 'sonner';
import { scheduleKeys } from './use-schedules';

export function useGenerateSchedule() {
  return useMutation({
    mutationFn: (config?: SchedulerConfig) => schedulerApi.generate(config),
    onError: (error: Error) => {
      toast.error(`Failed to generate schedule: ${error.message}`);
    },
  });
}

export function useGenerateAndSaveSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: GenerateRequest) => schedulerApi.generateAndSave(data),
    onSuccess: (response) => {
      if (response.error) {
        toast.warning(response.error);
      } else {
        queryClient.invalidateQueries({ queryKey: scheduleKeys.lists() });
        toast.success('Schedule generated and saved successfully');
      }
    },
    onError: (error: Error) => {
      toast.error(`Failed to generate schedule: ${error.message}`);
    },
  });
}
