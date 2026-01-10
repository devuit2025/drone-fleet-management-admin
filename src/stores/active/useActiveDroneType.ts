export interface ActiveDroneState {
    droneId: any;
    missionId: any; // ← current assigned / active mission

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

    // System (very minimal for now)
    system: {
        armed: boolean;
        mode: string; // GUIDED, AUTO, STABILIZE, etc.
    };
}
