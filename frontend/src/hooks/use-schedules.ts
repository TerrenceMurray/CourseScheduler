import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { schedulesApi } from '@/lib/api';
import type { ScheduleCreate, ScheduleUpdate } from '@/types/api';
import { toast } from 'sonner';

export const scheduleKeys = {
  all: ['schedules'] as const,
  lists: () => [...scheduleKeys.all, 'list'] as const,
  archived: () => [...scheduleKeys.all, 'archived'] as const,
  detail: (id: string) => [...scheduleKeys.all, 'detail', id] as const,
};

export function useSchedules() {
  return useQuery({
    queryKey: scheduleKeys.lists(),
    queryFn: schedulesApi.list,
  });
}

export function useSchedule(id: string) {
  return useQuery({
    queryKey: scheduleKeys.detail(id),
    queryFn: () => schedulesApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ScheduleCreate) => schedulesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scheduleKeys.lists() });
      toast.success('Schedule created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create schedule: ${error.message}`);
    },
  });
}

export function useUpdateSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ScheduleUpdate }) =>
      schedulesApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: scheduleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: scheduleKeys.detail(id) });
      toast.success('Schedule updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update schedule: ${error.message}`);
    },
  });
}

export function useDeleteSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: schedulesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scheduleKeys.lists() });
      toast.success('Schedule deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete schedule: ${error.message}`);
    },
  });
}

export function useArchivedSchedules() {
  return useQuery({
    queryKey: scheduleKeys.archived(),
    queryFn: schedulesApi.listArchived,
  });
}

export function useSetActiveSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => schedulesApi.setActive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scheduleKeys.all });
      toast.success('Schedule set as active');
    },
    onError: (error: Error) => {
      toast.error(`Failed to set active schedule: ${error.message}`);
    },
  });
}

export function useArchiveSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => schedulesApi.archive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scheduleKeys.all });
      toast.success('Schedule archived');
    },
    onError: (error: Error) => {
      toast.error(`Failed to archive schedule: ${error.message}`);
    },
  });
}

export function useUnarchiveSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => schedulesApi.unarchive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scheduleKeys.all });
      toast.success('Schedule restored');
    },
    onError: (error: Error) => {
      toast.error(`Failed to restore schedule: ${error.message}`);
    },
  });
}
