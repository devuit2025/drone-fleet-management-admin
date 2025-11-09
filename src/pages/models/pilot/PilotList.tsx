import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable } from '@/components/table/DataTable';
import type { ColumnDef } from '@/components/table/types';
import { AutoBreadcrumb } from '@/components/breadcrumb/AutoBreadcrumb';
import { toast } from 'sonner';
import { PilotClient, type Pilot } from '@/api/models/pilot/pilotClient';
import { PilotMutation } from '@/api/models/pilot/pilotMutation';

export default function PilotList() {
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState<Record<string, string>>({});
    const [pilots, setPilots] = useState<Pilot[]>([]);

    const data = useMemo(() => pilots, [pilots]);

    const columns: ColumnDef<Pilot>[] = [
        { key: 'id', header: 'ID', sortable: true },
        { key: 'name', header: 'Name', filterable: true },
        {
            key: 'userId',
            header: 'User ID',
            render: r => r.userId,
        },
        {
            key: 'status',
            header: 'Status',
            filterable: true,
        },
        { key: 'createdAt', header: 'Created At', render: r => r.createdAt.slice(0, 10) },
        { key: 'updatedAt', header: 'Updated At', render: r => r.updatedAt.slice(0, 10) },
    ];

    const handleEdit = (row: Pilot) => {
        navigate(`/pilots/edit/${row.id}`);
    };

    const handleDelete = async (row: Pilot) => {
        if (!confirm('Bạn có chắc chắn muốn xóa pilot này?')) {
            return;
        }
        try {
            await PilotMutation.remove(row.id);
            toast.success('Xóa pilot thành công');
            // Refresh data
            const response = await PilotClient.findAll();
            setPilots(response);
            setTotal(response.length);
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Xóa pilot thất bại');
            console.error(error);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await PilotClient.findAll();
                setPilots(response);
                setTotal(response.length);
            } catch (error) {
                console.error('Failed to fetch pilots:', error);
                setPilots([]);
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
                prefix="pilots"
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

