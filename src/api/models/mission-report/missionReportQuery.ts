import api from '@/utils/api';

export interface MissionReport {
    id: number;
    missionId: number;
    flightTimeSec: number;
    distanceM: number;
    avgSpeedMps: number;
    batteryConsumedPct: number;
    incidentCount: number;
    createdAt: string;
}

export interface CreateMissionReportDto {
    missionId: number;
    flightTimeSec: number;
    distanceM: number;
    avgSpeedMps: number;
    batteryConsumedPct: number;
    incidentCount: number;
}

export type UpdateMissionReportDto = Partial<CreateMissionReportDto>;

export class MissionReportQuery {
    async getAll(missionId?: number): Promise<MissionReport[]> {
        const params = missionId ? { missionId } : undefined;
        const { data } = await api.get<MissionReport[]>(`${import.meta.env.VITE_API_PREFIX}/mission-reports`, { params });
        return data;
    }

    async getOne(id: number): Promise<MissionReport> {
        const { data } = await api.get<MissionReport>(`/api/v1/mission-reports/${id}`);
        return data;
    }
}
