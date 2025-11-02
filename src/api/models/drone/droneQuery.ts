// api/models/drone/droneQuery.ts
import { DroneClient, type Drone, type DroneStatus } from './droneClient';

export const droneQuery = {
    async getAll(): Promise<Drone[]> {
        return DroneClient.findAll();
    },

    async getAvailable(): Promise<Drone[]> {
        return DroneClient.findAvailable();
    },

    async getByStatus(status: DroneStatus): Promise<Drone[]> {
        return DroneClient.findByStatus(status);
    },

    async getById(id: number): Promise<Drone> {
        return DroneClient.findOne(id);
    },
};
