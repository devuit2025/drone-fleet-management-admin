import axios from 'axios';

export interface NoFlyZone {
    id: number;
    name: string;
    zoneType: 'polygon' | 'circle';
    geometry: string;
    description: string;
}

export interface CreateNoFlyZoneDto {
    name: string;
    zoneType: 'polygon' | 'circle';
    geometry: string;
    description: string;
}

export interface UpdateNoFlyZoneDto {
    name?: string;
    zoneType?: 'polygon' | 'circle';
    geometry?: string;
    description?: string;
}

export const NoFlyZoneClient = {
    axios: axios.create({
        baseURL: '/api/v1/no-fly-zones',
        withCredentials: true,
    }),

    async findAll(): Promise<NoFlyZone[]> {
        const res = await this.axios.get<NoFlyZone[]>('/');
        return res.data;
    },

    async findOne(id: number): Promise<NoFlyZone> {
        const res = await this.axios.get<NoFlyZone>(`/${id}`);
        return res.data;
    },

    async create(data: CreateNoFlyZoneDto): Promise<NoFlyZone> {
        const res = await this.axios.post<NoFlyZone>('/', data);
        return res.data;
    },

    async update(id: number, data: UpdateNoFlyZoneDto): Promise<NoFlyZone> {
        const res = await this.axios.patch<NoFlyZone>(`/${id}`, data);
        return res.data;
    },

    async remove(id: number): Promise<void> {
        await this.axios.delete(`/${id}`);
    },
};
