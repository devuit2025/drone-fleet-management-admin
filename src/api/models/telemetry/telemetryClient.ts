import axios from 'axios'

export interface Telemetry {
  id: number
  droneId: number
  missionId: number
  timestamp: string
  location: string
  altitudeM: number
  speedMps: number
  batteryPct: number
  status: string
  payloadWeight: number
}

export interface CreateTelemetryDto {
  droneId: number
  missionId: number
  timestamp: string
  location: string
  altitudeM: number
  speedMps: number
  batteryPct: number
  status: string
  payloadWeight: number
}

export const TelemetryClient = {
  axios: axios.create({
    baseURL: '/api/v1/telemetry',
    withCredentials: true,
  }),

  async create(data: CreateTelemetryDto) {
    const res = await this.axios.post<Telemetry>('/', data)
    return res.data
  },

  async findAll(params?: { missionId?: number; droneId?: number }) {
    const res = await this.axios.get<Telemetry[]>('/', { params })
    return res.data
  },

  async findOne(id: number) {
    const res = await this.axios.get<Telemetry>(`/${id}`)
    return res.data
  },

  async remove(id: number) {
    const res = await this.axios.delete<void>(`/${id}`)
    return res.data
  },
}
