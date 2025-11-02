// api/models/drone/droneClient.ts
import axios from 'axios'

export type DroneStatus =
  | 'available'
  | 'in_mission'
  | 'flying'
  | 'hovering'
  | 'landing'
  | 'maintenance'
  | 'decommissioned'

export interface Drone {
  id: number
  modelId: number
  serialNumber: string
  name: string
  status: DroneStatus
  firmwareVersion: string | null
  batteryHealth: number | null
  totalFlightHours: number
  lastMaintenance: string | null
  createdAt: string
  updatedAt: string
  model?: Record<string, unknown>
  sensors?: Record<string, unknown>[]
  telemetry?: Record<string, unknown>[]
}

export interface CreateDroneDto {
  modelId: number
  serialNumber: string
  name: string
  status?: DroneStatus
  firmwareVersion?: string
  batteryHealth?: number
  totalFlightHours?: number
  lastMaintenance?: string
}

export interface UpdateDroneDto {
  modelId?: number
  serialNumber?: string
  name?: string
  status?: DroneStatus
  firmwareVersion?: string
  batteryHealth?: number
  totalFlightHours?: number
  lastMaintenance?: string
}

export interface UpdateDroneStatusDto {
  status: DroneStatus
  battery_health?: number
}

export class DroneClient {
  private static base = '/api/v1/drones'

  static async create(data: CreateDroneDto): Promise<Drone> {
    const res = await axios.post<Drone>(this.base, data)
    return res.data
  }

  static async findAll(): Promise<Drone[]> {
    const res = await axios.get<Drone[]>(this.base)
    return res.data
  }

  static async findAvailable(): Promise<Drone[]> {
    const res = await axios.get<Drone[]>(`${this.base}/available`)
    return res.data
  }

  static async findByStatus(status: DroneStatus): Promise<Drone[]> {
    const res = await axios.get<Drone[]>(`${this.base}/status/${status}`)
    return res.data
  }

  static async findOne(id: number): Promise<Drone> {
    const res = await axios.get<Drone>(`${this.base}/${id}`)
    return res.data
  }

  static async update(id: number, data: UpdateDroneDto): Promise<Drone> {
    const res = await axios.patch<Drone>(`${this.base}/${id}`, data)
    return res.data
  }

  static async remove(id: number): Promise<void> {
    await axios.delete(`${this.base}/${id}`)
  }

  static async updateStatus(id: number, data: UpdateDroneStatusDto): Promise<void> {
    await axios.patch(`${this.base}/${id}/status`, data)
  }
}
