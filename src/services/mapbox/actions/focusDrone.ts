import mapboxgl from 'mapbox-gl';

export function focusDrone(
    map: mapboxgl.Map,
    droneId: string,
    options?: {
        zoom?: number;
        durationMs?: number;
        bearing?: boolean;
        pitch?: number;
    },
    onFocused: Function,
) {
    const source = map.getSource('drones') as mapboxgl.GeoJSONSource;
    if (!source) return;

    const data = source._data as GeoJSON.FeatureCollection;
    const feature = data.features.find(f => f.properties?.id === droneId);

    if (!feature || feature.geometry.type !== 'Point') return;

    const [lng, lat] = feature.geometry.coordinates as [number, number];

    map.easeTo({
        center: [lng, lat],
        zoom: options?.zoom ?? Math.max(map.getZoom(), 16),
        bearing: options?.bearing
            ? (feature.properties?.heading ?? map.getBearing())
            : map.getBearing(),
        pitch: options?.pitch ?? map.getPitch(),
        duration: options?.durationMs ?? 800,
    });

    onFocused();
}
