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

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Play, Square, Plane, Layers, Clock } from 'lucide-react';

const FAKE_MISSIONS: Mission[] = [
    {
        id: 9991,
        pilotId: 1,
        licenseId: null,
        missionName: 'Nhiệm vụ kiểm tra khu vực A',
        status: 'running' as any,
        startTime: new Date().toISOString(),
        endTime: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        missionDrones: [
            {
                id: 1,
                missionId: 9991,
                droneId: 101,
                drone: { name: 'Drone Alpha' },
            },
            {
                id: 2,
                missionId: 9991,
                droneId: 102,
                drone: { name: 'Drone Beta' },
            },
        ],
    },
    {
        id: 9992,
        pilotId: 1,
        licenseId: null,
        missionName: 'Nhiệm vụ mô phỏng bay thử',
        status: 'idle' as any,
        startTime: null,
        endTime: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        missionDrones: [],
    },
];

export function MissionListTab({
    value,
    missions,
    observingMissionId,
    missionProgress,
    startObservingMission,
    stopObservingMission,
}: MissionListTabProps) {
    const displayMissions = missions && missions.length > 0 ? missions : FAKE_MISSIONS;

    return (
        <TabsContent value={value} className="space-y-2">
            <div className="max-h-[400px] overflow-auto space-y-3 pd-2  ">
                {displayMissions.length === 0 && (
                    <div className="text-sm text-slate-500 text-center py-4">
                        Không có nhiệm vụ nào
                    </div>
                )}

                {displayMissions.map(mission => {
                    const isActive = observingMissionId === mission.id;
                    const droneCount = mission.missionDrones?.length ?? 0;

                    return (
                        <Card
                            key={mission.id}
                            className={`transition-all py-1 ${
                                isActive ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-slate-50'
                            }`}
                        >
                            <CardContent className="p-4 space-y-3">
                                {/* Header */}
                                <div className="flex items-start justify-between gap-2">
                                    <div className="space-y-1 mw-100">
                                        <div className="font-medium text-sm">
                                            {mission.missionName || `Nhiệm vụ #${mission.id}`}
                                        </div>

                                        <div className="flex items-center gap-2 text-xs">
                                            <Badge
                                                variant="outline"
                                                className="flex items-center gap-1"
                                            >
                                                <Layers className="w-3 h-3" />
                                                {droneCount} drone
                                            </Badge>

                                            <Badge
                                                variant="outline"
                                                className={`flex items-center gap-1 ${
                                                    isActive
                                                        ? 'border-blue-300 bg-blue-50 text-blue-700'
                                                        : 'text-slate-600'
                                                }`}
                                            >
                                                <Plane className="w-3 h-3" />
                                                {isActive ? 'Đang theo dõi' : 'Chưa kích hoạt'}
                                            </Badge>
                                        </div>
                                    </div>

                                    {/* Main action */}
                                    <div>
                                        {isActive ? (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={stopObservingMission}
                                            >
                                                <Square className="w-4 h-4 mr-1" />
                                                Dừng
                                            </Button>
                                        ) : (
                                            <Button
                                                size="sm"
                                                onClick={() => startObservingMission(mission.id)}
                                                disabled={droneCount === 0}
                                            >
                                                <Play className="w-4 h-4 mr-1" />
                                                Kích hoạt
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                {/* Active mission → show drones progress */}
                                {isActive && (
                                    <div className="space-y-2 pt-2 border-t">
                                        <div className="text-xs text-slate-500 flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            Tiến độ drone trong nhiệm vụ
                                        </div>

                                        {mission.missionDrones?.map(md => {
                                            const droneId = md.droneId?.toString();
                                            const progress = droneId
                                                ? (missionProgress[droneId] ?? 0)
                                                : 0;

                                            const droneName =
                                                md.drone?.name || `Drone ${md.droneId}`;

                                            return (
                                                <div key={md.id} className="space-y-1">
                                                    <div className="flex justify-between text-xs">
                                                        <span>{droneName}</span>
                                                        <span className="font-medium">
                                                            {progress.toFixed(1)}%
                                                        </span>
                                                    </div>
                                                    <Progress value={progress} className="h-1.5" />
                                                </div>
                                            );
                                        })}

                                        {droneCount === 0 && (
                                            <div className="text-xs text-slate-500 italic">
                                                Nhiệm vụ này chưa có drone
                                            </div>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </TabsContent>
    );
}
