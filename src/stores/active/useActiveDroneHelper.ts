import type { ActiveDroneState } from './useActiveDroneType';

export const createEmptyDroneState = (droneId: any): ActiveDroneState => ({
    droneId,
    missionId: null,

    lastUpdate: 0,
    connected: false,

    position: {
        lat: null,
        lng: null,
        altitudeM: null,
        relativeAltitudeM: null,
    },

    motion: {
        speedMps: null,
        headingDeg: null,
        velocity: {
            vx: null,
            vy: null,
            vz: null,
        },
    },

    system: {
        armed: false,
        mode: 'UNKNOWN',
    },
});
