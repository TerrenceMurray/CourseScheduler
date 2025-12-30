import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { roomsApi } from '@/lib/api';
import type { RoomCreate, RoomUpdate } from '@/types/api';
import { toast } from 'sonner';

export const roomKeys = {
  all: ['rooms'] as const,
  lists: () => [...roomKeys.all, 'list'] as const,
  detail: (id: string) => [...roomKeys.all, 'detail', id] as const,
};

export function useRooms() {
  return useQuery({
    queryKey: roomKeys.lists(),
    queryFn: roomsApi.list,
  });
}

export function useRoom(id: string) {
  return useQuery({
    queryKey: roomKeys.detail(id),
    queryFn: () => roomsApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RoomCreate) => roomsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roomKeys.lists() });
      toast.success('Room created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create room: ${error.message}`);
    },
  });
}

export function useUpdateRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RoomUpdate }) =>
      roomsApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: roomKeys.lists() });
      queryClient.invalidateQueries({ queryKey: roomKeys.detail(id) });
      toast.success('Room updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update room: ${error.message}`);
    },
  });
}

export function useDeleteRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: roomsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roomKeys.lists() });
      toast.success('Room deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete room: ${error.message}`);
    },
  });
}
