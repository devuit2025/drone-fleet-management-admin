import { Drone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAdminLayout } from '@/contexts/AdminLayoutContext';

interface SidebarHeaderProps {}

export function SidebarHeader({}: SidebarHeaderProps) {
    const { collapsed } = useAdminLayout();

    return (
        <div className={cn('flex items-center justify-between px-4 py-3 border-b bg-background')}>
            {/* Icon + Title */}
            <div className="flex items-center space-x-3">
                <Drone
                    className={cn(
                        'transition-all text-blue-600 dark:text-blue-400',
                        collapsed ? 'h-6 w-6' : 'h-10 w-10',
                    )}
                />
                {!collapsed && (
                    <div className="flex flex-col leading-tight">
                        <span className="font-semibold text-lg text-600">DroneFleet</span>
                        <span className="text-xs text-muted-foreground">Fleet Management</span>
                    </div>
                )}
            </div>
        </div>
    );
}
