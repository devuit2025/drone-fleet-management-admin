import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Battery, Gauge, MapPin, AlertTriangle, Plane, Layers } from 'lucide-react';
import { useActiveDroneStore } from '@/stores/active/useActiveDroneStore';
import type { ActiveDroneState } from '@/stores/active/useActiveDroneType';
import { focusDrone } from '@/services/mapbox/actions/focusDrone';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface DroneListContentProps {
    mapRef: React.RefObject<any>;
}

export function DroneListContent({ mapRef }: DroneListContentProps) {
    const [selectedDroneId, setSelectedDroneId] = useState();
    // Active drone store (source of truth)
    const dronesMap = useActiveDroneStore(s => s.drones);
    // Convert Record -> Array
    const activeDrones: ActiveDroneState[] = Object.values(dronesMap);

    const onFocusDrone = (droneId: string) => {
        if (!mapRef.current) return;
        focusDrone(mapRef.current, droneId, { bearing: true }, () => setSelectedDroneId(droneId));
    };

    const navigate = useNavigate();

    return (
        <div className="overflow-auto space-y-3 p-1">
            {activeDrones.map(d => {
                const selected = selectedDroneId === d.droneId;
                const isConnected = d.connected;
                const isFlying = d.system.armed === false && (d.motion.speedMps ?? 0) > 1;

                // const hasError = d.connected === false;
                const hasError = false;

                return (
                    <Card
                        key={d.droneId}
                        className={`transition-all cursor-pointer py-1 ${
                            selected ? 'ring-2 ring-blue-500 bg-blue-50 ' : 'hover:bg-slate-50'
                        }`}
                        // onClick={() => onFocusDrone(d.droneId)}
                    >
                        <CardContent className="p-4 space-y-3">
                            {/* Header */}
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-2">
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
                                            {d.name}
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
                                                {d.connected ? 'Kết nối' : 'Không kết nối'}
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

                                        {d.battery?.remainingPercent != null ? (
                                            <span>{d.battery.remainingPercent}%</span>
                                        ) : (
                                            <span className="text-slate-400">No battery</span>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-1 justify-end">
                                        <Gauge className="w-3 h-3" />
                                        {typeof d.motion.speedMps === 'number'
                                            ? d.motion.speedMps.toFixed(1)
                                            : '-'}
                                        {''}
                                        m/s
                                    </div>

                                    <div className="flex items-center gap-1 justify-end">
                                        <Layers className="w-3 h-3" />
                                        {typeof d.position.relativeAltitudeM === 'number'
                                            ? d.position.relativeAltitudeM.toFixed(1)
                                            : (d.position.altitudeM?.toFixed(1) ?? '-')}{' '}
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
                                    disabled={!isConnected}
                                    onClick={() => onFocusDrone(d.droneId)}
                                >
                                    <MapPin className="w-4 h-4 mr-1" />
                                    {/* vi tri, localtion, handle trigger, handle disabled */}
                                    Vị trí
                                </Button>

                                <span className="flex-1">
                                    <Button
                                        size="sm"
                                        className="w-full"
                                        disabled={!isConnected}
                                        onClick={e => {
                                            navigate(`/monitoring/single/${d.droneId}`);
                                            // not handle yet
                                            // should go to another route
                                        }}
                                    >
                                        Chi tiết
                                    </Button>
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}

            {activeDrones.length === 0 && (
                <div className="text-sm text-slate-500 text-center py-6">No drones connected</div>
            )}
        </div>
    );
}
