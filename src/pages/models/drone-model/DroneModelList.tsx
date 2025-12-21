import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable } from '@/components/table/DataTable';
import type { ColumnDef } from '@/components/table/types';
import { AutoBreadcrumb } from '@/components/breadcrumb/AutoBreadcrumb';
import { toast } from 'sonner';
import { DroneModelClient, type DroneModel } from '@/api/models/drone-model/droneModelClient';
import { DroneModelMutation } from '@/api/models/drone-model/droneModelMutation';

export default function DroneModelList() {
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState<Record<string, string>>({});
    const [droneModels, setDroneModels] = useState<DroneModel[]>([]);

    const data = useMemo(() => droneModels, [droneModels]);

    const columns: ColumnDef<DroneModel>[] = [
        { key: 'id', header: 'ID', sortable: true },
        { key: 'name', header: 'Model Name', filterable: true },
        {
            key: 'brandId',
            header: 'Brand ID',
            render: r => r.brandId,
        },
        {
            key: 'categoryId',
            header: 'Category ID',
            render: r => r.categoryId,
        },
        {
            key: 'maxSpeed',
            header: 'Max Speed (km/h)',
            render: r => r.maxSpeed ?? '-',
        },
        {
            key: 'maxAltitude',
            header: 'Max Altitude (m)',
            render: r => r.maxAltitude ?? '-',
        },
        {
            key: 'maxFlightTime',
            header: 'Max Flight Time (min)',
            render: r => r.maxFlightTime ?? '-',
        },
        {
            key: 'maxPayload',
            header: 'Max Payload (g)',
            render: r => r.maxPayload ?? '-',
        },
        { key: 'createdAt', header: 'Created At', render: r => r.createdAt.slice(0, 10) },
        { key: 'updatedAt', header: 'Updated At', render: r => r.updatedAt.slice(0, 10) },
    ];

    const handleEdit = (row: DroneModel) => {
        navigate(`/drone-models/edit/${row.id}`);
    };

    const handleDelete = async (row: DroneModel) => {
        if (!confirm('Bạn có chắc chắn muốn xóa drone model này?')) {
            return;
        }
        try {
            await DroneModelMutation.remove(row.id);
            toast.success('Xóa drone model thành công');
            // Refresh data
            const response = await DroneModelClient.findAll();
            setDroneModels(response);
            setTotal(response.length);
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Xóa drone model thất bại');
            console.error(error);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await DroneModelClient.findAll();
                setDroneModels(response);
                setTotal(response.length);
            } catch (error) {
                console.error('Failed to fetch drone models:', error);
                setDroneModels([]);
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
                prefix="drone-models"
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
