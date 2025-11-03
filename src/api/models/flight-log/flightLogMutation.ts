import {
    FlightLogClient,
    type FlightLog,
    type CreateFlightLogDto,
    type UpdateFlightLogDto,
} from './flightLogClient';

export const FlightLogMutation = {
    async create(data: CreateFlightLogDto): Promise<FlightLog> {
        return FlightLogClient.create(data);
    },

    async update(id: number, data: UpdateFlightLogDto): Promise<FlightLog> {
        return FlightLogClient.update(id, data);
    },

    async remove(id: number): Promise<void> {
        return FlightLogClient.remove(id);
    },
};
