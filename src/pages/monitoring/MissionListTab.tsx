import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DroneClient, type Drone, type DroneStatus } from '@/api/models/drone/droneClient';
import { MissionClient, type Mission } from '@/api/models/mission/missionClient';

interface MissionListTabProps {
    value: string;
    missions: Mission[];
    observingMissionId: number | null;
    missionProgress: Record<string, number>;
    startObservingMission: (id: number) => void;
    stopObservingMission: () => void;
}

export function MissionListTab({
    value,
    missions,
    observingMissionId,
    missionProgress,
    startObservingMission,
    stopObservingMission,
}: MissionListTabProps) {
    return (
        <TabsContent value={value} className="space-y-2">
            <div className="max-h-[400px] overflow-auto space-y-2">
                {missions.length === 0 && (
                    <div className="text-sm text-slate-500 text-center py-4">No missions found</div>
                )}

                {missions.map(mission => (
                    <div key={mission.id}>mission {mission.id}</div>
                    //   <MissionCard
                    //     key={mission.id}
                    //     mission={mission}
                    //     observingMissionId={observingMissionId}
                    //     missionProgress={missionProgress}
                    //     startObservingMission={startObservingMission}
                    //     stopObservingMission={stopObservingMission}
                    //   />
                ))}
            </div>
        </TabsContent>
    );
}
