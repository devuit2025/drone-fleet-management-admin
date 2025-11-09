import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable } from '@/components/table/DataTable';
import type { ColumnDef } from '@/components/table/types';
import { AutoBreadcrumb } from '@/components/breadcrumb/AutoBreadcrumb';
import { toast } from 'sonner';
import { DroneCategoryClient, type DroneCategory } from '@/api/models/drone-category/droneCategoryClient';
import { DroneCategoryMutation } from '@/api/models/drone-category/droneCategoryMutation';

export default function DroneCategoryList() {
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState<Record<string, string>>({});
    const [categories, setCategories] = useState<DroneCategory[]>([]);

    const data = useMemo(() => categories, [categories]);

    const columns: ColumnDef<DroneCategory>[] = [
        { key: 'id', header: 'ID', sortable: true },
        { key: 'name', header: 'Name', filterable: true },
        {
            key: 'description',
            header: 'Description',
            render: r => r.description || '-',
        },
        { key: 'createdAt', header: 'Created At', render: r => r.createdAt.slice(0, 10) },
        { key: 'updatedAt', header: 'Updated At', render: r => r.updatedAt.slice(0, 10) },
    ];

    const handleEdit = (row: DroneCategory) => {
        navigate(`/drone-category/edit/${row.id}`);
    };

    const handleDelete = async (row: DroneCategory) => {
        if (!confirm('Bạn có chắc chắn muốn xóa danh mục này?')) {
            return;
        }
        try {
            await DroneCategoryMutation.remove(row.id);
            toast.success('Xóa danh mục thành công');
            // Refresh data
            const response = await DroneCategoryClient.findAll();
            setCategories(response);
            setTotal(response.length);
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Xóa danh mục thất bại');
            console.error(error);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await DroneCategoryClient.findAll();
                setCategories(response);
                setTotal(response.length);
            } catch (error) {
                console.error('Failed to fetch drone categories:', error);
                setCategories([]);
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
                prefix="drone-category"
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
