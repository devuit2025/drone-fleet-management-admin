import { useForm } from '@tanstack/react-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { useEffect, useState } from 'react';
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
import {
    type CreateMissionDto,
    type UpdateMissionDto,
    type MissionStatus,
    type MissionWaypointInput,
    MissionClient,
} from '@/api/models/mission/missionClient';
import { MissionMutation } from '@/api/models/mission/missionMutation';
import { PilotClient, type Pilot } from '@/api/models/pilot/pilotClient';
import { Plus, Trash2 } from 'lucide-react';
import { MapboxMap } from '@/components/map/MapboxMap';
import type { FeatureCollection, Polygon } from 'geojson';
import { ringFromFeatureCollection } from '@/lib/geo';

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

type WaypointDraft = {
    seqNumber: string;
    geoPoint: string;
    altitudeM: string;
    speedMps: string;
    action: string;
};

const createEmptyWaypoint = (seqNumber?: number): WaypointDraft => ({
    seqNumber: seqNumber !== undefined ? String(seqNumber) : '',
    geoPoint: '',
    altitudeM: '100',
    speedMps: '10',
    action: 'Survey',
});

export default function MissionForm({ isEdit = false }: MissionFormProps) {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [pilots, setPilots] = useState<Pilot[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingData, setLoadingData] = useState(isEdit);
    const [waypoints, setWaypoints] = useState<WaypointDraft[]>(() =>
        isEdit ? [] : [createEmptyWaypoint(0)],
    );
    const [featureCollection, setFeatureCollection] = useState<FeatureCollection<Polygon>>({
        type: 'FeatureCollection',
        features: [],
    });

    const canEditWaypoints = !isEdit;

    useEffect(() => {
        PilotClient.findAll()
            .then(res => {
                setPilots(res);
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to load pilots:', err);
                setLoading(false);
            });
    }, []);

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
                let preparedWaypoints: MissionWaypointInput[] | undefined;
                // Always prepare waypoints from current state for both create and update
                preparedWaypoints = [];
                for (let index = 0; index < waypoints.length; index++) {
                    const draft = waypoints[index];
                    const hasAnyValue = Object.values(draft).some(v => v.trim() !== '');
                    if (!hasAnyValue) {
                        continue;
                    }
                    const missingField =
                        draft.seqNumber.trim() === '' ||
                        draft.geoPoint.trim() === '' ||
                        draft.altitudeM.trim() === '' ||
                        draft.speedMps.trim() === '' ||
                        draft.action.trim() === '';
                    if (missingField) {
                        toast.error(`Waypoint #${index + 1} chưa đủ thông tin`);
                        return;
                    }

                    const seqNumber = Number(draft.seqNumber);
                    const altitudeM = Number(draft.altitudeM);
                    const speedMps = Number(draft.speedMps);

                    if (
                        Number.isNaN(seqNumber) ||
                        Number.isNaN(altitudeM) ||
                        Number.isNaN(speedMps)
                    ) {
                        toast.error(`Waypoint #${index + 1} chứa giá trị không hợp lệ`);
                        return;
                    }

                    preparedWaypoints.push({
                        seqNumber,
                        geoPoint: draft.geoPoint.trim(),
                        altitudeM,
                        speedMps,
                        action: draft.action.trim(),
                    });
                }

                if (preparedWaypoints.length === 0) {
                    preparedWaypoints = undefined;
                }

                if (isEdit && id) {
                    const payload: UpdateMissionDto = {
                        pilotId: value.pilotId,
                        licenseId: value.licenseId,
                        missionName: value.missionName,
                        status: value.status,
                        startTime: value.startTime || undefined,
                        endTime: value.endTime || undefined,
                        waypoints: preparedWaypoints,
                    };
                    await MissionMutation.update(Number(id), payload);
                    toast.success('Cập nhật mission thành công!');
                } else {
                    const payload: CreateMissionDto = {
                        pilotId: value.pilotId!,
                        licenseId: value.licenseId,
                        missionName: value.missionName,
                        status: value.status,
                        startTime: value.startTime || undefined,
                        endTime: value.endTime || undefined,
                        waypoints: preparedWaypoints,
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

    const formatGeoPointToWkt = (value: unknown): string => {
        if (
            value &&
            typeof value === 'object' &&
            (value as any).type === 'Point' &&
            Array.isArray((value as any).coordinates)
        ) {
            const [lon, lat] = (value as any).coordinates as [number, number];
            return `POINT(${lon} ${lat})`;
        }
        return typeof value === 'string' ? value : '';
    };

    useEffect(() => {
        if (isEdit && id) {
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

                    const missionWaypoints = Array.isArray(mission.waypoints)
                        ? mission.waypoints
                        : [];
                    if (missionWaypoints.length > 0) {
                        setWaypoints(
                            missionWaypoints.map((wp, idx) => ({
                                seqNumber:
                                    wp.seqNumber !== undefined && wp.seqNumber !== null
                                        ? String(wp.seqNumber)
                                        : String(idx),
                                geoPoint: formatGeoPointToWkt(wp.geoPoint),
                                altitudeM:
                                    wp.altitudeM !== undefined && wp.altitudeM !== null
                                        ? String(wp.altitudeM)
                                        : '',
                                speedMps:
                                    wp.speedMps !== undefined && wp.speedMps !== null
                                        ? String(wp.speedMps)
                                        : '',
                                action: wp.action ?? '',
                            })),
                        );

                        const polygonCoordinates: number[][][] = [
                            missionWaypoints.map(wp => {
                                if (
                                    wp.geoPoint &&
                                    typeof wp.geoPoint === 'object' &&
                                    (wp.geoPoint as any).type === 'Point' &&
                                    Array.isArray((wp.geoPoint as any).coordinates)
                                ) {
                                    const [lon, lat] = (wp.geoPoint as any).coordinates as [
                                        number,
                                        number,
                                    ];
                                    return [lon, lat];
                                }

                                const match =
                                    typeof wp.geoPoint === 'string'
                                        ? wp.geoPoint.match(
                                              /POINT\s*\(\s*(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)\s*\)/i,
                                          )
                                        : null;
                                if (match) {
                                    return [Number(match[1]), Number(match[2])];
                                }
                                return [0, 0];
                            }),
                        ];

                        const firstRing = polygonCoordinates[0];
                        if (
                            firstRing.length > 0 &&
                            (firstRing[0][0] !== firstRing[firstRing.length - 1][0] ||
                                firstRing[0][1] !== firstRing[firstRing.length - 1][1])
                        ) {
                            firstRing.push([...firstRing[0]]);
                        }

                        setFeatureCollection({
                            type: 'FeatureCollection',
                            features: [
                                {
                                    type: 'Feature',
                                    geometry: {
                                        type: 'Polygon',
                                        coordinates: polygonCoordinates,
                                    },
                                    properties: {},
                                },
                            ],
                        });
                    } else {
                        setWaypoints([]);
                        setFeatureCollection({ type: 'FeatureCollection', features: [] });
                    }
                    setLoadingData(false);
                })
                .catch(err => {
                    console.error('Failed to load mission:', err);
                    toast.error('Không thể tải thông tin mission');
                    setLoadingData(false);
                    navigate('/missions');
                });
        }
    }, [isEdit, id, form, navigate]);

    const handleAddWaypoint = () => {
        setWaypoints(prev => {
            const lastSeq =
                prev.length > 0 ? Number(prev[prev.length - 1].seqNumber || prev.length - 1) : -1;
            const nextSeq = Number.isFinite(lastSeq) ? lastSeq + 1 : prev.length;
            return [...prev, createEmptyWaypoint(nextSeq)];
        });
    };

    const handleWaypointChange = (index: number, key: keyof WaypointDraft, value: string) => {
        setWaypoints(prev => prev.map((wp, i) => (i === index ? { ...wp, [key]: value } : wp)));
    };

    const handleRemoveWaypoint = (index: number) => {
        setWaypoints(prev => prev.filter((_, i) => i !== index));
    };

    const handleMapFeaturesChange = (fc: FeatureCollection<Polygon>) => {
        if (!fc || !Array.isArray(fc.features) || fc.features.length === 0) {
            setWaypoints([]);
            setFeatureCollection({ type: 'FeatureCollection', features: [] });
            return;
        }
        const first = fc.features[0];
        const coords = first?.geometry?.coordinates?.[0] || [];
        const drafts: WaypointDraft[] = coords.map(([lon, lat], idx) => ({
            seqNumber: String(idx),
            geoPoint: `POINT(${lon} ${lat})`,
            altitudeM: '100',
            speedMps: '10',
            action: 'Survey',
        }));
        setWaypoints(drafts);
        setFeatureCollection(fc);
    };

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
                    <div className="text-center py-8 text-muted-foreground">
                        Đang tải dữ liệu...
                    </div>
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
                                                disabled={loading}
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
                                                Chọn pilot từ danh sách
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
                                                License ID (tùy chọn)
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

                        <div className="mt-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-sm font-semibold">Waypoints (tùy chọn)</h3>
                                    {isEdit && (
                                        <p className="text-xs text-muted-foreground">
                                            Waypoints hiện có được liệt kê bên dưới. Chỉnh sửa hoặc
                                            thêm mới tại trang Waypoint.
                                        </p>
                                    )}
                                </div>
                                {canEditWaypoints && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={handleAddWaypoint}
                                    >
                                        <Plus className="mr-2 h-4 w-4" /> Thêm waypoint
                                    </Button>
                                )}
                            </div>

                            {waypoints.length === 0 && (
                                <p className="text-sm text-muted-foreground">
                                    {canEditWaypoints
                                        ? 'Chưa có waypoint nào, thêm mới nếu cần.'
                                        : 'Mission chưa có waypoint.'}
                                </p>
                            )}

                            <Field>
                                <FieldLabel>Bản đồ nhiệm vụ *</FieldLabel>
                                <div className="space-y-4">
                                    <MapboxMap
                                        style={{ height: '500px', width: '100%' }}
                                        features={featureCollection}
                                        onFeaturesChange={handleMapFeaturesChange}
                                    />
                                    <div className="mt-4">
                                        <div className="text-sm font-semibold mb-2">Toạ độ và thông số waypoint</div>
                                        {(() => {
                                            const ring = ringFromFeatureCollection(featureCollection);
                                            if (!ring || ring.length === 0) {
                                                return (
                                                    <div className="text-xs text-muted-foreground p-3 rounded border bg-muted/30">
                                                        Chưa có polygon. Vẽ polygon trên bản đồ để hiển thị toạ độ.
                                                    </div>
                                                );
                                            }
                                            const gridColsHeader = canEditWaypoints ? 'grid-cols-7' : 'grid-cols-6';
                                            return (
                                                <div className="rounded border bg-muted/30 p-4">
                                                    <div
                                                        className={`grid ${gridColsHeader} gap-2 text-xs font-medium text-muted-foreground mb-2 pb-2 border-b`}
                                                    >
                                                        <div>#</div>
                                                        <div>Longitude</div>
                                                        <div>Latitude</div>
                                                        <div>Altitude (m)</div>
                                                        <div>Speed (m/s)</div>
                                                        <div>Action</div>
                                                        {canEditWaypoints && <div className="text-right pr-1">Xóa</div>}
                                                    </div>
                                                    <div className="max-h-64 overflow-auto">
                                                        {ring.map(([lon, lat], idx) => {
                                                            const wp = waypoints[idx] || createEmptyWaypoint(idx);
                                                            return (
                                                                <div
                                                                    key={idx}
                                                                    className={`grid ${gridColsHeader} gap-2 text-xs py-2 border-b last:border-b-0 items-center`}
                                                                >
                                                                    <div className="font-medium">{idx}</div>
                                                                    <div className="font-mono">{Number(lon).toFixed(6)}</div>
                                                                    <div className="font-mono">{Number(lat).toFixed(6)}</div>
                                                                    <Input
                                                                        type="number"
                                                                        value={wp.altitudeM}
                                                                        onChange={e => handleWaypointChange(idx, 'altitudeM', e.target.value)}
                                                                        placeholder="100"
                                                                        className="h-7 text-xs"
                                                                    />
                                                                    <Input
                                                                        type="number"
                                                                        value={wp.speedMps}
                                                                        onChange={e => handleWaypointChange(idx, 'speedMps', e.target.value)}
                                                                        placeholder="10"
                                                                        className="h-7 text-xs"
                                                                    />
                                                                    <Input
                                                                        value={wp.action}
                                                                        onChange={e => handleWaypointChange(idx, 'action', e.target.value)}
                                                                        placeholder="Survey"
                                                                        className="h-7 text-xs"
                                                                    />
                                                                    {canEditWaypoints && (
                                                                        <Button
                                                                            type="button"
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            className="h-7 w-7 text-destructive"
                                                                            onClick={() => handleRemoveWaypoint(idx)}
                                                                            aria-label={`Xóa waypoint ${idx}`}
                                                                        >
                                                                            <Trash2 className="h-3.5 w-3.5" />
                                                                        </Button>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            );
                                        })()}
                                    </div>
                                </div>
                                <FieldDescription>Vẽ polygon trên bản đồ để định nghĩa vùng nhiệm vụ</FieldDescription>
                            </Field>
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
