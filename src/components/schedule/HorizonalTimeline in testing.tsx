import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { format, addMinutes, differenceInMinutes, startOfDay } from 'date-fns';

// -----------------------------
// Types
// -----------------------------
export interface TimelineEvent {
    id: string;
    label: string;
    start: Date;
    end: Date;
    droneId: string; // resource row
    color?: string;
    progress?: number; // 0-100
}

export interface DroneResource {
    id: string;
    name: string;
}

interface TimelineProps {
    startDate: Date; // leftmost time
    endDate: Date; // rightmost time
    resources: DroneResource[];
    events: TimelineEvent[];
    onEventsChange?: (events: TimelineEvent[]) => void;
}

// -----------------------------
// Constants & Helpers
// -----------------------------
const MINUTE_STEP = 15; // grid snap in minutes
const CELL_WIDTH = 40; // px per MINUTE_STEP block (chosen for example)

function minutesBetween(a: Date, b: Date) {
    return differenceInMinutes(b, a);
}

function clamp<T>(v: T, min: T, max: T) {
    // @ts-ignore
    return Math.min(Math.max(v, min), max);
}

function roundToStep(mins: number, step: number) {
    return Math.round(mins / step) * step;
}

// Map a Date -> x position (px) inside timeline
function timeToX(date: Date, start: Date) {
    const mins = minutesBetween(start, date);
    const blocks = mins / MINUTE_STEP;
    return blocks * CELL_WIDTH;
}

function xToTime(x: number, start: Date) {
    const blocks = x / CELL_WIDTH;
    const mins = blocks * MINUTE_STEP;
    const snapped = roundToStep(mins, MINUTE_STEP);
    return addMinutes(start, snapped);
}

// -----------------------------
// Components
// -----------------------------

function TimelineHeader({
    startDate,
    endDate,
    scrollRef,
}: {
    startDate: Date;
    endDate: Date;
    scrollRef: React.RefObject<HTMLDivElement>;
}) {
    const totalMins = minutesBetween(startDate, endDate);
    const blocks = Math.ceil(totalMins / MINUTE_STEP);
    const labels: Array<{ x: number; label: string }> = [];

    for (let i = 0; i <= blocks; i++) {
        const mins = i * MINUTE_STEP;
        const date = addMinutes(startDate, mins);
        // show hour mark every 60 minutes
        if (date.getMinutes() === 0) {
            labels.push({ x: i * CELL_WIDTH, label: format(date, 'HH:mm') });
        }
    }

    return (
        <div className="flex flex-col">
            <div className="flex items-center h-12 border-b border-gray-200 dark:border-blue-800 px-2 bg-surface">
                <div className="w-48 flex-shrink-0" />
                <div className="relative overflow-x-auto flex-1" ref={scrollRef}>
                    <div style={{ width: blocks * CELL_WIDTH }} className="relative h-12">
                        {labels.map(l => (
                            <div
                                key={l.x}
                                style={{ left: l.x }}
                                className="absolute top-2 -ml-6 text-xs"
                            >
                                {l.label}
                            </div>
                        ))}
                        {/* Current time indicator */}
                        <CurrentTimeIndicator startDate={startDate} endDate={endDate} />
                    </div>
                </div>
            </div>
        </div>
    );
}

function CurrentTimeIndicator({ startDate, endDate }: { startDate: Date; endDate: Date }) {
    const [now, setNow] = useState(new Date());
    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 30 * 1000);
        return () => clearInterval(id);
    }, []);
    if (now < startDate || now > endDate) return null;
    const x = timeToX(now, startDate);
    return <div style={{ left: x }} className="absolute inset-y-0 w-px bg-red-500" />;
}

