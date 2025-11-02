import { useEffect, useRef, useState } from 'react';
import { DataTable } from '@/components/table/DataTable';
import type { ColumnDef } from '@/components/table/types';
import { AutoBreadcrumb } from '@/components/breadcrumb/AutoBreadcrumb';
import { getDrones } from '@/api/models/drone/droneClient.ts';

interface Drone {
    id: number;
    name: string;
    status: string;
    battery: number;
    lastMission: string;
}

export default function DroneList() {
    const [data, setData] = useState<Drone[]>([]);
    const [all, setAll] = useState<Drone[]>([]);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);

    const columns: ColumnDef<Drone>[] = [
        { key: 'id', header: 'ID', sortable: true },
        {
            key: 'name',
            header: 'Name',
            filterable: true,
        },
        {
            key: 'status',
            header: 'Status',
            filterable: true,
            filterComponent: (value, onChange) => (
                <select
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    className="w-full border rounded-md px-2 py-1 text-sm bg-background"
                >
                    <option value="">All</option>
                    <option value="Active">Active</option>
                    <option value="Idle">Idle</option>
                    <option value="Charging">Charging</option>
                    <option value="Maintenance">Maintenance</option>
                </select>
            ),
        },
        {
            key: 'battery',
            header: 'Battery',
            render: r => `${r.battery}%`,
        },
        { key: 'lastMission', header: 'Last Mission' },
    ];

    // Prevent duplicate in-flight requests (e.g., React StrictMode double-invoke in dev)
    const inFlightRef = useRef(false);

    // Fetch from API and map to table rows
    const fetchData = async (params?: Record<string, any>) => {
        const queryParams = (params ? `?${new URLSearchParams(params).toString()}` : '');
        console.log('queryParams', queryParams);
        if (inFlightRef.current) return;
        inFlightRef.current = true;
        setLoading(true);
        try {
            const res = await getDrones(params);
            const all = Array.isArray(res.data) ? res.data : [];

            // Map API drones to table row model
            const mapped: Drone[] = all.map((d: any) => ({
                id: d.id,
                name: d.name,
                status: d.status,
                // No battery percentage in API; using a stable pseudo value from id as placeholder
                battery: Math.abs(((d.id ?? 0) * 37) % 100),
                lastMission: (d.lastMaintenance || d.updatedAt || d.createdAt || new Date().toISOString()).slice(0, 10),
            }));

            setAll(mapped);
            setTotal(mapped.length);
        } catch (err) {
            console.error('Failed to load drones', err);
            setData([]);
            setTotal(0);
        } finally {
            setLoading(false);
            inFlightRef.current = false;
        }
    };

    // Fetch once on mount
    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Slice locally on page change or when data arrives
    useEffect(() => {
        const pageSize = 10;
        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        setData(all.slice(start, end));
    }, [page, all]);

    return (
        <div className="">
            <AutoBreadcrumb />

            <DataTable
                columns={columns}
                data={data}
                total={total}
                page={page}
                pageSize={10}
                loading={loading}
                onPageChange={setPage}
                onFilterChange={(filters) => {
                    setPage(1);
                    fetchData(filters);
                }}
            />
        </div>
    );
}
