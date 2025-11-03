import { MissionClient, type CreateMissionDto, type UpdateMissionDto, type Mission } from './missionClient';

export const MissionMutation = {
    async create(data: CreateMissionDto): Promise<Mission> {
        const res = await MissionClient.create(data);
        return res as unknown as Mission;
    },

    async update(id: number, data: UpdateMissionDto): Promise<Mission> {
        const res = await MissionClient.update(id, data);
        return res as unknown as Mission;
    },

    async remove(id: number): Promise<void> {
        // TODO: Implement if needed
    },
};
