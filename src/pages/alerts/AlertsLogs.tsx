import { useEffect, useState } from 'react';
import { AutoBreadcrumb } from '@/components/breadcrumb/AutoBreadcrumb';
import { MetricCard } from '@/components/analytics/MetricCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { LogsClient, type FlightLog } from '@/api/admin/logsClient';
import { AlertTriangle, Activity, Search, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

export default function AlertsLogs() {
    const [loading, setLoading] = useState(false);
    const [logs, setLogs] = useState<FlightLog[]>([]);
    const [filteredLogs, setFilteredLogs] = useState<FlightLog[]>([]);

    // Filters
    const [eventTypeFilter, setEventTypeFilter] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState('');

    // Stats
    const stats = {
        total: logs.length,
        critical: logs.filter(l =>
            ['altitude_violation', 'no_fly_zone_violation', 'emergency_landing'].includes(
                l.eventType,
            ),
        ).length,
        warnings: logs.filter(l =>
            ['battery_low', 'signal_loss', 'gps_error', 'weather_warning'].includes(l.eventType),
        ).length,
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [logs, eventTypeFilter, searchTerm]);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const response = await LogsClient.getFlightLogs();
            setLogs(response);
        } catch (error) {
            console.error('Failed to fetch flight logs:', error);
            // Use mock data
            setLogs(getMockFlightLogs());
        } finally {
            setLoading(false);
        }
    };

    const getMockFlightLogs = (): FlightLog[] => {
        const now = new Date();
        return [
            {
                id: 1,
                missionId: 1,
                eventType: 'altitude_violation',
                description: 'Drone exceeded maximum altitude limit (120m)',
                timestamp: new Date(now.getTime() - 15 * 60 * 1000).toISOString(),
                mission: {
                    id: 1,
                    missionName: 'Mission Alpha',
                    pilot: { name: 'Nguyễn Văn A' },
                },
            },
            {
                id: 2,
                missionId: 2,
                eventType: 'battery_low',
                description: 'Battery level dropped below 20%',
                timestamp: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
                mission: {
                    id: 2,
                    missionName: 'Mission Beta',
                    pilot: { name: 'Trần Thị B' },
                },
            },
            {
                id: 3,
                missionId: 3,
                eventType: 'signal_loss',
                description: 'Lost signal connection for 3 seconds',
                timestamp: new Date(now.getTime() - 60 * 60 * 1000).toISOString(),
                mission: {
                    id: 3,
                    missionName: 'Mission Gamma',
                    pilot: { name: 'Lê Văn C' },
                },
            },
            {
                id: 4,
                missionId: 4,
                eventType: 'gps_error',
                description: 'GPS signal weak, accuracy degraded',
                timestamp: new Date(now.getTime() - 120 * 60 * 1000).toISOString(),
                mission: {
                    id: 4,
                    missionName: 'Mission Delta',
                    pilot: { name: 'Phạm Thị D' },
                },
            },
            {
                id: 5,
                missionId: 5,
                eventType: 'no_fly_zone_violation',
                description: 'Drone entered restricted airspace',
                timestamp: new Date(now.getTime() - 180 * 60 * 1000).toISOString(),
                mission: {
                    id: 5,
                    missionName: 'Mission Epsilon',
                    pilot: { name: 'Hoàng Văn E' },
                },
            },
            {
                id: 6,
                missionId: 6,
                eventType: 'emergency_landing',
                description: 'Emergency landing initiated due to critical battery',
                timestamp: new Date(now.getTime() - 300 * 60 * 1000).toISOString(),
                mission: {
                    id: 6,
                    missionName: 'Mission Zeta',
                    pilot: { name: 'Trần Thị B' },
                },
            },
            {
                id: 7,
                missionId: 7,
                eventType: 'weather_warning',
                description: 'High wind speed detected (>15 m/s)',
                timestamp: new Date(now.getTime() - 360 * 60 * 1000).toISOString(),
                mission: {
                    id: 7,
                    missionName: 'Mission Eta',
                    pilot: { name: 'Nguyễn Văn A' },
                },
            },
        ];
    };

    const applyFilters = () => {
        let filtered = [...logs];

        if (eventTypeFilter !== 'all') {
            filtered = filtered.filter(log => log.eventType === eventTypeFilter);
        }

        if (searchTerm) {
            filtered = filtered.filter(
                log =>
                    log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    log.mission?.missionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    log.mission?.pilot?.name.toLowerCase().includes(searchTerm.toLowerCase()),
            );
        }

        setFilteredLogs(filtered);
    };

    const getSeverityColor = (eventType: string) => {
        const critical = ['altitude_violation', 'no_fly_zone_violation', 'emergency_landing'];
        const warning = ['battery_low', 'signal_loss', 'gps_error', 'weather_warning'];

        if (critical.includes(eventType)) {
            return 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-400';
        }
        if (warning.includes(eventType)) {
            return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-400';
        }
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-400';
    };

    const getEventTypeLabel = (eventType: string) => {
        return eventType
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    return (
        <div className="space-y-6">
            <AutoBreadcrumb />

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Flight Alerts & Incidents</h1>
                    <p className="text-muted-foreground">
                        Monitor flight safety events and incidents
                    </p>
                </div>
                <Button onClick={fetchLogs} disabled={loading} variant="outline" size="sm">
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <MetricCard
                    title="Total Incidents"
                    value={stats.total}
                    icon={<Activity className="h-5 w-5" />}
                    format="number"
                    color="blue"
                    loading={loading}
                />
                <MetricCard
                    title="Critical"
                    value={stats.critical}
                    icon={<AlertTriangle className="h-5 w-5" />}
                    format="number"
                    color="red"
                    loading={loading}
                />
                <MetricCard
                    title="Warnings"
                    value={stats.warnings}
                    icon={<AlertTriangle className="h-5 w-5" />}
                    format="number"
                    color="yellow"
                    loading={loading}
                />
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base font-medium">Filters</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Event Type</label>
                            <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All types" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    <SelectItem value="altitude_violation">
                                        Altitude Violation
                                    </SelectItem>
                                    <SelectItem value="battery_low">Battery Low</SelectItem>
                                    <SelectItem value="signal_loss">Signal Loss</SelectItem>
                                    <SelectItem value="gps_error">GPS Error</SelectItem>
                                    <SelectItem value="no_fly_zone_violation">
                                        No-Fly Zone Violation
                                    </SelectItem>
                                    <SelectItem value="emergency_landing">
                                        Emergency Landing
                                    </SelectItem>
                                    <SelectItem value="weather_warning">Weather Warning</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Search</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search incidents..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Incidents Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base font-medium">
                        Recent Incidents ({filteredLogs.length} entries)
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="text-xs uppercase bg-muted">
                                <tr>
                                    <th className="px-6 py-3 text-left">Time</th>
                                    <th className="px-6 py-3 text-left">Severity</th>
                                    <th className="px-6 py-3 text-left">Event Type</th>
                                    <th className="px-6 py-3 text-left">Mission</th>
                                    <th className="px-6 py-3 text-left">Pilot</th>
                                    <th className="px-6 py-3 text-left">Description</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="px-6 py-8 text-center text-muted-foreground"
                                        >
                                            Loading incidents...
                                        </td>
                                    </tr>
                                ) : filteredLogs.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="px-6 py-8 text-center text-muted-foreground"
                                        >
                                            No incidents found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredLogs.map(log => (
                                        <tr key={log.id} className="border-b hover:bg-muted/50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {format(new Date(log.timestamp), 'dd/MM HH:mm:ss')}
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge className={getSeverityColor(log.eventType)}>
                                                    {[
                                                        'altitude_violation',
                                                        'no_fly_zone_violation',
                                                        'emergency_landing',
                                                    ].includes(log.eventType)
                                                        ? 'Critical'
                                                        : 'Warning'}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                                                    <span className="text-xs">
                                                        {getEventTypeLabel(log.eventType)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-medium">
                                                {log.mission?.missionName || '-'}
                                            </td>
                                            <td className="px-6 py-4">
                                                {log.mission?.pilot?.name || '-'}
                                            </td>
                                            <td className="px-6 py-4 max-w-md truncate">
                                                {log.description}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
