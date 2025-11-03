import { useEffect, useMemo, useState } from 'react';
import { DataTable } from '@/components/table/DataTable';
import type { ColumnDef } from '@/components/table/types';
import { AutoBreadcrumb } from '@/components/breadcrumb/AutoBreadcrumb';
import { DroneBrandMutation } from '@/api/models/drone-brand/droneBrandMutation'
import { DroneBrandClient, type DroneBrand } from '@/api/models/drone-brand/droneBrandClient'

export default function DroneBrandList() {
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState<Record<string, string>>({});
    const [brands, setBrands] = useState<DroneBrand[]>([]);

    const data = useMemo(() => brands, [brands]);

    const columns: ColumnDef<DroneBrand>[] = [
        { key: 'id', header: 'ID', sortable: true },
        { key: 'name', header: 'Name', filterable: true },
        { key: 'country', header: 'Country', filterable: true },
        {
            key: 'website',
            header: 'Website',
            render: r => r.website ? <a href={r.website} target="_blank" className="text-blue-500 underline">{r.website}</a> : '-'
        },
        { key: 'createdAt', header: 'Created At', render: r => r.createdAt.slice(0, 10) },
        { key: 'updatedAt', header: 'Updated At', render: r => r.updatedAt.slice(0, 10) },
    ];

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await DroneBrandClient.findAll();
                console.log(response)
                setBrands(response);
                setTotal(response.length);
            } catch (error) {
                console.error('Failed to fetch drone brands:', error);
                setBrands([]);
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
        setPage(1); // reset to first page on filter
    };

    return (
        <div>
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
