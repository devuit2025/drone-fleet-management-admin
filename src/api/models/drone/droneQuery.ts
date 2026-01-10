// api/models/drone/droneQuery.ts
import { useQuery } from '@tanstack/react-query';
import { DroneClient, type Drone, type DroneStatus } from './droneClient';

export const droneQuery = {
    getAll() {
        return useQuery({
            queryKey: ['users'],
            queryFn: DroneClient.getAll,
        });
    },
};
