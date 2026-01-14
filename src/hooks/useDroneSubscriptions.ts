import { useEffect } from 'react';
import { useWebSocket } from '@/providers/WebSocketProvider';
import { useActiveDroneStore } from '@/stores/active/useActiveDroneStore';
import { DroneTelemetryMapper } from '@/services/drone/DroneTelemetryMapper';

export const useDroneSubscriptions = () => {
    const drones = useActiveDroneStore(s => s.drones);
    const { subscribe, unsubscribe } = useWebSocket();

    useEffect(() => {
        const unsubs: (() => void)[] = [];

        Object.keys(drones).forEach(droneId => {
            const topic = `drone.${droneId}.telemetry`;

            const handler = (msg: unknown) => {
                if (!DroneTelemetryMapper.isValid(msg)) return;

                const activeDroneState = DroneTelemetryMapper.toActiveDroneState(msg);
                useActiveDroneStore.getState().upsertDrone(droneId, activeDroneState);
            };

            subscribe(topic, handler);
            unsubs.push(() => unsubscribe(topic, handler));
        });

        return () => {
            unsubs.forEach(fn => fn());
        };
    }, [drones, subscribe, unsubscribe]);
};
