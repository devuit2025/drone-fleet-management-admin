import { Button } from '@/components/ui/button';

interface Props {
    total: number;
    page: number;
    pageSize: number;
    onPageChange?: (page: number) => void;
}

export function DataTablePagination({ total, page, pageSize, onPageChange }: Props) {
    const totalPages = Math.ceil(total / pageSize);

    return (
        <div className="flex items-center justify-end gap-2 py-3">
            <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange?.(page - 1)}
                disabled={page === 1}
            >
                Prev
            </Button>
            <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
            </span>
            <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange?.(page + 1)}
                disabled={page === totalPages}
            >
                Next
            </Button>
        </div>
    );
}
