import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DroneClient, type Drone, type DroneStatus } from '@/api/models/drone/droneClient';
import { MissionClient, type Mission } from '@/api/models/mission/missionClient';
import { DroneListContent } from './DroneListContent';

interface DroneListTabProps {
    value: string;
    visibleDrones: Drone[];
    selectedDroneId: number | null;
    setSelectedDroneId: (id: number) => void;
    mapRef: React.RefObject<any>;
    isDroneActive: (d: Drone) => boolean;
    isConnected: boolean;
    setIsVideoModalOpen: (v: boolean) => void;
}

export function DroneListTab({
    value,
    visibleDrones,
    selectedDroneId,
    setSelectedDroneId,
    mapRef,
    isDroneActive,
    isConnected,
    setIsVideoModalOpen,
}: DroneListTabProps) {
    return (
        <TabsContent value={value} className="space-y-2">
            <div className="max-h-[400px] overflow-auto space-y-2">
                <DroneListContent
                    visibleDrones={visibleDrones}
                    selectedDroneId={selectedDroneId}
                    setSelectedDroneId={setSelectedDroneId}
                    mapRef={mapRef}
                    isDroneActive={isDroneActive}
                    isConnected={isConnected}
                    setIsVideoModalOpen={setIsVideoModalOpen}
                />

                {visibleDrones.length === 0 && (
                    <div className="text-sm text-slate-500 text-center py-4">No drones found</div>
                )}
            </div>
        </TabsContent>
    );
}
