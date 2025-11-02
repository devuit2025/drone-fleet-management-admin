import axios from 'axios';

export type DroneSensorStatus = 'active' | 'inactive' | 'faulty';

export interface DroneSensor {
    id: number;
    droneId: number;
    type: string;
    model?: string | null;
    resolution?: string | null;
    fieldOfView?: number | null;
    status: DroneSensorStatus;
    createdAt: string;
    updatedAt: string;
}

export interface CreateDroneSensorDto {
    droneId: number;
    type: string;
    model?: string;
    resolution?: string;
    fieldOfView?: number;
    status?: DroneSensorStatus;
}

export interface UpdateDroneSensorDto {
    droneId?: number;
    type?: string;
    model?: string;
    resolution?: string;
    fieldOfView?: number;
    status?: DroneSensorStatus;
}

export const DroneSensorClient = {
    axios: axios.create({
        baseURL: '/api/v1/drone-sensors',
        withCredentials: true,
    }),

    async create(data: CreateDroneSensorDto) {
        const res = await this.axios.post<DroneSensor>('/', data);
        return res.data;
    },

    async findAll(droneId?: number) {
        const res = await this.axios.get<DroneSensor[]>('/', {
            params: droneId ? { droneId } : {},
        });
        return res.data;
    },

    async findOne(id: number) {
        const res = await this.axios.get<DroneSensor>(`/${id}`);
        return res.data;
    },

    async update(id: number, data: UpdateDroneSensorDto) {
        const res = await this.axios.patch<DroneSensor>(`/${id}`, data);
        return res.data;
    },

    async remove(id: number) {
        const res = await this.axios.delete<void>(`/${id}`);
        return res.data;
    },
};
