import { useEffect, useMemo, useState } from 'react';
import { api } from '@/api/axios';

type Stats = {
    udpPort: number;
    totalPackets: number;
    lastPacketAt?: string;
    lastFrom?: string;
    lastSize?: number;
};

export default function MavlinkDemo() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [lastHex, setLastHex] = useState<string>('');
    const [error, setError] = useState<string>('');

    const apiBase = useMemo(() => {
        // Prefer configured API, fallback to localhost:3001 (docker mapped)
        return (import.meta.env.VITE_API_URL as string) || 'http://localhost:3001';
    }, []);

    useEffect(() => {
        let stopped = false;
        const tick = async () => {
            try {
                const [s, l] = await Promise.all([
                    api.get(`${apiBase}/mavlink/stats`, { baseURL: '' }),
                    api.get(`${apiBase}/mavlink/last`, { baseURL: '' }),
                ]);
                if (!stopped) {
                    setStats(s as Stats);
                    setLastHex((l as any)?.hex || '');
                    setError('');
                }
            } catch (e: any) {
                if (!stopped) setError(e?.message || 'Request failed');
            }
        };
        tick();
        const id = setInterval(tick, 1000);
        return () => {
            stopped = true;
            clearInterval(id);
        };
    }, [apiBase]);

    return (
        <div className="p-6 space-y-4">
            <h1 className="text-xl font-semibold">MAVLink Demo</h1>
            {error && <div className="text-red-500">{error}</div>}
            <div className="grid grid-cols-2 gap-4">
                <div className="rounded border p-4">
                    <h2 className="font-medium mb-2">Stats</h2>
                    <pre className="text-sm whitespace-pre-wrap">
                        {JSON.stringify(stats, null, 2)}
                    </pre>
                </div>
                <div className="rounded border p-4">
                    <h2 className="font-medium mb-2">Last Packet (hex)</h2>
                    <div className="text-xs break-all">{lastHex || '—'}</div>
                </div>
            </div>
            <div className="text-xs text-gray-500">API Base: {apiBase}</div>
        </div>
    );
}
