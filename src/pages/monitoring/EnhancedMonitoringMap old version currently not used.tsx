import { useEffect, useRef, useState } from 'react';
import mapboxgl, { type LngLatLike, type Map as MapboxMap, Popup } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DroneClient, type Drone, type DroneStatus } from '@/api/models/drone/droneClient';
import { NoFlyZoneClient, type NoFlyZone } from '@/api/models/no-fly-zone/noFlyZoneClient';
import { MissionClient, type Mission } from '@/api/models/mission/missionClient';
import {
    FlightPermitClient,
    type FlightPermit,
} from '@/api/models/flight-permit/flightPermitClient';
import { useWebSocket } from '@/providers/WebSocketProvider';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import {
    Activity,
    Battery,
    Gauge,
    MapPin,
    AlertTriangle,
    Plane,
    Layers,
    Play,
    Square,
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import {
    Tooltip as UITooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { pointFromWkt } from '@/lib/geo';
import VideoStreamModal from '@/components/VideoStreamModal';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
);

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || '';

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
    status?: DroneStatus;
    name?: string;
    batteryHistory: { time: number; value: number }[];
    altitudeHistory: { time: number; value: number }[];
    speedHistory: { time: number; value: number }[];
};

type ChartDataPoint = {
    time: number;
    value: number;
};

const MAX_HISTORY_POINTS = 50;
const TRAIL_LENGTH = 100;

