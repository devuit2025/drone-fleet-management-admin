import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DroneClient, type Drone, type DroneStatus } from '@/api/models/drone/droneClient';
import { MissionClient, type Mission } from '@/api/models/mission/missionClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
        <div className="max-h-[400px] overflow-auto space-y-2">
            {visibleDrones.map(d => {
                const active = isDroneActive(d);
                const selected = selectedDroneId === d.id;

                return (
                    <Card
                        key={d.id}
                        className={`cursor-pointer transition-colors ${
                            selected ? 'ring-2 ring-blue-500' : ''
                        }`}
                        onClick={() => {
                            // #Here not implemented yet
                        }}
                    >
                        <CardContent className="p-3">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="font-medium text-sm flex items-center gap-2">
                                        {d.name || d.id}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}

            {visibleDrones.length === 0 && (
                <div className="text-sm text-slate-500 text-center py-4">No drones found</div>
            )}
        </div>
    );
}
