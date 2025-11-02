import { DroneBrandClient, type DroneBrand } from './droneBrandClient';

/**
 * DroneBrandQuery
 * Read-only operations that fetch drone brand data.
 */
export const DroneBrandQuery = {
    async findAll(): Promise<DroneBrand[]> {
        return DroneBrandClient.findAll();
    },

    async findOne(id: number): Promise<DroneBrand> {
        return DroneBrandClient.findOne(id);
    },
};
