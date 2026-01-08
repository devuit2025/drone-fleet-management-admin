import { api } from '@/api/axios';

export type LogEventType =
    | 'login.success'
    | 'login.failed'
    | 'logout'
    | 'altitude_violation'
    | 'battery_low'
    | 'signal_loss'
    | 'gps_error'
    | 'no_fly_zone_violation'
    | 'emergency_landing'
    | 'weather_warning';

export type LogStatus = 'success' | 'error' | 'warning' | 'info';

export interface FlightLog {
    id: number;
    missionId: number;
    eventType: string;
    description: string;
    timestamp: string;
    mission?: {
        id: number;
        missionName: string;
        pilot?: {
            name: string;
        };
    };
}

export interface AuthLog {
    id: number;
    userId?: number;
    eventType: 'login.success' | 'login.failed' | 'logout';
    email: string;
    ipAddress: string;
    userAgent: string;
    timestamp: string;
    user?: {
        name: string;
        email: string;
    };
}

export interface LogEntry {
    id: number;
    type: 'flight' | 'auth';
    eventType: LogEventType;
    description: string;
    timestamp: string;
    user?: string;
    resource?: string;
    ipAddress?: string;
    status: LogStatus;
}

export interface LogsStats {
    totalToday: number;
    errors: number;
    warnings: number;
    critical: number;
}

export class LogsClient {
    private static base = '/logs';

    static async getFlightLogs(params?: {
        startDate?: string;
        endDate?: string;
        missionId?: number;
        eventType?: string;
    }): Promise<FlightLog[]> {
        const res = await api.get<FlightLog[]>(`${this.base}/flight`, { params });
        return res as unknown as FlightLog[];
    }

    static async getAuthLogs(params?: {
        startDate?: string;
        endDate?: string;
        userId?: number;
        eventType?: string;
    }): Promise<AuthLog[]> {
        const res = await api.get<AuthLog[]>(`${this.base}/auth`, { params });
        return res as unknown as AuthLog[];
    }

    static async getAllLogs(params?: {
        startDate?: string;
        endDate?: string;
        eventType?: string;
        status?: LogStatus;
    }): Promise<LogEntry[]> {
        const res = await api.get<LogEntry[]>(this.base, { params });
        return res as unknown as LogEntry[];
    }

    static async getStats(): Promise<LogsStats> {
        const res = await api.get<LogsStats>(`${this.base}/stats`);
        return res as unknown as LogsStats;
    }
}


