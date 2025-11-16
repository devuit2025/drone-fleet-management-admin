import { useForm } from '@tanstack/react-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { FeatureCollection, Polygon } from 'geojson';

import {
    type CreateMissionDto,
    type MissionDroneInput,
    type MissionStatus,
    type UpdateMissionDto,
    MissionClient,
} from '@/api/models/mission/missionClient';
import { MissionMutation } from '@/api/models/mission/missionMutation';
import { PilotClient, type Pilot } from '@/api/models/pilot/pilotClient';
import { DroneClient, type Drone } from '@/api/models/drone/droneClient';
import {
    MissionDroneSelector,
    createEmptyMissionDroneDraft,
    type MissionDroneDraft,
} from './components/MissionDroneSelector';
import { useNoFlyZoneStore } from '@/stores/useNoFlyZoneStore';
import { featureCollectionFromRing, intersectsAnyPolygon, pointFromWkt, closeRingIfNeeded, isPointInAnyPolygon } from '@/lib/geo';
import type { Feature } from 'geojson';
import { MapboxMap } from '@/components/map/MapboxMap';

const missionStatusValues = ['planned', 'in_progress', 'completed', 'failed'] as const;

const missionSchema = z.object({
    pilotId: z.number().min(1, 'Pilot is required'),
    licenseId: z.number().optional(),
    missionName: z.string().min(1, 'Mission name is required'),
    status: z.enum(missionStatusValues).optional(),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
});

interface MissionFormProps {
    isEdit?: boolean;
}

const DEFAULT_ALTITUDE = '100';
const DEFAULT_SPEED = '10';
const DEFAULT_ACTION = 'Survey';

const EMPTY_FEATURE_COLLECTION: FeatureCollection<Polygon> = {
    type: 'FeatureCollection',
    features: [],
};

const parseGeoPoint = (value: unknown): [number, number] | null => {
    if (!value) return null;
    if (typeof value === 'string') {
        const trimmed = value.trim();
        if (!trimmed) return null;
        if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
            try {
                return parseGeoPoint(JSON.parse(trimmed));
            } catch {
                return pointFromWkt(trimmed);
            }
        }
        return pointFromWkt(trimmed);
    }
    if (typeof value === 'object' && value !== null) {
        const maybePoint = value as { type?: string; coordinates?: any };
        if (maybePoint.type === 'Point' && Array.isArray(maybePoint.coordinates)) {
            const [lon, lat] = maybePoint.coordinates;
            return [Number(lon), Number(lat)];
        }
    }
    return null;
};

