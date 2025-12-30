import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { roomTypesApi } from '@/lib/api';
import type { RoomTypeCreate, RoomTypeUpdate } from '@/types/api';
import { toast } from 'sonner';

export const roomTypeKeys = {
  all: ['room-types'] as const,
  lists: () => [...roomTypeKeys.all, 'list'] as const,
  detail: (name: string) => [...roomTypeKeys.all, 'detail', name] as const,
};

export function useRoomTypes() {
  return useQuery({
    queryKey: roomTypeKeys.lists(),
    queryFn: roomTypesApi.list,
  });
}

export function useRoomType(name: string) {
  return useQuery({
    queryKey: roomTypeKeys.detail(name),
    queryFn: () => roomTypesApi.getByName(name),
    enabled: !!name,
  });
}

export function useCreateRoomType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RoomTypeCreate) => roomTypesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roomTypeKeys.lists() });
      toast.success('Room type created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create room type: ${error.message}`);
    },
  });
}

export function useUpdateRoomType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ name, data }: { name: string; data: RoomTypeUpdate }) =>
      roomTypesApi.update(name, data),
    onSuccess: (_, { name }) => {
      queryClient.invalidateQueries({ queryKey: roomTypeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: roomTypeKeys.detail(name) });
      toast.success('Room type updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update room type: ${error.message}`);
    },
  });
}

export function useDeleteRoomType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: roomTypesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roomTypeKeys.lists() });
      toast.success('Room type deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete room type: ${error.message}`);
    },
  });
}
