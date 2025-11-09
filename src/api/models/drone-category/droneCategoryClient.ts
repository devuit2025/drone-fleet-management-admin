import { api } from '@/api/axios';

export interface DroneCategory {
    id: number;
    name: string;
    description: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface CreateDroneCategoryDto {
    name: string;
    description?: string;
}

export interface UpdateDroneCategoryDto {
    name?: string;
    description?: string;
}

/**
 * DroneCategoryClient
 * Centralized client defining all Drone Category API endpoints.
 */
export class DroneCategoryClient {
    private static base = '/drone-categories';

    static async create(data: CreateDroneCategoryDto): Promise<DroneCategory> {
        const res = await api.post<DroneCategory>(this.base, data);
        return res as unknown as DroneCategory;
    }

    static async findAll(): Promise<DroneCategory[]> {
        const res = await api.get<DroneCategory[]>(this.base);
        return res as unknown as DroneCategory[];
    }

    static async findOne(id: number): Promise<DroneCategory> {
        const res = await api.get<DroneCategory>(`${this.base}/${id}`);
        return res as unknown as DroneCategory;
    }

    static async update(id: number, data: UpdateDroneCategoryDto): Promise<DroneCategory> {
        const res = await api.patch<DroneCategory>(`${this.base}/${id}`, data);
        return res as unknown as DroneCategory;
    }

    static async remove(id: number): Promise<void> {
        await api.delete(`${this.base}/${id}`);
    }
}
