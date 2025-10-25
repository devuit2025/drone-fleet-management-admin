import { useEffect, useState } from 'react';
import { DataTable } from '@/components/table/DataTable';
import type { ColumnDef } from '@/components/table/types';

interface Drone {
    id: number;
    name: string;
    status: string;
    battery: number;
    lastMission: string;
}

export default function DroneList() {
    const [data, setData] = useState<Drone[]>([]);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);

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
                    <option value="Active">Active</option>
                    <option value="Idle">Idle</option>
                    <option value="Charging">Charging</option>
                    <option value="Maintenance">Maintenance</option>
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

    // 🔧 Fake async data fetcher
    const fetchData = async () => {
        setLoading(true);

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 600));

        // Generate fake drone data
        const totalItems = 57;
        const pageSize = 10;
        const start = (page - 1) * pageSize;
        const end = start + pageSize;

        const allDrones: Drone[] = Array.from({ length: totalItems }, (_, i) => ({
            id: i + 1,
            name: `Drone ${i + 1}`,
            status: ['Active', 'Idle', 'Charging', 'Maintenance'][Math.floor(Math.random() * 4)],
            battery: Math.floor(Math.random() * 100),
            lastMission: new Date(
                Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 30,
            ).toLocaleDateString(),
        }));

        const pagedData = allDrones.slice(start, end);

        setData(pagedData);
        setTotal(totalItems);
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, [page]);

    return (
        <div className="">
            <DataTable
                columns={columns}
                data={data}
                total={total}
                page={page}
                pageSize={10}
                loading={loading}
                onPageChange={setPage}
            />
        </div>
    );
}
