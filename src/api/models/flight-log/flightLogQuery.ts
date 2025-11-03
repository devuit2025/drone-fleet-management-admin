import { FlightLogClient, type FlightLog } from './flightLogClient';

export const FlightLogQuery = {
    async findAll(params?: { missionId?: number }): Promise<FlightLog[]> {
        return FlightLogClient.findAll(params);
    },

    async findOne(id: number): Promise<FlightLog> {
        return FlightLogClient.findOne(id);
    },
};
