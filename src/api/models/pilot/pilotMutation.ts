import { PilotClient, type Pilot, type CreatePilotDto, type UpdatePilotDto } from './pilotClient';

export const PilotMutation = {
    async create(data: CreatePilotDto): Promise<Pilot> {
        return PilotClient.create(data);
    },

    async update(id: number, data: UpdatePilotDto): Promise<Pilot> {
        return PilotClient.update(id, data);
    },

    async remove(id: number): Promise<void> {
        return PilotClient.remove(id);
    },
};
