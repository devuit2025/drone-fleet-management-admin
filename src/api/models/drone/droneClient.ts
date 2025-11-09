// api/models/drone/droneClient.ts
import { api } from '@/api/axios';

export type DroneStatus =
    | 'available'
    | 'in_mission'
    | 'flying'
    | 'hovering'
    | 'landing'
    | 'maintenance'
    | 'decommissioned';

export interface Drone {
    id: number;
    modelId: number;
    serialNumber: string;
    name: string;
    status: DroneStatus;
    firmwareVersion: string | null;
    batteryHealth: number | null;
    totalFlightHours: number;
    lastMaintenance: string | null;
    createdAt: string;
    updatedAt: string;
    model?: Record<string, unknown>;
    sensors?: Record<string, unknown>[];
    telemetry?: Record<string, unknown>[];
}

export interface CreateDroneDto {
    modelId: number;
    serialNumber: string;
    name: string;
    status?: DroneStatus;
    firmwareVersion?: string;
    batteryHealth?: number;
    totalFlightHours?: number;
    lastMaintenance?: string;
}

export interface UpdateDroneDto {
    modelId?: number;
    serialNumber?: string;
    name?: string;
    status?: DroneStatus;
    firmwareVersion?: string;
    batteryHealth?: number;
    totalFlightHours?: number;
    lastMaintenance?: string;
}

export interface UpdateDroneStatusDto {
    status: DroneStatus;
    battery_health?: number;
}

export class DroneClient {
    private static base = '/drones';

    static async create(data: CreateDroneDto): Promise<Drone> {
        const res = await api.post<Drone>(this.base, data);
        return res as unknown as Drone;
    }

    static async findAll(): Promise<Drone[]> {
        const res = await api.get<Drone[]>(`${this.base}/drones`);
        return res as unknown as Drone[];
    }

    static async findAvailable(): Promise<Drone[]> {
        const res = await api.get<Drone[]>(`${this.base}/available`);
        return res as unknown as Drone[];
    }

    static async findByStatus(status: DroneStatus): Promise<Drone[]> {
        const res = await api.get<Drone[]>(`${this.base}/status/${status}`);
        return res as unknown as Drone[];
    }

    static async findOne(id: number): Promise<Drone> {
        const res = await api.get<Drone>(`${this.base}/${id}`);
        return res as unknown as Drone;
    }

    static async update(id: number, data: UpdateDroneDto): Promise<Drone> {
        const res = await api.patch<Drone>(`${this.base}/${id}`, data);
        return res as unknown as Drone;
    }

    static async remove(id: number): Promise<void> {
        await api.delete(`${this.base}/${id}`);
    }

    static async updateStatus(id: number, data: UpdateDroneStatusDto): Promise<void> {
        await api.patch(`${this.base}/${id}/status`, data);
    }
}
