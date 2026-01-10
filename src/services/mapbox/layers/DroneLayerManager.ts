import mapboxgl from 'mapbox-gl';
import type { ActiveDroneState } from '@/stores/active/useActiveDroneType';

const SOURCE_ID = 'drones';
const ICON_ID = 'drone-icon';

export class DroneLayerManager {
  private static initializedMaps = new WeakSet<mapboxgl.Map>();

  /* =============================
   * SINGLE ENTRY POINT
   * =============================*/
  static render(map: mapboxgl.Map, drones: ActiveDroneState[]) {
    if (!map.isStyleLoaded()) {
      map.once('style.load', () => this.render(map, drones));
      return;
    }

    if (!this.initializedMaps.has(map)) {
      this.init(map);
      this.initializedMaps.add(map);
    }

    this.update(map, drones);
  }

  /* =============================
   * INIT (run once per map)
   * =============================*/
  private static init(map: mapboxgl.Map) {
    this.addSource(map);
    this.loadIcon(map);
    this.addLayers(map);
  }

  /* =============================
   * UPDATE (safe to call often)
   * =============================*/
  private static update(map: mapboxgl.Map, drones: ActiveDroneState[]) {
    const features = drones
      .filter(d => d.connected && d.position.lat && d.position.lng)
      .map(this.toFeature);

    const source = map.getSource(SOURCE_ID) as mapboxgl.GeoJSONSource;
    source.setData({
      type: 'FeatureCollection',
      features,
    });
  }

  /* =============================
   * MAP SETUP
   * =============================*/
  private static addSource(map: mapboxgl.Map) {
    if (map.getSource(SOURCE_ID)) return;

    map.addSource(SOURCE_ID, {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: [],
      },
    });
  }

 private static loadIcon(map: mapboxgl.Map) {
  if (map.hasImage(ICON_ID)) return;

  map.loadImage('/drone.png', (err, image) => {
    if (err || !image) {
      console.error('Failed to load drone icon', err);
      return;
    }

    if (!map.hasImage(ICON_ID)) {
      map.addImage(ICON_ID, image); // ← no sdf
    }
  });
}

  private static addLayers(map: mapboxgl.Map) {
    if (map.getLayer('drone-symbol')) return;

    map.addLayer({
      id: 'drone-pulse',
      type: 'circle',
      source: SOURCE_ID,
      paint: {
        'circle-radius': 8,
        'circle-color': 'rgba(34,197,94,0.2)',
      },
    });

    map.addLayer({
      id: 'drone-symbol',
      type: 'symbol',
      source: SOURCE_ID,
      layout: {
        'icon-image': ICON_ID,
        'icon-size': [
          'interpolate',
          ['linear'],
          ['get', 'speed'],
          0, 0.5,
          20, 1.0,
          40, 1.4,
        ],
        'icon-rotate': 0,
        'icon-rotation-alignment': 'viewport',
        'icon-pitch-alignment': 'viewport',

        'icon-allow-overlap': true,
      },
    });
  }

  /* =============================
   * FEATURE MAPPING
   * =============================*/
  private static toFeature(drone: ActiveDroneState): GeoJSON.Feature {
    return {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [
          drone.position.lng!,
          drone.position.lat!,
        ],
      },
      properties: {
        id: drone.droneId,
        connected: drone.connected,
        heading: drone.motion.headingDeg,
        speed: drone.motion.speedMps,
      },
    };
  }
}
