import { api } from '@/api/axios';

export interface DroneModel {
    id: number;
    brandId: number;
    categoryId: number;
    name: string;
    maxSpeed: number | null;
    maxAltitude: number | null;
    maxFlightTime: number | null;
    maxPayload: number | null;
    batteryCapacity: number | null;
    dimensions: Record<string, any> | null;
    createdAt: string;
    updatedAt: string;
}

export interface CreateDroneModelDto {
    brandId: number;
    categoryId: number;
    name: string;
    maxSpeed?: number;
    maxAltitude?: number;
    maxFlightTime?: number;
    maxPayload?: number;
    batteryCapacity?: number;
    dimensions?: Record<string, any>;
}

export interface UpdateDroneModelDto {
    brandId?: number;
    categoryId?: number;
    name?: string;
    maxSpeed?: number;
    maxAltitude?: number;
    maxFlightTime?: number;
    maxPayload?: number;
    batteryCapacity?: number;
    dimensions?: Record<string, any>;
}

export class DroneModelClient {
    static async create(data: CreateDroneModelDto): Promise<DroneModel> {
        const res = await api.post<DroneModel>('/drone-models', data);
        return res as unknown as DroneModel;
    }

    static async findAll(): Promise<DroneModel[]> {
        const res = await api.get<DroneModel[]>('/drone-models');
        return res as unknown as DroneModel[];
    }

    static async findOne(id: number): Promise<DroneModel> {
        const res = await api.get<DroneModel>(`/drone-models/${id}`);
        return res as unknown as DroneModel;
    }

    static async update(id: number, data: UpdateDroneModelDto): Promise<DroneModel> {
        const res = await api.patch<DroneModel>(`/drone-models/${id}`, data);
        return res as unknown as DroneModel;
    }

    static async remove(id: number): Promise<void> {
        await api.delete(`/drone-models/${id}`);
    }
}
