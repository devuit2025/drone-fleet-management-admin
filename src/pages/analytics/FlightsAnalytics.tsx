import { useEffect, useState } from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { MetricCard } from '@/components/analytics/MetricCard';
import { AutoBreadcrumb } from '@/components/breadcrumb/AutoBreadcrumb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FlightAnalyticsClient, type FlightAnalyticsResponse } from '@/api/analytics/flightAnalyticsClient';
import { Activity, Clock, TrendingUp, CheckCircle, Plane } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

export default function FlightsAnalytics() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<FlightAnalyticsResponse | null>(null);
    const [dateRange, setDateRange] = useState({
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
    });

    useEffect(() => {
        fetchAnalytics();
    }, [dateRange]);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const response = await FlightAnalyticsClient.getFlightAnalytics({
                startDate: dateRange.startDate,
                endDate: dateRange.endDate,
            });
            setData(response);
        } catch (error: any) {
            console.error('Failed to fetch analytics:', error);
            toast.error('Không thể tải dữ liệu thống kê');
            // Set mock data for development
            setData(getMockData());
        } finally {
            setLoading(false);
        }
    };

    const getMockData = (): FlightAnalyticsResponse => ({
        stats: {
            totalFlights: 156,
            activeMissions: 8,
            avgFlightTime: 2345, // seconds
            successRate: 94.2,
        },
        flightsOverTime: Array.from({ length: 30 }, (_, i) => ({
            date: format(new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
            count: Math.floor(Math.random() * 10) + 2,
        })),
        topPilots: [
            { pilotId: 1, pilotName: 'Nguyễn Văn A', totalFlightHours: 127.5, flightCount: 45 },
            { pilotId: 2, pilotName: 'Trần Thị B', totalFlightHours: 98.3, flightCount: 38 },
            { pilotId: 3, pilotName: 'Lê Văn C', totalFlightHours: 85.7, flightCount: 32 },
            { pilotId: 4, pilotName: 'Phạm Thị D', totalFlightHours: 72.4, flightCount: 28 },
            { pilotId: 5, pilotName: 'Hoàng Văn E', totalFlightHours: 65.2, flightCount: 25 },
        ],
        statusDistribution: [
            { status: 'completed', count: 147, percentage: 94.2 },
            { status: 'failed', count: 5, percentage: 3.2 },
            { status: 'in_progress', count: 4, percentage: 2.6 },
        ],
        recentFlights: [
            {
                id: 1,
                missionName: 'Mission Alpha',
                pilotName: 'Nguyễn Văn A',
                drones: ['Drone-001'],
                duration: 2340,
                distance: 15430,
                batteryUsed: 68,
                status: 'completed',
                startTime: new Date().toISOString(),
                endTime: new Date().toISOString(),
            },
        ],
    });

    const flightsOverTimeChart = {
        labels: data?.flightsOverTime.map(d => format(new Date(d.date), 'dd/MM')) || [],
        datasets: [
            {
                label: 'Số chuyến bay',
                data: data?.flightsOverTime.map(d => d.count) || [],
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                fill: true,
                tension: 0.4,
            },
        ],
    };

    const topPilotsChart = {
        labels: data?.topPilots.map(p => p.pilotName) || [],
        datasets: [
            {
                label: 'Tổng giờ bay',
                data: data?.topPilots.map(p => p.totalFlightHours) || [],
                backgroundColor: 'rgba(59, 130, 246, 0.8)',
            },
        ],
    };

    const statusDistributionChart = {
        labels: data?.statusDistribution.map(s => {
            const statusMap: Record<string, string> = {
                completed: 'Hoàn thành',
                failed: 'Thất bại',
                in_progress: 'Đang bay',
                planned: 'Đã lên kế hoạch',
            };
            return statusMap[s.status] || s.status;
        }) || [],
        datasets: [
            {
                data: data?.statusDistribution.map(s => s.count) || [],
                backgroundColor: [
                    'rgba(34, 197, 94, 0.8)',
                    'rgba(239, 68, 68, 0.8)',
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(251, 191, 36, 0.8)',
                ],
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
        },
    };

    return (
        <div className="space-y-6">
            <AutoBreadcrumb />

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Thống kê chuyến bay</h1>
                    <p className="text-muted-foreground">
                        Tổng quan về hoạt động bay trong 30 ngày qua
                    </p>
                </div>

                {/* Date range selector - to be implemented */}
                <div className="flex gap-2">
                    {/* Add date picker here */}
                </div>
            </div>

            {/* Metric Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <MetricCard
                    title="Tổng số chuyến bay"
                    value={data?.stats.totalFlights || 0}
                    icon={<Plane className="h-5 w-5" />}
                    format="number"
                    color="blue"
                    loading={loading}
                    trend={{
                        value: 12.5,
                        direction: 'up',
                        label: 'vs tháng trước',
                    }}
                />
                <MetricCard
                    title="Nhiệm vụ đang bay"
                    value={data?.stats.activeMissions || 0}
                    icon={<Activity className="h-5 w-5" />}
                    format="number"
                    color="green"
                    loading={loading}
                />
                <MetricCard
                    title="Thời gian bay TB"
                    value={data?.stats.avgFlightTime || 0}
                    icon={<Clock className="h-5 w-5" />}
                    format="duration"
                    color="purple"
                    loading={loading}
                    trend={{
                        value: 5.2,
                        direction: 'up',
                        label: 'vs tháng trước',
                    }}
                />
                <MetricCard
                    title="Tỉ lệ thành công"
                    value={data?.stats.successRate || 0}
                    icon={<CheckCircle className="h-5 w-5" />}
                    format="percentage"
                    color="green"
                    loading={loading}
                    trend={{
                        value: 2.1,
                        direction: 'up',
                        label: 'vs tháng trước',
                    }}
                />
            </div>

            {/* Charts Row */}
            <div className="grid gap-4 md:grid-cols-2">
                {/* Flights Over Time */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base font-medium">
                            Chuyến bay theo thời gian
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            {!loading && data && (
                                <Line data={flightsOverTimeChart} options={chartOptions} />
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Status Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base font-medium">
                            Phân bố trạng thái
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] flex items-center justify-center">
                            {!loading && data && (
                                <Doughnut
                                    data={statusDistributionChart}
                                    options={{
                                        ...chartOptions,
                                        plugins: { ...chartOptions.plugins, legend: { display: true, position: 'bottom' } },
                                    }}
                                />
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Top Pilots Chart */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base font-medium">
                        Top Pilots theo giờ bay
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px]">
                        {!loading && data && (
                            <Bar
                                data={topPilotsChart}
                                options={{
                                    ...chartOptions,
                                    scales: {
                                        y: {
                                            beginAtZero: true,
                                            title: {
                                                display: true,
                                                text: 'Giờ bay',
                                            },
                                        },
                                    },
                                }}
                            />
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Recent Flights Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base font-medium">Chuyến bay gần đây</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="relative overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs uppercase bg-muted">
                                <tr>
                                    <th className="px-6 py-3">Nhiệm vụ</th>
                                    <th className="px-6 py-3">Pilot</th>
                                    <th className="px-6 py-3">Drones</th>
                                    <th className="px-6 py-3">Thời gian</th>
                                    <th className="px-6 py-3">Quãng đường</th>
                                    <th className="px-6 py-3">Pin</th>
                                    <th className="px-6 py-3">Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data?.recentFlights.map(flight => (
                                    <tr key={flight.id} className="border-b hover:bg-muted/50">
                                        <td className="px-6 py-4 font-medium">{flight.missionName}</td>
                                        <td className="px-6 py-4">{flight.pilotName}</td>
                                        <td className="px-6 py-4">{flight.drones.join(', ')}</td>
                                        <td className="px-6 py-4">
                                            {Math.floor(flight.duration / 60)}m
                                        </td>
                                        <td className="px-6 py-4">
                                            {(flight.distance / 1000).toFixed(2)} km
                                        </td>
                                        <td className="px-6 py-4">{flight.batteryUsed}%</td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs ${
                                                    flight.status === 'completed'
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-blue-100 text-blue-800'
                                                }`}
                                            >
                                                {flight.status}
                                            </span>
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


