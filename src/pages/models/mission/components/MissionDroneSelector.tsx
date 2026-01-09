import { useCallback, useMemo, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { FeatureCollection, Polygon } from 'geojson';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { MapboxPolygonEditor } from '@/components/map/MapboxPolygonEditor';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
    closeRingIfNeeded,
    featureCollectionFromRing,
    intersectsAnyPolygon,
    ringFromFeatureCollection,
    isPointInPermitArea,
    isPointNearPermitBoundary,
} from '@/lib/geo';
import { toast } from 'sonner';

type DroneOption = {
    id: number;
    label: string;
};

export type MissionWaypointDraft = {
    seqNumber: number;
    lon: number;
    lat: number;
    altitudeM: string;
    speedMps: string;
    action: string;
};

export type MissionDroneDraft = {
    key: string;
    droneId?: number;
    droneName?: string;
    featureCollection: FeatureCollection<Polygon>;
    waypoints: MissionWaypointDraft[];
    hasConflict?: boolean;
};

const EMPTY_FEATURE_COLLECTION: FeatureCollection<Polygon> = {
    type: 'FeatureCollection',
    features: [],
};

const DEFAULT_ALTITUDE = '100';
const DEFAULT_SPEED = '10';
const DEFAULT_ACTION = 'Survey';

const randomKey = () =>
    `mission-drone-${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36)}`;

export const createEmptyMissionDroneDraft = (): MissionDroneDraft => ({
    key: randomKey(),
    droneId: undefined,
    droneName: undefined,
    featureCollection: EMPTY_FEATURE_COLLECTION,
    waypoints: [],
    hasConflict: false,
});

interface MissionDroneSelectorProps {
    value: MissionDroneDraft[];
    onChange: (next: MissionDroneDraft[]) => void;
    droneOptions: DroneOption[];
    disabledZones?: FeatureCollection<Polygon> | null;
    permitAreas?: FeatureCollection<Polygon> | null;
}

interface EditorState {
    featureCollection: FeatureCollection<Polygon>;
    waypoints: MissionWaypointDraft[];
    hasConflict: boolean;
}

const ensureClosedRing = (ring: number[][]): number[][] => closeRingIfNeeded(ring);

const stripClosingPoint = (ring: number[][]): number[][] => {
    if (ring.length <= 1) return ring;
    const first = ring[0];
    const last = ring[ring.length - 1];
    if (first[0] === last[0] && first[1] === last[1]) {
        return ring.slice(0, ring.length - 1);
    }
    return ring;
};

const buildWaypoints = (
    ring: number[][],
    previous: MissionWaypointDraft[] = [],
): MissionWaypointDraft[] => {
    const stripped = stripClosingPoint(ring);
    return stripped.map(([lon, lat], idx) => {
        const existing = previous[idx];
        return {
            seqNumber: idx,
            lon: Number(lon),
            lat: Number(lat),
            altitudeM: existing?.altitudeM ?? DEFAULT_ALTITUDE,
            speedMps: existing?.speedMps ?? DEFAULT_SPEED,
            action: existing?.action ?? DEFAULT_ACTION,
        };
    });
};

