import React, { useRef, useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

// ----------------------------
// 📅 Types
// ----------------------------
interface MissionItem {
    id: string;
    name: string;
    start: number; // start time in hours
    end: number; // end time in hours
    status?: 'planned' | 'in-progress' | 'completed';
}

interface DroneRowProps {
    droneId: string;
    droneName: string;
    missions: MissionItem[];
}

interface TimelineProps {
    drones: DroneRowProps[];
    startHour?: number;
    endHour?: number;
}

// ----------------------------
// 🧭 Hook: Horizontal Drag Scroll
// ----------------------------
function useHorizontalScroll<T extends HTMLElement>() {
    const elRef = useRef<T | null>(null);
    useEffect(() => {
        const el = elRef.current;
        if (!el) return;
        let isDown = false;
        let startX: number;
        let scrollLeft: number;

        const onMouseDown = (e: MouseEvent) => {
            isDown = true;
            startX = e.pageX - el.offsetLeft;
            scrollLeft = el.scrollLeft;
        };
        const onMouseLeave = () => (isDown = false);
        const onMouseUp = () => (isDown = false);
        const onMouseMove = (e: MouseEvent) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - el.offsetLeft;
            const walk = (x - startX) * 1.5;
            el.scrollLeft = scrollLeft - walk;
        };

        el.addEventListener('mousedown', onMouseDown);
        el.addEventListener('mouseleave', onMouseLeave);
        el.addEventListener('mouseup', onMouseUp);
        el.addEventListener('mousemove', onMouseMove);
        return () => {
            el.removeEventListener('mousedown', onMouseDown);
            el.removeEventListener('mouseleave', onMouseLeave);
            el.removeEventListener('mouseup', onMouseUp);
            el.removeEventListener('mousemove', onMouseMove);
        };
    }, []);
    return elRef;
}

// ----------------------------
// 🧱 Timeline Components
// ----------------------------
const TimelineHeader: React.FC<{ start: number; end: number }> = ({ start, end }) => {
    const hours = Array.from({ length: end - start + 1 }, (_, i) => start + i);
    return (
        <div className="flex border-b border-muted/40 bg-muted/30 text-sm font-medium">
            <div className="w-40 flex-shrink-0 border-r border-muted/40 bg-background p-2">
                Drone
            </div>
            <div className="flex flex-1">
                {hours.map(h => (
                    <div key={h} className="flex-1 border-r border-muted/40 text-center p-2">
                        {h}:00
                    </div>
                ))}
            </div>
        </div>
    );
};

const TimelineItem: React.FC<{ item: MissionItem; scale: number }> = ({ item, scale }) => {
    const width = (item.end - item.start) * scale;
    const left = item.start * scale;
    const statusColor = {
        planned: 'bg-gray-300',
        'in-progress': 'bg-blue-500',
        completed: 'bg-green-500',
    }[item.status ?? 'planned'];

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div
                        className={cn(
                            'absolute top-1 h-8 rounded-md text-xs text-white flex items-center justify-center',
                            statusColor,
                        )}
                        style={{ left, width }}
                    >
                        {item.name}
                    </div>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{item.name}</p>
                    <p>
                        {item.start}:00 - {item.end}:00
                    </p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};

const TimelineRow: React.FC<DroneRowProps & { scale: number }> = ({
    droneId,
    droneName,
    missions,
    scale,
}) => {
    return (
        <div className="flex border-b border-muted/30">
            <div className="w-40 flex-shrink-0 border-r border-muted/40 bg-background p-2 text-sm font-medium">
                {droneName}
            </div>
            <div className="relative flex-1 h-10">
                {missions.map(m => (
                    <TimelineItem key={m.id} item={m} scale={scale} />
                ))}
            </div>
        </div>
    );
};

export const TimelineContainer: React.FC<TimelineProps> = ({
    drones,
    startHour = 6,
    endHour = 20,
}) => {
    const scrollRef = useHorizontalScroll<HTMLDivElement>();
    const scale = 80; // pixels per hour

    return (
        <Card className="overflow-hidden">
            <CardContent className="p-0">
                <TimelineHeader start={startHour} end={endHour} />
                <div ref={scrollRef} className="overflow-x-auto cursor-grab active:cursor-grabbing">
                    <div className="min-w-max">
                        {drones.map(drone => (
                            <TimelineRow key={drone.droneId} {...drone} scale={scale} />
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

// ----------------------------
// 🧪 Example Usage
// ----------------------------
export function DroneScheduleDemo() {
    const drones: DroneRowProps[] = [
        {
            droneId: 'd1',
            droneName: 'Drone A',
            missions: [
                { id: 'm1', name: 'Survey Zone 1', start: 8, end: 10, status: 'completed' },
                { id: 'm2', name: 'Inspection Run', start: 11, end: 13, status: 'in-progress' },
            ],
        },
        {
            droneId: 'd2',
            droneName: 'Drone B',
            missions: [
                { id: 'm3', name: 'Photo Capture', start: 9, end: 11, status: 'planned' },
                { id: 'm4', name: 'Delivery', start: 14, end: 15, status: 'planned' },
            ],
        },
    ];

    return (
        <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Drone Mission Schedule</h2>
            <TimelineContainer drones={drones} />
        </div>
    );
}
