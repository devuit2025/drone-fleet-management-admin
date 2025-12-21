import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable } from '@/components/table/DataTable';
import type { ColumnDef } from '@/components/table/types';
import { AutoBreadcrumb } from '@/components/breadcrumb/AutoBreadcrumb';
import { toast } from 'sonner';
import { LicenseClient, type License } from '@/api/models/license/licenseClient';
import { LicenseMutation } from '@/api/models/license/licenseMutation';

export default function LicenseList() {
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState<Record<string, string>>({});
    const [licenses, setLicenses] = useState<License[]>([]);

    const data = useMemo(() => licenses, [licenses]);

    const columns: ColumnDef<License>[] = [
        { key: 'id', header: 'ID', sortable: true },
        { key: 'licenseNumber', header: 'License Number', filterable: true },
        // {
        //     key: 'pilotId',
        //     header: 'Pilot ID',
        //     render: r => r.pilotId,
        // },
        {
            key: 'licenseType',
            header: 'License Type',
            filterable: true,
            render: r => r.licenseType.charAt(0).toUpperCase() + r.licenseType.slice(1),
        },
        {
            key: 'qualificationLevel',
            header: 'Qualification Level',
            filterable: true,
            render: r =>
                r.qualificationLevel.charAt(0).toUpperCase() + r.qualificationLevel.slice(1),
        },
        { key: 'issuingAuthority', header: 'Issuing Authority', filterable: true },
        {
            key: 'issuedDate',
            header: 'Issued Date',
            render: r => (r.issuedDate ? new Date(r.issuedDate).toLocaleDateString() : '-'),
        },
        {
            key: 'expiryDate',
            header: 'Expiry Date',
            render: r => (r.expiryDate ? new Date(r.expiryDate).toLocaleDateString() : '-'),
        },
        {
            key: 'active',
            header: 'Active',
            render: r => (r.active ? 'Yes' : 'No'),
        },
        // { key: 'createdAt', header: 'Created At', render: r => r.createdAt ? r.createdAt.slice(0, 10) : '-' },
        // { key: 'updatedAt', header: 'Updated At', render: r => r.updatedAt ? r.updatedAt.slice(0, 10) : '-' },
    ];

    const handleEdit = (row: License) => {
        navigate(`/licenses/edit/${row.id}`);
    };

    const handleDelete = async (row: License) => {
        if (!confirm('Bạn có chắc chắn muốn xóa license này?')) {
            return;
        }
        try {
            await LicenseMutation.remove(row.id);
            toast.success('Xóa license thành công');
            // Refresh data
            const response = await LicenseClient.findAll();
            setLicenses(response);
            setTotal(response.length);
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Xóa license thất bại');
            console.error(error);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await LicenseClient.findAll();
                setLicenses(response);
                setTotal(response.length);
            } catch (error) {
                console.error('Failed to fetch licenses:', error);
                setLicenses([]);
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
                prefix="licenses"
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
