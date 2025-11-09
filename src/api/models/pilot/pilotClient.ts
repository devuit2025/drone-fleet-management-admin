import { api } from '@/api/axios';

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

export interface UpdatePilotDto {
    userId?: number;
    name?: string;
    status?: PilotStatus;
}

export class PilotClient {
    private static base = '/pilots';

    static async findAll(): Promise<Pilot[]> {
        const res = await api.get<Pilot[]>(this.base);
        return res as unknown as Pilot[];
    }

    static async findOne(id: number): Promise<Pilot> {
        const res = await api.get<Pilot>(`${this.base}/${id}`);
        return res as unknown as Pilot;
    }

    static async create(data: CreatePilotDto): Promise<Pilot> {
        const res = await api.post<Pilot>(this.base, data);
        return res as unknown as Pilot;
    }

    static async update(id: number, data: UpdatePilotDto): Promise<Pilot> {
        const res = await api.patch<Pilot>(`${this.base}/${id}`, data);
        return res as unknown as Pilot;
    }

    static async remove(id: number): Promise<void> {
        await api.delete(`${this.base}/${id}`);
    }
}
