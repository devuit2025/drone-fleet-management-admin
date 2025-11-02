// api/models/drone/droneMutation.ts
import {
    DroneClient,
    type CreateDroneDto,
    type UpdateDroneDto,
    type UpdateDroneStatusDto,
    type Drone,
} from './droneClient';

export const droneMutation = {
    async create(data: CreateDroneDto): Promise<Drone> {
        return DroneClient.create(data);
    },

    async update(id: number, data: UpdateDroneDto): Promise<Drone> {
        return DroneClient.update(id, data);
    },

    async updateStatus(id: number, data: UpdateDroneStatusDto): Promise<void> {
        return DroneClient.updateStatus(id, data);
    },

    async remove(id: number): Promise<void> {
        return DroneClient.remove(id);
    },
};
