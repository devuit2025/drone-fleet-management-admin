import { useEffect, useRef, useState } from 'react';
import { renderNoFlyZones } from '@/services/mapbox/layers/noFlyZoneLayer';
import { createAppMap } from '@/services/mapbox/createMap';
import { NoFlyZoneClient, type NoFlyZone } from '@/api/models/no-fly-zone/noFlyZoneClient';

interface UseAppMapOptions {}

export function useAppMap(options: UseAppMapOptions = {}) {
    const mapContainerRef = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<mapboxgl.Map | null>(null);

    /**
     * @noFlyZone
     */
    const [noFlyZones, setNoFlyZones] = useState<NoFlyZone[]>([]);

    /**
     * Single initial logic
     */
    useEffect(() => {
        const init = async () => {
            /**
             * @noFlyZone
             */
            const noFlyZones = await NoFlyZoneClient.findAll();
            setNoFlyZones(noFlyZones);
            handleMapInitial({ noFlyZones });
        };
        init();
    }, []);

    const handleMapInitial = (mapOptions: any) => {
        if (!mapContainerRef.current || mapRef.current) return;

        mapRef.current = createAppMap({
            container: mapContainerRef.current,
            onReady: map => {
                renderNoFlyZones(map, mapOptions.noFlyZones);
            },
        });

        return () => {
            mapRef.current?.remove();
            mapRef.current = null;
        };
    };

    return {
        mapContainerRef,
        mapRef,
    };
}
