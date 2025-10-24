import { cn } from '@/lib/utils';
import { Home, Settings, LogOut, Folder, Users } from 'lucide-react';
import { SidebarItem } from './SidebarItem';
import { SidebarGroup } from './SidebarGroup';
import { SidebarHeader } from './SidebarHeader';
import { useAdminLayout } from '@/contexts/AdminLayoutContext';

interface SidebarProps {
    className?: string;
}

export function Sidebar({ className }: SidebarProps) {
    const { collapsed } = useAdminLayout();

    return (
        <aside
            className={cn(
                'flex flex-col border-r bg-background text-foreground transition-all duration-300',
                collapsed ? 'w-16' : 'w-64',
                className,
            )}
        >
            <SidebarHeader />

            {/* Sidebar Body */}
            <nav className="flex-1 overflow-y-auto p-2 space-y-1">
                <SidebarItem
                    icon={<Home className="h-5 w-5" />}
                    label="Dashboard"
                    collapsed={collapsed}
                    active
                />

                <SidebarGroup
                    icon={<Folder className="h-5 w-5" />}
                    label="Projects"
                    collapsed={collapsed}
                    items={[
                        { label: 'All Projects', href: '/projects' },
                        { label: 'New Project', href: '/projects/new' },
                    ]}
                />

                <SidebarGroup
                    icon={<Users className="h-5 w-5" />}
                    label="Users"
                    collapsed={collapsed}
                    items={[
                        { label: 'Team', href: '/users/team' },
                        { label: 'Clients', href: '/users/clients' },
                    ]}
                />

                <SidebarItem
                    icon={<Settings className="h-5 w-5" />}
                    label="Settings"
                    collapsed={collapsed}
                />
            </nav>

            {/* Sidebar Footer */}
            <div className="border-t p-3">
                <SidebarItem
                    icon={<LogOut className="h-5 w-5" />}
                    label="Logout"
                    collapsed={collapsed}
                />
            </div>
        </aside>
    );
}
