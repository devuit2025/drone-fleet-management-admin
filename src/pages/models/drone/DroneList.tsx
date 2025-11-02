import { useEffect, useMemo, useState } from 'react';
import { DataTable } from '@/components/table/DataTable';
import type { ColumnDef } from '@/components/table/types';
import { AutoBreadcrumb } from '@/components/breadcrumb/AutoBreadcrumb';
import { getDrones } from '@/api/models/drone/droneEndpoint';
import type { Drone as ApiDrone } from '@/api/models/drone/droneEndpoint';
import { useDroneStore } from '@/stores/useDroneStore';

interface Drone {
    id: number;
    name: string;
    status: string;
    battery: number;
    lastMission: string;
}

export default function DroneList() {
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState<Record<string, string>>({});
    const [apiDrones, setApiDrones] = useState<ApiDrone[]>([]);
    const { statuses, fetchStatus } = useDroneStore();
    // Map API drones to table row format
    const data = useMemo<Drone[]>(() => {
        return apiDrones.map((d: ApiDrone) => ({
            id: d.id,
            name: d.name,
            status: d.status,
            // No battery percentage in API; using a stable pseudo value from id as placeholder
            battery: Math.abs(((d.id ?? 0) * 37) % 100),
            lastMission: (d.lastMaintenance || d.updatedAt || d.createdAt || new Date().toISOString()).slice(0, 10),
        }));
    }, [apiDrones]);

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
                    {statuses.map(status => (
                        <option key={status} value={status}>{status}</option>
                    ))}
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

    // Fetch data when page, pageSize, or filters change
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const params = {
                    // page,
                    // per: pageSize,
                    ...filters,
                };
                const response = await getDrones(params);
                const drones = Array.isArray(response.data) ? response.data : [];

                // Get total from X-Total header
                const totalHeader = response.headers?.['x-total'] || 
                                    response.headers?.['X-Total'];
                const totalCount = totalHeader 
                    ? parseInt(String(totalHeader), 10) 
                    : drones.length;

                setApiDrones(drones);
                setTotal(totalCount);
            } catch (error) {
                console.error('Failed to fetch drones:', error);
                setApiDrones([]);
                setTotal(0);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, pageSize, filters]);

    // Fetch statuses once on mount
    useEffect(() => {
        fetchStatus();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };

    const handleFilterChange = (newFilters: Record<string, string>) => {
        console.log(newFilters);
        setFilters(newFilters);
        setPage(1); // Reset to first page when filters change
    };

    return (
        <div className="">
            <AutoBreadcrumb />

            <DataTable
                columns={columns}
                data={data}
                total={total}
                page={page}
                pageSize={pageSize}
                loading={loading}
                onPageChange={handlePageChange}
                onFilterChange={handleFilterChange}
            />
        </div>
    );
}
