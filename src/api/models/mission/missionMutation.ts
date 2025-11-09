import { MissionClient, type CreateMissionDto, type UpdateMissionDto, type Mission } from './missionClient';

export const MissionMutation = {
    async create(data: CreateMissionDto): Promise<Mission> {
        return MissionClient.create(data);
    },

    async update(id: number, data: UpdateMissionDto): Promise<Mission> {
        return MissionClient.update(id, data);
    },

    async remove(id: number): Promise<void> {
        return MissionClient.remove(id);
    },
};
