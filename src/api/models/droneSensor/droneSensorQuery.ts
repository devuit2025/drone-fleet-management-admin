import { DroneSensorClient } from './droneSensorClient';
import type { DroneSensor } from './droneSensorClient';

export const DroneSensorQuery = {
    async findAll(droneId?: number): Promise<DroneSensor[]> {
        return DroneSensorClient.findAll(droneId);
    },

    async findOne(id: number): Promise<DroneSensor> {
        return DroneSensorClient.findOne(id);
    },
};
