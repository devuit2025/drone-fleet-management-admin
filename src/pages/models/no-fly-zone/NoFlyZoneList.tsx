import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/table/DataTable';
import type { ColumnDef } from '@/components/table/types';
import { NoFlyZoneClient, type NoFlyZone } from '@/api/models/no-fly-zone/noFlyZoneClient';
import { NoFlyZoneMutation } from '@/api/models/no-fly-zone/noFlyZoneMutation';
import { toast } from 'sonner';
import { AutoBreadcrumb } from '@/components/breadcrumb/AutoBreadcrumb';
import { Plus } from 'lucide-react';

export default function NoFlyZoneList() {
    const navigate = useNavigate();
    const [data, setData] = useState<NoFlyZone[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [total, setTotal] = useState(0);
    const [filters, setFilters] = useState<Record<string, string>>({});

    useEffect(() => {
        NoFlyZoneClient.findAll()
            .then(res => {
              setData(res);
              setTotal(res.length);
              setLoading(false);
            })
            .catch(err => {
                console.error(err);
                toast.error('Không thể tải danh sách No-Fly Zones');
            })
            .finally(() => setLoading(false));
    }, [page, pageSize, filters]);

    const columns: ColumnDef<NoFlyZone>[] = [
        { key: 'id', header: 'ID', sortable: true },
        { key: 'name', header: 'Tên', filterable: true },
        { 
            key: 'description', 
            header: 'Mô tả',
            render: (row) => row.description || '-',
        },
        { 
            key: 'zoneType', 
            header: 'Loại',
            render: (row) => row.zoneType === 'polygon' ? 'Polygon' : 'Circle',
        },
    ];

    const handleEdit = (row: NoFlyZone) => navigate(`/no-fly-zones/${row.id}/edit`);
    const handleDelete = async (row: NoFlyZone) => {
        if (!confirm('Bạn có chắc chắn muốn xóa No-Fly Zone này?')) {
            return;
        }
        try {
            await NoFlyZoneMutation.remove(row.id);
            setData(prev => prev.filter(x => x.id !== row.id));
            setTotal(prev => prev - 1);
            toast.success('Đã xóa No-Fly Zone');
        } catch (e: any) {
            console.error(e);
            toast.error(e?.response?.data?.message || 'Xóa thất bại');
        }
    };

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
                prefix="no-fly-zones"
                columns={columns}
                data={data}
                total={total}
                page={page}
                pageSize={pageSize}
                loading={loading}
                getId={(row) => row.id}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onPageChange={handlePageChange}
                onFilterChange={handleFilterChange}
            />
        </div>
    );
}
