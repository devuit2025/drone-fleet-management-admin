import { api } from '@/api/axios';

export interface MaintenanceDue {
    droneId: number;
    droneName: string;
    serialNumber: string;
    lastMaintenance: string;
    daysSinceLastMaintenance: number;
    status: 'critical' | 'warning' | 'ok';
}

export interface IncidentSummary {
    eventType: string;
    count: number;
    percentage: number;
    severity: 'high' | 'medium' | 'low';
}

export interface LicenseExpiring {
    licenseId: number;
    licenseNumber: string;
    pilotId: number;
    pilotName: string;
    expiryDate: string;
    daysUntilExpiry: number;
    status: 'expired' | 'critical' | 'warning';
}

export interface PerformanceMetric {
    label: string;
    value: number;
    change: number; // percentage change
    format: 'number' | 'percentage' | 'duration' | 'distance';
}

export interface BatteryConsumptionData {
    missionId: number;
    missionName: string;
    flightTime: number; // seconds
    batteryConsumed: number; // percentage
    efficiency: number; // seconds per 1% battery
}

export interface DistanceLeaderboard {
    pilotId: number;
    pilotName: string;
    totalDistance: number; // meters
    flightCount: number;
    avgDistance: number;
}

export interface ReportsAnalyticsResponse {
    maintenanceDue: MaintenanceDue[];
    incidents: IncidentSummary[];
    licensesExpiring: LicenseExpiring[];
    performanceMetrics: PerformanceMetric[];
    batteryConsumption: BatteryConsumptionData[];
    distanceLeaderboard: DistanceLeaderboard[];
}

export class ReportsAnalyticsClient {
    private static base = '/analytics/reports';

    static async getReportsAnalytics(params?: {
        startDate?: string;
        endDate?: string;
    }): Promise<ReportsAnalyticsResponse> {
        const res = await api.get<ReportsAnalyticsResponse>(this.base, { params });
        return res as unknown as ReportsAnalyticsResponse;
    }

    static async getMaintenanceDue(params?: { threshold?: number }): Promise<MaintenanceDue[]> {
        const res = await api.get<MaintenanceDue[]>(`${this.base}/maintenance-due`, { params });
        return res as unknown as MaintenanceDue[];
    }

    static async getIncidentSummary(params?: {
        startDate?: string;
        endDate?: string;
    }): Promise<IncidentSummary[]> {
        const res = await api.get<IncidentSummary[]>(`${this.base}/incidents`, { params });
        return res as unknown as IncidentSummary[];
    }

    static async getLicensesExpiring(params?: { days?: number }): Promise<LicenseExpiring[]> {
        const res = await api.get<LicenseExpiring[]>(`${this.base}/licenses-expiring`, { params });
        return res as unknown as LicenseExpiring[];
    }

    static async getPerformanceMetrics(params?: {
        startDate?: string;
        endDate?: string;
    }): Promise<PerformanceMetric[]> {
        const res = await api.get<PerformanceMetric[]>(`${this.base}/performance`, { params });
        return res as unknown as PerformanceMetric[];
    }

    static async getBatteryConsumption(params?: {
        startDate?: string;
        endDate?: string;
        limit?: number;
    }): Promise<BatteryConsumptionData[]> {
        const res = await api.get<BatteryConsumptionData[]>(`${this.base}/battery-consumption`, {
            params,
        });
        return res as unknown as BatteryConsumptionData[];
    }

    static async getDistanceLeaderboard(params?: {
        startDate?: string;
        endDate?: string;
        limit?: number;
    }): Promise<DistanceLeaderboard[]> {
        const res = await api.get<DistanceLeaderboard[]>(`${this.base}/distance-leaderboard`, {
            params,
        });
        return res as unknown as DistanceLeaderboard[];
    }
}

