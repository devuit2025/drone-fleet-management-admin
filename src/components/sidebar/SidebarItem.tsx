import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import React from 'react';
import { useAdminLayout } from '@/contexts/AdminLayoutContext';

interface SidebarItemProps {
    href?: string;
    icon: React.ReactNode;
    label: string;
    collapsed: boolean;
    active?: boolean;
    onClick?: () => void;
}

export function SidebarItem({ icon, label, collapsed, active, href, onClick }: SidebarItemProps) {
    const navigate = useNavigate();
    const { isActive } = useAdminLayout();

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        if (onClick) onClick();
        if (href) {
            navigate(href);
        }
    };

    return (
        <Button
            variant="ghost"
            onClick={handleClick}
            className={cn(
                'w-full justify-start font-normal transition-colors',
                collapsed ? 'px-2' : 'px-3',
                // Hover color
                'hover:bg-accent hover:text-accent-foreground',
                // Active highlight
                href && isActive(href)
                    ? 'bg-blue-100 text-blue-700 font-medium pointer-events-none'
                    : 'hover:bg-accent hover:text-accent-foreground',
            )}
        >
            {icon}
            {!collapsed && <span className="ml-3">{label}</span>}
        </Button>
    );
}
