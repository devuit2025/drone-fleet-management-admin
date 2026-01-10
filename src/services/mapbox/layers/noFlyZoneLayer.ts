// map/layers/noFlyZoneLayer.ts
import mapboxgl from 'mapbox-gl';
import { NoFlyZoneClient, type NoFlyZone } from '@/api/models/no-fly-zone/noFlyZoneClient';

function parseZoneToFeature(
    zone: NoFlyZone
): GeoJSON.Feature | null {
    let geom: GeoJSON.Geometry;

    if (typeof zone.geometry === 'string') {
        try {
            geom = JSON.parse(zone.geometry);
        } catch {
            console.error(`Invalid geometry for zone ${zone.id}`);
            return null;
        }
    } else {
        geom = zone.geometry;
    }

    if (!geom?.type || !('coordinates' in geom)) return null;

    return {
        type: 'Feature',
        geometry: geom,
        properties: {
            id: zone.id,
            name: zone.name,
            type: zone.zoneType,
        },
    };
}

export function renderNoFlyZones(
    map: mapboxgl.Map,
    zones: NoFlyZone[],
) {
    if (!map) return;

    const features: GeoJSON.Feature[] = zones
        .map(zone => parseZoneToFeature(zone))
        .filter(Boolean) as GeoJSON.Feature[];

    const data: GeoJSON.FeatureCollection = {
        type: 'FeatureCollection',
        features,
    };

    const sourceId = 'no-fly-zones';

    const source = map.getSource(sourceId) as mapboxgl.GeoJSONSource;
    if (source) {
        source.setData(data);
        return;
    }

    map.addSource(sourceId, { type: 'geojson', data });

    map.addLayer({
        id: 'no-fly-zones-fill',
        type: 'fill',
        source: sourceId,
        paint: {
            'fill-color': '#ef4444',
            'fill-opacity': 0.2,
        },
    });

    map.addLayer({
        id: 'no-fly-zones-stroke',
        type: 'line',
        source: sourceId,
        paint: {
            'line-color': '#ef4444',
            'line-width': 2,
            'line-opacity': 0.8,
        },
    });
}
