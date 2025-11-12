import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable } from '@/components/table/DataTable';
import type { ColumnDef } from '@/components/table/types';
import { AutoBreadcrumb } from '@/components/breadcrumb/AutoBreadcrumb';
import { toast } from 'sonner';
import { MissionClient, type Mission } from '@/api/models/mission/missionClient';
import { MissionMutation } from '@/api/models/mission/missionMutation';
import { useNoFlyZoneStore } from '@/stores/useNoFlyZoneStore';

export default function MissionList() {
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState<Record<string, string>>({});
    const [missions, setMissions] = useState<Mission[]>([]);

    const zonesLoaded = useNoFlyZoneStore(state => state.loaded);
    const fetchNoFlyZones = useNoFlyZoneStore(state => state.fetchZones);

    const data = useMemo(() => missions, [missions]);

    const columns: ColumnDef<Mission>[] = [
        { key: 'id', header: 'ID', sortable: true },
        { key: 'missionName', header: 'Mission Name', filterable: true },
        {
            key: 'pilotId',
            header: 'Pilot ID',
            render: r => r.pilotId,
        },
        {
            key: 'licenseId',
            header: 'License ID',
            render: r => r.licenseId || '-',
        },
        {
            key: 'status',
            header: 'Status',
            filterable: true,
        },
        {
            key: 'startTime',
            header: 'Start Time',
            render: r => r.startTime ? r.startTime.slice(0, 10) : '-',
        },
        {
            key: 'endTime',
            header: 'End Time',
            render: r => r.endTime ? r.endTime.slice(0, 10) : '-',
        },
        { key: 'createdAt', header: 'Created At', render: r => r.createdAt.slice(0, 10) },
        { key: 'updatedAt', header: 'Updated At', render: r => r.updatedAt.slice(0, 10) },
    ];

    const handleEdit = (row: Mission) => {
        navigate(`/missions/edit/${row.id}`);
    };

    const handleDelete = async (row: Mission) => {
        if (!confirm('Bạn có chắc chắn muốn xóa mission này?')) {
            return;
        }
        try {
            await MissionMutation.remove(row.id);
            toast.success('Xóa mission thành công');
            // Refresh data
            const response = await MissionClient.findAll();
            setMissions(response);
            setTotal(response.length);
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Xóa mission thất bại');
            console.error(error);
        }
    };

    useEffect(() => {
        if (!zonesLoaded) {
            fetchNoFlyZones().catch(err => {
                console.error('Failed to preload no-fly zones:', err);
            });
        }
    }, [zonesLoaded, fetchNoFlyZones]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await MissionClient.findAll();
                setMissions(response);
                setTotal(response.length);
            } catch (error) {
                console.error('Failed to fetch missions:', error);
                setMissions([]);
                setTotal(0);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [page, pageSize, filters]);

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };

    const handleFilterChange = (newFilters: Record<string, string>) => {
        setFilters(newFilters);
        setPage(1);
    };

    return (
        <div>
            <AutoBreadcrumb />

            <DataTable
                prefix="missions"
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

