import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Battery, Satellite, Activity, Gauge, Navigation, Radio } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useActiveDroneStore } from '@/stores/active/useActiveDroneStore';
import { MissionClient, type Mission } from '@/api/models/mission/missionClient';
import { useWebSocket } from '@/providers/WebSocketProvider';

export default function GroundStationActions() {
    const { droneId } = useParams<{ droneId: string }>();
    const { subscribe, unsubscribe, send, isConnected, connectionState } = useWebSocket();

    const activeDrone = useActiveDroneStore(s => (droneId ? s.drones[droneId] : null));

    // Guard: no drone selected or not yet loaded
    if (!activeDrone) {
        return null; // or skeleton / placeholder
    }

    const drone = activeDrone;

    const fmtNum = (v: number | null | undefined, unit?: string) =>
        v == null ? '—' : `${v.toFixed(1)}${unit ? ` ${unit}` : ''}`;

    const fmtInt = (v: number | null | undefined, unit?: string) =>
        v == null ? '—' : `${Math.round(v)}${unit ? ` ${unit}` : ''}`;

    const fmtText = (v: string | null | undefined) => (v && v.length > 0 ? v : '—');

    const fmtAgeSec = (ts: number | null | undefined) =>
        ts ? `${Math.max(0, Math.floor((Date.now() - ts) / 1000))}s ago` : '—';

    const safe = {
        name: fmtText(drone?.name),
        mode: fmtText(drone?.system?.mode),
        connected: Boolean(drone?.connected),

        altitude: fmtNum(drone?.position?.relativeAltitudeM, 'm'),
        speed: fmtNum(drone?.motion?.speedMps, 'm/s'),
        heading: drone?.motion?.headingDeg != null ? `${drone.motion.headingDeg}°` : '—',

        battery:
            drone?.battery?.remainingPercent != null ? `${drone.battery.remainingPercent}%` : '—',

        telemetryAge: fmtAgeSec(drone?.lastUpdate),
    };

    useEffect(() => {
        loadMissions();
    }, [activeDrone]);

    /**
     * @mission
     */
    const [activeMission, setActiveMission] = useState<Mission[]>([]);

    function loadMissions() {
        MissionClient.findAllForMonitoring()
            .then(ms => {
                const missions = ms.filter(
                    m => m.id == import.meta.env.VITE_DJI_MINI_3_PRO_MISSION_ID,
                );

                console.log(missions[0]);
                setActiveMission(missions[0]);
            })
            .catch(err => console.error('Failed to load missions', err));
    }

    function parseGeoPoint(geoPoint?: string): { latitude: number; longitude: number } | null {
        if (!geoPoint) return null;

        const match = geoPoint.match(/POINT\s*\(\s*([-\d.]+)\s+([-\d.]+)\s*\)/i);

        if (!match) return null;

        const longitude = Number(match[1]);
        const latitude = Number(match[2]);

        if (Number.isNaN(latitude) || Number.isNaN(longitude)) return null;

        return { latitude, longitude };
    }

    const sendMission = () => {
        const wayPoints = activeMission?.missionDrones?.[0]?.waypoints ?? [];

        const mappedWaypoints = wayPoints
            .map(item => {
                const parsed = parseGeoPoint(item.geoPoint);

                if (!parsed) return null;

                return {
                    latitude: parsed.latitude,
                    longitude: parsed.longitude,
                    altitude: import.meta.env.VITE_FLY_ALTITUDE,
                    action: 'fly_to' as const,
                };
            })
            .filter(Boolean); // remove null entries

        const payload = {
            droneId: import.meta.env.VITE_DJI_MINI_3_PRO_ID,
            mission: {
                waypoints: mappedWaypoints,
                timestamp: new Date().toISOString(),
            },
        };

        const message = {
            action: 'mission:start',
            payload,
        };

        send(message);
    };

    return (
        <div className="absolute top-4 right-4 space-y-3 pointer-events-auto">
            {/* ACTIONS */}
            <Card className="w-64 bg-white/20 backdrop-blur border border-white/25 rounded-xl">
                <CardContent className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={sendMission}>
                        <Play className="h-4 w-4 mr-1" /> Start
                    </Button>
                </CardContent>
            </Card>

            {/* DRONE STATUS */}
            <Card className="w-64 bg-black/40 backdrop-blur text-white border border-white/20 rounded-xl">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold">{safe.name}</CardTitle>

                    <div className="flex justify-between text-xs opacity-80">
                        <span>Status</span>
                        <span className={safe.connected ? 'text-green-400' : 'text-red-400'}>
                            {safe.connected ? 'CONNECTED' : 'OFFLINE'}
                        </span>
                    </div>
                </CardHeader>

                <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span>Altitude</span>
                        <span>{safe.altitude}</span>
                    </div>

                    <div className="flex justify-between">
                        <span className="flex items-center gap-1">
                            <Gauge className="h-4 w-4" /> Speed
                        </span>
                        <span>{safe.speed}</span>
                    </div>

                    <div className="flex justify-between">
                        <span className="flex items-center gap-1">
                            <Navigation className="h-4 w-4" /> Heading
                        </span>
                        <span>{safe.heading}</span>
                    </div>

                    <div className="flex justify-between">
                        <span className="flex items-center gap-1">
                            <Battery className="h-4 w-4" /> Battery
                        </span>
                        <span>{safe.battery}</span>
                    </div>

                    <div className="flex justify-between">
                        <span className="flex items-center gap-1">
                            <Radio className="h-4 w-4" /> Telemetry
                        </span>
                        <span>{safe.telemetryAge}</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
