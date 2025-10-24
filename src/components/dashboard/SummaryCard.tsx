// SummaryCard.tsx
import CountUp from 'react-countup';
import React, { type JSX } from 'react';
import { Tooltip } from 'react-tooltip';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

interface SummaryCardProps {
    title: string;
    value: number;
    icon: JSX.Element;
    subtitle?: string;
    trend?: number; // 0-100
    trendInfo?: string; // tooltip text
    color?: 'blue' | 'green' | 'yellow' | 'red';
}

const colorMap = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-600' },
    green: { bg: 'bg-green-50', text: 'text-green-600' },
    yellow: { bg: 'bg-yellow-50', text: 'text-yellow-600' },
    red: { bg: 'bg-red-50', text: 'text-red-600' },
};

const SummaryCard: React.FC<SummaryCardProps> = ({
    title,
    value,
    icon,
    subtitle,
    trend,
    trendInfo,
    color = 'blue',
}) => {
    const styles = colorMap[color];

    // Determine trend color dynamically
    const trendColor = trend !== undefined ? (trend > 50 ? 'bg-green-500' : 'bg-red-500') : '';

    return (
        <>
            <Card className={`w-full sm:w-64 p-4 shadow-md hover:shadow-lg transition-shadow `}>
                <CardHeader className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">{title}</CardTitle>
                    <div className={`w-8 h-8 ${styles.text}`}>{icon}</div>
                </CardHeader>
                <CardContent>
                    <div className={`text-2xl font-bold ${styles.text}`}>
                        <CountUp end={value} duration={1.5} separator="," />
                    </div>
                    {subtitle && (
                        <CardDescription className="text-sm text-gray-500">
                            {subtitle}
                        </CardDescription>
                    )}

                    {trend !== undefined && (
                        <div
                            className="mt-2 h-2 w-full bg-gray-200 rounded-full"
                            data-tooltip-id={`trend-${title}`}
                        >
                            <div
                                className={`h-2 rounded-full transition-all ${trendColor}`}
                                style={{ width: `${trend}%` }}
                            />
                        </div>
                    )}
                </CardContent>
            </Card>

            {trendInfo && <Tooltip id={`trend-${title}`} place="top" content={trendInfo} />}
        </>
    );
};

export default SummaryCard;
