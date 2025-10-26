import React, { useEffect, useRef, useState } from 'react';
import mapboxgl, { LngLatLike, Map as MapboxMap } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLocalFakeTelem } from '@/hooks/useLocalFakeTelem'; // new import

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || '';

export type DroneTelemetry = {
  id: string;
  lat: number;
  lon: number;
  altitude?: number;
  heading?: number;
  speed?: number;
  battery?: number;
  timestamp: number;
};

type DroneState = DroneTelemetry & {
  path: [number, number][];
};

export default function DroneMap() {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapboxMap | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const dronesRef = useRef<Record<string, DroneState>>({});
  const [, forceRerender] = useState(0);
  const readyRef = useRef(false);
  const TRAIL_LENGTH = 60;
  const WS_URL = import.meta.env.VITE_DRONE_WS_URL || 'ws://localhost:4000/telemetry';
  const USE_FAKE = false;

  function createDroneMarkerEl(id: string, heading = 0) {
    const el = document.createElement('div');
    el.className = 'drone-marker w-10 h-10 rounded-full flex items-center justify-center';
    el.style.transform = `rotate(${heading}deg)`;
    el.innerHTML = `
      <svg width="36" height="36" viewBox="0 0 24 24">
        <g transform="translate(12,12)">
          <path d="M0 -10 L6 8 L0 4 L-6 8 Z" fill="#0369a1" stroke="#083344" stroke-width="0.5" />
        </g>
      </svg>
    `;
    el.dataset.droneId = id;
    return el;
  }

  function upsertMarker(drone: DroneState) {
    const { id, lon, lat, heading } = drone;
    const markerId = `marker-${id}`;
    const existing = document.querySelector(`[data-marker-id="${markerId}"]`) as HTMLElement | null;
    if (existing) {
      existing.style.transform = `rotate(${heading ?? 0}deg)`;
    } else if (mapRef.current) {
      const el = createDroneMarkerEl(id, heading ?? 0);
      el.setAttribute('data-marker-id', markerId);
      const marker = new mapboxgl.Marker(el).setLngLat([lon, lat]).addTo(mapRef.current);
      (el as any).__markerInstance = marker;
    }
    const el2 = document.querySelector(`[data-marker-id="${markerId}"]`) as HTMLElement | null;
    if (el2) {
      const markerInstance = (el2 as any).__markerInstance as mapboxgl.Marker | undefined;
      if (markerInstance) markerInstance.setLngLat([lon, lat]);
    }
  }

  function updateTrailsSource() {
    if (!mapRef.current) return;
    const features = Object.values(dronesRef.current).map((d) => ({
      type: 'Feature',
      geometry: { type: 'LineString', coordinates: d.path },
      properties: { id: d.id },
    }));
    const data = { type: 'FeatureCollection', features };
    if (mapRef.current.getSource('drone-trails')) {
      (mapRef.current.getSource('drone-trails') as mapboxgl.GeoJSONSource).setData(data);
    }
  }

  function processTelemetry(payload: DroneTelemetry | DroneTelemetry[]) {
    const items = Array.isArray(payload) ? payload : [payload];
    let anyChange = false;
    for (const t of items) {
      const id = t.id;
      const lon = t.lon;
      const lat = t.lat;
      const heading = t.heading ?? 0;
      let current = dronesRef.current[id];
      if (!current) {
        current = { ...t, path: [[lon, lat]] } as DroneState;
        dronesRef.current[id] = current;
      } else {
        current.path.push([lon, lat]);
        if (current.path.length > TRAIL_LENGTH) current.path.shift();
        current.lat = lat;
        current.lon = lon;
        current.heading = heading;
        current.altitude = t.altitude ?? current.altitude;
        current.speed = t.speed ?? current.speed;
        current.battery = t.battery ?? current.battery;
        current.timestamp = t.timestamp;
      }
      upsertMarker(dronesRef.current[id]);
      anyChange = true;
    }
    if (anyChange) {
      updateTrailsSource();
      forceRerender((s) => s + 1);
    }
  }

  useEffect(() => {
    if (!mapContainer.current) return;
    if (!mapRef.current) {
      mapRef.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [106.6648, 10.7626] as LngLatLike,
        zoom: 12,
      });
      mapRef.current.on('load', () => {
        readyRef.current = true;
        mapRef.current!.addSource('drone-trails', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] },
        });
        mapRef.current!.addLayer({
          id: 'trails-layer',
          type: 'line',
          source: 'drone-trails',
          paint: { 'line-width': 3, 'line-opacity': 0.8, 'line-color': '#06b6d4' },
        });
      });
    }

    if (!USE_FAKE) {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;
      ws.addEventListener('message', (ev) => {
        try {
          const payload = JSON.parse(ev.data) as DroneTelemetry | DroneTelemetry[];
          processTelemetry(payload);
        } catch (err) {
          console.error('Failed parsing ws payload', err);
        }
      });
      return () => {
        ws.close();
        mapRef.current?.remove();
        mapRef.current = null;
      };
    }
  }, []);

  // Integrate local fake telemetry
  useLocalFakeTelem(
    USE_FAKE ? { count: 10, hz: 5 } : undefined,
    USE_FAKE ? (payload) => processTelemetry(payload) : undefined
  );

  const drones = Object.values(dronesRef.current);

  return (
    <div className="w-full h-screen flex">
      <div ref={mapContainer} className="flex-1 relative" />
      <aside className="w-80 p-4 bg-white border-l border-slate-100">
        <Card>
          <CardHeader>
            <CardTitle>Live Drones ({drones.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[70vh] overflow-auto">
              {drones.map((d) => (
                <div key={d.id} className="p-2 rounded-md hover:bg-slate-50 border">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{d.id}</div>
                      <div className="text-sm text-slate-500">{d.lat.toFixed(5)}, {d.lon.toFixed(5)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm">{d.speed?.toFixed(1) ?? '-'} m/s</div>
                      <div className="text-sm">{d.battery ?? '-'}%</div>
                    </div>
                  </div>
                  <div className="mt-2 flex gap-2">
                    <Button size="sm" onClick={() => mapRef.current?.flyTo({ center: [d.lon, d.lat], zoom: 16 })}>Focus</Button>
                    <Button size="sm" onClick={() => mapRef.current?.easeTo({ center: [d.lon, d.lat] })}>Center</Button>
                  </div>
                </div>
              ))}
              {drones.length === 0 && <div className="text-sm text-slate-500">No drones streaming yet.</div>}
            </div>
          </CardContent>
        </Card>
        <div className="mt-4 text-sm text-slate-500">
          Mode: {USE_FAKE ? 'Local Fake Telemetry' : 'WebSocket'}
        </div>
      </aside>
      <style>{`.drone-marker { transform-origin: center; cursor: pointer; }`}</style>
    </div>
  );
}
