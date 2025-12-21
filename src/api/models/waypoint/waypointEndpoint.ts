import { api } from '@/api/axios';

export interface CreateWaypointDto {
    missionId: number;
    seqNumber: number;
    geoPoint: string;
    altitudeM: number;
    speedMps: number;
    action: string;
}

export const createWaypoint = (data: CreateWaypointDto) => api.post('/waypoints', data);
export const getWaypoints = (missionId?: number) =>
    api.get('/waypoints', { params: missionId ? { missionId } : {} });