function TimelineRow({
    resource,
    events,
    startDate,
    endDate,
    onEventUpdate,
    onSelectEvent,
}: {
    resource: DroneResource;
    events: TimelineEvent[];
    startDate: Date;
    endDate: Date;
    onEventUpdate?: (e: TimelineEvent) => void;
    onSelectEvent?: (e: TimelineEvent) => void;
}) {
    const rowRef = useRef<HTMLDivElement | null>(null);

    return (
        <div className="flex items-start border-b border-gray-100 dark:border-blue-900 last:border-b-0">
            <div className="w-48 p-2 flex-shrink-0">
                <div className="text-sm font-medium">{resource.name}</div>
            </div>
            <div className="relative flex-1 overflow-x-auto">
                <div className="relative h-20 min-h-[80px]">
                    {events.map(ev => (
                        <TimelineEventBar
                            key={ev.id}
                            event={ev}
                            startDate={startDate}
                            endDate={endDate}
                            onUpdate={onEventUpdate}
                            onSelect={onSelectEvent}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

function TimelineEventBar({
    event,
    startDate,
    endDate,
    onUpdate,
    onSelect,
}: {
    event: TimelineEvent;
    startDate: Date;
    endDate: Date;
    onUpdate?: (e: TimelineEvent) => void;
    onSelect?: (e: TimelineEvent) => void;
}) {
    const startX = timeToX(event.start, startDate);
    const endX = timeToX(event.end, startDate);
    const width = Math.max(6, endX - startX);
    const barRef = useRef<HTMLDivElement | null>(null);
    const [dragging, setDragging] = useState(false);
    const [resizing, setResizing] = useState<'left' | 'right' | null>(null);

    // Drag handlers using pointer events
    useEffect(() => {
        const el = barRef.current;
        if (!el) return;
        let originX = 0;
        let originLeft = 0;
        let originRight = 0;

        function onPointerDown(e: PointerEvent) {
            const target = e.target as HTMLElement;
            // detect if it's the left or right handle
            if (target.dataset?.handle === 'left') {
                setResizing('left');
                originX = e.clientX;
                originLeft = startX;
                (e.target as Element).setPointerCapture(e.pointerId);
            } else if (target.dataset?.handle === 'right') {
                setResizing('right');
                originX = e.clientX;
                originRight = endX;
                (e.target as Element).setPointerCapture(e.pointerId);
            } else {
                setDragging(true);
                originX = e.clientX;
                originLeft = startX;
                (e.target as Element).setPointerCapture(e.pointerId);
            }
        }

        function onPointerMove(e: PointerEvent) {
            if (!dragging && !resizing) return;
            const dx = e.clientX - originX;
            if (dragging) {
                const newLeft = originLeft + dx;
                const newStart = xToTime(newLeft, startDate);
                const delta = minutesBetween(event.start, newStart);
                const newEvent = { ...event, start: newStart, end: addMinutes(event.end, delta) };
                onUpdate?.(newEvent);
            } else if (resizing === 'left') {
                const newLeft = originLeft + dx;
                let newStart = xToTime(newLeft, startDate);
                // do not pass end
                if (newStart >= event.end) {
                    newStart = addMinutes(event.end, -MINUTE_STEP);
                }
                const newEvent = { ...event, start: newStart };
                onUpdate?.(newEvent);
            } else if (resizing === 'right') {
                const newRight = originRight + dx;
                let newEnd = xToTime(newRight, startDate);
                if (newEnd <= event.start) {
                    newEnd = addMinutes(event.start, MINUTE_STEP);
                }
                const newEvent = { ...event, end: newEnd };
                onUpdate?.(newEvent);
            }
        }

        function onPointerUp(e: PointerEvent) {
            setDragging(false);
            setResizing(null);
            try {
                (e.target as Element).releasePointerCapture(e.pointerId);
            } catch {}
        }

        el.addEventListener('pointerdown', onPointerDown as any);
        window.addEventListener('pointermove', onPointerMove as any);
        window.addEventListener('pointerup', onPointerUp as any);

        return () => {
            el.removeEventListener('pointerdown', onPointerDown as any);
            window.removeEventListener('pointermove', onPointerMove as any);
            window.removeEventListener('pointerup', onPointerUp as any);
        };
    }, [barRef, dragging, resizing, event, onUpdate, startDate, startX, endX]);

    return (
        <Popover>
            <PopoverTrigger asChild>
                <div
                    ref={barRef}
                    role="button"
                    onClick={() => onSelect?.(event)}
                    className={cn(
                        'absolute top-3 h-10 rounded-md shadow-sm flex items-center overflow-hidden',
                        event.color ?? 'bg-blue-500',
                    )}
                    style={{ left: startX, width }}
                >
                    {/* left handle */}
                    <div data-handle="left" className="w-2 h-full cursor-ew-resize" />

                    <div className="flex-1 px-2 text-xs text-white truncate">
                        <div className="font-medium">{event.label}</div>
                        <div className="text-[11px] opacity-90">
                            {format(event.start, 'HH:mm')} — {format(event.end, 'HH:mm')}
                        </div>
                    </div>

                    {/* right handle */}
                    <div data-handle="right" className="w-2 h-full cursor-ew-resize" />
                </div>
            </PopoverTrigger>
            <PopoverContent>
                <div className="w-48">
                    <div className="text-sm font-semibold">{event.label}</div>
                    <div className="text-xs">
                        {format(event.start, 'PPpp')} — {format(event.end, 'PPpp')}
                    </div>
                    <div className="mt-2 flex gap-2">
                        <Button
                            size="sm"
                            onClick={() => {
                                /* placeholder */
                            }}
                        >
                            Edit
                        </Button>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                                /* placeholder */
                            }}
                        >
                            Delete
                        </Button>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}

export default function HorizonalTimeline({
    startDate,
    endDate,
    resources,
    events: initialEvents,
    onEventsChange,
}: TimelineProps) {
    const [events, setEvents] = useState<TimelineEvent[]>(initialEvents);
    const scrollRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => setEvents(initialEvents), [initialEvents]);

    const totalMins = minutesBetween(startDate, endDate);
    const blocks = Math.ceil(totalMins / MINUTE_STEP);
    const timelineWidth = blocks * CELL_WIDTH;

    const eventsByResource = useMemo(() => {
        const map = new Map<string, TimelineEvent[]>();
        resources.forEach(r => map.set(r.id, []));
        events.forEach(ev => {
            const arr = map.get(ev.droneId) ?? [];
            arr.push(ev);
            map.set(ev.droneId, arr);
        });
        return map;
    }, [events, resources]);

    const handleEventUpdate = useCallback(
        (updated: TimelineEvent) => {
            setEvents(prev => {
                const next = prev.map(p => (p.id === updated.id ? updated : p));
                onEventsChange?.(next);
                return next;
            });
        },
        [onEventsChange],
    );

    const handleAddEvent = useCallback(
        (resourceId: string) => {
            // add a default new event at the start of timeline
            const start = addMinutes(startDate, 30);
            const end = addMinutes(start, 60);
            const newEv: TimelineEvent = {
                id: Math.random().toString(36).slice(2, 9),
                label: 'New Mission',
                start,
                end,
                droneId: resourceId,
                color: 'bg-green-500',
            };
            setEvents(prev => {
                const next = [...prev, newEv];
                onEventsChange?.(next);
                return next;
            });
        },
        [startDate, onEventsChange],
    );

    return (
        <Card>
            <CardHeader className="flex items-center justify-between">
                <CardTitle>Drone Missions Timeline</CardTitle>
                <div className="flex gap-2">
                    <Button
                        onClick={() => {
                            if (scrollRef.current) scrollRef.current.scrollLeft -= 300;
                        }}
                    >
                        ◀
                    </Button>
                    <Button
                        onClick={() => {
                            if (scrollRef.current) scrollRef.current.scrollLeft += 300;
                        }}
                    >
                        ▶
                    </Button>
                    <Button
                        onClick={() => {
                            if (scrollRef.current) scrollRef.current.scrollLeft = 0;
                        }}
                    >
                        Today
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col">
                    <TimelineHeader startDate={startDate} endDate={endDate} scrollRef={scrollRef} />
                    <div className="flex flex-col max-h-[500px] overflow-auto border-t border-gray-100 dark:border-blue-900">
                        {resources.map(r => (
                            <div key={r.id} className="flex items-center">
                                <div className="w-48 p-2 flex-shrink-0">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="text-sm font-medium">{r.name}</div>
                                        </div>
                                        <div>
                                            <Button size="sm" onClick={() => handleAddEvent(r.id)}>
                                                + Mission
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                                <div className="relative flex-1 overflow-auto" ref={scrollRef}>
                                    <div
                                        style={{ width: timelineWidth }}
                                        className="relative h-24 bg-white/0"
                                    >
                                        {/* grid background */}
                                        <div className="absolute inset-0 pointer-events-none">
                                            <div className="h-full flex">
                                                {Array.from({ length: blocks }).map((_, i) => (
                                                    <div
                                                        key={i}
                                                        className={cn(
                                                            'h-full border-r border-gray-100 dark:border-blue-900',
                                                            i % (60 / MINUTE_STEP) === 0
                                                                ? 'border-r-2'
                                                                : 'border-r',
                                                        )}
                                                        style={{ width: CELL_WIDTH }}
                                                    />
                                                ))}
                                            </div>
                                        </div>

                                        {/* events for this resource */}
                                        <div className="relative h-24">
                                            {(eventsByResource.get(r.id) ?? []).map(ev => (
                                                <TimelineEventBar
                                                    key={ev.id}
                                                    event={ev}
                                                    startDate={startDate}
                                                    endDate={endDate}
                                                    onUpdate={handleEventUpdate}
                                                    onSelect={() => {
                                                        /* show modal */
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

// <HorizonalTimeline startDate={startDate} endDate={endDate} resources={resources} events={events} onEventsChange={(e) => console.log("events", e)} />;

//     const dayStart = startOfDay(new Date());
//     const startDate = addMinutes(dayStart, 6 * 60); // 6:00 AM
//     const endDate = addMinutes(dayStart, 22 * 60); // 10:00 PM

//     const resources: DroneResource[] = [
//     { id: "drone-1", name: "Drone Alpha" },
//     { id: "drone-2", name: "Drone Beta" },
//     { id: "drone-3", name: "Drone Gamma" },
//     ];

//     const events: TimelineEvent[] = [
//     { id: "e1", label: "Survey Area A", start: addMinutes(startDate, 30), end: addMinutes(startDate, 120), droneId: "drone-1", color: "bg-indigo-600" },
//     { id: "e2", label: "Delivery 23", start: addMinutes(startDate, 90), end: addMinutes(startDate, 180), droneId: "drone-2", color: "bg-emerald-500" },
//     { id: "e3", label: "Inspection X", start: addMinutes(startDate, 240), end: addMinutes(startDate, 360), droneId: "drone-1", color: "bg-rose-500" },

//     ]
