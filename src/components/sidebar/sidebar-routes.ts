import { Home, Users, BarChart, Settings, Folder } from 'lucide-react';

export interface SidebarItem {
    name: string;
    icon?: React.ElementType;
    path?: string;
    children?: SidebarItem[];
}

export interface SidebarGroup {
    title?: string;
    items: SidebarItem[];
}

export const sidebarRoutes: SidebarGroup[] = [
    {
        title: 'General',
        items: [{ name: 'Dashboard', icon: Home, path: '/' }],
    },
    {
        title: 'Management',
        items: [
            {
                name: 'Users',
                icon: Users,
                children: [
                    { name: 'All Users', path: '/users' },
                    { name: 'Roles', path: '/users/roles' },
                ],
            },
            { name: 'Reports', icon: BarChart, path: '/reports' },
        ],
    },
    {
        title: 'System',
        items: [
            { name: 'Settings', icon: Settings, path: '/settings' },
            { name: 'Files', icon: Folder, path: '/files' },
        ],
    },
];
