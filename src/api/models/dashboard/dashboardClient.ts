import { api } from '@/api/axios';

export interface DashboardStats {
    drones: {
        total: number;
        available: number;
        in_flight: number;
        maintenance: number;
        charging: number;
        decommissioned: number;
        avgBatteryHealth: number;
        totalFlightHours: number;
    };
    missions: {
        total: number;
        planned: number;
        in_progress: number;
        completed: number;
        cancelled: number;
        failed: number;
        today: number;
        successRate: number;
    };
    pilots: {
        total: number;
        active: number;
        inactive: number;
    };
    licenses: {
        total: number;
        active: number;
        expired: number;
        expiringSoon: number;
    };
    permits: {
        total: number;
        pending: number;
        approved: number;
        rejected: number;
        active: number;
        expiringSoon: number;
    };
    noFlyZones: number;
}

export const DashboardClient = {
    async getStats(): Promise<DashboardStats> {
        const response = await api.get<DashboardStats>('/dashboard/stats');
        return response as unknown as DashboardStats;
    },
};
