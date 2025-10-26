import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTablePagination } from './DataTablePagination';
import { DataTableToolbar } from './DataTableToolbar';
import type { DataTableProps } from './types';

export function DataTable<T>({
    columns,
    data,
    total,
    page,
    pageSize,
    loading,
    onPageChange,
    onSortChange,
    onFilterChange,
}: DataTableProps<T>) {
    const [filters, setFilters] = useState<Record<string, string>>({});
    const [selectedRows, setSelectedRows] = useState<number[]>([]);
    const [visibleColumns, setVisibleColumns] = useState<string[]>(columns.map(c => c.key));

    // ---- Filter handling ----
    const handleFilterChange = (key: string, value: string) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        onFilterChange?.(newFilters);
    };

    // ---- Row selection handling ----
    const toggleRow = (index: number) => {
        setSelectedRows(prev =>
            prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index],
        );
    };

    const toggleSelectAll = () => {
        if (selectedRows.length === data.length) {
            setSelectedRows([]);
        } else {
            setSelectedRows(data.map((_, i) => i));
        }
    };

    // ---- Bulk actions ----
    const handleBulkAction = (action: string) => {
        if (!selectedRows.length) return;
        if (action === 'delete') {
            console.log('Deleting rows:', selectedRows);
            // Implement your deletion logic here
        } else if (action === 'export') {
            console.log('Exporting rows:', selectedRows);
        }
    };

    // ---- Reset filters when columns change ----
    useEffect(() => {
        setFilters({});
        setVisibleColumns(columns.map(c => c.key));
    }, [columns]);

    return (
        <div className="flex flex-col gap-4">
            {/* Toolbar on top */}
            <DataTableToolbar
                columns={columns}
                selectedCount={selectedRows.length}
                onBulkAction={handleBulkAction}
                onColumnToggle={setVisibleColumns}
                onFilterChange={handleFilterChange}
            />

            <div
                className={cn(
                    'overflow-x-auto rounded-md border border-border bg-card text-card-foreground shadow-sm',
                    'transition-colors duration-200',
                )}
            >
                <Table>
                    <TableHeader>
                        {/* Header Row */}
                        <TableRow className="bg-muted/50 hover:bg-muted/50">
                            <TableHead className="w-10 px-4">
                                <Checkbox
                                    checked={selectedRows.length === data.length && data.length > 0}
                                    indeterminate={
                                        selectedRows.length > 0 && selectedRows.length < data.length
                                    }
                                    onCheckedChange={toggleSelectAll}
                                />
                            </TableHead>

                            {columns.map(
                                col =>
                                    visibleColumns.includes(col.key) && (
                                        <TableHead
                                            key={String(col.key)}
                                            className={cn(
                                                'font-semibold text-sm text-muted-foreground px-4 py-3 whitespace-nowrap',
                                                col.sortable &&
                                                    'cursor-pointer select-none hover:text-foreground transition-colors',
                                            )}
                                            onClick={() =>
                                                col.sortable &&
                                                onSortChange?.(String(col.key), 'asc')
                                            }
                                        >
                                            {col.header}
                                        </TableHead>
                                    ),
                            )}
                        </TableRow>

                        {/* Filter inputs Row */}
                        <TableRow className="border-t border-border bg-card/80">
                            <TableHead className="px-4" />
                            {columns.map(
                                col =>
                                    visibleColumns.includes(col.key) && (
                                        <TableHead key={String(col.key)} className="px-4 py-2">
                                            {col.filterable ? (
                                                col.filterComponent ? (
                                                    col.filterComponent(
                                                        filters[String(col.key)] || '',
                                                        v => handleFilterChange(String(col.key), v),
                                                    )
                                                ) : (
                                                    <input
                                                        type="text"
                                                        value={filters[String(col.key)] || ''}
                                                        onChange={e =>
                                                            handleFilterChange(
                                                                String(col.key),
                                                                e.target.value,
                                                            )
                                                        }
                                                        placeholder={`Filter ${col.header}`}
                                                        className={cn(
                                                            'w-full h-8 rounded-md border border-input bg-background',
                                                            'px-2 text-sm text-foreground',
                                                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60',
                                                            'transition-all duration-150',
                                                        )}
                                                    />
                                                )
                                            ) : (
                                                <div className="h-8" />
                                            )}
                                        </TableHead>
                                    ),
                            )}
                        </TableRow>
                    </TableHeader>

                    {/* Table Body */}
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell
                                    colSpan={visibleColumns.length + 1}
                                    className="text-center py-8 text-muted-foreground"
                                >
                                    Loading...
                                </TableCell>
                            </TableRow>
                        ) : data.length ? (
                            data.map((row, i) => (
                                <TableRow
                                    key={i}
                                    className={cn(
                                        'hover:bg-muted/40 transition-colors duration-100',
                                        selectedRows.includes(i) && 'bg-muted/60',
                                    )}
                                >
                                    <TableCell className="px-4">
                                        <Checkbox
                                            checked={selectedRows.includes(i)}
                                            onCheckedChange={() => toggleRow(i)}
                                        />
                                    </TableCell>

                                    {columns.map(
                                        col =>
                                            visibleColumns.includes(col.key) && (
                                                <TableCell
                                                    key={String(col.key)}
                                                    className="px-4 py-3 text-sm"
                                                >
                                                    {col.render
                                                        ? col.render(row)
                                                        : String((row as any)[col.key])}
                                                </TableCell>
                                            ),
                                    )}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={visibleColumns.length + 1}
                                    className="text-center py-8 text-muted-foreground"
                                >
                                    No records found
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            <div className="flex justify-end pt-2">
                <DataTablePagination
                    total={total}
                    page={page}
                    pageSize={pageSize}
                    onPageChange={onPageChange}
                />
            </div>
        </div>
    );
}
