import { useAppMap } from '@/hooks/useAppMap';
import { useParams } from 'react-router-dom';
import { DroneLayerManager } from '@/services/mapbox/layers/DroneLayerManager';
import { useActiveDroneStore } from '@/stores/active/useActiveDroneStore';
import { useCallback, useEffect, useState } from 'react';
import GroundStationOverlay from '../single/GroundStationOverlay';
import { useWebSocket } from '@/providers/WebSocketProvider';
import { DroneTelemetryMapper } from '@/services/drone/DroneTelemetryMapper';
import { MissionClient, type Mission } from '@/api/models/mission/missionClient';

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
    return (
        <div className="fixed inset-0 ">
            <div ref={mapContainerRef} className="w-full h-full" />
            <GroundStationOverlay />
        </div>
    );
}
