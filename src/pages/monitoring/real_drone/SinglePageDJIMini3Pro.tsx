import { useAppMap } from '@/hooks/useAppMap';
import { useParams } from 'react-router-dom';
import { DroneLayerManager } from '@/services/mapbox/layers/DroneLayerManager';
import { useActiveDroneStore } from '@/stores/active/useActiveDroneStore';
import { useCallback, useEffect } from 'react';
import GroundStationOverlay from '../single/GroundStationOverlay';
import { useWebSocket } from '@/providers/WebSocketProvider';
import { DroneTelemetryMapper } from '@/services/drone/DroneTelemetryMapper';

export default function SinglePageDJIMini3Pro() {
    const { droneId } = useParams<{ droneId: string }>();
    const { mapRef, mapContainerRef } = useAppMap();
    const { subscribe, unsubscribe, send, isConnected, connectionState } = useWebSocket();

    // Get all drones
    const dronesMap = useActiveDroneStore(s => s.drones);

    useEffect(() => {
        if (!mapRef.current) return;

        // Pick the single drone by ID
        const activeDrone = dronesMap[droneId];
        if (!activeDrone) return; // nothing to render

        // Render single drone
        DroneLayerManager.render(mapRef.current, [activeDrone]);
    }, [mapRef, droneId, dronesMap]); // listen to mapRef, droneId, and drone data

    useEffect(() => {
        subscribe('drone:location_updated', handleUpdateLocation);

        return () => {
            unsubscribe('drone:location_updated', handleUpdateLocation);
        };
    }, [droneId]);

    // const testSend = () => {
    //     const message = {
    //         action: 'telemetry:data',
    //         payload: {
    //             droneId: droneId,
    //             telemetry: {
    //                 latitude: 10.76315, // ~60–70m north of center
    //                 longitude: 106.66542, // ~70m east of center
    //                 altitude: 48.6, // meters AGL
    //                 heading: 132.4, // degrees (SE direction)
    //                 speed: 11.8, // m/s (~42 km/h)
    //                 battery: 67, // percent
    //             },
    //         },
    //     };

    //     send(message);
    // };
    // setInterval(() => {
    //     testSend();
    // }, 1000);

    // Subscribe to telemetry:data (fallback nếu có)
    const handleUpdateLocation = useCallback(
        (data: { droneId: string; telemetry: any } | any) => {
            const map = DroneTelemetryMapper.toActiveDroneStateFromDJIMini3Pro(data.location);
            useActiveDroneStore.getState().upsertDrone(data.droneId, map);
        },
        [droneId],
    );

    return (
        <div className="fixed inset-0 ">
            <div ref={mapContainerRef} className="w-full h-full" />
            <GroundStationOverlay />
        </div>
    );
}
