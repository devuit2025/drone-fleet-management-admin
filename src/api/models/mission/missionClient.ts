import { api } from '@/api/axios';

export type MissionStatus = 'planned' | 'in_progress' | 'completed' | 'failed';

export interface Mission {
    id: number;
    pilotId: number;
    licenseId: number | null;
    missionName: string;
    status: MissionStatus;
    startTime: string | null;
    endTime: string | null;
    createdAt: string;
    updatedAt: string;
    pilot?: Record<string, any>;
    drone?: Record<string, any>;
    waypoints?: Record<string, any>[];
    drones?: Record<string, any>[];
    telemetry?: Record<string, any>[];
    flightLogs?: Record<string, any>[];
    reports?: Record<string, any>[];
    simulations?: Record<string, any>[];
}

export interface CreateMissionDto {
    pilotId: number;
    licenseId?: number;
    missionName: string;
    status?: MissionStatus;
    startTime?: string;
    endTime?: string;
}

export interface UpdateMissionDto {
    pilotId?: number;
    licenseId?: number;
    missionName?: string;
    status?: MissionStatus;
    startTime?: string;
    endTime?: string;
}

export class MissionClient {
    private static base = '/missions';

    static async findAll(): Promise<Mission[]> {
        const res = await api.get<Mission[]>(this.base);
        return res as unknown as Mission[];
    }

    static async findOne(id: number): Promise<Mission> {
        const res = await api.get<Mission>(`${this.base}/${id}`);
        return res as unknown as Mission;
    }

    static async create(data: CreateMissionDto): Promise<Mission> {
        const res = await api.post<Mission>(this.base, data);
        return res as unknown as Mission;
    }

    static async update(id: number, data: UpdateMissionDto): Promise<Mission> {
        const res = await api.patch<Mission>(`${this.base}/${id}`, data);
        return res as unknown as Mission;
    }

    static async remove(id: number): Promise<void> {
        await api.delete(`${this.base}/${id}`);
    }
}
