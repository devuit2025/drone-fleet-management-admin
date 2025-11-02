import axios from 'axios';

export interface Waypoint {
    id: number;
    missionId: number;
    seqNumber: number;
    geoPoint: string;
    altitudeM: number;
    speedMps: number;
    action: string;
    createdAt: string;
}

export interface CreateWaypointDto {
    missionId: number;
    seqNumber: number;
    geoPoint: string;
    altitudeM: number;
    speedMps: number;
    action: string;
}

export interface UpdateWaypointDto {
    missionId?: number;
    seqNumber?: number;
    geoPoint?: string;
    altitudeM?: number;
    speedMps?: number;
    action?: string;
}

export const WaypointClient = {
    axios: axios.create({
        baseURL: '/api/v1/waypoints',
        withCredentials: true,
    }),

    async create(data: CreateWaypointDto) {
        const res = await this.axios.post<Waypoint>('/', data);
        return res.data;
    },

    async findAll(missionId?: number) {
        const res = await this.axios.get<Waypoint[]>('/', {
            params: missionId ? { missionId } : {},
        });
        return res.data;
    },

    async findOne(id: number) {
        const res = await this.axios.get<Waypoint>(`/${id}`);
        return res.data;
    },

    async update(id: number, data: UpdateWaypointDto) {
        const res = await this.axios.patch<Waypoint>(`/${id}`, data);
        return res.data;
    },

    async remove(id: number) {
        const res = await this.axios.delete<void>(`/${id}`);
        return res.data;
    },
};
