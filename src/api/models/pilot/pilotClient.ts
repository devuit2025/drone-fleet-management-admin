import axios from 'axios';

export type PilotStatus = 'active' | 'inactive';

export interface Pilot {
    id: number;
    userId: number;
    name: string;
    status: PilotStatus;
    createdAt: string;
    updatedAt: string;
}

export interface CreatePilotDto {
    userId: number;
    name: string;
    status?: PilotStatus;
}

export const PilotClient = {
    axios: axios.create({
        baseURL: `${import.meta.env.VITE_API_PREFIX}/pilots`,
        withCredentials: true,
    }),

    async findAll() {
        const res = await this.axios.get<Pilot[]>('/');
        return res.data;
    },

    async create(data: CreatePilotDto) {
        const res = await this.axios.post<Pilot>('/', data);
        return res.data;
    },
};
