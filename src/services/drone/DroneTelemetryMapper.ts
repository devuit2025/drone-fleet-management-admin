import type { ActiveDroneState } from '@/stores/active/useActiveDroneType';

/**
 * Raw telemetry payload coming from WS / MAVLink / simulator
 * Keep this close to the transport format (snake_case)
 */
export interface RawDroneTelemetry {
    lat: number;
    lng: number;
    altitude_m: number;
    speed_mps: number;
    heading_deg: number;
    extra?: {
        relative_altitude_m?: number;
        vx?: number;
        vy?: number;
        vz?: number;
    };
}

/**
 * DroneTelemetryMapper
 * Responsibility:
 *  - Transform raw telemetry into ActiveDroneState snapshot
 *  - No side effects, no state access
 */
export class DroneTelemetryMapper {
    /**
     * Map raw telemetry into ActiveDroneState (partial update)
     */
    static toActiveDroneState(msg: RawDroneTelemetry): Partial<ActiveDroneState> {
        return {
            position: {
                lat: msg.lat,
                lng: msg.lng,
                altitudeM: msg.altitude_m,
                relativeAltitudeM: msg.extra?.relative_altitude_m ?? null,
            },
            motion: {
                speedMps: msg.speed_mps,
                headingDeg: msg.heading_deg,
                velocity: {
                    vx: msg.extra?.vx ?? null,
                    vy: msg.extra?.vy ?? null,
                    vz: msg.extra?.vz ?? null,
                },
            },
        };
    }

    static toActiveDroneStateFromDJIMini3Pro(msg: any): Partial<ActiveDroneState> {
        //         {
        //     "latitude": 10.76315,
        //     "longitude": 106.66542,
        //     "altitude": 48.6,
        //     "heading": 132.4,
        //     "speed": 11.8,
        //     "battery": 67
        // }

        // {
        //     "timestamp": "14:34:42.708",
        //     "latitude": 0,
        //     "longitude": 0,
        //     "gps_valid": false,
        //     "altitude_m": 0,
        //     "battery_percent": 66,
        //     "speed_mps": 0,
        //     "heading_deg": 176,
        //     "is_flying": false,
        //     "flight_mode": "P-GPS",
        //     "gps_signal_level": "LEVEL_0",
        //     "satellite_count": 6
        // }

        return {
            position: {
                lat: msg.latitude,
                lng: msg.longitude,
                altitudeM: msg?.altitude_m,
                relativeAltitudeM: msg.altitude_m ?? null,
            },
            motion: {
                speedMps: msg.speed_mps ?? null,
                headingDeg: msg.heading_deg ?? null,
                velocity: {
                    vx: msg.extra?.vx ?? null,
                    vy: msg.extra?.vy ?? null,
                    vz: msg.extra?.vz ?? null,
                },
            },
            battery: {
                remainingPercent: msg.battery_percent ?? null,
            },
        };
    }

    /**
     * Optional guard for unknown payloads
     * Useful if WS payloads are not trusted
     */
    static isValid(msg: unknown): msg is RawDroneTelemetry {
        if (!msg || typeof msg !== 'object') return false;

        const m = msg as Record<string, unknown>;

        return (
            typeof m.lat === 'number' &&
            typeof m.lng === 'number' &&
            typeof m.altitude_m === 'number' &&
            typeof m.speed_mps === 'number' &&
            typeof m.heading_deg === 'number'
        );
    }
}
