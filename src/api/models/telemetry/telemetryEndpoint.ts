import { api } from '@/api/axios';

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

export const createTelemetry = (data: CreateTelemetryDto) => api.post('/telemetry', data);

