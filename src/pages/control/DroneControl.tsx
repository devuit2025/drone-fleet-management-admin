import { useEffect, useMemo, useRef, useState } from 'react';
import { io, type Socket } from 'socket.io-client';
import type { Drone } from '@/api/models/drone/droneEndpoint';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { createTelemetry } from '@/api/models/telemetry/telemetryEndpoint';
import { createWaypoint } from '@/api/models/waypoint/waypointEndpoint';
import { updateMission, getMissions } from '@/api/models/mission/missionEndpoint';
import { getAvailableDrones, getDrones, updateDroneStatus } from '@/api/models/drone/droneEndpoint';

type StatusPayload = { status: string };
type LocationPayload = { latitude: number; longitude: number; altitude: number };

export default function DroneControl() {
    const [drones, setDrones] = useState<Drone[]>([]);
    const [selectedDroneId, setSelectedDroneId] = useState<number | undefined>();
    const [missionId, setMissionId] = useState<number>(1);
    const [missions, setMissions] = useState<Array<{ id: number; missionName?: string; name?: string }>>([]);
    const [connected, setConnected] = useState(false);
    const [status, setStatus] = useState<string>('Idle');
    const [altitude, setAltitude] = useState<number>(0);
    const [speed, setSpeed] = useState<number>(0);
    const [battery] = useState<number>(100);
    const [logs, setLogs] = useState<string[]>([]);

    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        void (async () => {
            // drones
            const list = await getAvailableDrones().catch(async () => getDrones());
            const normalized = Array.isArray(list) ? list : [];
            setDrones(normalized);
            if (normalized.length > 0) setSelectedDroneId(normalized[0].id);

            // missions
            const ms = await getMissions().catch(() => [] as any[]);
            const missionsArr = Array.isArray(ms) ? ms : [];
            setMissions(missionsArr);
            if (missionsArr.length > 0) setMissionId(missionsArr[0].id);
        })();
    }, []);

    const nsUrl = useMemo(() => {
        // default API port 3000; adjust via env if needed later
        return `${window.location.protocol}//${window.location.hostname}:3000/drone`;
    }, []);

    const log = (m: string) => setLogs((prev) => [(`[${new Date().toLocaleTimeString()}] ${m}`), ...prev].slice(0, 200));

    const connect = () => {
        if (socketRef.current) return;
        const token = localStorage.getItem('access_token') || localStorage.getItem('accessToken');
        const s = io(nsUrl, {
            transports: ['websocket', 'polling'],
            auth: token ? { authorization: `Bearer ${token}` } : undefined,
            // Fallback: send token via query if server expects it there
            query: token ? { token } : undefined,
        });
        socketRef.current = s;

        s.on('connect', () => {
            setConnected(true);
            log('Connected to gateway');
        });
        s.on('disconnect', () => {
            setConnected(false);
            log('Disconnected from gateway');
        });
        s.on('drone:location_updated', (data: { droneId: string; location: LocationPayload }) => {
            const loc = data.location;
            setAltitude(loc.altitude ?? 0);
            setSpeed((prev) => prev);
            log(`Location D${data.droneId}: lat=${loc.latitude?.toFixed(5)} lng=${loc.longitude?.toFixed(5)} alt=${loc.altitude}`);
        });
        s.on('drone:status_updated', (data: { droneId: string; status: StatusPayload }) => {
            setStatus(data.status.status);
            log(`Status D${data.droneId}: ${data.status.status}`);
        });
        s.on('flight:started', (data: { flightId: string }) => log(`Flight ${data.flightId} started`));
        s.on('flight:ended', (data: { flightId: string }) => log(`Flight ${data.flightId} ended`));
        s.on('flight:path_point_added', (data: any) => log(`Path point added F${data.flightId}`));
        s.on('error', (data: { message: string }) => log(`Error: ${data.message}`));
    };

    const disconnect = () => {
        socketRef.current?.disconnect();
        socketRef.current = null;
        setConnected(false);
    };

    const emit = (event: string, payload: any) => socketRef.current?.emit(event, payload);

    const joinDrone = () => {
        if (!selectedDroneId) return;
        emit('join:drone', { droneId: String(selectedDroneId) });
        log(`Joined drone ${selectedDroneId}`);
    };
    const joinMission = () => {
        emit('join:flight', { flightId: String(missionId) });
        log(`Joined flight ${missionId}`);
    };

    // Simple flow controls built atop existing WS API contracts
    const sendStatus = async (s: string) => {
        if (!selectedDroneId) return;
        emit('drone:status_update', { droneId: String(selectedDroneId), status: { status: s } satisfies StatusPayload });
        // Persist via REST if available
        try {
            await updateDroneStatus(selectedDroneId, { status: s });
        } catch (e) {
            log('REST updateStatus failed (TODO handle error)');
        }
    };
    const sendLocation = async (lat: number, lng: number, alt: number) => {
        if (!selectedDroneId) return;
        emit('drone:location_update', {
            droneId: String(selectedDroneId),
            location: { latitude: lat, longitude: lng, altitude: alt } satisfies LocationPayload,
        });
        // Persist telemetry via REST
        try {
            await createTelemetry({
                droneId: selectedDroneId,
                missionId,
                timestamp: new Date().toISOString(),
                location: `POINT(${lng} ${lat})`,
                altitudeM: alt,
                speedMps: 0,
                batteryPct: 100,
                status,
                payloadWeight: 0,
            });
        } catch (e) {
            log('REST telemetry create failed (TODO handle error)');
        }
    };
    const startFlight = async () => {
        emit('flight:start', { flightId: String(missionId) });
        // Persist mission status via REST (if mission exists)
        try {
            await updateMission(missionId, { status: 'in_progress', startTime: new Date().toISOString() });
        } catch (e) {
            log('REST mission start update failed (TODO handle error)');
        }
    };
    const endFlight = async () => {
        emit('flight:end', { flightId: String(missionId), endData: { status: 'completed' } });
        try {
            await updateMission(missionId, { status: 'completed', endTime: new Date().toISOString() });
        } catch (e) {
            log('REST mission end update failed (TODO handle error)');
        }
    };
    const addPathPoint = async (i: number, lat: number, lng: number, alt: number, action: string) => {
        emit('flight:path_point', {
            flightId: String(missionId),
            pathPoint: {
                seqNumber: i,
                geoPoint: `POINT(${lng} ${lat})`,
                altitudeM: alt,
                speedMps: 12,
                action,
            },
        });
        // Persist waypoint via REST
        try {
            await createWaypoint({
                missionId,
                seqNumber: i,
                geoPoint: `POINT(${lng} ${lat})`,
                altitudeM: alt,
                speedMps: 12,
                action,
            });
        } catch (e) {
            log('REST waypoint create failed (TODO handle error)');
        }
    };

    const simulate = async () => {
        if (!socketRef.current) return log('Not connected');
        if (!selectedDroneId) return log('No drone selected');

        startFlight();
        // takeoff
        sendStatus('flying');
        addPathPoint(1, 10.8231, 106.6296, 20, 'take_off');
        sendLocation(10.8231, 106.6296, 20);

        await new Promise((r) => setTimeout(r, 1500));
        // hover/move
        sendStatus('hovering');
        addPathPoint(2, 10.8241, 106.6306, 40, 'fly_to');
        sendLocation(10.8241, 106.6306, 40);

        await new Promise((r) => setTimeout(r, 1500));
        // land
        sendStatus('landing');
        addPathPoint(3, 10.8251, 106.6316, 5, 'land');
        sendLocation(10.8251, 106.6316, 5);

        await new Promise((r) => setTimeout(r, 800));
        endFlight();
    };

    return (
        <div className="p-4 space-y-4">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="text-lg font-semibold">Điều khiển Drone (Realtime)</div>
                        <div className="flex items-center gap-2">
                            <span className={`text-xs px-2 py-1 rounded ${connected ? 'bg-green-600 text-white' : 'bg-zinc-600 text-white'}`}>{connected ? 'Connected' : 'Disconnected'}</span>
                            <Button size="sm" onClick={connect} disabled={connected}>
                                Connect
                            </Button>
                            <Button size="sm" variant="secondary" onClick={disconnect} disabled={!connected}>
                                Disconnect
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="space-y-2">
                            <div className="text-sm">Chọn Drone</div>
                            <Select value={selectedDroneId ? String(selectedDroneId) : undefined} onValueChange={(v) => setSelectedDroneId(Number(v))}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Chọn drone" />
                                </SelectTrigger>
                                <SelectContent>
                                    {(Array.isArray(drones) ? drones : []).map((d) => (
                                        <SelectItem key={d.id} value={String(d.id)}>
                                            #{d.id} - {d.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button size="sm" onClick={joinDrone} disabled={!connected || !selectedDroneId}>
                                Tham gia Drone
                            </Button>
                        </div>

                        <div className="space-y-2">
                            <div className="text-sm">Chọn Mission</div>
                            <Select value={missionId ? String(missionId) : undefined} onValueChange={(v) => setMissionId(Number(v))}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Chọn mission" />
                                </SelectTrigger>
                                <SelectContent>
                                    {(Array.isArray(missions) ? missions : []).map((m) => (
                                        <SelectItem key={m.id} value={String(m.id)}>
                                            #{m.id} - {m.missionName || m.name || 'Mission'}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button size="sm" onClick={joinMission} disabled={!connected}>
                                Tham gia Nhiệm vụ
                            </Button>
                        </div>

                        <div className="space-y-2">
                            <div className="text-sm">Flow nhanh</div>
                            <div className="flex gap-2">
                                <Button size="sm" onClick={simulate} disabled={!connected || !selectedDroneId}>
                                    Simulate Flight
                                </Button>
                                <Button size="sm" variant="secondary" onClick={() => setLogs([])}>
                                    Clear Logs
                                </Button>
                            </div>
                        </div>
                    </div>

                    <Separator className="my-4" />

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <Card>
                            <CardHeader className="text-sm opacity-70">Altitude</CardHeader>
                            <CardContent className="text-xl font-semibold">{altitude} m</CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="text-sm opacity-70">Speed</CardHeader>
                            <CardContent className="text-xl font-semibold">{speed} m/s</CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="text-sm opacity-70">Battery</CardHeader>
                            <CardContent className="text-xl font-semibold">{battery}%</CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="text-sm opacity-70">Status</CardHeader>
                            <CardContent className="text-xl font-semibold">{status}</CardContent>
                        </Card>
                    </div>

                    <Separator className="my-4" />

                    <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
                        <Button size="sm" onClick={() => { startFlight(); }} disabled={!connected}>Start</Button>
                        <Button size="sm" onClick={() => sendStatus('flying')} disabled={!connected}>Arm/Takeoff</Button>
                        <Button size="sm" onClick={() => sendStatus('hovering')} disabled={!connected}>Hover</Button>
                        <Button size="sm" onClick={() => { sendLocation(10.8231, 106.6296, Math.max(0, altitude + 10)); }} disabled={!connected}>Up +10m</Button>
                        <Button size="sm" onClick={() => sendStatus('landing')} disabled={!connected}>Land</Button>
                        <Button size="sm" variant="secondary" onClick={() => { endFlight(); }} disabled={!connected}>End</Button>
                    </div>

                    <Separator className="my-4" />

                    <div className="h-60 overflow-auto rounded border p-2 text-xs font-mono bg-zinc-950 text-zinc-50">
                        {logs.map((l, i) => (
                            <div key={i} className="py-0.5">
                                {l}
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}


