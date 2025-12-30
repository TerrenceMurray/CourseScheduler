import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { buildingsApi } from '@/lib/api';
import type { BuildingCreate, BuildingUpdate } from '@/types/api';
import { toast } from 'sonner';

export const buildingKeys = {
  all: ['buildings'] as const,
  lists: () => [...buildingKeys.all, 'list'] as const,
  detail: (id: string) => [...buildingKeys.all, 'detail', id] as const,
};

export function useBuildings() {
  return useQuery({
    queryKey: buildingKeys.lists(),
    queryFn: buildingsApi.list,
  });
}

export function useBuilding(id: string) {
  return useQuery({
    queryKey: buildingKeys.detail(id),
    queryFn: () => buildingsApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateBuilding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BuildingCreate) => buildingsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: buildingKeys.lists() });
      toast.success('Building created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create building: ${error.message}`);
    },
  });
}

export function useUpdateBuilding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: BuildingUpdate }) =>
      buildingsApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: buildingKeys.lists() });
      queryClient.invalidateQueries({ queryKey: buildingKeys.detail(id) });
      toast.success('Building updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update building: ${error.message}`);
    },
  });
}

export function useDeleteBuilding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: buildingsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: buildingKeys.lists() });
      toast.success('Building deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete building: ${error.message}`);
    },
  });
}
