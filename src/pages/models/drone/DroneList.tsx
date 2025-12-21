import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable } from '@/components/table/DataTable';
import type { ColumnDef } from '@/components/table/types';
import { AutoBreadcrumb } from '@/components/breadcrumb/AutoBreadcrumb';
import { toast } from 'sonner';
import { getDrones } from '@/api/models/drone/droneEndpoint';
import type { Drone as ApiDrone } from '@/api/models/drone/droneEndpoint';
import { droneMutation } from '@/api/models/drone/droneMutation';
import { useDroneStore } from '@/stores/useDroneStore';

interface Drone {
    id: number;
    name: string;
    status: string;
    batteryHealth: number;
    lastMission: string;
}

export default function DroneList() {
    const navigate = useNavigate();
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
            batteryHealth: d.batteryHealth ?? 0,
            lastMission: (
                d.lastMaintenance ||
                d.updatedAt ||
                d.createdAt ||
                new Date().toISOString()
            ).slice(0, 10),
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
                        <option key={status} value={status}>
                            {status}
                        </option>
                    ))}
                </select>
            ),
        },
        {
            key: 'battery',
            header: 'Battery',
            render: r => `${r.batteryHealth}%`,
        },
        { key: 'lastMission', header: 'Last Mission' },
    ];

    const handleEdit = (row: Drone) => {
        navigate(`/drones/edit/${row.id}`);
    };

    const handleDelete = async (row: Drone) => {
        if (!confirm('Bạn có chắc chắn muốn xóa drone này?')) {
            return;
        }
        try {
            await droneMutation.remove(row.id);
            toast.success('Xóa drone thành công');
            // Refresh data
            const params = {
                ...filters,
            };
            const response = await getDrones(params);
            const drones = Array.isArray(response) ? response : [];
            setApiDrones(drones);
            setTotal(drones.length);
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Xóa drone thất bại');
            console.error(error);
        }
    };

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
                const drones = Array.isArray(response) ? response : [];
                // Get total from X-Total header
                const totalHeader = response.headers?.['x-total'] || response.headers?.['X-Total'];
                const totalCount = totalHeader ? parseInt(String(totalHeader), 10) : drones.length;

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
        setFilters(newFilters);
        setPage(1); // Reset to first page when filters change
    };

    return (
        <div className="">
            <AutoBreadcrumb />

            <DataTable
                prefix="drones"
                columns={columns}
                data={data}
                total={total}
                page={page}
                pageSize={pageSize}
                loading={loading}
                onPageChange={handlePageChange}
                onFilterChange={handleFilterChange}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />
        </div>
    );
}
