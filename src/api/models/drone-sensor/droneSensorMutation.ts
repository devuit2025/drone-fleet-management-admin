import {
    DroneSensorClient,
    type DroneSensor,
    type CreateDroneSensorDto,
    type UpdateDroneSensorDto,
} from './droneSensorClient';

export const DroneSensorMutation = {
    async create(data: CreateDroneSensorDto): Promise<DroneSensor> {
        return DroneSensorClient.create(data);
    },

    async update(id: number, data: UpdateDroneSensorDto): Promise<DroneSensor> {
        return DroneSensorClient.update(id, data);
    },

    async remove(id: number): Promise<void> {
        return DroneSensorClient.remove(id);
    },
};
