import { api } from '@/api/axios';

export type MissionStatus = 'planned' | 'in_progress' | 'completed' | 'failed';

export type GeoJsonPoint = {
    type: 'Point';
    coordinates: [number, number];
};

export interface MissionWaypointInput {
    id?: number;
    missionDroneId?: number;
    seqNumber: number;
    geoPoint: GeoJsonPoint | string;
    altitudeM: number;
    speedMps: number;
    action: string;
    createdAt?: string;
}

export interface MissionDroneInput {
    id?: number;
    droneId: number;
    assignedAt?: string;
    drone?: Record<string, any>;
    waypoints?: MissionWaypointInput[];
}

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
    missionDrones?: MissionDroneInput[];
    drones?: Record<string, any>[]; // legacy field
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
    drones?: MissionDroneInput[];
}

export interface UpdateMissionDto {
    pilotId?: number;
    licenseId?: number;
    missionName?: string;
    status?: MissionStatus;
    startTime?: string;
    endTime?: string;
    drones?: MissionDroneInput[];
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
