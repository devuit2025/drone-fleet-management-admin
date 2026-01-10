import { DroneClient, type Drone, type DroneStatus } from '@/api/models/drone/droneClient';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Tooltip as UITooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import {
    Activity,
    Battery,
    Gauge,
    MapPin,
    AlertTriangle,
    Plane,
    Layers,
    Play,
    Square,
} from 'lucide-react';

interface DroneListContentProps {
    visibleDrones: Drone[];
    selectedDroneId: number | null;
    setSelectedDroneId: (id: number) => void;
    mapRef: React.RefObject<any>;
    isDroneActive: (d: Drone) => boolean;
    isConnected: boolean;
    setIsVideoModalOpen: (open: boolean) => void;
}

export function DroneListContent({
    visibleDrones,
    selectedDroneId,
    setSelectedDroneId,
    mapRef,
    isDroneActive,
    isConnected,
    setIsVideoModalOpen,
}: DroneListContentProps) {
    return (
        <div className="max-h-[400px] overflow-auto space-y-3">
            {visibleDrones.map(d => {
                const active = isDroneActive(d);
                const selected = selectedDroneId === d.id;

                const isFlying = d.status === 'flying'; // adjust to your enum
                const hasError = d.status === 'error';

                return (
                    <Card
                        key={d.id}
                        className={`transition-all cursor-pointer hover:bg-slate-50 py-1 ${
                            selected ? '' : ''
                        }`}
                        onClick={() => setSelectedDroneId(d.id)}
                    >
                        <CardContent className="p-4 space-y-3">
                            {/* Header row */}
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    {/* Connection dot */}
                                    <span
                                        className={`w-2.5 h-2.5 rounded-full ${
                                            active ? 'bg-green-500 animate-pulse' : 'bg-slate-300'
                                        }`}
                                    />

                                    <div>
                                        <div className="font-medium text-sm">
                                            {d.name || `Drone ${d.id}`}
                                        </div>

                                        <div className="flex items-center gap-2 mt-1">
                                            {/* Connection badge */}
                                            <Badge
                                                variant="outline"
                                                className={`text-xs ${
                                                    active
                                                        ? 'border-green-300 text-green-700 bg-green-50'
                                                        : 'border-slate-300 text-slate-500'
                                                }`}
                                            >
                                                {active ? 'Kết nối' : 'Không kết nối'}
                                            </Badge>

                                            {/* Flight state */}
                                            {isFlying && (
                                                <Badge
                                                    variant="outline"
                                                    className="text-xs border-blue-300 text-blue-700 bg-blue-50 flex items-center gap-1"
                                                >
                                                    <Plane className="w-3 h-3" />
                                                    Flying
                                                </Badge>
                                            )}

                                            {hasError && (
                                                <Badge
                                                    variant="outline"
                                                    className="text-xs border-red-300 text-red-700 bg-red-50 flex items-center gap-1"
                                                >
                                                    <AlertTriangle className="w-3 h-3" />
                                                    Error
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Telemetry */}
                                <div className="text-right text-xs space-y-1 text-slate-600">
                                    <div className="flex items-center gap-1 justify-end">
                                        <Battery className="w-3 h-3" />
                                        {d.battery ?? '50'}%
                                    </div>
                                    <div className="flex items-center gap-1 justify-end">
                                        <Gauge className="w-3 h-3" />
                                        {typeof d.speed === 'number' ? d.speed.toFixed(1) : '-'} m/s
                                    </div>
                                    <div className="flex items-center gap-1 justify-end">
                                        <Layers className="w-3 h-3" />
                                        {typeof d.altitude === 'number'
                                            ? d.altitude.toFixed(1)
                                            : '-'}{' '}
                                        m
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="flex-1"
                                    onClick={e => {
                                        e.stopPropagation();
                                        mapRef.current?.flyTo({
                                            center: [d.lon, d.lat],
                                            zoom: 16,
                                        });
                                    }}
                                >
                                    <MapPin className="w-4 h-4 mr-1" />
                                    Vị trí
                                </Button>

                                <TooltipProvider>
                                    <UITooltip>
                                        <TooltipTrigger asChild>
                                            <span className="flex-1">
                                                <Button
                                                    size="sm"
                                                    className="w-full"
                                                    disabled={!isConnected}
                                                    onClick={e => {
                                                        e.stopPropagation();
                                                        if (!isConnected) return;
                                                        setSelectedDroneId(d.id);
                                                        setIsVideoModalOpen(true);
                                                    }}
                                                >
                                                    Chi tiết
                                                </Button>
                                            </span>
                                        </TooltipTrigger>

                                        {!isConnected && (
                                            <TooltipContent>WebSocket chưa kết nối</TooltipContent>
                                        )}
                                    </UITooltip>
                                </TooltipProvider>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}

            {visibleDrones.length === 0 && (
                <div className="text-sm text-slate-500 text-center py-6">No drones found</div>
            )}
        </div>
    );
}
