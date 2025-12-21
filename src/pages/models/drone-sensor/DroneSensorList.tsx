import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable } from '@/components/table/DataTable';
import type { ColumnDef } from '@/components/table/types';
import { AutoBreadcrumb } from '@/components/breadcrumb/AutoBreadcrumb';
import { toast } from 'sonner';
import { DroneSensorClient, type DroneSensor } from '@/api/models/drone-sensor/droneSensorClient';
import { DroneSensorMutation } from '@/api/models/drone-sensor/droneSensorMutation';

export default function DroneSensorList() {
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState<Record<string, string>>({});
    const [droneSensors, setDroneSensors] = useState<DroneSensor[]>([]);

    const data = useMemo(() => droneSensors, [droneSensors]);

    const columns: ColumnDef<DroneSensor>[] = [
        { key: 'id', header: 'ID', sortable: true },
        {
            key: 'droneId',
            header: 'Drone ID',
            render: r => r.droneId,
        },
        { key: 'type', header: 'Type', filterable: true },
        {
            key: 'model',
            header: 'Model',
            render: r => r.model || '-',
        },
        {
            key: 'resolution',
            header: 'Resolution',
            render: r => r.resolution || '-',
        },
        {
            key: 'fieldOfView',
            header: 'Field of View',
            render: r => (r.fieldOfView ? `${r.fieldOfView}°` : '-'),
        },
        {
            key: 'status',
            header: 'Status',
            filterable: true,
        },
        { key: 'createdAt', header: 'Created At', render: r => r.createdAt.slice(0, 10) },
        { key: 'updatedAt', header: 'Updated At', render: r => r.updatedAt.slice(0, 10) },
    ];

    const handleEdit = (row: DroneSensor) => {
        navigate(`/drone-sensors/edit/${row.id}`);
    };

    const handleDelete = async (row: DroneSensor) => {
        if (!confirm('Bạn có chắc chắn muốn xóa drone sensor này?')) {
            return;
        }
        try {
            await DroneSensorMutation.remove(row.id);
            toast.success('Xóa drone sensor thành công');
            // Refresh data
            const response = await DroneSensorClient.findAll();
            setDroneSensors(response);
            setTotal(response.length);
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Xóa drone sensor thất bại');
            console.error(error);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await DroneSensorClient.findAll();
                setDroneSensors(response);
                setTotal(response.length);
            } catch (error) {
                console.error('Failed to fetch drone sensors:', error);
                setDroneSensors([]);
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
                prefix="drone-sensors"
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