export default function EnhancedMonitoringMap() {
    const mapContainer = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<MapboxMap | null>(null);
    const dronesRef = useRef<Record<string, DroneState>>({});
    const markersRef = useRef<Record<string, mapboxgl.Marker>>({});
    const [, forceRerender] = useState(0);
    const readyRef = useRef(false);
    const [mapReady, setMapReady] = useState(false);

    const [drones, setDrones] = useState<Drone[]>([]);
    const [noFlyZones, setNoFlyZones] = useState<NoFlyZone[]>([]);
    const [flightPermits, setFlightPermits] = useState<FlightPermit[]>([]);
    const [missions, setMissions] = useState<Mission[]>([]);
    const [selectedDroneId, setSelectedDroneId] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<DroneStatus | 'all'>('all');
    const [showTrails, setShowTrails] = useState(true);
    const [showNoFlyZones, setShowNoFlyZones] = useState(true);
    const [showFlightPermits, setShowFlightPermits] = useState(true);
    const [showMissions, setShowMissions] = useState(true);
    const [useFakeTelemetry, setUseFakeTelemetry] = useState(false); // Disable fake telemetry by default - use real WebSocket data
    const [observingMissionId, setObservingMissionId] = useState<number | null>(null);
    const [missionProgress, setMissionProgress] = useState<Record<string, number>>({}); // droneId -> progress %
    const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

    const { subscribe, unsubscribe, isConnected } = useWebSocket();
    const selectedDrone = selectedDroneId ? dronesRef.current[selectedDroneId] : null;

    function createDroneMarkerEl(id: string, heading = 0, status?: DroneStatus, isActive = false) {
        const el = document.createElement('div');
        el.className =
            'drone-marker w-10 h-10 rounded-full flex items-center justify-center cursor-pointer';
        el.style.transform = `rotate(${heading}deg)`;
        el.style.position = 'relative';

        const statusColor = getStatusColor(status);
        // Thêm indicator màu xanh lá nếu drone đang active
        const activeIndicator = isActive
            ? '<div class="active-indicator" style="position: absolute; top: -2px; right: -2px; width: 12px; height: 12px; background: #10b981; border: 2px solid white; border-radius: 50%; box-shadow: 0 0 4px rgba(16, 185, 129, 0.6);"></div>'
            : '';

        el.innerHTML = `
      <svg width="36" height="36" viewBox="0 0 24 24">
        <g transform="translate(12,12)">
          <path d="M0 -10 L6 8 L0 4 L-6 8 Z" fill="${statusColor}" stroke="#083344" stroke-width="0.5" />
        </g>
      </svg>
      ${activeIndicator}
    `;
        el.dataset.droneId = id;
        return el;
    }

    function getStatusColor(status?: DroneStatus): string {
        switch (status) {
            case 'flying':
                return '#10b981';
            case 'in_mission':
                return '#3b82f6';
            case 'hovering':
                return '#f59e0b';
            case 'landing':
                return '#ef4444';
            case 'maintenance':
                return '#6b7280';
            default:
                return '#0369a1';
        }
    }

    // Check if drone is actively communicating (telemetry received within last 10 seconds)
    function isDroneActive(drone: DroneState): boolean {
        if (!drone.timestamp) return false;
        const now = Date.now();
        const timeSinceLastUpdate = now - drone.timestamp;
        return timeSinceLastUpdate < 3000; // 3 seconds
    }

    function upsertMarker(drone: DroneState) {
        const { id, lon, lat, heading, status } = drone;
        const markerId = `marker-${id}`;
        const isActive = isDroneActive(drone);

        if (!mapRef.current) return;

        let marker = markersRef.current[id];
        if (!marker) {
            const el = createDroneMarkerEl(id, heading ?? 0, status, isActive);
            el.setAttribute('data-marker-id', markerId);
            marker = new mapboxgl.Marker(el).setLngLat([lon, lat]).addTo(mapRef.current);

            el.addEventListener('click', () => {
                setSelectedDroneId(id);
                showDronePopup(drone);
            });

            markersRef.current[id] = marker;
        } else {
            marker.setLngLat([lon, lat]);
            const el = marker.getElement();
            if (el) {
                el.style.transform = `rotate(${heading ?? 0}deg)`;
                const svg = el.querySelector('svg path');
                if (svg) {
                    svg.setAttribute('fill', getStatusColor(status));
                }

                // Update active indicator
                let activeIndicator = el.querySelector('.active-indicator') as HTMLElement;
                if (isActive && !activeIndicator) {
                    // Add indicator if active but doesn't exist
                    activeIndicator = document.createElement('div');
                    activeIndicator.className = 'active-indicator';
                    activeIndicator.style.cssText =
                        'position: absolute; top: -2px; right: -2px; width: 12px; height: 12px; background: #10b981; border: 2px solid white; border-radius: 50%; box-shadow: 0 0 4px rgba(16, 185, 129, 0.6);';
                    el.appendChild(activeIndicator);
                } else if (!isActive && activeIndicator) {
                    // Remove indicator if not active but exists
                    activeIndicator.remove();
                }
            }
        }
    }

    function showDronePopup(drone: DroneState) {
        if (!mapRef.current) return;

        const popup = new Popup({ offset: 25, closeButton: true }).setLngLat([drone.lon, drone.lat])
            .setHTML(`
                <div class="p-2 min-w-[200px]">
                    <h3 class="font-semibold text-sm mb-2">${drone.name || drone.id}</h3>
                    <div class="space-y-1 text-xs">
                        <div><strong>Status:</strong> ${drone.status || 'unknown'}</div>
                        <div><strong>Altitude:</strong> ${typeof drone.altitude === 'number' ? drone.altitude.toFixed(1) : (drone.altitude ?? '-')} m</div>
                        <div><strong>Speed:</strong> ${typeof drone.speed === 'number' ? drone.speed.toFixed(1) : (drone.speed ?? '-')} m/s</div>
                        <div><strong>Battery:</strong> ${drone.battery ?? '-'}%</div>
                        <div><strong>Heading:</strong> ${typeof drone.heading === 'number' ? drone.heading.toFixed(0) : (drone.heading ?? '-')}°</div>
                    </div>
                </div>
            `);

        const marker = markersRef.current[drone.id];
        if (marker) {
            marker.setPopup(popup);
        }
    }

    function updateTrailsSource() {
        if (!mapRef.current || !showTrails) return;
        const features = Object.values(dronesRef.current).map(d => ({
            type: 'Feature' as const,
            geometry: { type: 'LineString' as const, coordinates: d.path },
            properties: { id: d.id },
        }));
        const data: GeoJSON.FeatureCollection = { type: 'FeatureCollection', features };
        const source = mapRef.current.getSource('drone-trails') as mapboxgl.GeoJSONSource;
        if (source) {
            source.setData(data);
        }
    }

    function loadNoFlyZones() {
        NoFlyZoneClient.findAll()
            .then(zones => {
                console.log('Loaded no-fly zones:', zones.length);
                setNoFlyZones(zones);
                // Zones will be added to map via useEffect when map is ready
            })
            .catch(err => console.error('Failed to load no-fly zones', err));
    }

    function loadFlightPermits() {
        FlightPermitClient.findAll()
            .then(permits => {
                console.log('Loaded flight permits:', permits.length);
                setFlightPermits(permits);
                // Permits will be added to map via useEffect when map is ready
            })
            .catch(err => console.error('Failed to load flight permits', err));
    }

    function addFlightPermitsToMap(permits: FlightPermit[]) {
        if (!mapRef.current) {
            console.warn('Map not ready, cannot add flight permits');
            return;
        }

        console.log('Adding flight permits to map:', permits.length);

        const features: GeoJSON.Feature[] = permits
            .map(permit => {
                try {
                    let geom: GeoJSON.Geometry;

                    if (typeof permit.airspaceArea === 'string') {
                        const trimmed = permit.airspaceArea.trim();
                        // Try JSON parse first
                        if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
                            try {
                                geom = JSON.parse(trimmed);
                            } catch (e) {
                                console.error(
                                    `Failed to parse permit ${permit.id} geometry as JSON:`,
                                    trimmed.substring(0, 100),
                                );
                                return null;
                            }
                        } else {
                            console.error(
                                `Permit ${permit.id} geometry is not JSON format:`,
                                trimmed.substring(0, 100),
                            );
                            return null;
                        }
                    } else {
                        geom = permit.airspaceArea as any;
                    }

                    // Validate geometry
                    if (!geom || !geom.type) {
                        console.error(`Permit ${permit.id} has invalid geometry structure:`, geom);
                        return null;
                    }

                    return {
                        type: 'Feature' as const,
                        geometry: geom,
                        properties: {
                            id: permit.id,
                            name: permit.permitNumber,
                            applicant: permit.applicantName,
                        },
                    } as GeoJSON.Feature;
                } catch (e) {
                    console.error(
                        `Failed to parse permit ${permit.id} geometry:`,
                        e,
                        permit.airspaceArea,
                    );
                    return null;
                }
            })
            .filter((f): f is GeoJSON.Feature => f !== null);

        console.log('Parsed flight permit features:', features.length);

        const data: GeoJSON.FeatureCollection = { type: 'FeatureCollection', features };
        const source = mapRef.current.getSource('flight-permits') as mapboxgl.GeoJSONSource;
        if (source) {
            source.setData(data);
            console.log('Updated existing flight-permits source');
        } else {
            console.log('Creating new flight-permits source');
            mapRef.current.addSource('flight-permits', {
                type: 'geojson',
                data,
            });
            // Chỉ thêm viền, không có fill
            mapRef.current.addLayer({
                id: 'flight-permits-stroke',
                type: 'line',
                source: 'flight-permits',
                paint: {
                    'line-color': '#16a34a',
                    'line-width': 3,
                    'line-opacity': 0.8,
                },
            });
        }
    }

    function addNoFlyZonesToMap(zones: NoFlyZone[]) {
        if (!mapRef.current) {
            console.warn('Map not ready, cannot add no-fly zones');
            return;
        }

        console.log('Adding no-fly zones to map:', zones.length);

        const features: GeoJSON.Feature[] = zones
            .map(zone => {
                try {
                    let geom: GeoJSON.Geometry;

                    if (typeof zone.geometry === 'string') {
                        const trimmed = zone.geometry.trim();
                        // Try JSON parse first
                        if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
                            try {
                                geom = JSON.parse(trimmed);
                            } catch (e) {
                                console.error(
                                    `Failed to parse zone ${zone.id} geometry as JSON:`,
                                    trimmed.substring(0, 100),
                                );
                                return null;
                            }
                        } else {
                            console.error(
                                `Zone ${zone.id} geometry is not JSON format:`,
                                trimmed.substring(0, 100),
                            );
                            return null;
                        }
                    } else {
                        geom = zone.geometry;
                    }

                    // Validate geometry
                    if (!geom || !geom.type) {
                        console.error(`Zone ${zone.id} has invalid geometry structure:`, geom);
                        return null;
                    }

                    // Check if geometry has coordinates (Polygon, LineString, Point, etc.)
                    if ('coordinates' in geom && !Array.isArray((geom as any).coordinates)) {
                        console.error(
                            `Zone ${zone.id} geometry coordinates is not an array:`,
                            geom,
                        );
                        return null;
                    }

                    return {
                        type: 'Feature' as const,
                        geometry: geom,
                        properties: { id: zone.id, name: zone.name, type: zone.zoneType },
                    } as GeoJSON.Feature;
                } catch (e) {
                    console.error(`Failed to parse zone ${zone.id} geometry:`, e, zone.geometry);
                    return null;
                }
            })
            .filter((f): f is GeoJSON.Feature => f !== null);

        console.log('Parsed no-fly zone features:', features.length);

        const data: GeoJSON.FeatureCollection = { type: 'FeatureCollection', features };
        const source = mapRef.current.getSource('no-fly-zones') as mapboxgl.GeoJSONSource;
        if (source) {
            source.setData(data);
            console.log('Updated existing no-fly-zones source');
        } else {
            console.log('Creating new no-fly-zones source');
            mapRef.current.addSource('no-fly-zones', {
                type: 'geojson',
                data,
            });
            mapRef.current.addLayer({
                id: 'no-fly-zones-fill',
                type: 'fill',
                source: 'no-fly-zones',
                paint: {
                    'fill-color': '#ef4444',
                    'fill-opacity': 0.2,
                },
            });
            mapRef.current.addLayer({
                id: 'no-fly-zones-stroke',
                type: 'line',
                source: 'no-fly-zones',
                paint: {
                    'line-color': '#ef4444',
                    'line-width': 2,
                    'line-opacity': 0.8,
                },
            });
        }
    }

    function loadMissions() {
        MissionClient.findAllForMonitoring()
            .then(ms => {
                console.log('Loaded missions:', ms);
                const activeMissions = ms.filter(m => m.status === 'in_progress');
                console.log('Active missions:', activeMissions);
                setMissions(activeMissions);
                // Missions will be added to map via useEffect when map is ready
            })
            .catch(err => console.error('Failed to load missions', err));
    }

    function addMissionsToMap(activeMissions: Mission[]) {
        if (!mapRef.current) {
            console.warn('Map not ready, cannot add missions');
            return;
        }

        console.log('Adding missions to map:', activeMissions.length);

        const routeColors = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444'];

        const routeFeatures: GeoJSON.Feature[] = [];
        const waypointFeatures: GeoJSON.Feature[] = [];

        activeMissions.forEach((mission, missionIdx) => {
            console.log(`Mission ${mission.id} (${mission.missionName}):`, {
                missionDrones: mission.missionDrones?.length || 0,
                missionDronesData: mission.missionDrones,
            });

            if (!mission.missionDrones || mission.missionDrones.length === 0) {
                console.warn(`Mission ${mission.id} has no missionDrones`);
                return;
            }

            mission.missionDrones.forEach((md, droneIdx) => {
                console.log(`  MissionDrone ${md.id}:`, {
                    waypoints: md.waypoints?.length || 0,
                    waypointsData: md.waypoints,
                });

                if (!md.waypoints || md.waypoints.length < 2) {
                    console.warn(`  MissionDrone ${md.id} has less than 2 waypoints`);
                    return;
                }

                const sortedWaypoints = [...md.waypoints].sort((a, b) => a.seqNumber - b.seqNumber);
                const coords = sortedWaypoints.map(wp => {
                    let geo: GeoJSON.Point;
                    if (typeof wp.geoPoint === 'string') {
                        // Try JSON first
                        if (
                            wp.geoPoint.trim().startsWith('{') ||
                            wp.geoPoint.trim().startsWith('[')
                        ) {
                            try {
                                geo = JSON.parse(wp.geoPoint);
                            } catch {
                                // If JSON fails, try PostGIS WKT format
                                const coords = pointFromWkt(wp.geoPoint);
                                if (coords) {
                                    geo = { type: 'Point', coordinates: coords };
                                } else {
                                    throw new Error(`Invalid geoPoint format: ${wp.geoPoint}`);
                                }
                            }
                        } else {
                            // PostGIS WKT format (POINT(lon lat))
                            const coords = pointFromWkt(wp.geoPoint);
                            if (coords) {
                                geo = { type: 'Point', coordinates: coords };
                            } else {
                                throw new Error(`Invalid geoPoint format: ${wp.geoPoint}`);
                            }
                        }
                    } else {
                        geo = wp.geoPoint;
                    }
                    return geo.coordinates;
                });

                const color = routeColors[(missionIdx + droneIdx) % routeColors.length];
                const droneName = md.drone?.name || `Drone ${md.droneId}`;

                // Route line
                routeFeatures.push({
                    type: 'Feature' as const,
                    geometry: { type: 'LineString' as const, coordinates: coords },
                    properties: {
                        missionId: mission.id,
                        missionName: mission.missionName,
                        droneId: md.droneId,
                        droneName,
                        color,
                    },
                });

                // Waypoint markers
                sortedWaypoints.forEach((wp, wpIdx) => {
                    let geo: GeoJSON.Point;
                    if (typeof wp.geoPoint === 'string') {
                        // Try JSON first
                        if (
                            wp.geoPoint.trim().startsWith('{') ||
                            wp.geoPoint.trim().startsWith('[')
                        ) {
                            try {
                                geo = JSON.parse(wp.geoPoint);
                            } catch {
                                // If JSON fails, try PostGIS WKT format
                                const coords = pointFromWkt(wp.geoPoint);
                                if (coords) {
                                    geo = { type: 'Point', coordinates: coords };
                                } else {
                                    console.error(`Invalid geoPoint format: ${wp.geoPoint}`);
                                    return; // Skip this waypoint
                                }
                            }
                        } else {
                            // PostGIS WKT format (POINT(lon lat))
                            const coords = pointFromWkt(wp.geoPoint);
                            if (coords) {
                                geo = { type: 'Point', coordinates: coords };
                            } else {
                                console.error(`Invalid geoPoint format: ${wp.geoPoint}`);
                                return; // Skip this waypoint
                            }
                        }
                    } else {
                        geo = wp.geoPoint;
                    }
                    waypointFeatures.push({
                        type: 'Feature' as const,
                        geometry: geo,
                        properties: {
                            missionId: mission.id,
                            missionName: mission.missionName,
                            droneId: md.droneId,
                            droneName,
                            seqNumber: wp.seqNumber,
                            altitudeM: wp.altitudeM,
                            speedMps: wp.speedMps,
                            action: wp.action,
                            isStart: wpIdx === 0,
                            isEnd: wpIdx === sortedWaypoints.length - 1,
                        },
                    });
                });
            });
        });

        console.log(
            'Route features:',
            routeFeatures.length,
            'Waypoint features:',
            waypointFeatures.length,
        );

        // Update routes
        const routesData: GeoJSON.FeatureCollection = {
            type: 'FeatureCollection',
            features: routeFeatures,
        };
        const routesSource = mapRef.current.getSource('mission-routes') as mapboxgl.GeoJSONSource;
        if (routesSource) {
            routesSource.setData(routesData);
            console.log('Updated existing mission-routes source');
        } else {
            console.log('Creating new mission-routes source');
            mapRef.current.addSource('mission-routes', {
                type: 'geojson',
                data: routesData,
            });
            mapRef.current.addLayer({
                id: 'mission-routes-layer',
                type: 'line',
                source: 'mission-routes',
                paint: {
                    'line-color': ['get', 'color'],
                    'line-width': 3,
                    'line-opacity': 0.7,
                    'line-dasharray': [2, 2],
                },
            });

            // Add click handler for routes
            mapRef.current.on('click', 'mission-routes-layer', e => {
                if (!e.features || e.features.length === 0 || !e.features[0].properties) return;
                const props = e.features[0].properties as any;
                new Popup({ offset: 25 })
                    .setLngLat(e.lngLat)
                    .setHTML(
                        `
                        <div class="p-2 min-w-[200px]">
                            <h3 class="font-semibold text-sm mb-2">${props.missionName || 'Unknown'}</h3>
                            <div class="space-y-1 text-xs">
                                <div><strong>Drone:</strong> ${props.droneName || 'Unknown'}</div>
                                <div><strong>Mission ID:</strong> ${props.missionId || 'N/A'}</div>
                            </div>
                        </div>
                    `,
                    )
                    .addTo(mapRef.current!);
            });
        }

        // Update waypoints
        const waypointsData: GeoJSON.FeatureCollection = {
            type: 'FeatureCollection',
            features: waypointFeatures,
        };
        const waypointsSource = mapRef.current.getSource(
            'mission-waypoints',
        ) as mapboxgl.GeoJSONSource;
        if (waypointsSource) {
            waypointsSource.setData(waypointsData);
        } else {
            mapRef.current.addSource('mission-waypoints', {
                type: 'geojson',
                data: waypointsData,
            });

            // Start waypoint (green)
            mapRef.current.addLayer({
                id: 'waypoints-start',
                type: 'circle',
                source: 'mission-waypoints',
                filter: ['==', ['get', 'isStart'], true],
                paint: {
                    'circle-radius': 8,
                    'circle-color': '#10b981',
                    'circle-stroke-width': 2,
                    'circle-stroke-color': '#fff',
                },
            });

            // End waypoint (red)
            mapRef.current.addLayer({
                id: 'waypoints-end',
                type: 'circle',
                source: 'mission-waypoints',
                filter: ['==', ['get', 'isEnd'], true],
                paint: {
                    'circle-radius': 8,
                    'circle-color': '#ef4444',
                    'circle-stroke-width': 2,
                    'circle-stroke-color': '#fff',
                },
            });

            // Intermediate waypoints
            mapRef.current.addLayer({
                id: 'waypoints-intermediate',
                type: 'circle',
                source: 'mission-waypoints',
                filter: ['all', ['!=', ['get', 'isStart'], true], ['!=', ['get', 'isEnd'], true]],
                paint: {
                    'circle-radius': 6,
                    'circle-color': '#6366f1',
                    'circle-stroke-width': 2,
                    'circle-stroke-color': '#fff',
                },
            });

            // Waypoint labels
            mapRef.current.addLayer({
                id: 'waypoints-labels',
                type: 'symbol',
                source: 'mission-waypoints',
                layout: {
                    'text-field': ['get', 'seqNumber'],
                    'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
                    'text-size': 12,
                    'text-offset': [0, 1.5],
                },
                paint: {
                    'text-color': '#fff',
                    'text-halo-color': '#000',
                    'text-halo-width': 1,
                },
            });

            // Click handler for waypoints
            mapRef.current.on(
                'click',
                ['waypoints-start', 'waypoints-end', 'waypoints-intermediate'],
                e => {
                    if (!e.features || e.features.length === 0 || !e.features[0].properties) return;
                    const props = e.features[0].properties as any;
                    new Popup({ offset: 25 })
                        .setLngLat(e.lngLat)
                        .setHTML(
                            `
                        <div class="p-2 min-w-[200px]">
                            <h3 class="font-semibold text-sm mb-2">Waypoint #${props.seqNumber || 'N/A'}</h3>
                            <div class="space-y-1 text-xs">
                                <div><strong>Mission:</strong> ${props.missionName || 'Unknown'}</div>
                                <div><strong>Drone:</strong> ${props.droneName || 'Unknown'}</div>
                                <div><strong>Altitude:</strong> ${props.altitudeM || 'N/A'} m</div>
                                <div><strong>Speed:</strong> ${props.speedMps || 'N/A'} m/s</div>
                                <div><strong>Action:</strong> ${props.action || 'N/A'}</div>
                            </div>
                        </div>
                    `,
                        )
                        .addTo(mapRef.current!);
                },
            );
        }
    }

    function checkNoFlyZoneViolations(_drone: DroneState) {
        if (!mapRef.current || noFlyZones.length === 0) return false;

        // Simple point-in-polygon check (you might want to use turf.js for more accurate)
        return noFlyZones.some(() => {
            // Placeholder - implement actual point-in-polygon check if needed
            return false;
        });
    }

    function calculateDroneProgress(droneId: string, mission: Mission | null): number {
        if (!mission || !mission.missionDrones) return 0;

        const missionDrone = mission.missionDrones.find(md => md.droneId?.toString() === droneId);
        if (!missionDrone || !missionDrone.waypoints || missionDrone.waypoints.length === 0)
            return 0;

        const drone = dronesRef.current[droneId];
        if (!drone) return 0;

        const sortedWaypoints = [...missionDrone.waypoints].sort(
            (a, b) => a.seqNumber - b.seqNumber,
        );

        // Find current waypoint index based on drone position
        let currentWpIndex = 0;
        let minDistance = Infinity;

        for (let i = 0; i < sortedWaypoints.length; i++) {
            const wp = sortedWaypoints[i];
            let wpCoords: [number, number];

            try {
                if (typeof wp.geoPoint === 'string') {
                    if (wp.geoPoint.trim().startsWith('{')) {
                        const parsed = JSON.parse(wp.geoPoint);
                        wpCoords = parsed.coordinates;
                    } else {
                        const coords = pointFromWkt(wp.geoPoint);
                        if (!coords) continue;
                        wpCoords = coords;
                    }
                } else {
                    wpCoords = wp.geoPoint.coordinates;
                }

                // Calculate distance
                const dx = drone.lon - wpCoords[0];
                const dy = drone.lat - wpCoords[1];
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < minDistance) {
                    minDistance = distance;
                    currentWpIndex = i;
                }
            } catch (e) {
                continue;
            }
        }

        // Calculate progress: (completed waypoints + progress to next) / total
        const completedWaypoints = currentWpIndex;
        const totalWaypoints = sortedWaypoints.length;

        // If at last waypoint, check if close enough to consider complete
        if (currentWpIndex === totalWaypoints - 1 && minDistance < 0.0001) {
            return 100;
        }

        // Estimate progress between current and next waypoint
        if (currentWpIndex < totalWaypoints - 1) {
            const currentWp = sortedWaypoints[currentWpIndex];
            const nextWp = sortedWaypoints[currentWpIndex + 1];

            let currentCoords: [number, number];
            let nextCoords: [number, number];

            try {
                if (typeof currentWp.geoPoint === 'string') {
                    if (currentWp.geoPoint.trim().startsWith('{')) {
                        currentCoords = JSON.parse(currentWp.geoPoint).coordinates;
                    } else {
                        const coords = pointFromWkt(currentWp.geoPoint);
                        if (!coords) return (completedWaypoints / totalWaypoints) * 100;
                        currentCoords = coords;
                    }
                } else {
                    currentCoords = currentWp.geoPoint.coordinates;
                }

                if (typeof nextWp.geoPoint === 'string') {
                    if (nextWp.geoPoint.trim().startsWith('{')) {
                        nextCoords = JSON.parse(nextWp.geoPoint).coordinates;
                    } else {
                        const coords = pointFromWkt(nextWp.geoPoint);
                        if (!coords) return (completedWaypoints / totalWaypoints) * 100;
                        nextCoords = coords;
                    }
                } else {
                    nextCoords = nextWp.geoPoint.coordinates;
                }

                // Calculate progress between waypoints
                const segmentLength = Math.sqrt(
                    Math.pow(nextCoords[0] - currentCoords[0], 2) +
                        Math.pow(nextCoords[1] - currentCoords[1], 2),
                );
                const distanceToCurrent = Math.sqrt(
                    Math.pow(drone.lon - currentCoords[0], 2) +
                        Math.pow(drone.lat - currentCoords[1], 2),
                );

                const segmentProgress =
                    segmentLength > 0 ? Math.min(1, distanceToCurrent / segmentLength) : 0;
                return ((completedWaypoints + segmentProgress) / totalWaypoints) * 100;
            } catch (e) {
                return (completedWaypoints / totalWaypoints) * 100;
            }
        }

        return (completedWaypoints / totalWaypoints) * 100;
    }

    function startObservingMission(missionId: number) {
        setObservingMissionId(missionId);
        const mission = missions.find(m => m.id === missionId);
        if (mission && mission.missionDrones) {
            // Focus map on mission area
            const allWaypoints = mission.missionDrones.flatMap(md => md.waypoints || []);
            if (allWaypoints.length > 0) {
                const sorted = [...allWaypoints].sort((a, b) => a.seqNumber - b.seqNumber);
                const firstWp = sorted[0];
                try {
                    let coords: [number, number];
                    if (typeof firstWp.geoPoint === 'string') {
                        if (firstWp.geoPoint.trim().startsWith('{')) {
                            coords = JSON.parse(firstWp.geoPoint).coordinates;
                        } else {
                            const parsed = pointFromWkt(firstWp.geoPoint);
                            if (parsed) coords = parsed;
                            else return;
                        }
                    } else {
                        coords = firstWp.geoPoint.coordinates;
                    }
                    mapRef.current?.flyTo({
                        center: coords,
                        zoom: 14,
                    });
                } catch (e) {
                    console.error('Failed to focus on mission:', e);
                }
            }
        }
    }

    function stopObservingMission() {
        setObservingMissionId(null);
        setMissionProgress({});
    }

    function processTelemetry(payload: DroneTelemetry | DroneTelemetry[]) {
        const items = Array.isArray(payload) ? payload : [payload];
        let anyChange = false;

        for (const t of items) {
            const id = t.id;
            const lon = t.lon;
            const lat = t.lat;
            const heading = t.heading ?? 0;
            const now = Date.now();

            let current = dronesRef.current[id];
            if (!current) {
                const drone = drones.find(d => d.id.toString() === id || d.serialNumber === id);
                current = {
                    ...t,
                    path: [[lon, lat]],
                    status: drone?.status,
                    name: drone?.name,
                    batteryHistory: t.battery ? [{ time: now, value: t.battery }] : [],
                    altitudeHistory: t.altitude ? [{ time: now, value: t.altitude }] : [],
                    speedHistory: t.speed ? [{ time: now, value: t.speed }] : [],
                } as DroneState;
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

                if (t.battery !== undefined) {
                    current.batteryHistory.push({ time: now, value: t.battery });
                    if (current.batteryHistory.length > MAX_HISTORY_POINTS) {
                        current.batteryHistory.shift();
                    }
                }
                if (t.altitude !== undefined) {
                    current.altitudeHistory.push({ time: now, value: t.altitude });
                    if (current.altitudeHistory.length > MAX_HISTORY_POINTS) {
                        current.altitudeHistory.shift();
                    }
                }
                if (t.speed !== undefined) {
                    current.speedHistory.push({ time: now, value: t.speed });
                    if (current.speedHistory.length > MAX_HISTORY_POINTS) {
                        current.speedHistory.shift();
                    }
                }
            }

            upsertMarker(current);
            if (checkNoFlyZoneViolations(current)) {
                console.warn(`Drone ${id} is in no-fly zone!`);
            }
            anyChange = true;
        }

        if (anyChange) {
            updateTrailsSource();
            forceRerender(s => s + 1);
        }
    }

    useEffect(() => {
        DroneClient.findAll().then(setDrones).catch(console.error);
        loadNoFlyZones();
        loadFlightPermits();
        loadMissions();
    }, []);

    // Populate dronesRef.current from drones state (even without telemetry)
    useEffect(() => {
        drones.forEach(drone => {
            const id = drone.id.toString();
            if (!dronesRef.current[id]) {
                // Initialize drone state even without telemetry data
                // Use default location (center of map) if no telemetry available
                dronesRef.current[id] = {
                    id,
                    lat: 10.7626, // Default to map center
                    lon: 106.6648,
                    altitude: undefined,
                    heading: undefined,
                    speed: undefined,
                    battery: undefined,
                    timestamp: Date.now(),
                    path: [],
                    status: drone.status,
                    name: drone.name,
                    batteryHistory: [],
                    altitudeHistory: [],
                    speedHistory: [],
                } as DroneState;
            } else {
                // Update existing drone with API data (status, name)
                dronesRef.current[id].status = drone.status;
                dronesRef.current[id].name = drone.name;
            }
        });
        // Force re-render to update visible drones
        forceRerender(s => s + 1);
    }, [drones]);

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
                setMapReady(true);

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

                // Zones and missions will be added via useEffect when data is ready
            });
        }

        // Only subscribe to real socket events if not using fake telemetry
        if (!useFakeTelemetry) {
            const handleLocationUpdate = (data: { droneId: string; location: any }) => {
                const loc = data.location;
                processTelemetry({
                    id: data.droneId,
                    lat: loc.latitude ?? loc.lat,
                    lon: loc.longitude ?? loc.lon,
                    altitude: loc.altitude,
                    heading: loc.heading,
                    speed: loc.speed,
                    battery: loc.battery,
                    timestamp: Date.now(),
                });
            };

            const handleTelemetryData = (data: { droneId: string; telemetry: any }) => {
                // Handle raw telemetry data from Android app (fallback)
                if (data.telemetry && data.droneId) {
                    processTelemetry({
                        id: data.droneId,
                        lat: data.telemetry.latitude,
                        lon: data.telemetry.longitude,
                        altitude: data.telemetry.altitude_m,
                        heading: data.telemetry.heading_deg,
                        speed: data.telemetry.speed_mps,
                        battery: data.telemetry.battery_percent,
                        timestamp: Date.now(),
                    });
                }
            };

            const handleStatusUpdate = (data: { droneId: string; status: any }) => {
                const drone = dronesRef.current[data.droneId];
                if (drone) {
                    drone.status = data.status.status;
                    upsertMarker(drone);
                    forceRerender(s => s + 1);
                }
            };

            subscribe('drone:location_updated', handleLocationUpdate);
            subscribe('telemetry:data', handleTelemetryData);
            subscribe('drone:status_updated', handleStatusUpdate);

            return () => {
                unsubscribe('drone:location_updated', handleLocationUpdate);
                unsubscribe('telemetry:data', handleTelemetryData);
                unsubscribe('drone:status_updated', handleStatusUpdate);
            };
        } else {
            console.log('Using fake telemetry mode');
        }
    }, [useFakeTelemetry, subscribe, unsubscribe]);

    // Fake telemetry generator
    useEffect(() => {
        if (!useFakeTelemetry || !mapReady) return;

        const fakeDroneStates = new Map<
            string,
            {
                missionId: number;
                missionDrone: any;
                waypoints: any[];
                currentWaypointIndex: number;
                progress: number; // 0-1 between waypoints
                speed: number;
                battery: number;
            }
        >();

        // Initialize fake drones from active missions
        const activeMissions = missions.filter(m => m.status === 'in_progress');
        activeMissions.forEach(mission => {
            if (!mission.missionDrones || mission.missionDrones.length === 0) return;

            mission.missionDrones.forEach((md, idx) => {
                if (!md.waypoints || md.waypoints.length < 2) return;

                const sortedWaypoints = [...md.waypoints].sort((a, b) => a.seqNumber - b.seqNumber);
                const droneId = md.droneId?.toString() || `fake-${mission.id}-${idx}`;

                fakeDroneStates.set(droneId, {
                    missionId: mission.id,
                    missionDrone: md,
                    waypoints: sortedWaypoints,
                    currentWaypointIndex: 0,
                    progress: 0,
                    speed: sortedWaypoints[0]?.speedMps || 10,
                    battery: 100 - idx * 10, // Different battery levels
                });
            });
        });

        // If no missions, create some random fake drones
        if (fakeDroneStates.size === 0 && drones.length > 0) {
            drones.slice(0, 3).forEach((drone, idx) => {
                const centerLat = 10.7626;
                const centerLon = 106.6648;
                const radius = 0.01; // ~1km

                const waypoints = Array.from({ length: 5 }, (_, i) => ({
                    seqNumber: i,
                    geoPoint: {
                        type: 'Point',
                        coordinates: [
                            centerLon + radius * Math.cos((i * 2 * Math.PI) / 5),
                            centerLat + radius * Math.sin((i * 2 * Math.PI) / 5),
                        ],
                    },
                    altitudeM: 50 + i * 10,
                    speedMps: 8 + Math.random() * 4,
                }));

                fakeDroneStates.set(drone.id.toString(), {
                    missionId: 0,
                    missionDrone: { droneId: drone.id },
                    waypoints,
                    currentWaypointIndex: 0,
                    progress: 0,
                    speed: waypoints[0].speedMps,
                    battery: 100 - idx * 15,
                });
            });
        }

        const interval = setInterval(() => {
            fakeDroneStates.forEach((state, droneId) => {
                const { waypoints, currentWaypointIndex, progress } = state;

                if (waypoints.length === 0) return;

                const currentWp = waypoints[currentWaypointIndex];
                const nextWp = waypoints[(currentWaypointIndex + 1) % waypoints.length];

                // Parse waypoint coordinates
                let currentCoords: [number, number];
                let nextCoords: [number, number];

                try {
                    if (typeof currentWp.geoPoint === 'string') {
                        if (currentWp.geoPoint.trim().startsWith('{')) {
                            const parsed = JSON.parse(currentWp.geoPoint);
                            currentCoords = parsed.coordinates;
                        } else {
                            const coords = pointFromWkt(currentWp.geoPoint);
                            if (!coords) return;
                            currentCoords = coords;
                        }
                    } else {
                        currentCoords = currentWp.geoPoint.coordinates;
                    }

                    if (typeof nextWp.geoPoint === 'string') {
                        if (nextWp.geoPoint.trim().startsWith('{')) {
                            const parsed = JSON.parse(nextWp.geoPoint);
                            nextCoords = parsed.coordinates;
                        } else {
                            const coords = pointFromWkt(nextWp.geoPoint);
                            if (!coords) return;
                            nextCoords = coords;
                        }
                    } else {
                        nextCoords = nextWp.geoPoint.coordinates;
                    }
                } catch (e) {
                    console.error('Failed to parse waypoint:', e);
                    return;
                }

                // Interpolate position
                const newProgress = progress + 0.02; // Move 2% per update
                const finalProgress = newProgress > 1 ? 0 : newProgress;

                const lon = currentCoords[0] + (nextCoords[0] - currentCoords[0]) * finalProgress;
                const lat = currentCoords[1] + (nextCoords[1] - currentCoords[1]) * finalProgress;

                // Calculate heading
                const dx = nextCoords[0] - currentCoords[0];
                const dy = nextCoords[1] - currentCoords[1];
                const heading = (Math.atan2(dy, dx) * 180) / Math.PI;

                // Update state
                state.progress = finalProgress;
                if (finalProgress === 0) {
                    state.currentWaypointIndex = (currentWaypointIndex + 1) % waypoints.length;
                }

                // Gradually decrease battery
                state.battery = Math.max(20, state.battery - 0.1);

                // Send fake telemetry
                processTelemetry({
                    id: droneId,
                    lat,
                    lon,
                    altitude: currentWp.altitudeM || 50,
                    heading,
                    speed: state.speed,
                    battery: Math.round(state.battery),
                    timestamp: Date.now(),
                });

                // Update progress if observing a mission
                if (observingMissionId && state.missionId === observingMissionId) {
                    const mission = missions.find(m => m.id === observingMissionId);
                    if (mission) {
                        const progress = calculateDroneProgress(droneId, mission);
                        setMissionProgress(prev => ({ ...prev, [droneId]: progress }));
                    }
                }
            });
        }, 500); // Update every 500ms

        return () => {
            clearInterval(interval);
        };
    }, [useFakeTelemetry, mapReady, missions, drones, observingMissionId]);

    // Update progress for observed mission drones periodically
    useEffect(() => {
        if (!observingMissionId || !mapReady) return;

        const mission = missions.find(m => m.id === observingMissionId);
        if (!mission || !mission.missionDrones) return;

        const updateProgress = () => {
            const progressUpdates: Record<string, number> = {};
            mission.missionDrones?.forEach(md => {
                const droneId = md.droneId?.toString();
                if (!droneId) return;

                const drone = dronesRef.current[droneId];
                if (drone) {
                    progressUpdates[droneId] = calculateDroneProgress(droneId, mission);
                }
            });

            if (Object.keys(progressUpdates).length > 0) {
                setMissionProgress(prev => ({ ...prev, ...progressUpdates }));
            }
        };

        // Update immediately
        updateProgress();

        // Update every second
        const interval = setInterval(updateProgress, 1000);

        return () => clearInterval(interval);
    }, [observingMissionId, missions, mapReady]);

    useEffect(() => {
        if (mapRef.current && readyRef.current) {
            const layer = mapRef.current.getLayer('trails-layer');
            if (layer) {
                mapRef.current.setLayoutProperty(
                    'trails-layer',
                    'visibility',
                    showTrails ? 'visible' : 'none',
                );
            }
        }
    }, [showTrails]);

    useEffect(() => {
        if (mapRef.current && readyRef.current) {
            const fillLayer = mapRef.current.getLayer('no-fly-zones-fill');
            const strokeLayer = mapRef.current.getLayer('no-fly-zones-stroke');
            if (fillLayer) {
                mapRef.current.setLayoutProperty(
                    'no-fly-zones-fill',
                    'visibility',
                    showNoFlyZones ? 'visible' : 'none',
                );
            }
            if (strokeLayer) {
                mapRef.current.setLayoutProperty(
                    'no-fly-zones-stroke',
                    'visibility',
                    showNoFlyZones ? 'visible' : 'none',
                );
            }
        }
    }, [showNoFlyZones]);

    useEffect(() => {
        if (mapRef.current && readyRef.current) {
            const strokeLayer = mapRef.current.getLayer('flight-permits-stroke');
            if (strokeLayer) {
                mapRef.current.setLayoutProperty(
                    'flight-permits-stroke',
                    'visibility',
                    showFlightPermits ? 'visible' : 'none',
                );
            }
        }
    }, [showFlightPermits]);

    // Add no-fly zones to map when zones data or map is ready
    useEffect(() => {
        if (mapRef.current && mapReady && noFlyZones.length > 0) {
            console.log('Adding no-fly zones to map:', noFlyZones.length);
            addNoFlyZonesToMap(noFlyZones);
        }
    }, [noFlyZones, mapReady]);

    // Add flight permits to map when permits data or map is ready
    useEffect(() => {
        if (mapRef.current && mapReady && flightPermits.length > 0) {
            console.log('Adding flight permits to map:', flightPermits.length);
            addFlightPermitsToMap(flightPermits);
        }
    }, [flightPermits, mapReady]);

    // Add missions to map when missions data or map is ready
    useEffect(() => {
        if (mapRef.current && mapReady && missions.length > 0) {
            const activeMissions = missions.filter(m => m.status === 'in_progress');
            if (activeMissions.length > 0) {
                console.log('Adding missions to map:', activeMissions.length);
                addMissionsToMap(activeMissions);
            }
        }
    }, [missions, mapReady]);

    useEffect(() => {
        if (mapRef.current && readyRef.current) {
            const visibility = showMissions ? 'visible' : 'none';
            const routeLayer = mapRef.current.getLayer('mission-routes-layer');
            if (routeLayer) {
                mapRef.current.setLayoutProperty('mission-routes-layer', 'visibility', visibility);
            }
            const waypointLayers = [
                'waypoints-start',
                'waypoints-end',
                'waypoints-intermediate',
                'waypoints-labels',
            ];
            waypointLayers.forEach(layerId => {
                const layer = mapRef.current!.getLayer(layerId);
                if (layer) {
                    mapRef.current!.setLayoutProperty(layerId, 'visibility', visibility);
                }
            });
        }
    }, [showMissions]);

    const observedMission = observingMissionId
        ? missions.find(m => m.id === observingMissionId)
        : null;
    const observedMissionDroneIds =
        observedMission?.missionDrones?.map(md => md.droneId?.toString()).filter(Boolean) || [];

    const visibleDrones = Object.values(dronesRef.current).filter(d => {
        // If observing a mission, only show drones in that mission
        if (observingMissionId && !observedMissionDroneIds.includes(d.id)) {
            return false;
        }

        if (statusFilter === 'all') return true;
        return d.status === statusFilter;
    });

    const metrics = {
        total: Object.keys(dronesRef.current).length,
        flying: Object.values(dronesRef.current).filter(d => d.status === 'flying').length,
        avgBattery:
            Object.values(dronesRef.current).reduce((sum, d) => sum + (d.battery ?? 0), 0) /
            Math.max(visibleDrones.length, 1),
        inMission: Object.values(dronesRef.current).filter(d => d.status === 'in_mission').length,
    };

    const prepareChartData = (history: ChartDataPoint[], label: string, color: string) => {
        if (history.length === 0) {
            return {
                labels: [],
                datasets: [
                    {
                        label,
                        data: [],
                        borderColor: color,
                        backgroundColor: `${color}20`,
                        fill: true,
                        tension: 0.4,
                    },
                ],
            };
        }

        const labels = history.map((_, i) => {
            const time = new Date(history[i].time);
            return `${time.getMinutes()}:${time.getSeconds().toString().padStart(2, '0')}`;
        });

        return {
            labels,
            datasets: [
                {
                    label,
                    data: history.map(h => h.value),
                    borderColor: color,
                    backgroundColor: `${color}20`,
                    fill: true,
                    tension: 0.4,
                },
            ],
        };
    };

    return (
        <div className="w-full h-screen flex">
            <div ref={mapContainer} className="flex-1 relative" />

            <aside className="w-96 p-4 bg-white border-l border-slate-200 overflow-y-auto">
                <div className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="w-5 h-5" />
                                Monitoring Dashboard
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-2">
                                <div className="p-2 bg-blue-50 rounded">
                                    <div className="text-xs text-slate-600">Total</div>
                                    <div className="text-xl font-bold">{metrics.total}</div>
                                </div>
                                <div className="p-2 bg-green-50 rounded">
                                    <div className="text-xs text-slate-600">Flying</div>
                                    <div className="text-xl font-bold">{metrics.flying}</div>
                                </div>
                                <div className="p-2 bg-purple-50 rounded">
                                    <div className="text-xs text-slate-600">In Mission</div>
                                    <div className="text-xl font-bold">{metrics.inMission}</div>
                                </div>
                                <div className="p-2 bg-orange-50 rounded">
                                    <div className="text-xs text-slate-600">Avg Battery</div>
                                    <div className="text-xl font-bold">
                                        {metrics.avgBattery.toFixed(0)}%
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">Filters & Layers</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <Label>Status Filter</Label>
                                <Select
                                    value={statusFilter}
                                    onValueChange={v => setStatusFilter(v as any)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All</SelectItem>
                                        <SelectItem value="available">Available</SelectItem>
                                        <SelectItem value="flying">Flying</SelectItem>
                                        <SelectItem value="in_mission">In Mission</SelectItem>
                                        <SelectItem value="hovering">Hovering</SelectItem>
                                        <SelectItem value="landing">Landing</SelectItem>
                                        <SelectItem value="maintenance">Maintenance</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-center justify-between">
                                <Label htmlFor="trails" className="flex items-center gap-2">
                                    <Layers className="w-4 h-4" />
                                    Show Trails
                                </Label>
                                <Switch
                                    id="trails"
                                    checked={showTrails}
                                    onCheckedChange={setShowTrails}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <Label htmlFor="zones" className="flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4" />
                                    No-Fly Zones
                                </Label>
                                <Switch
                                    id="zones"
                                    checked={showNoFlyZones}
                                    onCheckedChange={setShowNoFlyZones}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <Label htmlFor="permits" className="flex items-center gap-2">
                                    <Plane className="w-4 h-4" />
                                    Flight Permits
                                </Label>
                                <Switch
                                    id="permits"
                                    checked={showFlightPermits}
                                    onCheckedChange={setShowFlightPermits}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <Label htmlFor="missions" className="flex items-center gap-2">
                                    <Plane className="w-4 h-4" />
                                    Mission Routes
                                </Label>
                                <Switch
                                    id="missions"
                                    checked={showMissions}
                                    onCheckedChange={setShowMissions}
                                />
                            </div>

                            <div className="flex items-center justify-between mt-2 pt-2 border-t">
                                <Label htmlFor="fake-telemetry" className="flex items-center gap-2">
                                    <Activity className="w-4 h-4" />
                                    Fake Telemetry
                                </Label>
                                <Switch
                                    id="fake-telemetry"
                                    checked={useFakeTelemetry}
                                    onCheckedChange={setUseFakeTelemetry}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {observingMissionId && observedMission && (
                        <Card className="mb-4 border-blue-500 bg-blue-50">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-sm flex items-center gap-2">
                                        <Plane className="w-4 h-4" />
                                        Observing: {observedMission.missionName}
                                    </CardTitle>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={stopObservingMission}
                                    >
                                        <Square className="w-3 h-3 mr-1" />
                                        Stop
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {observedMission.missionDrones?.map(md => {
                                    const droneId = md.droneId?.toString();
                                    const progress = droneId ? missionProgress[droneId] || 0 : 0;
                                    const droneName = md.drone?.name || `Drone ${md.droneId}`;
                                    const waypointCount = md.waypoints?.length || 0;

                                    return (
                                        <div key={md.id} className="mb-3 last:mb-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-sm font-medium">
                                                    {droneName}
                                                </span>
                                                <span className="text-xs text-slate-600">
                                                    {progress.toFixed(1)}%
                                                </span>
                                            </div>
                                            <Progress value={progress} className="h-2" />
                                            <div className="text-xs text-slate-500 mt-1">
                                                {waypointCount} waypoints
                                            </div>
                                        </div>
                                    );
                                })}
                            </CardContent>
                        </Card>
                    )}

                    <Tabs defaultValue="list" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="list">Drones</TabsTrigger>
                            <TabsTrigger value="missions">Missions</TabsTrigger>
                            <TabsTrigger value="charts">Charts</TabsTrigger>
                        </TabsList>

                        <TabsContent value="missions" className="space-y-2">
                            <div className="max-h-[400px] overflow-auto space-y-2">
                                {missions.length === 0 ? (
                                    <div className="text-sm text-slate-500 text-center py-4">
                                        No missions found
                                    </div>
                                ) : (
                                    missions.map(mission => (
                                        <Card
                                            key={mission.id}
                                            className={`transition-colors ${
                                                observingMissionId === mission.id
                                                    ? 'ring-2 ring-blue-500 bg-blue-50'
                                                    : ''
                                            }`}
                                        >
                                            <CardContent className="p-3">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="font-medium text-sm">
                                                            {mission.missionName}
                                                        </div>
                                                        <div className="text-xs text-slate-500 mt-1">
                                                            Status: {mission.status}
                                                        </div>
                                                        <div className="text-xs text-slate-500">
                                                            {mission.missionDrones?.length || 0}{' '}
                                                            drone(s)
                                                        </div>
                                                        {observingMissionId === mission.id && (
                                                            <div className="mt-2 space-y-1">
                                                                {mission.missionDrones?.map(md => {
                                                                    const droneId =
                                                                        md.droneId?.toString();
                                                                    const progress = droneId
                                                                        ? missionProgress[
                                                                              droneId
                                                                          ] || 0
                                                                        : 0;
                                                                    const droneName =
                                                                        md.drone?.name ||
                                                                        `Drone ${md.droneId}`;
                                                                    return (
                                                                        <div key={md.id}>
                                                                            <div className="flex items-center justify-between text-xs mb-0.5">
                                                                                <span>
                                                                                    {droneName}
                                                                                </span>
                                                                                <span className="font-medium">
                                                                                    {progress.toFixed(
                                                                                        1,
                                                                                    )}
                                                                                    %
                                                                                </span>
                                                                            </div>
                                                                            <Progress
                                                                                value={progress}
                                                                                className="h-1.5"
                                                                            />
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="ml-2">
                                                        {observingMissionId === mission.id ? (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={stopObservingMission}
                                                            >
                                                                <Square className="w-3 h-3" />
                                                            </Button>
                                                        ) : (
                                                            <Button
                                                                size="sm"
                                                                onClick={() =>
                                                                    startObservingMission(
                                                                        mission.id,
                                                                    )
                                                                }
                                                                disabled={
                                                                    !mission.missionDrones ||
                                                                    mission.missionDrones.length ===
                                                                        0
                                                                }
                                                            >
                                                                <Play className="w-3 h-3" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value="list" className="space-y-2">
                            <div className="max-h-[400px] overflow-auto space-y-2">
                                {visibleDrones.map(d => (
                                    <Card
                                        key={d.id}
                                        className={`cursor-pointer transition-colors ${
                                            selectedDroneId === d.id ? 'ring-2 ring-blue-500' : ''
                                        }`}
                                        onClick={() => {
                                            setSelectedDroneId(d.id);
                                            mapRef.current?.flyTo({
                                                center: [d.lon, d.lat],
                                                zoom: 16,
                                            });
                                        }}
                                    >
                                        <CardContent className="p-3">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="font-medium text-sm flex items-center gap-2">
                                                        {d.name || d.id}
                                                        {isDroneActive(d) && (
                                                            <div
                                                                className="w-2 h-2 rounded-full bg-green-500 animate-pulse"
                                                                title="Đang giao tiếp với server"
                                                            />
                                                        )}
                                                    </div>
                                                    <div className="text-xs text-slate-500 mt-1">
                                                        {d.lat.toFixed(5)}, {d.lon.toFixed(5)}
                                                    </div>
                                                    <div className="flex gap-2 mt-2">
                                                        <Badge
                                                            variant="outline"
                                                            className="text-xs"
                                                        >
                                                            {d.status || 'unknown'}
                                                        </Badge>
                                                        {isDroneActive(d) && (
                                                            <Badge
                                                                variant="outline"
                                                                className="text-xs bg-green-50 text-green-700 border-green-300"
                                                            >
                                                                Active
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <div className="mt-2">
                                                        <TooltipProvider>
                                                            <UITooltip>
                                                                <TooltipTrigger asChild>
                                                                    <span className="w-full">
                                                                        <Button
                                                                            size="sm"
                                                                            variant="outline"
                                                                            className="w-full"
                                                                            disabled={
                                                                                !(
                                                                                    isConnected ??
                                                                                    false
                                                                                )
                                                                            }
                                                                            onClick={e => {
                                                                                e.stopPropagation();
                                                                                if (isConnected) {
                                                                                    setSelectedDroneId(
                                                                                        d.id,
                                                                                    );
                                                                                    setIsVideoModalOpen(
                                                                                        true,
                                                                                    );
                                                                                }
                                                                            }}
                                                                        >
                                                                            Access
                                                                        </Button>
                                                                    </span>
                                                                </TooltipTrigger>
                                                                {!isConnected && (
                                                                    <TooltipContent>
                                                                        <p>
                                                                            WebSocket chưa kết nối.
                                                                            Vui lòng đợi...
                                                                        </p>
                                                                    </TooltipContent>
                                                                )}
                                                            </UITooltip>
                                                        </TooltipProvider>
                                                    </div>
                                                </div>
                                                <div className="text-right text-xs space-y-1">
                                                    <div className="flex items-center gap-1">
                                                        <Battery className="w-3 h-3" />
                                                        {d.battery ?? '-'}%
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Gauge className="w-3 h-3" />
                                                        {typeof d.speed === 'number'
                                                            ? d.speed.toFixed(1)
                                                            : (d.speed ?? '-')}{' '}
                                                        m/s
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Activity className="w-3 h-3" />
                                                        {typeof d.altitude === 'number'
                                                            ? d.altitude.toFixed(1)
                                                            : (d.altitude ?? '-')}{' '}
                                                        m
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                                {visibleDrones.length === 0 && (
                                    <div className="text-sm text-slate-500 text-center py-4">
                                        No drones found
                                    </div>
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value="charts">
                            {selectedDrone ? (
                                <div className="space-y-4">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-sm">Battery Level</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <Line
                                                data={prepareChartData(
                                                    selectedDrone.batteryHistory,
                                                    'Battery %',
                                                    '#f59e0b',
                                                )}
                                                options={{
                                                    responsive: true,
                                                    maintainAspectRatio: false,
                                                    plugins: { legend: { display: false } },
                                                    scales: {
                                                        y: { min: 0, max: 100 },
                                                    },
                                                }}
                                                height={100}
                                            />
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-sm">Altitude</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <Line
                                                data={prepareChartData(
                                                    selectedDrone.altitudeHistory,
                                                    'Altitude (m)',
                                                    '#10b981',
                                                )}
                                                options={{
                                                    responsive: true,
                                                    maintainAspectRatio: false,
                                                    plugins: { legend: { display: false } },
                                                }}
                                                height={100}
                                            />
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-sm">Speed</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <Line
                                                data={prepareChartData(
                                                    selectedDrone.speedHistory,
                                                    'Speed (m/s)',
                                                    '#3b82f6',
                                                )}
                                                options={{
                                                    responsive: true,
                                                    maintainAspectRatio: false,
                                                    plugins: { legend: { display: false } },
                                                }}
                                                height={100}
                                            />
                                        </CardContent>
                                    </Card>
                                </div>
                            ) : (
                                <div className="text-sm text-slate-500 text-center py-4">
                                    Select a drone to view charts
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </div>
            </aside>

            <style>{`
                .drone-marker { 
                    transform-origin: center; 
                    cursor: pointer;
                    transition: transform 0.2s;
                }
                .drone-marker:hover {
                    transform: scale(1.2) rotate(var(--heading, 0deg));
                }
            `}</style>

            {/* Video Stream Modal */}
            {selectedDroneId && (
                <VideoStreamModal
                    open={isVideoModalOpen}
                    onOpenChange={setIsVideoModalOpen}
                    droneId={selectedDroneId}
                    droneTelemetry={dronesRef.current[selectedDroneId]}
                />
            )}
        </div>
    );
}
