import { cn } from '@/lib/utils';
import {
    Home,
    Plane,
    User,
    Map,
    FileText,
    BarChart3,
    Shield,
    Settings,
    Activity,
    Terminal,
    AlertTriangle,
    LogOut,
} from 'lucide-react';
import { SidebarItem } from './SidebarItem';
import { SidebarGroup } from './SidebarGroup';
import { SidebarHeader } from './SidebarHeader';
import { useAdminLayout } from '@/contexts/AdminLayoutContext';
import { useLogout } from '@/hooks/useAuth';

interface SidebarProps {
    className?: string;
}

export function Sidebar({ className }: SidebarProps) {
    const { collapsed } = useAdminLayout();
    const { logout } = useLogout();

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
                {/* Dashboard */}
                <SidebarItem
                    icon={<Home className="h-5 w-5" />}
                    label="Bảng điều khiển"
                    href="/"
                    collapsed={collapsed}
                    active
                />

                <SidebarItem
                    icon={<Activity className="h-5 w-5" />}
                    label="Bản đồ trực tiếp"
                    href="/monitoring"
                    collapsed={collapsed}
                    active
                />

                <SidebarItem
                    icon={<AlertTriangle className="h-5 w-5" />}
                    label="Trung tâm Cảnh báo"
                    href="/alerts/logs"
                    collapsed={collapsed}
                    active
                />
                
                {/* Drone Management */}
                <SidebarGroup
                    icon={<Plane className="h-5 w-5" />}
                    label="Quản lý Drone"
                    collapsed={collapsed}
                    items={[
                        { label: 'Danh sách Drone', href: '/drones' },
                        { label: 'Thương hiệu', href: '/drone-brand' },
                        { label: 'Phân loại', href: '/drone-category' },
                        { label: 'Model', href: '/drone-models' },
                        { label: 'Sensor', href: '/drone-sensors' },
                        // { label: 'Nhật ký bảo trì', href: '/drones/maintenance' },
                    ]}
                />

                <SidebarItem
                    icon={<User className="h-5 w-5" />}
                    label="Quản lý Phi công"
                    href="/pilots"
                    collapsed={collapsed}
                    active
                />
                
                <SidebarItem
                    icon={<Map className="h-5 w-5" />}
                    label="Quản lý Nhiệm vụ"
                    href="/missions"
                    collapsed={collapsed}
                    active
                />

                <SidebarItem
                    icon={<FileText className="h-5 w-5" />}
                    label="Khu vực cấm bay"
                    href="/no-fly-zones"
                    collapsed={collapsed}
                    active
                />

                <SidebarItem
                    icon={<Shield className="h-5 w-5" />}
                    label="Giấy phép bay"
                    href="/licenses"
                    collapsed={collapsed}
                    active
                />

                {/* Analytics */}
                <SidebarGroup
                    icon={<BarChart3 className="h-5 w-5" />}
                    label="Phân tích & Báo cáo"
                    collapsed={collapsed}
                    items={[
                        { label: 'Thống kê chuyến bay', href: '/analytics/flights' },
                        { label: 'Báo cáo tổng hợp', href: '/analytics/reports' },
                        { label: 'Xu hướng thời gian bay', href: '/analytics/trends' },
                    ]}
                />

                {/* System Administration */}
                <SidebarGroup
                    icon={<Settings className="h-5 w-5" />}
                    label="Quản trị Hệ thống"
                    collapsed={collapsed}
                    items={[
                        { label: 'Người dùng & Quyền', href: '/admin/users' },
                        // { label: 'Cấu hình hệ thống', href: '/admin/settings' },
                        { label: 'Nhật ký truy cập', href: '/admin/logs' },
                    ]}
                />
            </nav>

            {/* Sidebar Footer */}
            <div className="border-t p-3">
                <SidebarItem
                    icon={<LogOut className="h-5 w-5" />}
                    label="Đăng xuất"
                    onClick={logout}
                    collapsed={collapsed}
                />
            </div>
        </aside>
    );
}
