import { api } from '@/api/axios';

export interface Waypoint {
    id: number;
    missionId: number;
    seqNumber: number;
    geoPoint: string;
    altitudeM: number;
    speedMps: number;
    action: string;
    createdAt: string;
}

export interface CreateWaypointDto {
    missionId: number;
    seqNumber: number;
    geoPoint: string;
    altitudeM: number;
    speedMps: number;
    action: string;
}

export interface UpdateWaypointDto {
    missionId?: number;
    seqNumber?: number;
    geoPoint?: string;
    altitudeM?: number;
    speedMps?: number;
    action?: string;
}

export const WaypointClient = {
    async create(data: CreateWaypointDto) {
        return api.post<Waypoint>('/waypoints', data);
    },

    async findAll(missionId?: number) {
        return api.get<Waypoint[]>('/waypoints', { params: missionId ? { missionId } : {} });
    },

    async findOne(id: number) {
        return api.get<Waypoint>(`/waypoints/${id}`);
    },

    async update(id: number, data: UpdateWaypointDto) {
        return api.patch<Waypoint>(`/waypoints/${id}`, data);
    },

    async remove(id: number) {
        return api.delete<void>(`/waypoints/${id}`);
    },
};
