import { api } from '@/api/axios';

export interface FlightStats {
    totalFlights: number;
    activeMissions: number;
    avgFlightTime: number; // seconds
    successRate: number; // percentage
}

export interface FlightsOverTime {
    date: string;
    count: number;
}

export interface PilotStats {
    pilotId: number;
    pilotName: string;
    totalFlightHours: number;
    flightCount: number;
}

export interface MissionStatusDistribution {
    status: string;
    count: number;
    percentage: number;
}

export interface RecentFlight {
    id: number;
    missionName: string;
    pilotName: string;
    drones: string[];
    duration: number; // seconds
    distance: number; // meters
    batteryUsed: number; // percentage
    status: string;
    startTime: string;
    endTime: string | null;
}

export interface FlightAnalyticsResponse {
    stats: FlightStats;
    flightsOverTime: FlightsOverTime[];
    topPilots: PilotStats[];
    statusDistribution: MissionStatusDistribution[];
    recentFlights: RecentFlight[];
}

export class FlightAnalyticsClient {
    private static base = '/analytics/flights';

    static async getFlightAnalytics(params?: {
        startDate?: string;
        endDate?: string;
        pilotId?: number;
        status?: string;
    }): Promise<FlightAnalyticsResponse> {
        const res = await api.get<FlightAnalyticsResponse>(this.base, { params });
        return res as unknown as FlightAnalyticsResponse;
    }

    static async getStats(params?: { startDate?: string; endDate?: string }): Promise<FlightStats> {
        const res = await api.get<FlightStats>(`${this.base}/stats`, { params });
        return res as unknown as FlightStats;
    }

    static async getFlightsOverTime(params?: {
        startDate?: string;
        endDate?: string;
        groupBy?: 'day' | 'week' | 'month';
    }): Promise<FlightsOverTime[]> {
        const res = await api.get<FlightsOverTime[]>(`${this.base}/over-time`, { params });
        return res as unknown as FlightsOverTime[];
    }

    static async getTopPilots(params?: {
        startDate?: string;
        endDate?: string;
        limit?: number;
    }): Promise<PilotStats[]> {
        const res = await api.get<PilotStats[]>(`${this.base}/top-pilots`, { params });
        return res as unknown as PilotStats[];
    }

    static async getStatusDistribution(params?: {
        startDate?: string;
        endDate?: string;
    }): Promise<MissionStatusDistribution[]> {
        const res = await api.get<MissionStatusDistribution[]>(`${this.base}/status-distribution`, {
            params,
        });
        return res as unknown as MissionStatusDistribution[];
    }

    static async getRecentFlights(params?: { limit?: number }): Promise<RecentFlight[]> {
        const res = await api.get<RecentFlight[]>(`${this.base}/recent`, { params });
        return res as unknown as RecentFlight[];
    }
}

