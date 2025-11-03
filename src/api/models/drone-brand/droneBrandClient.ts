import axios from 'axios';

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
export const DroneBrandClient = {
    axios: axios.create({
        baseURL: `${import.meta.env.VITE_API_PREFIX}/drone-brands`,
        withCredentials: true,
    }),

    async create(data: CreateDroneBrandDto): Promise<DroneBrand> {
        const res = await this.axios.post<DroneBrand>('/', data);
        return res.data;
    },

    async findAll(): Promise<DroneBrand[]> {
        const res = await this.axios.get<DroneBrand[]>('/');
        return res.data;
    },

    async findOne(id: number): Promise<DroneBrand> {
        const res = await this.axios.get<DroneBrand>(`/${id}`);
        return res.data;
    },

    async update(id: number, data: UpdateDroneBrandDto): Promise<DroneBrand> {
        const res = await this.axios.patch<DroneBrand>(`/${id}`, data);
        return res.data;
    },

    async remove(id: number): Promise<void> {
        await this.axios.delete(`/${id}`);
    },
};
