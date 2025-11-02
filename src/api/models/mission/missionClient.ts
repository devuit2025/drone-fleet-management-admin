import axios from 'axios'

export interface Mission {
  id: number
  pilotId: number
  licenseId: number
  missionName: string
  status: MissionStatus
  startTime: string
  endTime: string
  createdAt: string
  updatedAt: string
  pilot?: Record<string, any>
  drone?: Record<string, any>
  waypoints?: Record<string, any>[]
  drones?: Record<string, any>[]
  telemetry?: Record<string, any>[]
  flightLogs?: Record<string, any>[]
  reports?: Record<string, any>[]
  simulations?: Record<string, any>[]
}

export type MissionStatus = 'planned' | 'in_progress' | 'completed' | 'failed'

export interface CreateMissionDto {
  pilotId: number
  licenseId?: number
  missionName: string
  status?: MissionStatus
  startTime?: string
  endTime?: string
}

export interface UpdateMissionDto {
  pilotId?: number
  licenseId?: number
  missionName?: string
  status?: MissionStatus
  startTime?: string
  endTime?: string
}

export const MissionClient = axios.create({
  baseURL: '/api/v1/missions',
  withCredentials: true,
})
