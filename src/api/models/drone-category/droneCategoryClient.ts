import axios from 'axios';

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
export const DroneCategoryClient = {
    axios: axios.create({
        baseURL: `${import.meta.env.VITE_API_PREFIX}/drone-categories`,
        withCredentials: true,
    }),

    /**
     * Create a new drone category
     */
    async create(data: CreateDroneCategoryDto): Promise<DroneCategory> {
        const res = await this.axios.post<DroneCategory>('/', data);
        return res.data;
    },

    /**
     * Get all drone categories
     */
    async findAll(): Promise<DroneCategory[]> {
        const res = await this.axios.get<DroneCategory[]>('/');
        return res.data;
    },

    /**
     * Get a drone category by ID
     */
    async findOne(id: number): Promise<DroneCategory> {
        const res = await this.axios.get<DroneCategory>(`/${id}`);
        return res.data;
    },

    /**
     * Update a drone category
     */
    async update(id: number, data: UpdateDroneCategoryDto): Promise<DroneCategory> {
        const res = await this.axios.patch<DroneCategory>(`/${id}`, data);
        return res.data;
    },

    /**
     * Delete a drone category
     */
    async remove(id: number): Promise<void> {
        await this.axios.delete(`/${id}`);
    },
};
