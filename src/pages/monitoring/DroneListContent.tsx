import {
    Card,
    CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Tooltip as UITooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import {
    Battery,
    Gauge,
    MapPin,
    AlertTriangle,
    Plane,
    Layers,
} from 'lucide-react';
import { useActiveDroneStore } from '@/stores/active/useActiveDroneStore';
import type { ActiveDroneState } from '@/stores/active/useActiveDroneType';

interface DroneListContentProps {
    selectedDroneId: string | null;
    setSelectedDroneId: (id: string) => void;
    mapRef: React.RefObject<any>;
    setIsVideoModalOpen: (open: boolean) => void;
}

export function DroneListContent({
    selectedDroneId,
    setSelectedDroneId,
    mapRef,
    setIsVideoModalOpen,
}: DroneListContentProps) {
    // Active drone store (source of truth)
    const dronesMap = useActiveDroneStore(s => s.drones);

    // Convert Record -> Array
    const activeDrones: ActiveDroneState[] = Object.values(dronesMap);

    return (
        <div className="max-h-[400px] overflow-auto space-y-3">
            {activeDrones.map(d => {
                const selected = selectedDroneId === d.droneId;
                const isConnected = d.connected
                const isFlying =
                    d.system.armed === true &&
                    (d.motion.speedMps ?? 0) > 1;

                const hasError = d.connected === false;

                return (
                    <Card
                        key={d.droneId}
                        className="transition-all cursor-pointer hover:bg-slate-50 py-1"
                        onClick={() => setSelectedDroneId(d.droneId)}
                    >
                        <CardContent className="p-4 space-y-3">
                            {/* Header */}
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    {/* Connection dot */}
                                    <span
                                        className={`w-2.5 h-2.5 rounded-full ${
                                            d.connected
                                                ? 'bg-green-500 animate-pulse'
                                                : 'bg-slate-300'
                                        }`}
                                    />

                                    <div>
                                        <div className="font-medium text-sm">
                                            Drone {d.droneId}
                                            {/* display drone name here */}
                                        </div>

                                        <div className="flex items-center gap-2 mt-1">
                                            {/* Connection badge */}
                                            <Badge
                                                variant="outline"
                                                className={`text-xs ${
                                                    d.connected
                                                        ? 'border-green-300 text-green-700 bg-green-50'
                                                        : 'border-slate-300 text-slate-500'
                                                }`}
                                            >
                                                {d.connected
                                                    ? 'Kết nối'
                                                    : 'Không kết nối'}
                                            </Badge>

                                            {/* Flying */}
                                            {isFlying && (
                                                <Badge
                                                    variant="outline"
                                                    className="text-xs border-blue-300 text-blue-700 bg-blue-50 flex items-center gap-1"
                                                >
                                                    <Plane className="w-3 h-3" />
                                                    Flying
                                                </Badge>
                                            )}

                                            {/* Error */}
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

                                        {d.battery?.remainingPercent != null
                                            ? (
                                                <span>
                                                    {d.battery.remainingPercent}%
                                                </span>
                                            )
                                            : (
                                                <span className="text-slate-400">
                                                    No battery
                                                </span>
                                            )}

                                        
                                    </div>

                                    <div className="flex items-center gap-1 justify-end">
                                        <Gauge className="w-3 h-3" />
                                        {typeof d.motion.speedMps === 'number'
                                            ? d.motion.speedMps.toFixed(1)
                                            : '-'}{''}
                                        m/s
                                    </div>

                                    <div className="flex items-center gap-1 justify-end">
                                        <Layers className="w-3 h-3" />
                                        {typeof d.position.relativeAltitudeM ===
                                        'number'
                                            ? d.position.relativeAltitudeM.toFixed(
                                                  1
                                              )
                                            : d.position.altitudeM?.toFixed(
                                                  1
                                              ) ?? '-'}{' '}
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
                                        if (
                                            d.position.lat == null ||
                                            d.position.lng == null
                                        )
                                            return;

                                        mapRef.current?.flyTo({
                                            center: [
                                                d.position.lng,
                                                d.position.lat,
                                            ],
                                            zoom: 16,
                                        });
                                    }}
                                >
                                    <MapPin className="w-4 h-4 mr-1" />
                                    {/* vi tri, localtion, handle trigger, handle disabled */}
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
                                                        if (!isConnected)
                                                            return;
                                                        setSelectedDroneId(
                                                            d.droneId
                                                        );
                                                        setIsVideoModalOpen(
                                                            true
                                                        );
                                                    }}
                                                >
                                                    Chi tiết
                                                </Button>
                                            </span>
                                        </TooltipTrigger>

                                        {!isConnected && (
                                            <TooltipContent>
                                                WebSocket chưa kết nối
                                            </TooltipContent>
                                        )}
                                    </UITooltip>
                                </TooltipProvider>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}

            {activeDrones.length === 0 && (
                <div className="text-sm text-slate-500 text-center py-6">
                    No drones connected
                </div>
            )}
        </div>
    );
}
