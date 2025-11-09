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
    dimensions: {
        length?: number;
        width?: number;
        height?: number;
        weight?: number;
    } | null;
    createdAt: string;
    updatedAt: string;
    brand?: Record<string, any>;
    category?: Record<string, any>;
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
    dimensions?: {
        length?: number;
        width?: number;
        height?: number;
        weight?: number;
    };
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
    dimensions?: {
        length?: number;
        width?: number;
        height?: number;
        weight?: number;
    };
}

export class DroneModelClient {
    private static base = '/drone-models';

    static async findAll(): Promise<DroneModel[]> {
        const res = await api.get<DroneModel[]>(this.base);
        return res as unknown as DroneModel[];
    }

    static async findOne(id: number): Promise<DroneModel> {
        const res = await api.get<DroneModel>(`${this.base}/${id}`);
        return res as unknown as DroneModel;
    }

    static async create(data: CreateDroneModelDto): Promise<DroneModel> {
        const res = await api.post<DroneModel>(this.base, data);
        return res as unknown as DroneModel;
    }

    static async update(id: number, data: UpdateDroneModelDto): Promise<DroneModel> {
        const res = await api.patch<DroneModel>(`${this.base}/${id}`, data);
        return res as unknown as DroneModel;
    }

    static async remove(id: number): Promise<void> {
        await api.delete(`${this.base}/${id}`);
    }
}
