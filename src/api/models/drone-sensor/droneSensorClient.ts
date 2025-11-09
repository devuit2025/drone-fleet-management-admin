import { api } from '@/api/axios';

export type SensorStatus = 'active' | 'inactive' | 'faulty';

export interface DroneSensor {
    id: number;
    droneId: number;
    type: string;
    model: string | null;
    resolution: string | null;
    fieldOfView: number | null;
    status: SensorStatus;
    createdAt: string;
    updatedAt: string;
    drone?: Record<string, any>;
}

export interface CreateDroneSensorDto {
    droneId: number;
    type: string;
    model?: string;
    resolution?: string;
    fieldOfView?: number;
    status?: SensorStatus;
}

export interface UpdateDroneSensorDto {
    droneId?: number;
    type?: string;
    model?: string;
    resolution?: string;
    fieldOfView?: number;
    status?: SensorStatus;
}

export class DroneSensorClient {
    private static base = '/drone-sensors';

    static async findAll(): Promise<DroneSensor[]> {
        const res = await api.get<DroneSensor[]>(this.base);
        return res as unknown as DroneSensor[];
    }

    static async findOne(id: number): Promise<DroneSensor> {
        const res = await api.get<DroneSensor>(`${this.base}/${id}`);
        return res as unknown as DroneSensor;
    }

    static async create(data: CreateDroneSensorDto): Promise<DroneSensor> {
        const res = await api.post<DroneSensor>(this.base, data);
        return res as unknown as DroneSensor;
    }

    static async update(id: number, data: UpdateDroneSensorDto): Promise<DroneSensor> {
        const res = await api.patch<DroneSensor>(`${this.base}/${id}`, data);
        return res as unknown as DroneSensor;
    }

    static async remove(id: number): Promise<void> {
        await api.delete(`${this.base}/${id}`);
    }
}
