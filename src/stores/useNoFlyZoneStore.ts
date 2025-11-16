import { create } from 'zustand';
import type { Feature, FeatureCollection, Polygon } from 'geojson';
import { NoFlyZoneClient, type NoFlyZone } from '@/api/models/no-fly-zone/noFlyZoneClient';

interface NoFlyZoneState {
  rawZones: NoFlyZone[];
  zones: FeatureCollection<Polygon> | null;
  loading: boolean;
  loaded: boolean;
  error?: string;
  fetchZones: () => Promise<FeatureCollection<Polygon> | null>;
  refreshZones: () => Promise<FeatureCollection<Polygon> | null>;
  setZones: (zones: FeatureCollection<Polygon> | null, raw: NoFlyZone[]) => void;
  reset: () => void;
}

function toPolygonFeature(zone: NoFlyZone): Feature<Polygon> | null {
  try {
    if (zone.zoneType !== 'polygon') {
      return null;
    }
    const geometry = typeof zone.geometry === 'string' ? JSON.parse(zone.geometry) : zone.geometry;
    if (!geometry || geometry.type !== 'Polygon' || !Array.isArray(geometry.coordinates)) {
      return null;
    }
    return {
      type: 'Feature',
      id: zone.id,
      geometry: geometry as Polygon,
      properties: {
        id: zone.id,
        name: zone.name,
        description: zone.description ?? undefined,
        zoneType: zone.zoneType,
      },
    };
  } catch (err) {
    console.warn('Failed to parse no-fly zone geometry', err);
    return null;
  }
}

export const useNoFlyZoneStore = create<NoFlyZoneState>((set, get) => ({
  rawZones: [],
  zones: null,
  loading: false,
  loaded: false,
  error: undefined,
  async fetchZones() {
    const { loading, loaded } = get();
    if (loading) {
      return get().zones ?? null;
    }
    if (loaded && get().zones) {
      return get().zones;
    }
    set({ loading: true, error: undefined });
    try {
      const response = await NoFlyZoneClient.findAll();
      const features = response
        .map(toPolygonFeature)
        .filter((feature): feature is Feature<Polygon> => !!feature);
      const featureCollection: FeatureCollection<Polygon> = {
        type: 'FeatureCollection',
        features,
      };
      set({
        rawZones: response,
        zones: featureCollection,
        loading: false,
        loaded: true,
        error: undefined,
      });
      return featureCollection;
    } catch (error: any) {
      set({ loading: false, error: error?.message ?? 'Failed to load no-fly zones' });
      throw error;
    }
  },
  async refreshZones() {
    set({ loading: true, error: undefined, loaded: false });
    try {
      const response = await NoFlyZoneClient.findAll();
      const features = response
        .map(toPolygonFeature)
        .filter((feature): feature is Feature<Polygon> => !!feature);
      const featureCollection: FeatureCollection<Polygon> = {
        type: 'FeatureCollection',
        features,
      };
      set({
        rawZones: response,
        zones: featureCollection,
        loading: false,
        loaded: true,
        error: undefined,
      });
      return featureCollection;
    } catch (error: any) {
      set({ loading: false, error: error?.message ?? 'Failed to load no-fly zones' });
      throw error;
    }
  },
  setZones(zones, raw) {
    set({ zones, rawZones: raw, loaded: true, loading: false, error: undefined });
  },
  reset() {
    set({ zones: null, rawZones: [], loaded: false, loading: false, error: undefined });
  },
}));
