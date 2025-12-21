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
    type CreateDroneSensorDto,
    type UpdateDroneSensorDto,
    type SensorStatus,
    DroneSensorClient,
    type DroneSensor,
} from '@/api/models/drone-sensor/droneSensorClient';
import { DroneSensorMutation } from '@/api/models/drone-sensor/droneSensorMutation';
import { DroneClient, type Drone } from '@/api/models/drone/droneClient';

const sensorStatusValues = ['active', 'inactive', 'faulty'] as const;

const droneSensorSchema = z.object({
    droneId: z.number().min(1, 'Drone is required'),
    type: z.string().min(1, 'Sensor type is required'),
    model: z.string().optional(),
    resolution: z.string().optional(),
    fieldOfView: z.number().optional(),
    status: z.enum(sensorStatusValues).optional(),
});

interface DroneSensorFormProps {
    isEdit?: boolean;
}

export default function DroneSensorForm({ isEdit = false }: DroneSensorFormProps) {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [drones, setDrones] = useState<Drone[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingData, setLoadingData] = useState(isEdit);

    useEffect(() => {
        DroneClient.findAll()
            .then(res => {
                setDrones(res);
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to load drones:', err);
                setLoading(false);
            });
    }, []);

    const form = useForm({
        defaultValues: {
            droneId: undefined as number | undefined,
            type: '',
            model: '',
            resolution: '',
            fieldOfView: undefined as number | undefined,
            status: 'active' as SensorStatus | undefined,
        },
        validators: {
            onSubmit: droneSensorSchema as any,
        },
        onSubmit: async ({ value }) => {
            try {
                if (isEdit && id) {
                    const payload: UpdateDroneSensorDto = {
                        droneId: value.droneId,
                        type: value.type,
                        model: value.model || undefined,
                        resolution: value.resolution || undefined,
                        fieldOfView: value.fieldOfView,
                        status: value.status,
                    };
                    await DroneSensorMutation.update(Number(id), payload);
                    toast.success('Cập nhật drone sensor thành công!');
                } else {
                    const payload: CreateDroneSensorDto = {
                        droneId: value.droneId!,
                        type: value.type,
                        model: value.model || undefined,
                        resolution: value.resolution || undefined,
                        fieldOfView: value.fieldOfView,
                        status: value.status,
                    };
                    await DroneSensorMutation.create(payload);
                    toast.success('Tạo drone sensor thành công!');
                }
                navigate('/drone-sensors');
            } catch (err: any) {
                toast.error(
                    err?.response?.data?.message ||
                        (isEdit ? 'Cập nhật drone sensor thất bại' : 'Tạo drone sensor thất bại'),
                );
                console.error(err);
            }
        },
    });

    // Load drone sensor data for edit mode
    useEffect(() => {
        if (isEdit && id) {
            setLoadingData(true);
            DroneSensorClient.findOne(Number(id))
                .then(sensor => {
                    form.setFieldValue('droneId', sensor.droneId);
                    form.setFieldValue('type', sensor.type);
                    form.setFieldValue('model', sensor.model || '');
                    form.setFieldValue('resolution', sensor.resolution || '');
                    form.setFieldValue('fieldOfView', sensor.fieldOfView || undefined);
                    form.setFieldValue('status', sensor.status);
                    setLoadingData(false);
                })
                .catch(err => {
                    console.error('Failed to load drone sensor:', err);
                    toast.error('Không thể tải thông tin drone sensor');
                    setLoadingData(false);
                    navigate('/drone-sensors');
                });
        }
    }, [isEdit, id, form, navigate]);

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>{isEdit ? 'Chỉnh sửa drone sensor' : 'Thêm drone sensor mới'}</CardTitle>
                <CardDescription>
                    {isEdit
                        ? 'Cập nhật thông tin drone sensor'
                        : 'Nhập thông tin drone sensor để quản lý'}
                </CardDescription>
            </CardHeader>
            <CardContent>
                {loadingData ? (
                    <div className="text-center py-8 text-muted-foreground">
                        Đang tải dữ liệu...
                    </div>
                ) : (
                    <form
                        id="drone-sensor-form"
                        onSubmit={e => {
                            e.preventDefault();
                            form.handleSubmit();
                        }}
                    >
                        <FieldGroup>
                            <form.Field
                                name="droneId"
                                children={field => {
                                    const isInvalid =
                                        field.state.meta.isTouched && !field.state.meta.isValid;
                                    return (
                                        <Field data-invalid={isInvalid}>
                                            <FieldLabel htmlFor={field.name}>Drone *</FieldLabel>
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
                                                    <SelectValue placeholder="Chọn drone" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {drones.map(drone => (
                                                        <SelectItem
                                                            key={drone.id}
                                                            value={drone.id.toString()}
                                                        >
                                                            {drone.name} ({drone.serialNumber})
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FieldDescription>
                                                Chọn drone từ danh sách
                                            </FieldDescription>
                                            {isInvalid && (
                                                <FieldError errors={field.state.meta.errors} />
                                            )}
                                        </Field>
                                    );
                                }}
                            />

                            <form.Field
                                name="type"
                                children={field => {
                                    const isInvalid =
                                        field.state.meta.isTouched && !field.state.meta.isValid;
                                    return (
                                        <Field data-invalid={isInvalid}>
                                            <FieldLabel htmlFor={field.name}>
                                                Sensor Type *
                                            </FieldLabel>
                                            <Input
                                                id={field.name}
                                                name={field.name}
                                                value={field.state.value}
                                                onBlur={field.handleBlur}
                                                onChange={e => field.handleChange(e.target.value)}
                                                aria-invalid={isInvalid}
                                                placeholder="Nhập loại sensor (ví dụ: camera, GPS, IMU)"
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
                                name="model"
                                children={field => {
                                    const isInvalid =
                                        field.state.meta.isTouched && !field.state.meta.isValid;
                                    return (
                                        <Field data-invalid={isInvalid}>
                                            <FieldLabel htmlFor={field.name}>Model</FieldLabel>
                                            <Input
                                                id={field.name}
                                                name={field.name}
                                                value={field.state.value}
                                                onBlur={field.handleBlur}
                                                onChange={e => field.handleChange(e.target.value)}
                                                aria-invalid={isInvalid}
                                                placeholder="Nhập model sensor"
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
                                name="resolution"
                                children={field => {
                                    const isInvalid =
                                        field.state.meta.isTouched && !field.state.meta.isValid;
                                    return (
                                        <Field data-invalid={isInvalid}>
                                            <FieldLabel htmlFor={field.name}>Resolution</FieldLabel>
                                            <Input
                                                id={field.name}
                                                name={field.name}
                                                value={field.state.value}
                                                onBlur={field.handleBlur}
                                                onChange={e => field.handleChange(e.target.value)}
                                                aria-invalid={isInvalid}
                                                placeholder="Nhập resolution (ví dụ: 3840x2160)"
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
                                name="fieldOfView"
                                children={field => {
                                    const isInvalid =
                                        field.state.meta.isTouched && !field.state.meta.isValid;
                                    return (
                                        <Field data-invalid={isInvalid}>
                                            <FieldLabel htmlFor={field.name}>
                                                Field of View (°)
                                            </FieldLabel>
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
                                                placeholder="Nhập field of view"
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
                                                value={field.state.value || 'active'}
                                                onValueChange={val =>
                                                    field.handleChange(val as SensorStatus)
                                                }
                                            >
                                                <SelectTrigger className="w-full" id={field.name}>
                                                    <SelectValue placeholder="Chọn trạng thái" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="active">Active</SelectItem>
                                                    <SelectItem value="inactive">
                                                        Inactive
                                                    </SelectItem>
                                                    <SelectItem value="faulty">Faulty</SelectItem>
                                                </SelectContent>
                                            </Select>
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
                    <Button type="submit" form="drone-sensor-form" disabled={loadingData}>
                        {loadingData ? 'Đang tải...' : isEdit ? 'Cập nhật' : 'Tạo sensor'}
                    </Button>
                </Field>
            </CardFooter>
        </Card>
    );
}
