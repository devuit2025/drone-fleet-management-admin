import { api } from '@/api/axios';

export interface Drone {
    id: number;
    name: string;
    model: string;
    serialNumber: string;
    status: 'available' | 'in_mission' | 'maintenance';

    maxPayload: number; // kg
    batteryHealth: number; // mAh
    lastMaintenance: string; // ISO date string

    createdAt: string; // ISO timestamp
    updatedAt: string; // ISO timestamp
}

export const getDrones = (params?: Record<string, any>) => api.get<Drone[]>('/drones', { params });
export const getDroneById = (id: number) => api.get<Drone>(`/drones/${id}`);
export const createDrone = (data: Partial<Drone>) => api.post('/drones', data);
export const updateDrone = (id: number, data: Partial<Drone>) => api.put(`/drones/${id}`, data);
export const deleteDrone = (id: number) => api.delete(`/drones/${id}`);
export const getStatus = () => api.get<string[]>('/drones/statuses');
export const getAvailableDrones = () => api.get<Drone[]>('/drones/available');
export const updateDroneStatus = (id: number, data: { status: string; battery_health?: number }) =>
    api.patch(`/drones/${id}/status`, data);