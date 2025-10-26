// src/api/models/droneMutation.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createDrone, updateDrone, deleteDrone } from "./droneEndpoint";

export const useCreateDrone = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createDrone,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["drones"] }),
  });
};

export const useUpdateDrone = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => updateDrone(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["drones"] }),
  });
};

export const useDeleteDrone = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteDrone,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["drones"] }),
  });
};
