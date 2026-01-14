import { useAppMap } from '@/hooks/useAppMap';
import { useParams } from 'react-router-dom';
import GroundStationOverlay from './GroundStationOverlay';
import { DroneLayerManager } from '@/services/mapbox/layers/DroneLayerManager';
import { useActiveDroneStore } from '@/stores/active/useActiveDroneStore';
import { useEffect } from 'react';
import SinglePageDJIMini3Pro from '../real_drone/SinglePageDJIMini3Pro';

export default function SingleDrone() {
    const { droneId } = useParams<{ droneId: string }>();
    //   const { mapRef, mapContainerRef } = useAppMap();

    //     // Get all drones
    //     const dronesMap = useActiveDroneStore(s => s.drones);

    //     useEffect(() => {
    //         if (!mapRef.current) return;

    //         if (droneId == import.meta.env.VITE_DJI_MINI_3_PRO_ID) {
    //             return;
    //         }

    //         // Pick the single drone by ID
    //         const activeDrone = dronesMap[droneId];
    //         if (!activeDrone) return; // nothing to render

    //         // Render single drone
    //         DroneLayerManager.render(mapRef.current, [activeDrone]);
    //     }, [mapRef, droneId, dronesMap]); // listen to mapRef, droneId, and drone data

    return (
        <div className="fixed inset-0 ">
            {droneId == import.meta.env.VITE_DJI_MINI_3_PRO_ID ? (
                <SinglePageDJIMini3Pro />
            ) : (
                <>
                    {/* MAP */}
                    {/* <div ref={mapContainerRef} className="w-full h-full" />
            <GroundStationOverlay /> */}
                </>
            )}
        </div>
    );
}
