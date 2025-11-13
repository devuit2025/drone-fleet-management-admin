import { api } from '@/api/axios';

export type MissionStatus = 'planned' | 'in_progress' | 'completed' | 'failed';

export interface CreateMissionDto {
  pilotId: number;
  licenseId?: number;
  missionName: string;
  status?: MissionStatus;
  startTime?: string;
  endTime?: string;
  drones?: Array<{
    droneId: number;
    waypoints?: Array<{
      seqNumber: number;
      geoPoint: unknown;
      altitudeM: number;
      speedMps: number;
      action: string;
    }>;
  }>;
}

export interface UpdateMissionDto {
  pilotId?: number;
  licenseId?: number;
  missionName?: string;
  status?: MissionStatus;
  startTime?: string;
  endTime?: string;
  drones?: Array<{
    droneId: number;
    waypoints?: Array<{
      seqNumber: number;
      geoPoint: unknown;
      altitudeM: number;
      speedMps: number;
      action: string;
    }>;
  }>;
}

export const createMission = (data: CreateMissionDto) => api.post('/missions', data);
export const updateMission = (id: number, data: UpdateMissionDto) => api.patch(`/missions/${id}`, data);
export const getMissions = (params?: { status?: MissionStatus; pilotId?: number; droneId?: number }) =>
  api.get('/missions', { params });

