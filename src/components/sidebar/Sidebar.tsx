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
    const { logout } = useLogout()

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

                {/* Real-Time Monitoring */}
                <SidebarGroup
                    icon={<Activity className="h-5 w-5" />}
                    label="Giám sát Thời gian thực"
                    collapsed={collapsed}
                    items={[
                        { label: 'Bản đồ trực tiếp', href: '/monitoring/map' },
                        { label: 'Bảng Telemetry', href: '/monitoring/telemetry' },
                        { label: 'Bảng Cảnh báo', href: '/monitoring/alerts' },
                    ]}
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
                        // { label: 'Nhật ký bảo trì', href: '/drones/maintenance' },
                    ]}
                />

                {/* Pilot Management */}
                <SidebarGroup
                    icon={<User className="h-5 w-5" />}
                    label="Quản lý Phi công"
                    collapsed={collapsed}
                    items={[
                        { label: 'Danh sách Phi công', href: '/pilots' },
                        // { label: 'Chi tiết Phi công', href: '/pilots/details' },
                        // { label: 'Xác thực Giấy phép', href: '/pilots/license' },
                    ]}
                />

                {/* Mission Management */}
                <SidebarGroup
                    icon={<Map className="h-5 w-5" />}
                    label="Quản lý Nhiệm vụ"
                    collapsed={collapsed}
                    items={[
                        { label: 'Danh sách Nhiệm vụ', href: '/missions' },
                        { label: 'Tạo Nhiệm vụ mới', href: '/missions/create' },
                        { label: 'Chi tiết Nhiệm vụ', href: '/missions/details' },
                    ]}
                />

                {/* Flight Planning */}
                <SidebarGroup
                    icon={<FileText className="h-5 w-5" />}
                    label="Lập kế hoạch bay"
                    collapsed={collapsed}
                    items={[
                        { label: 'Tạo tuyến bay', href: '/planning/create' },
                        { label: 'Khu vực cấm bay', href: '/planning/zones' },
                        { label: 'Kiểm tra hợp lệ', href: '/planning/validate' },
                    ]}
                />

                {/* Permit Management */}
                <SidebarGroup
                    icon={<Shield className="h-5 w-5" />}
                    label="Giấy phép bay"
                    collapsed={collapsed}
                    items={[
                        { label: 'Đăng ký Giấy phép', href: '/permits/apply' },
                        { label: 'Kiểm tra hợp lệ', href: '/permits/check' },
                        { label: 'Lịch sử phê duyệt', href: '/permits/logs' },
                    ]}
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

                {/* Simulation & Testing */}
                <SidebarGroup
                    icon={<Terminal className="h-5 w-5" />}
                    label="Mô phỏng & Kiểm thử"
                    collapsed={collapsed}
                    items={[
                        { label: 'Điều khiển Drone', href: '/control' },
                        { label: 'Kết nối ArduPilot', href: '/simulation/ardupilot' },
                        { label: 'Nhiệm vụ mô phỏng', href: '/simulation/missions' },
                        { label: 'So sánh dữ liệu', href: '/simulation/compare' },
                    ]}
                />

                {/* Error & Alert Center */}
                <SidebarGroup
                    icon={<AlertTriangle className="h-5 w-5" />}
                    label="Trung tâm Cảnh báo"
                    collapsed={collapsed}
                    items={[
                        { label: 'Cảnh báo hệ thống', href: '/alerts/system' },
                        { label: 'Cảnh báo an toàn', href: '/alerts/safety' },
                        { label: 'Nhật ký cảnh báo', href: '/alerts/logs' },
                    ]}
                />

                {/* System Administration */}
                <SidebarGroup
                    icon={<Settings className="h-5 w-5" />}
                    label="Quản trị Hệ thống"
                    collapsed={collapsed}
                    items={[
                        { label: 'Người dùng & Quyền', href: '/admin/users' },
                        { label: 'Cấu hình hệ thống', href: '/admin/settings' },
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
