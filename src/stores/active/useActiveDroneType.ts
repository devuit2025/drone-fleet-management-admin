export interface ActiveDroneState {
    droneId: any;
    missionId: any; // ← current assigned / active mission
    name: string;

    // Timing / connection
    lastUpdate: number; // ms timestamp of last telemetry
    connected: boolean; // derived from heartbeat / freshness

    // Position (core)
    position: {
        lat: number | null;
        lng: number | null;
        altitudeM: number | null;
        relativeAltitudeM: number | null;
    };

    // Motion (core)
    motion: {
        speedMps: number | null;
        headingDeg: number | null;
        velocity: {
            vx: number | null;
            vy: number | null;
            vz: number | null;
        };
    };

    // Battery (camelCase, MAVLink-aligned)
    battery: {
        voltageMv: number | null; // SYS_STATUS.voltage_battery (mV)
        currentCa: number | null; // SYS_STATUS.current_battery (cA)
        remainingPercent: number | null; // SYS_STATUS.battery_remaining (%)

        // Optional / advanced (BATTERY_STATUS)
        temperatureCdeg?: number | null; // cdegC
        cellVoltagesMv?: number[] | null; // per-cell mV
        batteryId?: number | null;
    };

    // System (very minimal for now)
    system: {
        armed: boolean;
        mode: string; // GUIDED, AUTO, STABILIZE, etc.
    };
}
