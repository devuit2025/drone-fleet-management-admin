import {
    DroneBrandClient,
    type DroneBrand,
    type CreateDroneBrandDto,
    type UpdateDroneBrandDto,
} from './droneBrandClient';

export const DroneBrandMutation = {
    async create(data: CreateDroneBrandDto): Promise<DroneBrand> {
        return DroneBrandClient.create(data);
    },

    async update(id: number, data: UpdateDroneBrandDto): Promise<DroneBrand> {
        return DroneBrandClient.update(id, data);
    },

    async remove(id: number): Promise<void> {
        return DroneBrandClient.remove(id);
    },
};
