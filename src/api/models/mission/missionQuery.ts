import { MissionClient } from './missionClient';
import type { Mission } from './missionClient';

export const MissionQuery = {
    async findAll(): Promise<Mission[]> {
        const res = await MissionClient.get('/');
        return res.data;
    },

    async findOne(id: number): Promise<Mission> {
        const res = await MissionClient.get(`/${id}`);
        return res.data;
    },
};
