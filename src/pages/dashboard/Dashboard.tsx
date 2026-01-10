import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardClient, type DashboardStats } from '@/api/models/dashboard/dashboardClient';
import {
    Plane,
    Activity,
    Users,
    FileText,
    Shield,
    MapPin,
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    CheckCircle,
    Clock,
    Battery,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

export default function Dashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            setLoading(true);
            setError(null);
            console.log('Loading dashboard stats...');
            const data = await DashboardClient.getStats();
            console.log('Dashboard stats loaded:', data);
            setStats(data);
        } catch (err: any) {
            const errorMessage = err?.response?.data?.message || err?.message || 'Unknown error';
            console.error('Failed to load dashboard stats:', err);
            console.error('Error details:', {
                message: errorMessage,
                status: err?.response?.status,
                data: err?.response?.data,
            });
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="p-6 space-y-6">
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => (
                        <Card key={i}>
                            <CardHeader>
                                <Skeleton className="h-4 w-24" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-8 w-16" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="p-6">
                <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-600 font-semibold">Failed to load dashboard data</p>
                    {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                    <button
                        onClick={loadStats}
                        className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <button
                    onClick={loadStats}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Refresh
                </button>
            </div>

            {/* Top KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Drones */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">
                            Total Drones
                        </CardTitle>
                        <Plane className="w-4 h-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.drones.total}</div>
                        <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                                {stats.drones.in_flight} Flying
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                                {stats.drones.available} Available
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                {/* Active Missions */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">
                            Missions Today
                        </CardTitle>
                        <Activity className="w-4 h-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.missions.today}</div>
                        <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                                {stats.missions.in_progress} In Progress
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                {/* Active Pilots */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">
                            Active Pilots
                        </CardTitle>
                        <Users className="w-4 h-4 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.pilots.active}</div>
                        <div className="text-xs text-gray-500 mt-2">
                            of {stats.pilots.total} total
                        </div>
                    </CardContent>
                </Card>

                {/* Active Permits */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">
                            Active Permits
                        </CardTitle>
                        <FileText className="w-4 h-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.permits.active}</div>
                        <div className="flex items-center gap-2 mt-2">
                            {stats.permits.pending > 0 && (
                                <Badge variant="outline" className="text-xs">
                                    {stats.permits.pending} Pending
                                </Badge>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Second Row - Detailed Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Drone Details */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Plane className="w-5 h-5" />
                            Drone Fleet Status
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-500">Available</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {stats.drones.available}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">In Flight</p>
                                <p className="text-2xl font-bold text-blue-600">
                                    {stats.drones.in_flight}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Maintenance</p>
                                <p className="text-2xl font-bold text-orange-600">
                                    {stats.drones.maintenance}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Charging</p>
                                <p className="text-2xl font-bold text-yellow-600">
                                    {stats.drones.charging}
                                </p>
                            </div>
                        </div>
                        <div className="pt-4 border-t">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-gray-600 flex items-center gap-2">
                                    <Battery className="w-4 h-4" />
                                    Avg Battery Health
                                </span>
                                <span className="text-lg font-bold">
                                    {stats.drones.avgBatteryHealth}%
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    Total Flight Hours
                                </span>
                                <span className="text-lg font-bold">
                                    {stats.drones.totalFlightHours}h
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Mission Details */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="w-5 h-5" />
                            Mission Overview
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-500">Completed</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {stats.missions.completed}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">In Progress</p>
                                <p className="text-2xl font-bold text-blue-600">
                                    {stats.missions.in_progress}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Planned</p>
                                <p className="text-2xl font-bold text-purple-600">
                                    {stats.missions.planned}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Failed</p>
                                <p className="text-2xl font-bold text-red-600">
                                    {stats.missions.failed}
                                </p>
                            </div>
                        </div>
                        <div className="pt-4 border-t">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4" />
                                    Success Rate
                                </span>
                                <span className="text-lg font-bold text-green-600">
                                    {stats.missions.successRate}%
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Third Row - Licenses & Permits */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Licenses */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="w-5 h-5" />
                            Licenses
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Total</span>
                            <span className="font-bold">{stats.licenses.total}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 flex items-center gap-1">
                                <CheckCircle className="w-3 h-3 text-green-600" />
                                Active
                            </span>
                            <span className="font-bold text-green-600">
                                {stats.licenses.active}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 flex items-center gap-1">
                                <Clock className="w-3 h-3 text-orange-600" />
                                Expiring Soon
                            </span>
                            <span className="font-bold text-orange-600">
                                {stats.licenses.expiringSoon}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3 text-red-600" />
                                Expired
                            </span>
                            <span className="font-bold text-red-600">{stats.licenses.expired}</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Flight Permits */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="w-5 h-5" />
                            Flight Permits
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Total</span>
                            <span className="font-bold">{stats.permits.total}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 flex items-center gap-1">
                                <CheckCircle className="w-3 h-3 text-green-600" />
                                Approved
                            </span>
                            <span className="font-bold text-green-600">
                                {stats.permits.approved}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 flex items-center gap-1">
                                <Clock className="w-3 h-3 text-yellow-600" />
                                Pending
                            </span>
                            <span className="font-bold text-yellow-600">
                                {stats.permits.pending}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3 text-orange-600" />
                                Expiring Soon
                            </span>
                            <span className="font-bold text-orange-600">
                                {stats.permits.expiringSoon}
                            </span>
                        </div>
                    </CardContent>
                </Card>

                {/* No-Fly Zones */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MapPin className="w-5 h-5" />
                            Safety Zones
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">No-Fly Zones</span>
                            <span className="font-bold">{stats.noFlyZones}</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-4">
                            Active restricted areas on the map
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
