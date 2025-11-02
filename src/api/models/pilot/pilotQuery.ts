import { PilotClient } from './pilotClient';
import type { Pilot } from './pilotClient';

export const PilotQuery = {
    async findAll(): Promise<Pilot[]> {
        return PilotClient.findAll();
    },
};
