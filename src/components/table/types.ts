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
    prefix: string;
    columns: ColumnDef<T>[];
    data: T[];
    total: number;
    page: number;
    pageSize: number;
    loading?: boolean;
    onPageChange?: (page: number) => void;
    onSortChange?: (key: string, direction: 'asc' | 'desc') => void;
    onFilterChange?: (filters: Record<string, string>) => void;
    /** Handler for edit action, receives row data and should navigate to edit page */
    onEdit?: (row: T) => void;
    /** Handler for delete action, receives row data */
    onDelete?: (row: T) => void;
    /** Function to extract ID from row (default: (row) => (row as any).id) */
    getId?: (row: T) => number | string;
}
