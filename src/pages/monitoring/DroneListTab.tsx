import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
        <TabsContent value={value} className="space-y-3">
            <DroneListContent mapRef={mapRef} />
        </TabsContent>
    );
}
