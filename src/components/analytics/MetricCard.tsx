import CountUp from 'react-countup';
import type { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardProps {
    title: string;
    value: number;
    icon: ReactNode;
    subtitle?: string;
    trend?: {
        value: number; // percentage change
        direction: 'up' | 'down' | 'neutral';
        label?: string;
    };
    format?: 'number' | 'percentage' | 'duration' | 'distance';
    color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
    loading?: boolean;
}

const colorMap = {
    blue: { bg: 'bg-blue-50 dark:bg-blue-950', icon: 'text-blue-600 dark:text-blue-400' },
    green: { bg: 'bg-green-50 dark:bg-green-950', icon: 'text-green-600 dark:text-green-400' },
    yellow: {
        bg: 'bg-yellow-50 dark:bg-yellow-950',
        icon: 'text-yellow-600 dark:text-yellow-400',
    },
    red: { bg: 'bg-red-50 dark:bg-red-950', icon: 'text-red-600 dark:text-red-400' },
    purple: {
        bg: 'bg-purple-50 dark:bg-purple-950',
        icon: 'text-purple-600 dark:text-purple-400',
    },
};

const formatValue = (value: number, format: MetricCardProps['format']) => {
    switch (format) {
        case 'percentage':
            return `${value.toFixed(1)}%`;
        case 'duration':
            const hours = Math.floor(value / 3600);
            const minutes = Math.floor((value % 3600) / 60);
            return `${hours}h ${minutes}m`;
        case 'distance':
            return value >= 1000 ? `${(value / 1000).toFixed(2)} km` : `${value.toFixed(0)} m`;
        default:
            return value;
    }
};

export function MetricCard({
    title,
    value,
    icon,
    subtitle,
    trend,
    format = 'number',
    color = 'blue',
    loading = false,
}: MetricCardProps) {
    const styles = colorMap[color];

    const getTrendIcon = () => {
        if (!trend) return null;
        switch (trend.direction) {
            case 'up':
                return <TrendingUp className="h-4 w-4" />;
            case 'down':
                return <TrendingDown className="h-4 w-4" />;
            default:
                return <Minus className="h-4 w-4" />;
        }
    };

    const getTrendColor = () => {
        if (!trend) return '';
        switch (trend.direction) {
            case 'up':
                return 'text-green-600 dark:text-green-400';
            case 'down':
                return 'text-red-600 dark:text-red-400';
            default:
                return 'text-gray-600 dark:text-gray-400';
        }
    };

    return (
        <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <div
                    className={`h-10 w-10 rounded-full ${styles.bg} flex items-center justify-center ${styles.icon}`}
                >
                    {icon}
                </div>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="h-8 w-24 bg-muted animate-pulse rounded" />
                ) : (
                    <>
                        <div className="text-2xl font-bold">
                            {format === 'number' ? (
                                <CountUp end={value} duration={1.5} separator="," />
                            ) : (
                                formatValue(value, format)
                            )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                            {trend && (
                                <div
                                    className={`flex items-center gap-1 text-xs ${getTrendColor()}`}
                                >
                                    {getTrendIcon()}
                                    <span className="font-medium">
                                        {Math.abs(trend.value).toFixed(1)}%
                                    </span>
                                    {trend.label && (
                                        <span className="text-muted-foreground">{trend.label}</span>
                                    )}
                                </div>
                            )}
                            {subtitle && !trend && (
                                <p className="text-xs text-muted-foreground">{subtitle}</p>
                            )}
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}
