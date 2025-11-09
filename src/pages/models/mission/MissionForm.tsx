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
import { type CreateMissionDto, type UpdateMissionDto, type MissionStatus, MissionClient } from '@/api/models/mission/missionClient';
import { MissionMutation } from '@/api/models/mission/missionMutation';
import { PilotClient, type Pilot } from '@/api/models/pilot/pilotClient';

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

export default function MissionForm({ isEdit = false }: MissionFormProps) {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [pilots, setPilots] = useState<Pilot[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingData, setLoadingData] = useState(isEdit);

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
                if (isEdit && id) {
                    const payload: UpdateMissionDto = {
                        pilotId: value.pilotId,
                        licenseId: value.licenseId,
                        missionName: value.missionName,
                        status: value.status,
                        startTime: value.startTime || undefined,
                        endTime: value.endTime || undefined,
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
                    };
                    await MissionMutation.create(payload);
                    toast.success('Tạo mission thành công!');
                }
                navigate('/missions');
            } catch (err: any) {
                toast.error(err?.response?.data?.message || (isEdit ? 'Cập nhật mission thất bại' : 'Tạo mission thất bại'));
                console.error(err);
            }
        },
    });

    // Load mission data for edit mode
    useEffect(() => {
        if (isEdit && id) {
            setLoadingData(true);
            MissionClient.findOne(Number(id))
                .then(mission => {
                    form.setFieldValue('pilotId', mission.pilotId);
                    form.setFieldValue('licenseId', mission.licenseId || undefined);
                    form.setFieldValue('missionName', mission.missionName);
                    form.setFieldValue('status', mission.status);
                    form.setFieldValue('startTime', mission.startTime ? mission.startTime.split('T')[0] : '');
                    form.setFieldValue('endTime', mission.endTime ? mission.endTime.split('T')[0] : '');
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
                                                    field.handleChange(val ? Number(val) : undefined)
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
                                                onChange={e => field.handleChange(e.target.value ? Number(e.target.value) : undefined)}
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
                                            <FieldLabel htmlFor={field.name}>Mission Name *</FieldLabel>
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
                                                    <SelectItem value="in_progress">In Progress</SelectItem>
                                                    <SelectItem value="completed">Completed</SelectItem>
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

