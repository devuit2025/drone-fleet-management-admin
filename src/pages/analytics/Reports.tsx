import { useEffect, useState } from 'react';
import { Scatter } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { AutoBreadcrumb } from '@/components/breadcrumb/AutoBreadcrumb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    ReportsAnalyticsClient,
    type ReportsAnalyticsResponse,
} from '@/api/analytics/reportsAnalyticsClient';
import { AlertTriangle, Shield, Award, Wrench, CreditCard, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function Reports() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<ReportsAnalyticsResponse | null>(null);

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            setLoading(true);
            const response = await ReportsAnalyticsClient.getReportsAnalytics();
            setData(response);
        } catch (error: any) {
            console.error('Failed to fetch reports:', error);
            toast.error('Không thể tải dữ liệu báo cáo');
            // Mock data for development
            setData(getMockData());
        } finally {
            setLoading(false);
        }
    };

    const getMockData = (): ReportsAnalyticsResponse => ({
        maintenanceDue: [
            {
                droneId: 1,
                droneName: 'Drone Alpha',
                serialNumber: 'DRN-001',
                lastMaintenance: '2024-09-15',
                daysSinceLastMaintenance: 95,
                status: 'critical',
            },
            {
                droneId: 2,
                droneName: 'Drone Beta',
                serialNumber: 'DRN-002',
                lastMaintenance: '2024-10-20',
                daysSinceLastMaintenance: 60,
                status: 'warning',
            },
            {
                droneId: 3,
                droneName: 'Drone Gamma',
                serialNumber: 'DRN-003',
                lastMaintenance: '2024-11-15',
                daysSinceLastMaintenance: 35,
                status: 'ok',
            },
        ],
        incidents: [
            { eventType: 'battery_low', count: 12, percentage: 40, severity: 'high' },
            { eventType: 'altitude_violation', count: 8, percentage: 26.7, severity: 'high' },
            { eventType: 'signal_loss', count: 6, percentage: 20, severity: 'medium' },
            { eventType: 'gps_error', count: 4, percentage: 13.3, severity: 'medium' },
        ],
        licensesExpiring: [
            {
                licenseId: 1,
                licenseNumber: 'LIC-2024-001',
                pilotId: 1,
                pilotName: 'Nguyễn Văn A',
                expiryDate: '2024-12-25',
                daysUntilExpiry: 8,
                status: 'critical',
            },
            {
                licenseId: 2,
                licenseNumber: 'LIC-2024-002',
                pilotId: 2,
                pilotName: 'Trần Thị B',
                expiryDate: '2025-01-10',
                daysUntilExpiry: 24,
                status: 'warning',
            },
        ],
        performanceMetrics: [
            { label: 'Avg Speed', value: 12.5, change: 5.2, format: 'number' },
            { label: 'Avg Distance', value: 15234, change: -2.3, format: 'distance' },
            { label: 'Mission Success', value: 94.2, change: 1.8, format: 'percentage' },
        ],
        batteryConsumption: [
            {
                missionId: 1,
                missionName: 'Mission Alpha',
                flightTime: 3600,
                batteryConsumed: 75,
                efficiency: 48,
            },
            {
                missionId: 2,
                missionName: 'Mission Beta',
                flightTime: 2400,
                batteryConsumed: 55,
                efficiency: 43.6,
            },
            {
                missionId: 3,
                missionName: 'Mission Gamma',
                flightTime: 4200,
                batteryConsumed: 82,
                efficiency: 51.2,
            },
            {
                missionId: 4,
                missionName: 'Mission Delta',
                flightTime: 1800,
                batteryConsumed: 42,
                efficiency: 42.9,
            },
            {
                missionId: 5,
                missionName: 'Mission Epsilon',
                flightTime: 3000,
                batteryConsumed: 68,
                efficiency: 44.1,
            },
        ],
        distanceLeaderboard: [
            {
                pilotId: 1,
                pilotName: 'Nguyễn Văn A',
                totalDistance: 125000,
                flightCount: 45,
                avgDistance: 2778,
            },
            {
                pilotId: 2,
                pilotName: 'Trần Thị B',
                totalDistance: 98500,
                flightCount: 38,
                avgDistance: 2592,
            },
            {
                pilotId: 3,
                pilotName: 'Lê Văn C',
                totalDistance: 87300,
                flightCount: 32,
                avgDistance: 2728,
            },
        ],
    });

    const getMaintenanceStatusColor = (status: string) => {
        switch (status) {
            case 'critical':
                return 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-400';
            case 'warning':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-400';
            default:
                return 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-400';
        }
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'high':
                return 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-400';
            case 'medium':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-400';
            default:
                return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-400';
        }
    };

    const batteryConsumptionChart = {
        datasets: [
            {
                label: 'Battery Efficiency',
                data:
                    data?.batteryConsumption.map(d => ({
                        x: d.flightTime / 60, // convert to minutes
                        y: d.batteryConsumed,
                    })) || [],
                backgroundColor: 'rgba(59, 130, 246, 0.6)',
                pointRadius: 8,
                pointHoverRadius: 10,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                callbacks: {
                    label: (context: any) => {
                        const mission = data?.batteryConsumption[context.dataIndex];
                        return [
                            `Mission: ${mission?.missionName}`,
                            `Time: ${context.parsed.x.toFixed(0)} min`,
                            `Battery: ${context.parsed.y.toFixed(1)}%`,
                            `Efficiency: ${mission?.efficiency.toFixed(1)} sec/1%`,
                        ];
                    },
                },
            },
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Flight Time (minutes)',
                },
            },
            y: {
                title: {
                    display: true,
                    text: 'Battery Consumed (%)',
                },
                beginAtZero: true,
            },
        },
    };

    return (
        <div className="space-y-6">
            <AutoBreadcrumb />

            <div>
                <h1 className="text-3xl font-bold tracking-tight">Báo cáo tổng hợp</h1>
                <p className="text-muted-foreground">
                    Báo cáo chi tiết về bảo trì, an toàn bay và hiệu suất hoạt động
                </p>
            </div>

            {/* Maintenance Due Section */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Wrench className="h-5 w-5 text-muted-foreground" />
                        <CardTitle className="text-base font-medium">
                            Lịch bảo trì sắp tới
                        </CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="text-xs uppercase bg-muted">
                                <tr>
                                    <th className="px-6 py-3 text-left">Drone</th>
                                    <th className="px-6 py-3 text-left">Serial Number</th>
                                    <th className="px-6 py-3 text-left">Last Maintenance</th>
                                    <th className="px-6 py-3 text-left">Days Since</th>
                                    <th className="px-6 py-3 text-left">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data?.maintenanceDue.map(drone => (
                                    <tr key={drone.droneId} className="border-b hover:bg-muted/50">
                                        <td className="px-6 py-4 font-medium">{drone.droneName}</td>
                                        <td className="px-6 py-4">{drone.serialNumber}</td>
                                        <td className="px-6 py-4">
                                            {format(new Date(drone.lastMaintenance), 'dd/MM/yyyy')}
                                        </td>
                                        <td className="px-6 py-4">
                                            {drone.daysSinceLastMaintenance} days
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge
                                                className={getMaintenanceStatusColor(drone.status)}
                                            >
                                                {drone.status}
                                            </Badge>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Safety & Compliance Section */}
            <div className="grid gap-4 md:grid-cols-2">
                {/* Incident Summary */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Shield className="h-5 w-5 text-muted-foreground" />
                            <CardTitle className="text-base font-medium">Tổng hợp sự cố</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {data?.incidents.map(incident => (
                                <div
                                    key={incident.eventType}
                                    className="flex items-center justify-between p-3 border rounded-lg"
                                >
                                    <div className="flex items-center gap-3">
                                        <AlertTriangle
                                            className={`h-5 w-5 ${
                                                incident.severity === 'high'
                                                    ? 'text-red-500'
                                                    : incident.severity === 'medium'
                                                      ? 'text-yellow-500'
                                                      : 'text-blue-500'
                                            }`}
                                        />
                                        <div>
                                            <p className="font-medium capitalize">
                                                {incident.eventType.replace(/_/g, ' ')}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {incident.percentage.toFixed(1)}% of incidents
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg font-bold">{incident.count}</span>
                                        <Badge className={getSeverityColor(incident.severity)}>
                                            {incident.severity}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* License Expiry */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <CreditCard className="h-5 w-5 text-muted-foreground" />
                            <CardTitle className="text-base font-medium">
                                License sắp hết hạn
                            </CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {data?.licensesExpiring.map(license => (
                                <div
                                    key={license.licenseId}
                                    className="flex items-center justify-between p-3 border rounded-lg"
                                >
                                    <div>
                                        <p className="font-medium">{license.pilotName}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {license.licenseNumber}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Expires:{' '}
                                            {format(new Date(license.expiryDate), 'dd/MM/yyyy')}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p
                                            className={`text-lg font-bold ${
                                                license.status === 'critical'
                                                    ? 'text-red-600'
                                                    : 'text-yellow-600'
                                            }`}
                                        >
                                            {license.daysUntilExpiry} days
                                        </p>
                                        <Badge
                                            className={
                                                license.status === 'critical'
                                                    ? 'bg-red-100 text-red-800'
                                                    : 'bg-yellow-100 text-yellow-800'
                                            }
                                        >
                                            {license.status}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Performance Metrics */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Award className="h-5 w-5 text-muted-foreground" />
                        <CardTitle className="text-base font-medium">Hiệu suất hoạt động</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                        {data?.performanceMetrics.map(metric => (
                            <div key={metric.label} className="p-4 border rounded-lg">
                                <p className="text-sm text-muted-foreground mb-1">{metric.label}</p>
                                <div className="flex items-end justify-between">
                                    <p className="text-2xl font-bold">
                                        {metric.format === 'percentage'
                                            ? `${metric.value.toFixed(1)}%`
                                            : metric.format === 'distance'
                                              ? `${(metric.value / 1000).toFixed(2)} km`
                                              : metric.value.toFixed(1)}
                                    </p>
                                    <span
                                        className={`text-sm font-medium ${
                                            metric.change > 0 ? 'text-green-600' : 'text-red-600'
                                        }`}
                                    >
                                        {metric.change > 0 ? '+' : ''}
                                        {metric.change.toFixed(1)}%
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Battery Consumption Scatter Chart */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base font-medium">Hiệu suất tiêu thụ pin</CardTitle>
                    <p className="text-sm text-muted-foreground">
                        Mối quan hệ giữa thời gian bay và mức tiêu thụ pin
                    </p>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px]">
                        {!loading && data && (
                            <Scatter data={batteryConsumptionChart} options={chartOptions} />
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Distance Leaderboard */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-muted-foreground" />
                        <CardTitle className="text-base font-medium">
                            Bảng xếp hạng quãng đường bay
                        </CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="text-xs uppercase bg-muted">
                                <tr>
                                    <th className="px-6 py-3 text-left">Rank</th>
                                    <th className="px-6 py-3 text-left">Pilot</th>
                                    <th className="px-6 py-3 text-right">Total Distance</th>
                                    <th className="px-6 py-3 text-right">Flights</th>
                                    <th className="px-6 py-3 text-right">Avg Distance</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data?.distanceLeaderboard.map((pilot, index) => (
                                    <tr key={pilot.pilotId} className="border-b hover:bg-muted/50">
                                        <td className="px-6 py-4">
                                            <div
                                                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                                                    index === 0
                                                        ? 'bg-yellow-100 text-yellow-800'
                                                        : index === 1
                                                          ? 'bg-gray-100 text-gray-800'
                                                          : index === 2
                                                            ? 'bg-orange-100 text-orange-800'
                                                            : 'bg-blue-100 text-blue-800'
                                                }`}
                                            >
                                                {index + 1}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-medium">{pilot.pilotName}</td>
                                        <td className="px-6 py-4 text-right">
                                            {(pilot.totalDistance / 1000).toFixed(2)} km
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {pilot.flightCount}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {(pilot.avgDistance / 1000).toFixed(2)} km
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
