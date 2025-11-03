import axios from 'axios';

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

export const DroneModelClient = {
    axios: axios.create({
        baseURL: `${import.meta.env.VITE_API_PREFIX}/drone-models`,
        withCredentials: true,
    }),

    async create(data: CreateDroneModelDto): Promise<DroneModel> {
        const res = await this.axios.post<DroneModel>('/', data);
        return res.data;
    },

    async findAll(): Promise<DroneModel[]> {
        const res = await this.axios.get<DroneModel[]>('/');
        return res.data;
    },

    async findOne(id: number): Promise<DroneModel> {
        const res = await this.axios.get<DroneModel>(`/${id}`);
        return res.data;
    },

    async update(id: number, data: UpdateDroneModelDto): Promise<DroneModel> {
        const res = await this.axios.patch<DroneModel>(`/${id}`, data);
        return res.data;
    },

    async remove(id: number): Promise<void> {
        await this.axios.delete(`/${id}`);
    },
};
