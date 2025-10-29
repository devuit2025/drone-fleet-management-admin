// src/api/models/droneQuery.ts
import { useQuery } from '@tanstack/react-query';
import { getDrones, getDroneById } from './droneEndpoint';

export const useDronesQuery = () =>
    useQuery({
        queryKey: ['drones'],
        queryFn: getDrones,
    });

export const useDroneQuery = (id: number) =>
    useQuery({
        queryKey: ['drone', id],
        queryFn: () => getDroneById(id),
        enabled: !!id,
    });
