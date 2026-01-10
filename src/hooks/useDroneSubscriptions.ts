import { useEffect } from 'react';
import { useWebSocket } from '@/providers/WebSocketProvider';
import { useActiveDroneStore } from '@/stores/active/useActiveDroneStore';

// Helper to map incoming telemetry to store snapshot
const mapTelemetry = (msg: any) => ({
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
});

export const useDroneSubscriptions = () => {
    const drones = useActiveDroneStore(s => s.drones);
    const { subscribe, unsubscribe } = useWebSocket();

    useEffect(() => {
        const unsubs: (() => void)[] = [];

        // Subscribe to each drone telemetry
        Object.keys(drones).forEach(id => {
            const topic = `drone.${id}.telemetry`;

            const handler = (msg: any) => {
                useActiveDroneStore.getState().upsertDrone(id, mapTelemetry(msg));
            };

            subscribe(topic, handler);
            //   unsubs.push(() => unsubscribe(topic, handler))
        });

        // Cleanup on unmount or when drones change
        return () => {
            unsubs.forEach(fn => fn());
        };
    }, [drones, subscribe, unsubscribe]);
};
