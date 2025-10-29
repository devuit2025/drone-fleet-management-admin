// useLocalFakeTelem.tsx
import { useEffect, useRef } from 'react';

export type Telemetry = {
    id: string;
    lat: number;
    lon: number;
    altitude?: number;
    heading?: number;
    speed?: number;
    battery?: number;
    timestamp: number;
};

export function useLocalFakeTelem(
    opts?: { count?: number; hz?: number; center?: { lat: number; lon: number } },
    onMessage?: (msg: Telemetry | Telemetry[]) => void,
) {
    const count = opts?.count ?? 8;
    const hz = opts?.hz ?? 5;
    const center = opts?.center ?? { lat: 10.762622, lon: 106.660172 };

    const dronesRef = useRef<any[]>([]);
    const intervalRef = useRef<number | null>(null);

    useEffect(() => {
        // init
        function rand(min: number, max: number) {
            return Math.random() * (max - min) + min;
        }
        function metersToDegLat(m: number) {
            return m / 111320;
        }
        function metersToDegLon(m: number, lat: number) {
            return m / (111320 * Math.cos((lat * Math.PI) / 180));
        }
        function randomPointNear(c: any, r = 1500) {
            const a = Math.random() * Math.PI * 2;
            const rr = r * Math.sqrt(Math.random());
            const dx = Math.cos(a) * rr;
            const dy = Math.sin(a) * rr;
            return { lat: c.lat + metersToDegLat(dy), lon: c.lon + metersToDegLon(dx, c.lat) };
        }
        for (let i = 0; i < count; i++) {
            const p = randomPointNear(center, 1500);
            dronesRef.current.push({
                id: `drone-${i + 1}`,
                lat: p.lat,
                lon: p.lon,
                altitude: rand(20, 100),
                heading: rand(0, 359),
                speed: rand(0, 15),
                battery: Math.round(rand(60, 100)),
                timestamp: Date.now(),
            });
        }

        let last = Date.now();
        intervalRef.current = window.setInterval(
            () => {
                const now = Date.now();
                const dt = (now - last) / 1000;
                last = now;
                const out = [];
                for (const d of dronesRef.current) {
                    d.heading = (d.heading + rand(-10, 10) + 360) % 360;
                    d.speed = Math.max(0, d.speed + rand(-1, 1));
                    const dist = d.speed * dt;
                    const a = (d.heading * Math.PI) / 180;
                    const dx = Math.sin(a) * dist,
                        dy = Math.cos(a) * dist;
                    d.lat += metersToDegLat(dy);
                    d.lon += metersToDegLon(dx, d.lat);
                    d.altitude = Math.max(5, d.altitude + rand(-1, 1));
                    d.battery = Math.max(0, d.battery - dt * rand(0.01, 0.07));
                    d.timestamp = Date.now();
                    out.push({
                        id: d.id,
                        lat: d.lat,
                        lon: d.lon,
                        heading: Math.round(d.heading),
                        speed: Math.round(d.speed * 10) / 10,
                        battery: Math.round(d.battery),
                        altitude: Math.round(d.altitude * 10) / 10,
                        timestamp: d.timestamp,
                    });
                }
                if (onMessage) onMessage(out);
            },
            Math.round(1000 / hz),
        );

        return () => {
            if (intervalRef.current) window.clearInterval(intervalRef.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // nothing returns; this hook uses callback style
}
