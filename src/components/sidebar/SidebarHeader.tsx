// src/components/sidebar/SidebarHeader.tsx
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

interface SidebarHeaderProps {
    collapsed: boolean;
    onToggle: () => void;
}

export function SidebarHeader({ collapsed, onToggle }: SidebarHeaderProps) {
    return (
        <div className="flex items-center justify-between p-4 ">
            {!collapsed && <h1 className="text-lg font-semibold tracking-tight">Admin Panel</h1>}
            <Button
                variant="ghost"
                size="icon"
                onClick={onToggle}
                className="text-muted-foreground hover:text-foreground"
            >
                <Menu className="h-5 w-5" />
            </Button>
        </div>
    );
}
