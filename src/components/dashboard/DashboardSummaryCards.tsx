import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Drone, Activity, Clock, MapPin } from 'lucide-react';

type SummaryCard = {
    title: string;
    metric: string;
    trend: string;
    comparison: string;
    extra?: string;
    icon: React.ReactNode;
    trendPositive: boolean;
    iconColor: string;
    shapeColor: string;
};

const summaryData: SummaryCard[] = [
    {
        title: 'Total Distance',
        metric: '12,340 km',
        trend: '+1,200 km this month',
        comparison: '10% more than last month',
        extra: 'Avg per mission: 1,762 km',
        icon: <MapPin className="w-6 h-6 text-purple-500" />,
        trendPositive: true,
        iconColor: 'text-purple-500',
        shapeColor: 'bg-purple-100',
    },
    {
        title: 'Flight Hours',
        metric: '1,250h',
        trend: '+150h this month',
        comparison: '12% increase vs last month',
        extra: 'Avg per drone: 29.8h',
        icon: <Clock className="w-6 h-6 text-green-500" />,
        trendPositive: true,
        iconColor: 'text-green-500',
        shapeColor: 'bg-green-100',
    },
    {
        title: 'Drones',
        metric: '42',
        trend: '+2 since last week',
        comparison: 'Fleet up 5% this month',
        extra: '3 idle drones',
        icon: <Drone className="w-6 h-6 text-blue-500" />,
        trendPositive: true,
        iconColor: 'text-blue-500',
        shapeColor: 'bg-blue-100',
    },
    {
        title: 'Active Missions',
        metric: '7',
        trend: '-1 since yesterday',
        comparison: '20% fewer than last week',
        extra: 'Avg duration: 1.2 hrs',
        icon: <Activity className="w-6 h-6 text-orange-500" />,
        trendPositive: false,
        iconColor: 'text-orange-500',
        shapeColor: 'bg-orange-100',
    },
];

export const DashboardSummaryCards: React.FC = () => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {summaryData.map((card, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                >
                    <Card className="hover:shadow-lg transition-shadow duration-300 gap-0">
                        <CardHeader className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                            <div className="relative flex items-center justify-center w-8 h-8">
                                {card.icon}
                                <span
                                    className={`absolute bottom-0 w-3 h-1 rounded-full ${card.shapeColor}`}
                                />
                            </div>
                        </CardHeader>
                        <CardContent className="flex flex-col items-start mt-2">
                            <p className="text-2xl font-bold">{card.metric}</p>
                            <p
                                className={`text-sm mt-1 ${
                                    card.trendPositive ? 'text-green-600' : 'text-red-600'
                                }`}
                            >
                                {card.trend}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">{card.comparison}</p>
                            {card.extra && (
                                <p className="text-xs text-muted-foreground mt-0.5">{card.extra}</p>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            ))}
        </div>
    );
};
