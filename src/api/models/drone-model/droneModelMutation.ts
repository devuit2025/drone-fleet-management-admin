import {
    DroneModelClient,
    type DroneModel,
    type CreateDroneModelDto,
    type UpdateDroneModelDto,
} from './droneModelClient';

export const DroneModelMutation = {
    async create(data: CreateDroneModelDto): Promise<DroneModel> {
        return DroneModelClient.create(data);
    },

    async update(id: number, data: UpdateDroneModelDto): Promise<DroneModel> {
        return DroneModelClient.update(id, data);
    },

    async remove(id: number): Promise<void> {
        return DroneModelClient.remove(id);
    },
};
