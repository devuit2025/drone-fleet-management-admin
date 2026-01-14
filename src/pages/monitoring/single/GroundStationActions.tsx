import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Battery, Satellite, Activity, Gauge, Navigation, Radio } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useActiveDroneStore } from '@/stores/active/useActiveDroneStore';


export default function GroundStationActions() {
    const { droneId } = useParams<{ droneId: string }>();

  const activeDrone = useActiveDroneStore(
    s => (droneId ? s.drones[droneId] : null)
  );

  // Guard: no drone selected or not yet loaded
  if (!activeDrone) {
    return null; // or skeleton / placeholder
  }

  const drone = activeDrone;

  
const fmtNum = (v: number | null | undefined, unit?: string) =>
  v == null ? '—' : `${v.toFixed(1)}${unit ? ` ${unit}` : ''}`;

const fmtInt = (v: number | null | undefined, unit?: string) =>
  v == null ? '—' : `${Math.round(v)}${unit ? ` ${unit}` : ''}`;

const fmtText = (v: string | null | undefined) =>
  v && v.length > 0 ? v : '—';

const fmtAgeSec = (ts: number | null | undefined) =>
  ts ? `${Math.max(0, Math.floor((Date.now() - ts) / 1000))}s ago` : '—';


const safe = {
  name: fmtText(drone?.name),
  mode: fmtText(drone?.system?.mode),
  connected: Boolean(drone?.connected),

  altitude: fmtNum(drone?.position?.relativeAltitudeM, 'm'),
  speed: fmtNum(drone?.motion?.speedMps, 'm/s'),
  heading: drone?.motion?.headingDeg != null
    ? `${drone.motion.headingDeg}°`
    : '—',

  battery: drone?.battery?.remainingPercent != null
    ? `${drone.battery.remainingPercent}%`
    : '—',

  telemetryAge: fmtAgeSec(drone?.lastUpdate),
};

  return (
  <div className="absolute top-4 right-4 space-y-3 pointer-events-auto">

    {/* ACTIONS */}
    <Card className="w-64 bg-white/20 backdrop-blur border border-white/25 rounded-xl">
      <CardContent className="flex gap-2">
        <Button size="sm" variant="outline">
          <Play className="h-4 w-4 mr-1" /> Start
        </Button>
      </CardContent>
    </Card>

    {/* DRONE STATUS */}
    <Card className="w-64 bg-black/40 backdrop-blur text-white border border-white/20 rounded-xl">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">
          {safe.name}
        </CardTitle>

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