export function MissionDroneSelector({
    value,
    onChange,
    droneOptions,
    disabledZones = null,
    permitAreas = null,
}: MissionDroneSelectorProps) {
    const [editorIndex, setEditorIndex] = useState<number | null>(null);
    const [editorState, setEditorState] = useState<EditorState | null>(null);

    const openEditor = useCallback(
        (index: number) => {
            const target = value[index];
            if (!target) return;
            setEditorIndex(index);
            setEditorState({
                featureCollection: target.featureCollection,
                waypoints: target.waypoints,
                hasConflict: target.hasConflict ?? false,
            });
        },
        [value],
    );

    const closeEditor = useCallback(() => {
        setEditorIndex(null);
        setEditorState(null);
    }, []);

    const handleSaveEditor = useCallback(() => {
        if (editorIndex === null || !editorState) {
            closeEditor();
            return;
        }
        const target = value[editorIndex];
        if (!target) {
            closeEditor();
            return;
        }
        if (editorState.waypoints.length === 0) {
            toast.error('Vui lòng vẽ tối thiểu một waypoint cho drone này');
            return;
        }

        // Validate permit areas before saving
        if (permitAreas && permitAreas.features.length > 0) {
            const outsidePermit: number[] = [];
            const nearBoundary: number[] = [];

            for (let i = 0; i < editorState.waypoints.length; i++) {
                const wp = editorState.waypoints[i];
                if (!isPointInPermitArea(wp.lon, wp.lat, permitAreas)) {
                    outsidePermit.push(i + 1);
                } else if (isPointNearPermitBoundary(wp.lon, wp.lat, permitAreas, 50)) {
                    nearBoundary.push(i + 1);
                }
            }

            if (outsidePermit.length > 0) {
                toast.error(
                    `Waypoint ${outsidePermit.join(', ')} nằm ngoài vùng được phép bay. Vui lòng điều chỉnh.`,
                );
                return;
            }

            if (nearBoundary.length > 0) {
                toast.warning(
                    `Cảnh báo: Waypoint ${nearBoundary.join(', ')} quá gần biên vùng phép bay (< 50m). Có thể vi phạm do yếu tố môi trường.`,
                );
            }
        }

        if (editorState.hasConflict) {
            toast.error(
                'Polygon đang chồng lấp với khu vực cấm bay hoặc nằm ngoài vùng được phép bay. Vui lòng điều chỉnh.',
            );
            return;
        }

        const next = [...value];
        next[editorIndex] = {
            ...target,
            featureCollection: editorState.featureCollection,
            waypoints: editorState.waypoints,
            hasConflict: editorState.hasConflict,
        };
        onChange(next);
        closeEditor();
    }, [closeEditor, editorIndex, editorState, onChange, value, permitAreas]);

    const updateEditorFeatures = useCallback(
        (fc: FeatureCollection<Polygon>) => {
            const ring = ringFromFeatureCollection(fc);
            const closed = ensureClosedRing(ring);
            const normalizedFc =
                closed.length > 0 ? featureCollectionFromRing(closed) : EMPTY_FEATURE_COLLECTION;
            const nextWaypoints = buildWaypoints(closed, editorState?.waypoints);

            let conflict = false;
            let outsidePermit = false;
            let nearBoundary = false;
            const boundaryWarnings: number[] = [];

            // Check no-fly zones conflict
            if (disabledZones && normalizedFc.features.length > 0) {
                conflict = intersectsAnyPolygon(normalizedFc, disabledZones);
            }

            // Check permit areas
            if (permitAreas && permitAreas.features.length > 0 && nextWaypoints.length > 0) {
                for (let i = 0; i < nextWaypoints.length; i++) {
                    const wp = nextWaypoints[i];
                    if (!isPointInPermitArea(wp.lon, wp.lat, permitAreas)) {
                        outsidePermit = true;
                    } else if (isPointNearPermitBoundary(wp.lon, wp.lat, permitAreas, 50)) {
                        nearBoundary = true;
                        boundaryWarnings.push(i + 1);
                    }
                }
            }

            setEditorState({
                featureCollection: normalizedFc,
                waypoints: nextWaypoints,
                hasConflict: conflict || outsidePermit,
            });
        },
        [disabledZones, permitAreas, editorState?.waypoints],
    );

    const handleWaypointFieldChange = useCallback(
        (index: number, key: keyof MissionWaypointDraft, value: string) => {
            setEditorState(prev => {
                if (!prev) return prev;
                const nextWaypoints = prev.waypoints.map((wp, i) =>
                    i === index ? { ...wp, [key]: value } : wp,
                );
                return { ...prev, waypoints: nextWaypoints };
            });
        },
        [],
    );

    const addDrone = () => {
        onChange([...value, createEmptyMissionDroneDraft()]);
    };

    const removeDrone = (key: string) => {
        const next = value.filter(item => item.key !== key);
        onChange(next.length > 0 ? next : [createEmptyMissionDroneDraft()]);
    };

    const handleSelectDrone = (idx: number, droneId: number | undefined) => {
        const option = droneOptions.find(opt => opt.id === droneId);
        onChange(
            value.map((item, i) =>
                i === idx
                    ? {
                          ...item,
                          droneId,
                          droneName: option?.label,
                      }
                    : item,
            ),
        );
    };

    const assignedDroneIds = useMemo(
        () =>
            value
                .map(item => item.droneId)
                .filter((id): id is number => typeof id === 'number' && !Number.isNaN(id)),
        [value],
    );

    const renderSummary = (item: MissionDroneDraft) => {
        const optionLabel =
            item.droneId !== undefined
                ? droneOptions.find(opt => opt.id === item.droneId)?.label
                : undefined;
        const label = item.droneId
            ? (item.droneName ?? optionLabel ?? `Drone ${item.droneId}`)
            : null;

        if (!item.droneId) {
            return <span className="text-xs text-muted-foreground">Chưa chọn drone</span>;
        }

        const pieces = [`Waypoints: ${item.waypoints.length}`];
        return (
            <div className="flex items-center gap-2">
                <div className="flex flex-col text-xs text-muted-foreground">
                    {label && <span className="font-medium text-foreground">{label}</span>}
                    <span>{pieces.join(' • ')}</span>
                </div>
                {item.hasConflict && (
                    <Badge variant="destructive" className="text-[11px]">
                        Trùng khu vực cấm bay
                    </Badge>
                )}
            </div>
        );
    };

    const availableOptions = (currentId?: number) =>
        droneOptions.filter(opt => opt.id === currentId || !assignedDroneIds.includes(opt.id));

    return (
        <div className="space-y-4">
            <div className="space-y-3">
                {value.map((item, idx) => (
                    <div
                        key={item.key}
                        className={cn(
                            'rounded border p-4 transition-colors',
                            item.hasConflict
                                ? 'border-destructive/60 bg-destructive/5'
                                : 'border-muted',
                        )}
                    >
                        <div className="flex flex-wrap items-start gap-3">
                            <div className="min-w-[220px] flex-1">
                                <label className="text-xs font-semibold text-muted-foreground">
                                    Drone #{idx + 1}
                                </label>
                                <Select
                                    value={item.droneId ? item.droneId.toString() : ''}
                                    onValueChange={val =>
                                        handleSelectDrone(idx, val ? Number(val) : undefined)
                                    }
                                >
                                    <SelectTrigger className="w-full mt-1">
                                        <SelectValue placeholder="Chọn drone" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableOptions(item.droneId).map(option => (
                                            <SelectItem
                                                key={option.id}
                                                value={option.id.toString()}
                                            >
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-center gap-2 pt-5">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={() => openEditor(idx)}
                                    title="Chỉnh sửa waypoint"
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeDrone(item.key)}
                                    title="Xoá drone"
                                >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </div>
                        </div>
                        <div className="mt-3">{renderSummary(item)}</div>
                    </div>
                ))}
            </div>

            <Button type="button" variant="outline" onClick={addDrone}>
                <Plus className="mr-2 h-4 w-4" /> Thêm drone
            </Button>

            <Dialog
                open={editorIndex !== null}
                onOpenChange={open => (open ? null : closeEditor())}
            >
                <DialogContent
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        height: '95vh',
                        width: '95vw',
                        overflow: 'hidden',
                        maxWidth: '95vw',
                    }}
                >
                    <DialogHeader>
                        <DialogTitle>Thiết lập waypoint cho drone</DialogTitle>
                        <DialogDescription>
                            Vẽ polygon trên bản đồ để sinh waypoint, rồi điều chỉnh thông số chi
                            tiết.
                        </DialogDescription>
                    </DialogHeader>
                    {editorState && (
                        <div className="flex flex-1 flex-col gap-4 overflow-hidden">
                            <div className="flex-1 overflow-hidden rounded border bg-muted/20">
                                <MapboxPolygonEditor
                                    permitAreas={permitAreas}
                                    style={{ height: '100%', width: '100%' }}
                                    value={editorState.featureCollection}
                                    onChange={updateEditorFeatures}
                                    disabledZones={disabledZones}
                                />
                            </div>
                            {editorState.hasConflict && (
                                <p className="rounded border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                                    Polygon đang chồng lấp với khu vực cấm bay hoặc nằm ngoài vùng
                                    được phép bay. Điều chỉnh lại trước khi lưu.
                                </p>
                            )}
                            {permitAreas && permitAreas.features.length === 0 && (
                                <p className="rounded border border-yellow-400/40 bg-yellow-400/10 p-3 text-sm text-yellow-800 dark:text-yellow-200">
                                    Không có phép bay hợp lệ cho license này. Vui lòng tạo phép bay
                                    trước khi vẽ waypoint.
                                </p>
                            )}
                            <div className="max-h-52 overflow-auto rounded border bg-muted/30 p-4">
                                <div className="grid grid-cols-6 gap-3 border-b pb-2 text-xs font-medium text-muted-foreground">
                                    <div>#</div>
                                    <div>Longitude</div>
                                    <div>Latitude</div>
                                    <div>Altitude (m)</div>
                                    <div>Speed (m/s)</div>
                                    <div>Action</div>
                                </div>
                                <div className="divide-y">
                                    {editorState.waypoints.map((wp, idx) => (
                                        <div
                                            key={idx}
                                            className="grid grid-cols-6 gap-3 py-2 text-xs"
                                        >
                                            <div className="font-medium">{idx}</div>
                                            <div className="font-mono">{wp.lon.toFixed(6)}</div>
                                            <div className="font-mono">{wp.lat.toFixed(6)}</div>
                                            <Input
                                                className="h-7 text-xs"
                                                type="number"
                                                value={wp.altitudeM}
                                                onChange={e =>
                                                    handleWaypointFieldChange(
                                                        idx,
                                                        'altitudeM',
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                            <Input
                                                className="h-7 text-xs"
                                                type="number"
                                                value={wp.speedMps}
                                                onChange={e =>
                                                    handleWaypointFieldChange(
                                                        idx,
                                                        'speedMps',
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                            <Input
                                                className="h-7 text-xs"
                                                value={wp.action}
                                                onChange={e =>
                                                    handleWaypointFieldChange(
                                                        idx,
                                                        'action',
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                        </div>
                                    ))}
                                    {editorState.waypoints.length === 0 && (
                                        <div className="py-4 text-center text-xs text-muted-foreground">
                                            Vẽ polygon để tạo waypoint
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter className="pt-4">
                        <Button type="button" variant="outline" onClick={closeEditor}>
                            Hủy
                        </Button>
                        <Button
                            type="button"
                            onClick={handleSaveEditor}
                            disabled={!editorState || editorState.hasConflict}
                        >
                            Lưu waypoint
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
