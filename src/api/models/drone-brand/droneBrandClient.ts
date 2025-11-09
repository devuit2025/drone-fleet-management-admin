import { api } from '@/api/axios';

export interface DroneBrand {
    id: number;
    name: string;
    country: string | null;
    website: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface CreateDroneBrandDto {
    name: string;
    country?: string;
    website?: string;
}

export interface UpdateDroneBrandDto {
    name?: string;
    country?: string;
    website?: string;
}

/**
 * DroneBrandClient
 * Defines all API endpoints related to drone brands.
 */
export class DroneBrandClient {
    private static base = '/drone-brands';


    static async create(data: CreateDroneBrandDto): Promise<DroneBrand> {
        const res = await api.post<DroneBrand>(this.base, data);
        console.log(res);
        return res as unknown as DroneBrand;
    }

    static async findAll(): Promise<DroneBrand[]> {
        const res = await api.get<DroneBrand[]>(this.base);
        return res as unknown as DroneBrand[];
    }

    static async findOne(id: number): Promise<DroneBrand> {
        const res = await api.get<DroneBrand>(`${this.base}/${id}`);
        return res as unknown as DroneBrand;
    }

    static async update(id: number, data: UpdateDroneBrandDto): Promise<DroneBrand> {
        const res = await api.patch<DroneBrand>(`${this.base}/${id}`, data);
        return res as unknown as DroneBrand;
    }

    static async remove(id: number): Promise<void> {
        await api.delete(`${this.base}/${id}`);
    }
};
