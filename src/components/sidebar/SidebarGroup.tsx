// src/components/sidebar/SidebarGroup.tsx
import { SidebarItem } from './SidebarItem';
import type { SidebarGroup as SidebarGroupType } from './sidebar-routes';

interface SidebarGroupProps {
    group: SidebarGroupType;
    collapsed: boolean;
}

export function SidebarGroup({ group, collapsed }: SidebarGroupProps) {
    return (
        <div className="space-y-1">
            {!collapsed && group.title && (
                <h2 className="px-3 text-xs font-semibold text-muted-foreground mb-2 tracking-wide">
                    {group.title}
                </h2>
            )}
            {group.items.map(item => (
                <SidebarItem key={item.name} item={item} collapsed={collapsed} />
            ))}
        </div>
    );
}
