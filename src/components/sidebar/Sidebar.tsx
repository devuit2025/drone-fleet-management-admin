// src/components/sidebar/Sidebar.tsx
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { TooltipProvider } from '@/components/ui/tooltip';
import { SidebarHeader } from './SidebarHeader';
import { SidebarGroup } from './SidebarGroup';
import { SidebarFooter } from './SidebarFooter';
import { sidebarRoutes } from './sidebar-routes';

export function Sidebar() {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <aside
            className={cn(
                'flex flex-col h-screen bg-background border-r shadow-sm transition-all duration-300',
                collapsed ? 'w-16' : 'w-64',
            )}
        >
            <SidebarHeader collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />

            <nav className="flex-1 overflow-y-auto p-2 space-y-4">
                <TooltipProvider>
                    {sidebarRoutes.map(group => (
                        <SidebarGroup key={group.title} group={group} collapsed={collapsed} />
                    ))}
                </TooltipProvider>
            </nav>

            <SidebarFooter collapsed={collapsed} />
        </aside>
    );
}
