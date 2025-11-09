import { useState, useEffect, useMemo } from 'react';
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
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { DataTablePagination } from './DataTablePagination';
import { DataTableToolbar } from './DataTableToolbar';
import type { DataTableProps, ColumnDef } from './types';
import { useDebounce } from '@/hooks/useDebounce';

export function DataTable<T>({
    prefix,
    columns,
    data,
    total,
    page,
    pageSize,
    loading,
    onPageChange,
    onSortChange,
    onFilterChange,
    onEdit,
    onDelete,
}: DataTableProps<T>) {
    console.log('data', data);
    // Ensure data is always an array
    const safeData = Array.isArray(data) ? data : [];
    
    // Add operation column if onEdit or onDelete is provided
    const columnsWithOperation = useMemo<ColumnDef<T>[]>(() => {
        if (!onEdit && !onDelete) {
            return columns;
        }
        return [
            ...columns,
            {
                key: 'operation',
                header: 'Operation',
                render: (row: T) => (
                    <div className="flex gap-2">
                        {onEdit && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onEdit(row)}
                            >
                                <Edit className="h-4 w-4" />
                            </Button>
                        )}
                        {onDelete && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onDelete(row)}
                            >
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        )}
                    </div>
                ),
            },
        ];
    }, [columns, onEdit, onDelete]);
    
    const [filters, setFilters] = useState<Record<string, string>>({});
    const [selectedRows, setSelectedRows] = useState<number[]>([]);
    const [visibleColumns, setVisibleColumns] = useState<string[]>(columnsWithOperation.map(c => c.key));
    const debouncedSearch = useDebounce(
        (newFilters: Record<string, string>) => handleSearch(newFilters),
        500,
    );

    // ---- Filter handling ----
    const handleFilterChange = (key: string | Record<string, string>, value: string, debounce: boolean = false) => {
        let newFilters = null
        if (typeof key ==='object') {
            newFilters = { ...filters, ...key };
        } else {
            newFilters = { ...filters, [key]: value };
        }
        setFilters(newFilters);
        if (debounce) {
            debouncedSearch(newFilters);
        } else {
            handleSearch(newFilters);
        }
    };

    const handleSearch = (newFilters: Record<string, string>) => {
        // const newFilters = { ...filters, [key]: value };
        onFilterChange?.(newFilters);
    };

    // ---- Row selection handling ----
    const toggleRow = (index: number) => {
        setSelectedRows(prev =>
            prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index],
        );
    };

    const toggleSelectAll = () => {
        if (selectedRows.length === safeData.length) {
            setSelectedRows([]);
        } else {
            setSelectedRows(safeData.map((_, i) => i));
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
        setVisibleColumns(columnsWithOperation.map(c => c.key));
    }, [columnsWithOperation]);

    return (
        <div className="flex flex-col gap-4">
            {/* Toolbar on top */}
            <DataTableToolbar
                prefix={prefix}
                columns={columnsWithOperation}
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
                                    checked={
                                        selectedRows.length === safeData.length && safeData.length > 0
                                            ? true
                                            : selectedRows.length > 0 && selectedRows.length < safeData.length
                                              ? 'indeterminate'
                                              : false
                                    }
                                    onCheckedChange={toggleSelectAll}
                                />
                            </TableHead>

                            {columnsWithOperation.map(
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
                            {columnsWithOperation.map(
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
                                                                true,
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
                        ) : safeData.length ? (
                            safeData.map((row, i) => (
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

                                    {columnsWithOperation.map(
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
