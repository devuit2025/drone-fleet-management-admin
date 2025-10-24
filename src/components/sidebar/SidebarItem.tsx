import { cn } from '@/lib/utils';
import { Button } from '../ui/button';

interface SidebarItemProps {
    icon: React.ReactNode;
    label: string;
    collapsed: boolean;
    active?: boolean;
    onClick?: () => void;
}

export function SidebarItem({ icon, label, collapsed, active, onClick }: SidebarItemProps) {
    return (
        <Button
            variant="ghost"
            onClick={onClick}
            className={cn(
                'w-full justify-start font-normal transition-colors',
                collapsed ? 'px-2' : 'px-3',
                // Blue hover styling
                'hover:bg-accent hover:text-accent-foreground',
                // Active styling
                active &&
                    'bg-blue-100 dark:bg-blue-800/50 text-blue-700 dark:text-blue-300 font-medium',
            )}
        >
            {icon}
            {!collapsed && <span className="ml-3">{label}</span>}
        </Button>
    );
}
