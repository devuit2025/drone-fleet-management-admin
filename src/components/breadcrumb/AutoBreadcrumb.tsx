// src/components/ui/auto-breadcrumb.tsx
import * as React from 'react';
import { ChevronRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAdminLayout } from '@/contexts/AdminLayoutContext';

interface AutoBreadcrumbProps extends React.HTMLAttributes<HTMLDivElement> {
    rootLabel?: string; // default: "Home"
}

export function AutoBreadcrumb({ rootLabel = 'Home', className }: AutoBreadcrumbProps) {
    const location = useLocation();
    const segments = location.pathname.split('/').filter(Boolean);
    const { labelMap } = useAdminLayout();

    const crumbs = segments.map((segment, index) => {
        const path = '/' + segments.slice(0, index + 1).join('/');
        return {
            label: labelMap[segment] || decodeURIComponent(segment),
            to: path,
        };
    });

    return (
        <nav
            aria-label="Breadcrumb"
            className={cn('flex items-center text-sm text-muted-foreground mb-4', className)}
        >
            <Link to="/" className="hover:text-foreground transition-colors">
                {rootLabel}
            </Link>

            {crumbs.map((crumb, index) => (
                <React.Fragment key={index}>
                    <ChevronRight className="mx-2 h-4 w-4 text-muted-foreground" />
                    {index === crumbs.length - 1 ? (
                        <span className="text-foreground font-medium">{crumb.label}</span>
                    ) : (
                        <Link to={crumb.to} className="hover:text-foreground transition-colors">
                            {crumb.label}
                        </Link>
                    )}
                </React.Fragment>
            ))}
        </nav>
    );
}
