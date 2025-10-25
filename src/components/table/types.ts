export interface ColumnDef<T> {
    key: keyof T | string;
    header: string;
    sortable?: boolean;
    filterable?: boolean;
    width?: string;
    render?: (row: T) => React.ReactNode;
    /** optional custom filter component */
    filterComponent?: (value: string, onChange: (v: string) => void) => React.ReactNode;
}

export interface DataTableProps<T> {
    columns: ColumnDef<T>[];
    data: T[];
    total: number;
    page: number;
    pageSize: number;
    loading?: boolean;
    onPageChange?: (page: number) => void;
    onSortChange?: (key: string, direction: 'asc' | 'desc') => void;
    onFilterChange?: (filters: Record<string, string>) => void;
}