export default function MissionForm({ isEdit = false }: MissionFormProps) {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [pilots, setPilots] = useState<Pilot[]>([]);
    const [loadingPilots, setLoadingPilots] = useState(true);
    const [drones, setDrones] = useState<Drone[]>([]);
    const [loadingDrones, setLoadingDrones] = useState(true);
    const [loadingData, setLoadingData] = useState(isEdit);
    const [missionDrones, setMissionDrones] = useState<MissionDroneDraft[]>([
        createEmptyMissionDroneDraft(),
    ]);

    const disabledZones = useNoFlyZoneStore(state => state.zones);
    const zonesLoaded = useNoFlyZoneStore(state => state.loaded);
    const fetchNoFlyZones = useNoFlyZoneStore(state => state.fetchZones);

    const droneOptions = useMemo(
        () =>
            drones.map(drone => ({
                id: drone.id,
                label: `${drone.name} (#${drone.id})`,
            })),
        [drones],
    );

    const droneLabelMap = useMemo(() => {
        const map = new Map<number, string>();
        droneOptions.forEach(option => {
            map.set(option.id, option.label);
        });
        return map;
    }, [droneOptions]);

    useEffect(() => {
        PilotClient.findAll()
            .then(res => {
                setPilots(res);
                setLoadingPilots(false);
            })
            .catch(err => {
                console.error('Failed to load pilots:', err);
                setLoadingPilots(false);
            });
    }, []);

    useEffect(() => {
        DroneClient.findAll()
            .then(res => {
                setDrones(res);
                setLoadingDrones(false);
            })
            .catch(err => {
                console.error('Failed to load drones:', err);
                setLoadingDrones(false);
            });
    }, []);

    useEffect(() => {
        if (loadingDrones) return;
        setMissionDrones(prev => {
            let changed = false;
            const next = prev.map(item => {
                if (item.droneId && !item.droneName) {
                    const option = droneOptions.find(opt => opt.id === item.droneId);
                    if (option) {
                        changed = true;
                        return { ...item, droneName: option.label };
                    }
                }
                return item;
            });
            return changed ? next : prev;
        });
    }, [droneOptions, loadingDrones, missionDrones]);

    useEffect(() => {
        if (!zonesLoaded) {
            fetchNoFlyZones().catch(err => {
                console.error('Failed to load no-fly zones:', err);
                toast.error('Không thể tải dữ liệu khu vực cấm bay');
            });
        }
    }, [zonesLoaded, fetchNoFlyZones]);

    const form = useForm({
        defaultValues: {
            pilotId: undefined as number | undefined,
            licenseId: undefined as number | undefined,
            missionName: '',
            status: 'planned' as MissionStatus | undefined,
            startTime: '',
            endTime: '',
        },
        validators: {
            onSubmit: missionSchema as any,
        },
        onSubmit: async ({ value }) => {
            try {
                // Kiểm tra waypoints có nằm trong vùng cấm bay không
                if (disabledZones && disabledZones.features.length > 0) {
                    for (const item of missionDrones) {
                        if (!item.droneId || !item.waypoints || item.waypoints.length === 0) continue;
                        
                        for (let idx = 0; idx < item.waypoints.length; idx++) {
                            const wp = item.waypoints[idx];
                            if (isPointInAnyPolygon(wp.lon, wp.lat, disabledZones)) {
                                const droneName = item.droneName ?? `Drone #${item.droneId}`;
                                toast.error(
                                    `Waypoint #${idx + 1} của ${droneName} nằm trong vùng cấm bay. Vui lòng điều chỉnh trước khi lưu.`
                                );
                                return;
                            }
                        }
                    }
                }
                
                const dronesPayload = buildMissionDronesPayload();
                if (dronesPayload === null) return;

                if (isEdit && id) {
                    const payload: UpdateMissionDto = {
                        pilotId: value.pilotId,
                        licenseId: value.licenseId,
                        missionName: value.missionName,
                        status: value.status,
                        startTime: value.startTime || undefined,
                        endTime: value.endTime || undefined,
                        drones: dronesPayload,
                    };
                    await MissionMutation.update(Number(id), payload);
                    toast.success('Cập nhật mission thành công!');
                } else {
                    if (dronesPayload.length === 0) {
                        toast.error('Vui lòng cấu hình ít nhất một drone với waypoint.');
                        return;
                    }
                    const payload: CreateMissionDto = {
                        pilotId: value.pilotId!,
                        licenseId: value.licenseId,
                        missionName: value.missionName,
                        status: value.status,
                        startTime: value.startTime || undefined,
                        endTime: value.endTime || undefined,
                        drones: dronesPayload,
                    };
                    await MissionMutation.create(payload);
                    toast.success('Tạo mission thành công!');
                }
                navigate('/missions');
            } catch (err: any) {
                toast.error(
                    err?.response?.data?.message ||
                        (isEdit ? 'Cập nhật mission thất bại' : 'Tạo mission thất bại'),
                );
                console.error(err);
            }
        },
    });

    useEffect(() => {
        if (!isEdit || !id) return;
        setLoadingData(true);
        MissionClient.findOne(Number(id))
            .then(mission => {
                form.setFieldValue('pilotId', mission.pilotId);
                form.setFieldValue('licenseId', mission.licenseId || undefined);
                form.setFieldValue('missionName', mission.missionName);
                form.setFieldValue('status', mission.status);
                form.setFieldValue(
                    'startTime',
                    mission.startTime ? mission.startTime.split('T')[0] : '',
                );
                form.setFieldValue(
                    'endTime',
                    mission.endTime ? mission.endTime.split('T')[0] : '',
                );

                const drafts = Array.isArray(mission.missionDrones)
                    ? mission.missionDrones.map(md => {
                          const coordinates: Array<[number, number]> = [];
                          (md.waypoints ?? []).forEach(wp => {
                              const coord = parseGeoPoint(wp.geoPoint);
                              if (coord) coordinates.push(coord);
                          });
                          const featureCollection =
                              coordinates.length > 0
                                  ? featureCollectionFromRing(coordinates)
                                  : EMPTY_FEATURE_COLLECTION;
                          return {
                              ...createEmptyMissionDroneDraft(),
                              key: `mission-drone-${md.id ?? Math.random()}`,
                              droneId: md.droneId,
                              droneName: md.drone?.name,
                              featureCollection,
                              waypoints: coordinates.map(([lon, lat], idx) => {
                                  const wp = md.waypoints?.[idx];
                                  return {
                                      seqNumber: idx,
                                      lon,
                                      lat,
                                      altitudeM:
                                          wp && wp.altitudeM !== undefined && wp.altitudeM !== null
                                              ? String(wp.altitudeM)
                                              : DEFAULT_ALTITUDE,
                                      speedMps:
                                          wp && wp.speedMps !== undefined && wp.speedMps !== null
                                              ? String(wp.speedMps)
                                              : DEFAULT_SPEED,
                                      action: wp?.action ?? DEFAULT_ACTION,
                                  };
                              }),
                              hasConflict: false,
                          } as MissionDroneDraft;
                      })
                    : [];

                setMissionDrones(
                    drafts.length > 0 ? drafts : [createEmptyMissionDroneDraft()],
                );
                setLoadingData(false);
            })
            .catch(err => {
                console.error('Failed to load mission:', err);
                toast.error('Không thể tải thông tin mission');
                setLoadingData(false);
                navigate('/missions');
            });
    }, [isEdit, id, form, navigate]);

    useEffect(() => {
        if (!disabledZones) return;
        setMissionDrones(prev => {
            let changed = false;
            const next = prev.map(item => {
                if (!item.featureCollection.features.length) {
                    if (item.hasConflict) {
                        changed = true;
                        return { ...item, hasConflict: false };
                    }
                    return item;
                }
                let conflict = false;
                try {
                    conflict = intersectsAnyPolygon(item.featureCollection, disabledZones);
                } catch (err) {
                    console.error('Failed to evaluate no-fly zone intersection:', err);
                }
                if (conflict !== (item.hasConflict ?? false)) {
                    changed = true;
                    return { ...item, hasConflict: conflict };
                }
                return item;
            });
            return changed ? next : prev;
        });
    }, [disabledZones]);

    const buildMissionDronesPayload = (): MissionDroneInput[] | null => {
        const meaningful = missionDrones.filter(
            item => item.droneId && item.waypoints.length > 0,
        );

        if (missionDrones.some(item => item.hasConflict)) {
            toast.error(
                'Một hoặc nhiều drone có waypoint trùng khu vực cấm bay. Vui lòng điều chỉnh trước khi lưu.',
            );
            return null;
        }

        const droneMissingSelection = missionDrones.some(
            item => !item.droneId && item.waypoints.length > 0,
        );
        if (droneMissingSelection) {
            toast.error('Vui lòng chọn drone cho mọi waypoint đã cấu hình.');
            return null;
        }

        const payload: MissionDroneInput[] = [];

        for (const item of meaningful) {
            if (!item.droneId) continue;
            if (item.waypoints.length === 0) {
                toast.error(
                    `Drone ${item.droneName ?? item.droneId} chưa có waypoint. Vui lòng vẽ polygon.`,
                );
                return null;
            }

            const waypoints = [];
            for (let idx = 0; idx < item.waypoints.length; idx++) {
                const wp = item.waypoints[idx];
                const altitude = Number(wp.altitudeM);
                const speed = Number(wp.speedMps);
                if (Number.isNaN(altitude) || Number.isNaN(speed)) {
                    toast.error(
                        `Waypoint #${idx} của drone ${item.droneName ?? item.droneId} chứa giá trị không hợp lệ`,
                    );
                    return null;
                }
                waypoints.push({
                    seqNumber: idx,
                    geoPoint: JSON.stringify({
                        type: 'Point',
                        coordinates: [wp.lon, wp.lat],
                    }),
                    altitudeM: altitude,
                    speedMps: speed,
                    action: wp.action?.trim() || DEFAULT_ACTION,
                });
            }

            payload.push({
                droneId: item.droneId,
                waypoints,
            });
        }

        return payload;
    };

    const overviewFeatureCollection = useMemo<FeatureCollection<Polygon>>(() => {
        const polygons: Feature<Polygon>[] = [];
        const colors: Record<string, string> = {};
        const palette = ['#f97316', '#2563eb', '#16a34a', '#a855f7', '#f59e0b', '#ec4899'];

        missionDrones.forEach((item, idx) => {
            if (!item.waypoints || item.waypoints.length === 0) return;
            const baseRing = item.waypoints.map(wp => [wp.lon, wp.lat]);
            const closed = closeRingIfNeeded(baseRing);
            if (closed.length < 4) return;

            const ring = [...closed];
            const first = ring[0];
            const last = ring[ring.length - 1];
            if (first[0] === last[0] && first[1] === last[1]) {
                ring.pop();
            }

            if (ring.length < 4) {
                return;
            }

            const feature: Feature<Polygon> = {
                type: 'Feature',
                geometry: {
                    type: 'Polygon',
                    coordinates: [closeRingIfNeeded(ring)],
                },
                properties: {
                    droneId: item.droneId ?? `draft-${idx}`,
                    droneName:
                        item.droneName ??
                        (item.droneId ? droneLabelMap.get(item.droneId) : undefined) ??
                        `Drone ${item.droneId ?? idx + 1}`,
                    color: palette[idx % palette.length],
                },
            };
            polygons.push(feature);
            colors[feature.properties!.droneId as string] = feature.properties!.color as string;
        });

        const overviewLines: Feature<Polygon>[] = missionDrones
            .filter(item => item.waypoints.length > 1)
            .flatMap(item => {
                const segments: Feature<Polygon>[] = [];
                const color = '#64748b';
                for (let i = 0; i < item.waypoints.length - 1; i++) {
                    segments.push({
                        type: 'Feature',
                        geometry: {
                            type: 'Polygon',
                            coordinates: [
                                closeRingIfNeeded([
                                    [item.waypoints[i].lon, item.waypoints[i].lat],
                                    [item.waypoints[i + 1].lon, item.waypoints[i + 1].lat],
                                    [item.waypoints[i + 1].lon + 0.00001, item.waypoints[i + 1].lat + 0.00001],
                                    [item.waypoints[i].lon + 0.00001, item.waypoints[i].lat + 0.00001],
                                ]),
                            ],
                        },
                        properties: {
                            droneId: item.droneId,
                            type: 'segment',
                            color,
                        },
                    });
                }
                return segments;
            });

        return {
            type: 'FeatureCollection',
            features: [...polygons, ...overviewLines],
        };
    }, [missionDrones, droneLabelMap]);

    const overviewMarkers = useMemo(
        () =>
            missionDrones.flatMap((item, idx) => {
                const colorPalette = ['#f97316', '#2563eb', '#16a34a', '#a855f7', '#f59e0b', '#ec4899'];
                const color = colorPalette[idx % colorPalette.length];
                const label =
                    item.droneName ??
                    (item.droneId ? droneLabelMap.get(item.droneId) : undefined) ??
                    `Drone ${item.droneId ?? idx + 1}`;
                return item.waypoints.map(wp => ({
                    lon: wp.lon,
                    lat: wp.lat,
                    label,
                    altitude: `${wp.altitudeM} m`,
                    color,
                }));
            }),
        [missionDrones, droneLabelMap],
    );
    const hasOverviewPolygons = overviewFeatureCollection.features.length > 0;

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>{isEdit ? 'Chỉnh sửa mission' : 'Thêm mission mới'}</CardTitle>
                <CardDescription>
                    {isEdit ? 'Cập nhật thông tin mission' : 'Nhập thông tin mission để quản lý'}
                </CardDescription>
            </CardHeader>
            <CardContent>
                {loadingData ? (
                    <div className="py-8 text-center text-muted-foreground">Đang tải dữ liệu...</div>
                ) : (
                    <form
                        id="mission-form"
                        onSubmit={e => {
                            e.preventDefault();
                            form.handleSubmit();
                        }}
                    >
                        <FieldGroup>
                            <form.Field
                                name="pilotId"
                                children={field => {
                                    const isInvalid =
                                        field.state.meta.isTouched && !field.state.meta.isValid;
                                    return (
                                        <Field data-invalid={isInvalid}>
                                            <FieldLabel htmlFor={field.name}>Pilot *</FieldLabel>
                                            <Select
                                                value={field.state.value?.toString() || ''}
                                                onValueChange={val =>
                                                    field.handleChange(
                                                        val ? Number(val) : undefined,
                                                    )
                                                }
                                                disabled={loadingPilots}
                                            >
                                                <SelectTrigger className="w-full" id={field.name}>
                                                    <SelectValue placeholder="Chọn pilot" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {pilots.map(pilot => (
                                                        <SelectItem
                                                            key={pilot.id}
                                                            value={pilot.id.toString()}
                                                        >
                                                            {pilot.name} (ID: {pilot.id})
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FieldDescription>
                                                Chọn pilot chịu trách nhiệm cho mission
                                            </FieldDescription>
                                            {isInvalid && (
                                                <FieldError errors={field.state.meta.errors} />
                                            )}
                                        </Field>
                                    );
                                }}
                            />

                            <form.Field
                                name="licenseId"
                                children={field => {
                                    const isInvalid =
                                        field.state.meta.isTouched && !field.state.meta.isValid;
                                    return (
                                        <Field data-invalid={isInvalid}>
                                            <FieldLabel htmlFor={field.name}>License ID</FieldLabel>
                                            <Input
                                                id={field.name}
                                                name={field.name}
                                                type="number"
                                                value={field.state.value || ''}
                                                onBlur={field.handleBlur}
                                                onChange={e =>
                                                    field.handleChange(
                                                        e.target.value
                                                            ? Number(e.target.value)
                                                            : undefined,
                                                    )
                                                }
                                                aria-invalid={isInvalid}
                                                placeholder="Nhập license ID (tùy chọn)"
                                                autoComplete="off"
                                            />
                                            <FieldDescription>
                                                License sử dụng cho mission (tùy chọn)
                                            </FieldDescription>
                                            {isInvalid && (
                                                <FieldError errors={field.state.meta.errors} />
                                            )}
                                        </Field>
                                    );
                                }}
                            />

                            <form.Field
                                name="missionName"
                                children={field => {
                                    const isInvalid =
                                        field.state.meta.isTouched && !field.state.meta.isValid;
                                    return (
                                        <Field data-invalid={isInvalid}>
                                            <FieldLabel htmlFor={field.name}>
                                                Mission Name *
                                            </FieldLabel>
                                            <Input
                                                id={field.name}
                                                name={field.name}
                                                value={field.state.value}
                                                onBlur={field.handleBlur}
                                                onChange={e => field.handleChange(e.target.value)}
                                                aria-invalid={isInvalid}
                                                placeholder="Nhập tên mission"
                                                autoComplete="off"
                                            />
                                            {isInvalid && (
                                                <FieldError errors={field.state.meta.errors} />
                                            )}
                                        </Field>
                                    );
                                }}
                            />

                            <form.Field
                                name="status"
                                children={field => {
                                    const isInvalid =
                                        field.state.meta.isTouched && !field.state.meta.isValid;
                                    return (
                                        <Field data-invalid={isInvalid}>
                                            <FieldLabel htmlFor={field.name}>Status</FieldLabel>
                                            <Select
                                                value={field.state.value || 'planned'}
                                                onValueChange={val =>
                                                    field.handleChange(val as MissionStatus)
                                                }
                                            >
                                                <SelectTrigger className="w-full" id={field.name}>
                                                    <SelectValue placeholder="Chọn trạng thái" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="planned">Planned</SelectItem>
                                                    <SelectItem value="in_progress">
                                                        In Progress
                                                    </SelectItem>
                                                    <SelectItem value="completed">
                                                        Completed
                                                    </SelectItem>
                                                    <SelectItem value="failed">Failed</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {isInvalid && (
                                                <FieldError errors={field.state.meta.errors} />
                                            )}
                                        </Field>
                                    );
                                }}
                            />

                            <form.Field
                                name="startTime"
                                children={field => {
                                    const isInvalid =
                                        field.state.meta.isTouched && !field.state.meta.isValid;
                                    return (
                                        <Field data-invalid={isInvalid}>
                                            <FieldLabel htmlFor={field.name}>Start Time</FieldLabel>
                                            <Input
                                                id={field.name}
                                                name={field.name}
                                                type="date"
                                                value={field.state.value || ''}
                                                onBlur={field.handleBlur}
                                                onChange={e => field.handleChange(e.target.value)}
                                                aria-invalid={isInvalid}
                                            />
                                            {isInvalid && (
                                                <FieldError errors={field.state.meta.errors} />
                                            )}
                                        </Field>
                                    );
                                }}
                            />

                            <form.Field
                                name="endTime"
                                children={field => {
                                    const isInvalid =
                                        field.state.meta.isTouched && !field.state.meta.isValid;
                                    return (
                                        <Field data-invalid={isInvalid}>
                                            <FieldLabel htmlFor={field.name}>End Time</FieldLabel>
                                            <Input
                                                id={field.name}
                                                name={field.name}
                                                type="date"
                                                value={field.state.value || ''}
                                                onBlur={field.handleBlur}
                                                onChange={e => field.handleChange(e.target.value)}
                                                aria-invalid={isInvalid}
                                            />
                                            {isInvalid && (
                                                <FieldError errors={field.state.meta.errors} />
                                            )}
                                        </Field>
                                    );
                                }}
                            />
                        </FieldGroup>

                        <div className="mt-8 space-y-4">
                            <div>
                                <h3 className="text-sm font-semibold">
                                    Phân công drone & waypoint
                                </h3>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Chọn drone và thiết lập waypoint riêng cho từng drone. Mỗi drone
                                    có thể có nhiều waypoint, được vẽ bằng polygon trên bản đồ.
                                </p>
                            </div>
                            <MissionDroneSelector
                                value={missionDrones}
                                onChange={setMissionDrones}
                                droneOptions={droneOptions}
                                disabledZones={disabledZones}
                            />
                            {loadingDrones && (
                                <p className="text-xs text-muted-foreground">
                                    Đang tải danh sách drone...
                                </p>
                            )}
                            <div className="rounded-lg border p-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <h4 className="text-sm font-semibold">Bản đồ tổng quan</h4>
                                        <p className="text-xs text-muted-foreground">
                                            Hiển thị tất cả waypoint của mọi drone trong mission để dễ quan sát vùng bay tổng thể.
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-3 overflow-hidden rounded border">
                                    <MapboxMap
                                        style={{ height: '70vh', width: '100%' }}
                                        features={hasOverviewPolygons ? overviewFeatureCollection : EMPTY_FEATURE_COLLECTION}
                                        disabledZones={disabledZones}
                                        readOnly
                                        markers={overviewMarkers}
                                    />
                                    {!hasOverviewPolygons && (
                                        <p className="mt-2 text-xs text-muted-foreground">
                                            Chưa có waypoint nào. Vui lòng mở từng drone để vẽ polygon.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </form>
                )}
            </CardContent>
            <CardFooter>
                <Field orientation="horizontal">
                    <Button type="button" variant="outline" onClick={() => form.reset()}>
                        Reset
                    </Button>
                    <Button type="submit" form="mission-form" disabled={loadingData}>
                        {loadingData ? 'Đang tải...' : isEdit ? 'Cập nhật' : 'Tạo mission'}
                    </Button>
                </Field>
            </CardFooter>
        </Card>
    );
}
