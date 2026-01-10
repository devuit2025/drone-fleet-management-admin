import mapboxgl, { Map } from 'mapbox-gl';
import type LngLatLike from 'mapbox-gl';

/* =========================
   Config
========================= */

const DEFAULT_STYLE = 'mapbox://styles/mapbox/streets-v12';

const DEFAULT_CENTER: LngLatLike = [106.6648, 10.7626];
const DEFAULT_ZOOM = 12;

/* =========================
   Sources
========================= */

function registerSources(map: Map) {
    if (!map.getSource('drone-trails')) {
        map.addSource('drone-trails', {
            type: 'geojson',
            data: {
                type: 'FeatureCollection',
                features: [],
            },
        });
    }
}

/* =========================
   Layers
========================= */

function registerLayers(map: Map) {
    if (!map.getLayer('drone-trails-layer')) {
        map.addLayer({
            id: 'drone-trails-layer',
            type: 'line',
            source: 'drone-trails',
            paint: {
                'line-width': 3,
                'line-opacity': 0.8,
                'line-color': '#06b6d4',
            },
        });
    }
}

/* =========================
   Public Factory
========================= */

interface CreateAppMapOptions {
    container: HTMLElement;
    center?: LngLatLike;
    zoom?: number;
    style?: string;
}

export function createAppMap({
    container,
    center = DEFAULT_CENTER,
    zoom = DEFAULT_ZOOM,
    style = DEFAULT_STYLE,
    onReady,
}: CreateAppMapOptions & {
    onReady?: (map: mapboxgl.Map) => void;
}) {
    const map = new mapboxgl.Map({
        container,
        style,
        center,
        zoom,
    });

    map.on('load', () => {
        registerSources(map);
        registerLayers(map);
        
        onReady?.(map);

        
    });

    return map;
}
