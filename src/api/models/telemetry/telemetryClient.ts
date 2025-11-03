import { api } from '@/api/axios';

export interface Telemetry {
    id: number;
    droneId: number;
    missionId: number;
    timestamp: string;
    location: string;
    altitudeM: number;
    speedMps: number;
    batteryPct: number;
    status: string;
    payloadWeight: number;
}

export interface CreateTelemetryDto {
    droneId: number;
    missionId: number;
    timestamp: string;
    location: string;
    altitudeM: number;
    speedMps: number;
    batteryPct: number;
    status: string;
    payloadWeight: number;
}

export const TelemetryClient = {
    async create(data: CreateTelemetryDto) {
        return api.post<Telemetry>('/telemetry', data);
    },

    async findAll(params?: { missionId?: number; droneId?: number }) {
        return api.get<Telemetry[]>('/telemetry', { params });
    },

    async findOne(id: number) {
        return api.get<Telemetry>(`/telemetry/${id}`);
    },

    async remove(id: number) {
        return api.delete<void>(`/telemetry/${id}`);
    },
};
