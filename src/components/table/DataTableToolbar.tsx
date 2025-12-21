import React, { useState, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuCheckboxItem,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Search, SlidersHorizontal, MoreVertical, Plus } from 'lucide-react';
import type { ColumnDef } from './types';
import { useDebounce } from '@/hooks/useDebounce';
import { useNavigate } from 'react-router-dom';

interface Props<T> {
    prefix: string;
    columns: ColumnDef<T>[];
    onFilterChange?: (filters: Record<string, string>) => void;
    onColumnToggle?: (visibleColumns: string[]) => void;
    onBulkAction?: (action: string) => void;
    selectedCount?: number; // number of selected rows
}

export function DataTableToolbar<T>({
    prefix,
    columns,
    onFilterChange,
    onColumnToggle,
    onBulkAction,
    selectedCount = 0,
}: Props<T>) {
    const navigate = useNavigate();
    const [filters, setFilters] = useState<Record<string, string>>({});
    const [visibleColumns, setVisibleColumns] = useState<string[]>(columns.map(c => c.key));
    // const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const debouncedSearch = useDebounce(
        (newFilters: Record<string, string>) => handleSearch(newFilters),
        500,
    );

    const handleChange = (value: string, debounce: boolean = false) => {
        console.log('value', value);
        const newFilters = { ...filters, global: value };
        console.log('newFilters', newFilters);
        setFilters(newFilters);
        if (debounce) {
            debouncedSearch(newFilters);
        } else {
            handleSearch(newFilters);
        }
    };

    const handleSearch = (newFilters: Record<string, string>) => {
        onFilterChange?.(newFilters);
    };

    const toggleColumn = (key: string) => {
        const updated = visibleColumns.includes(key)
            ? visibleColumns.filter(k => k !== key)
            : [...visibleColumns, key];
        setVisibleColumns(updated);
        onColumnToggle?.(updated);
    };

    const handleBulkAction = (action: string) => {
        if (selectedCount > 0) onBulkAction?.(action);
    };

    return (
        <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Global Search */}
            <div className="relative w-full sm:w-auto">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    className="pl-8 w-full sm:w-64"
                    placeholder="Search all columns..."
                    value={filters.global || ''}
                    onChange={e => handleChange(e.target.value, true)}
                />
            </div>

            {/* Right-side Controls */}
            <div className="flex items-center gap-2">
                {/* Create New Button */}
                <Button onClick={() => navigate(`/${prefix}/create`)}>
                    <Plus />
                    Create New
                </Button>
                {/* Bulk Actions */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="default"
                            size="sm"
                            className="flex items-center gap-2"
                            disabled={selectedCount === 0}
                        >
                            <MoreVertical className="h-4 w-4" />
                            {selectedCount > 0 ? `Bulk Actions (${selectedCount})` : 'Bulk Actions'}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Bulk Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={() => handleBulkAction('delete')}
                            disabled={selectedCount === 0}
                        >
                            Delete Selected
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => handleBulkAction('export')}
                            disabled={selectedCount === 0}
                        >
                            Export Selected
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => handleBulkAction('assign')}
                            disabled={selectedCount === 0}
                        >
                            Assign to Group
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Column Visibility */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="flex items-center gap-2">
                            <SlidersHorizontal className="h-4 w-4" />
                            Columns
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {columns.map(col => (
                            <DropdownMenuCheckboxItem
                                key={col.key}
                                checked={visibleColumns.includes(col.key)}
                                onCheckedChange={() => toggleColumn(col.key)}
                            >
                                {col.header}
                            </DropdownMenuCheckboxItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Reset Filters */}
                <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                        setFilters({});
                        onFilterChange?.({});
                    }}
                >
                    Reset
                </Button>
            </div>
        </div>
    );
}
