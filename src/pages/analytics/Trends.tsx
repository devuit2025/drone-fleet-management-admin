import { useState, useMemo } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { AutoBreadcrumb } from '@/components/breadcrumb/AutoBreadcrumb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, Calendar } from 'lucide-react';
import { format, subDays, subMonths } from 'date-fns';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler,
);

type DateRange = '7D' | '1M' | '3M' | '6M' | '1Y';

export default function Trends() {
    const [dateRange, setDateRange] = useState<DateRange>('3M');

    // Generate mock data based on date range
    const generateFlightHoursData = (range: DateRange) => {
        const days = {
            '7D': 7,
            '1M': 30,
            '3M': 90,
            '6M': 180,
            '1Y': 365,
        }[range];

        const data = [];
        const today = new Date();

        for (let i = days - 1; i >= 0; i--) {
            const date = subDays(today, i);
            // Simulate realistic flight hours with some variation
            const baseHours = 45;
            const variation = Math.sin(i / 7) * 10; // Weekly pattern
            const randomness = (Math.random() - 0.5) * 8;
            const totalHours = Math.max(20, baseHours + variation + randomness);

            data.push({
                date,
                totalHours: parseFloat(totalHours.toFixed(1)),
                avgPerPilot: parseFloat((totalHours / 8).toFixed(1)), // 8 pilots
                avgPerDrone: parseFloat((totalHours / 12).toFixed(1)), // 12 drones
            });
        }

        return data;
    };

    const flightHoursData = useMemo(() => generateFlightHoursData(dateRange), [dateRange]);

    // Month-over-month data
    const monthlyData = useMemo(() => {
        const months = [];
        const today = new Date();

        for (let i = 5; i >= 0; i--) {
            const date = subMonths(today, i);
            const baseValue = 1200;
            const growth = (5 - i) * 50; // Progressive growth
            const randomness = (Math.random() - 0.5) * 100;
            const value = baseValue + growth + randomness;

            months.push({
                month: format(date, 'MMM yyyy'),
                hours: parseFloat(value.toFixed(0)),
                change: i === 5 ? 0 : parseFloat(((Math.random() - 0.3) * 20).toFixed(1)),
            });
        }

        return months;
    }, []);

    // Peak hours heatmap data (hour of day vs day of week)
    const peakHoursData = useMemo(() => {
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const hours = Array.from({ length: 14 }, (_, i) => i + 6); // 6 AM to 8 PM

        return days.map(day => ({
            day,
            hours: hours.map(hour => ({
                hour,
                intensity: Math.floor(Math.random() * 100), // 0-100 intensity
            })),
        }));
    }, []);

    // Pilot statistics with trend
    const pilotStats = useMemo(() => {
        return [
            {
                id: 1,
                name: 'Nguyễn Văn A',
                totalHours: 127.5,
                avgPerFlight: 2.83,
                trend: [45, 52, 48, 55, 60, 58, 62, 65, 68, 70],
            },
            {
                id: 2,
                name: 'Trần Thị B',
                totalHours: 98.3,
                avgPerFlight: 2.59,
                trend: [38, 40, 42, 45, 48, 50, 52, 48, 45, 50],
            },
            {
                id: 3,
                name: 'Lê Văn C',
                totalHours: 85.7,
                avgPerFlight: 2.68,
                trend: [30, 32, 35, 38, 40, 42, 45, 48, 50, 52],
            },
            {
                id: 4,
                name: 'Phạm Thị D',
                totalHours: 72.4,
                avgPerFlight: 2.59,
                trend: [25, 28, 30, 32, 35, 38, 40, 42, 45, 48],
            },
            {
                id: 5,
                name: 'Hoàng Văn E',
                totalHours: 65.2,
                avgPerFlight: 2.61,
                trend: [22, 25, 28, 30, 32, 35, 38, 40, 42, 45],
            },
        ];
    }, []);

    // Seasonal patterns (quarterly)
    const seasonalData = useMemo(() => {
        return [
            { quarter: 'Q1 2024', hours: 3850, flights: 425, avgTemp: 18 },
            { quarter: 'Q2 2024', hours: 4200, flights: 468, avgTemp: 28 },
            { quarter: 'Q3 2024', hours: 4500, flights: 492, avgTemp: 32 },
            { quarter: 'Q4 2024', hours: 3950, flights: 438, avgTemp: 22 },
        ];
    }, []);

    // Chart: Flight Hours Trend
    const flightHoursTrendChart = {
        labels: flightHoursData.map(d =>
            dateRange === '7D'
                ? format(d.date, 'EEE')
                : dateRange === '1M'
                  ? format(d.date, 'dd/MM')
                  : format(d.date, 'dd/MM'),
        ),
        datasets: [
            {
                label: 'Total Hours',
                data: flightHoursData.map(d => d.totalHours),
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: dateRange === '7D' ? 4 : 0,
            },
            {
                label: 'Avg per Pilot',
                data: flightHoursData.map(d => d.avgPerPilot),
                borderColor: 'rgb(34, 197, 94)',
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: dateRange === '7D' ? 4 : 0,
            },
            {
                label: 'Avg per Drone',
                data: flightHoursData.map(d => d.avgPerDrone),
                borderColor: 'rgb(168, 85, 247)',
                backgroundColor: 'rgba(168, 85, 247, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: dateRange === '7D' ? 4 : 0,
            },
        ],
    };

    // Chart: Month-over-month
    const monthlyComparisonChart = {
        labels: monthlyData.map(d => d.month),
        datasets: [
            {
                label: 'Flight Hours',
                data: monthlyData.map(d => d.hours),
                backgroundColor: monthlyData.map(d =>
                    d.change >= 0 ? 'rgba(34, 197, 94, 0.8)' : 'rgba(239, 68, 68, 0.8)',
                ),
            },
        ],
    };

    // Chart: Seasonal patterns
    const seasonalChart = {
        labels: seasonalData.map(d => d.quarter),
        datasets: [
            {
                label: 'Total Hours',
                data: seasonalData.map(d => d.hours),
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                fill: true,
                tension: 0.4,
                yAxisID: 'y',
            },
            {
                label: 'Number of Flights',
                data: seasonalData.map(d => d.flights),
                borderColor: 'rgb(251, 146, 60)',
                backgroundColor: 'rgba(251, 146, 60, 0.1)',
                fill: true,
                tension: 0.4,
                yAxisID: 'y1',
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
            },
        },
    };

    const getHeatmapColor = (intensity: number) => {
        if (intensity < 20) return 'bg-blue-100 dark:bg-blue-950';
        if (intensity < 40) return 'bg-blue-200 dark:bg-blue-900';
        if (intensity < 60) return 'bg-blue-300 dark:bg-blue-800';
        if (intensity < 80) return 'bg-blue-400 dark:bg-blue-700';
        return 'bg-blue-500 dark:bg-blue-600';
    };

    return (
        <div className="space-y-6">
            <AutoBreadcrumb />

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Xu hướng thời gian bay</h1>
                    <p className="text-muted-foreground">
                        Phân tích chuyên sâu về xu hướng và patterns thời gian bay
                    </p>
                </div>

                {/* Date Range Selector */}
                <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    {(['7D', '1M', '3M', '6M', '1Y'] as DateRange[]).map(range => (
                        <Button
                            key={range}
                            variant={dateRange === range ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setDateRange(range)}
                        >
                            {range}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Main Trend Chart */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base font-medium">
                        Xu hướng giờ bay theo thời gian
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                        Tổng giờ bay, trung bình theo pilot và drone
                    </p>
                </CardHeader>
                <CardContent>
                    <div className="h-[400px]">
                        <Line data={flightHoursTrendChart} options={chartOptions} />
                    </div>
                </CardContent>
            </Card>

            {/* Month-over-month & Seasonal */}
            <div className="grid gap-4 md:grid-cols-2">
                {/* Month-over-month */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base font-medium">So sánh theo tháng</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <Bar
                                data={monthlyComparisonChart}
                                options={{
                                    ...chartOptions,
                                    plugins: {
                                        ...chartOptions.plugins,
                                        legend: { display: false },
                                    },
                                }}
                            />
                        </div>
                        <div className="mt-4 space-y-2">
                            {monthlyData.map((month, index) => (
                                <div
                                    key={month.month}
                                    className="flex items-center justify-between text-sm"
                                >
                                    <span className="text-muted-foreground">{month.month}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium">{month.hours}h</span>
                                        {index > 0 && (
                                            <span
                                                className={`text-xs ${
                                                    month.change >= 0
                                                        ? 'text-green-600'
                                                        : 'text-red-600'
                                                }`}
                                            >
                                                {month.change >= 0 ? '+' : ''}
                                                {month.change}%
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Seasonal Patterns */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base font-medium">Patterns theo mùa</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <Line
                                data={seasonalChart}
                                options={{
                                    ...chartOptions,
                                    scales: {
                                        y: {
                                            type: 'linear' as const,
                                            display: true,
                                            position: 'left' as const,
                                            title: {
                                                display: true,
                                                text: 'Hours',
                                            },
                                        },
                                        y1: {
                                            type: 'linear' as const,
                                            display: true,
                                            position: 'right' as const,
                                            title: {
                                                display: true,
                                                text: 'Flights',
                                            },
                                            grid: {
                                                drawOnChartArea: false,
                                            },
                                        },
                                    },
                                }}
                            />
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-4">
                            {seasonalData.map(season => (
                                <div key={season.quarter} className="text-sm">
                                    <p className="font-medium">{season.quarter}</p>
                                    <p className="text-muted-foreground">
                                        {season.flights} flights • {season.hours}h
                                    </p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Peak Hours Heatmap */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base font-medium">
                        Giờ bay cao điểm (Heatmap)
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                        Phân bố cường độ bay theo giờ trong ngày và ngày trong tuần
                    </p>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <div className="min-w-[600px]">
                            {/* Hour labels */}
                            <div className="flex mb-2">
                                <div className="w-16" />
                                {Array.from({ length: 14 }, (_, i) => i + 6).map(hour => (
                                    <div
                                        key={hour}
                                        className="flex-1 text-center text-xs text-muted-foreground"
                                    >
                                        {hour}h
                                    </div>
                                ))}
                            </div>

                            {/* Heatmap rows */}
                            {peakHoursData.map(dayData => (
                                <div key={dayData.day} className="flex items-center gap-1 mb-1">
                                    <div className="w-16 text-sm font-medium">{dayData.day}</div>
                                    {dayData.hours.map((hourData, index) => (
                                        <div
                                            key={index}
                                            className={`flex-1 h-8 rounded ${getHeatmapColor(hourData.intensity)} 
                                                transition-colors hover:ring-2 hover:ring-blue-500 cursor-pointer`}
                                            title={`${dayData.day} ${hourData.hour}:00 - Activity: ${hourData.intensity}%`}
                                        />
                                    ))}
                                </div>
                            ))}

                            {/* Legend */}
                            <div className="flex items-center justify-end gap-2 mt-4 text-xs text-muted-foreground">
                                <span>Less</span>
                                <div className="flex gap-1">
                                    {[0, 20, 40, 60, 80].map(val => (
                                        <div
                                            key={val}
                                            className={`w-4 h-4 rounded ${getHeatmapColor(val)}`}
                                        />
                                    ))}
                                </div>
                                <span>More</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Pilot Statistics with Sparklines */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-muted-foreground" />
                        <CardTitle className="text-base font-medium">
                            Thống kê chi tiết theo Pilot
                        </CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="text-xs uppercase bg-muted">
                                <tr>
                                    <th className="px-6 py-3 text-left">Pilot</th>
                                    <th className="px-6 py-3 text-right">Total Hours</th>
                                    <th className="px-6 py-3 text-right">Avg/Flight</th>
                                    <th className="px-6 py-3 text-center">
                                        Trend (Last 10 periods)
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {pilotStats.map(pilot => (
                                    <tr key={pilot.id} className="border-b hover:bg-muted/50">
                                        <td className="px-6 py-4 font-medium">{pilot.name}</td>
                                        <td className="px-6 py-4 text-right">
                                            {pilot.totalHours}h
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {pilot.avgPerFlight}h
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-end justify-center gap-0.5 h-12">
                                                {pilot.trend.map((value, index) => (
                                                    <div
                                                        key={index}
                                                        className="w-3 bg-blue-500 rounded-t hover:bg-blue-600 transition-colors"
                                                        style={{
                                                            height: `${(value / Math.max(...pilot.trend)) * 100}%`,
                                                        }}
                                                        title={`Period ${index + 1}: ${value}h`}
                                                    />
                                                ))}
                                            </div>
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
