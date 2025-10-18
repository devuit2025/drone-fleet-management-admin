// src/components/sidebar/SidebarItem.tsx
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Link, useLocation } from 'react-router-dom';
import type { SidebarItem as SidebarItemType } from './sidebar-routes';

interface SidebarItemProps {
    item: SidebarItemType;
    collapsed: boolean;
}

export function SidebarItem({ item, collapsed }: SidebarItemProps) {
    const location = useLocation?.();
    const currentPath = location?.pathname ?? '/';
    const [open, setOpen] = useState(false);

    const Icon = item.icon;
    const isActive = currentPath === item.path;

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <div>
                    <Button
                        variant={isActive ? 'secondary' : 'ghost'}
                        className={cn(
                            'w-full justify-start gap-3 text-sm font-medium transition-colors rounded-md',
                            'hover:bg-accent hover:text-accent-foreground',
                            collapsed ? 'px-2 justify-center' : 'px-3',
                        )}
                        onClick={() => item.children && setOpen(!open)}
                        asChild={!item.children}
                    >
                        {item.children ? (
                            <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-3">
                                    {Icon && <Icon className="h-4 w-4 shrink-0" />}
                                    {!collapsed && <span>{item.name}</span>}
                                </div>
                                {!collapsed &&
                                    (open ? (
                                        <ChevronDown className="h-3 w-3" />
                                    ) : (
                                        <ChevronRight className="h-3 w-3" />
                                    ))}
                            </div>
                        ) : (
                            <Link to={item.path ?? '#'} className="flex items-center gap-3 w-full">
                                {Icon && <Icon className="h-4 w-4 shrink-0" />}
                                {!collapsed && <span>{item.name}</span>}
                            </Link>
                        )}
                    </Button>

                    {!collapsed && item.children && open && (
                        <div className="ml-6 mt-1 space-y-1">
                            {item.children.map(sub => (
                                <Button
                                    key={sub.name}
                                    variant={currentPath === sub.path ? 'secondary' : 'ghost'}
                                    asChild
                                    className="w-full justify-start text-sm pl-4"
                                >
                                    <Link to={sub.path ?? '#'}>{sub.name}</Link>
                                </Button>
                            ))}
                        </div>
                    )}
                </div>
            </TooltipTrigger>
            {collapsed && <TooltipContent side="right">{item.name}</TooltipContent>}
        </Tooltip>
    );
}
