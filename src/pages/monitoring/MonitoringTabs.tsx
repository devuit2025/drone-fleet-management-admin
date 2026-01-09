import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DroneClient, type Drone, type DroneStatus } from '@/api/models/drone/droneClient';
import { MissionClient, type Mission } from '@/api/models/mission/missionClient';
import { DroneListTab } from './DroneListTab';
import { MissionListTab } from './MissionListTab';

interface DroneTabsProps {
    visibleDrones: Drone[];
    selectedDroneId: number | null;
    setSelectedDroneId: (id: number) => void;
    mapRef: React.RefObject<any>;
    isDroneActive: (d: Drone) => boolean;
    isConnected: boolean;
    setIsVideoModalOpen: (open: boolean) => void;

    missions: Mission[];
    observingMissionId: number | null;
    missionProgress: Record<string, number>;
    startObservingMission: (id: number) => void;
    stopObservingMission: () => void;

    selectedDrone: Drone | null;
    prepareChartData: (data: number[], label: string, color: string) => any;
}

export function MonitoringTabs({
    visibleDrones,
    selectedDroneId,
    setSelectedDroneId,
    mapRef,
    isDroneActive,
    isConnected,
    setIsVideoModalOpen,

    missions,
    observingMissionId,
    missionProgress,
    startObservingMission,
    stopObservingMission,

    selectedDrone,
    prepareChartData,
}: DroneTabsProps) {
    return (
        <Tabs defaultValue="list" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="list">Drones</TabsTrigger>
                <TabsTrigger value="missions">Missions</TabsTrigger>
            </TabsList>

            <DroneListTab
                value="list"
                visibleDrones={visibleDrones}
                selectedDroneId={selectedDroneId}
                setSelectedDroneId={setSelectedDroneId}
                mapRef={mapRef}
                isDroneActive={isDroneActive}
                isConnected={isConnected}
                setIsVideoModalOpen={setIsVideoModalOpen}
            />

            <MissionListTab
                value="missions"
                missions={missions}
                observingMissionId={observingMissionId}
                missionProgress={missionProgress}
                startObservingMission={startObservingMission}
                stopObservingMission={stopObservingMission}
            />
        </Tabs>
    );
}
