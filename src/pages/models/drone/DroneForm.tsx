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
import { type CreateDroneDto, type UpdateDroneDto, type DroneStatus, DroneClient } from '@/api/models/drone/droneClient';
import { droneMutation } from '@/api/models/drone/droneMutation';
import { DroneModelClient, type DroneModel } from '@/api/models/drone-model/droneModelClient';

const droneStatusValues = [
    'available',
    'in_mission',
    'flying',
    'hovering',
    'landing',
    'maintenance',
    'decommissioned',
] as const;

const droneSchema = z.object({
    modelId: z.number().min(1, 'Model is required'),
    serialNumber: z.string().min(1, 'Serial number is required'),
    name: z.string().min(1, 'Name is required'),
    status: z.enum(droneStatusValues).optional(),
    firmwareVersion: z.string().optional(),
    batteryHealth: z.number().min(0).max(100).optional(),
    totalFlightHours: z.number().min(0).optional(),
    lastMaintenance: z.string().optional(),
});

interface DroneFormProps {
    isEdit?: boolean;
}

export default function DroneForm({ isEdit = false }: DroneFormProps) {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [droneModels, setDroneModels] = useState<DroneModel[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingData, setLoadingData] = useState(isEdit);

    useEffect(() => {
        DroneModelClient.findAll()
            .then(models => {
                setDroneModels(models);
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to load drone models:', err);
                setLoading(false);
            });
    }, []);


    const form = useForm({
        defaultValues: {
            modelId: undefined as number | undefined,
            serialNumber: '',
    name: '',
            status: 'available' as DroneStatus | undefined,
            firmwareVersion: '',
            batteryHealth: undefined as number | undefined,
            totalFlightHours: 0,
            lastMaintenance: '',
        },
        validators: {
            onSubmit: droneSchema as any,
        },
        onSubmit: async ({ value }) => {
            try {
                if (isEdit && id) {
                    const payload: UpdateDroneDto = {
                        modelId: value.modelId,
                        serialNumber: value.serialNumber,
                        name: value.name,
                        status: value.status,
                        firmwareVersion: value.firmwareVersion || undefined,
                        batteryHealth: value.batteryHealth,
                        totalFlightHours: value.totalFlightHours,
                        lastMaintenance: value.lastMaintenance || undefined,
                    };
                    await droneMutation.update(Number(id), payload);
                    toast.success('Cập nhật drone thành công!');
                } else {
                    const payload: CreateDroneDto = {
                        modelId: value.modelId!,
                        serialNumber: value.serialNumber,
                        name: value.name,
                        status: value.status,
                        firmwareVersion: value.firmwareVersion || undefined,
                        batteryHealth: value.batteryHealth,
                        totalFlightHours: value.totalFlightHours,
                        lastMaintenance: value.lastMaintenance || undefined,
                    };
                    await droneMutation.create(payload);
                    toast.success('Tạo drone thành công!');
                }
                navigate('/drones');
            } catch (err: any) {
                toast.error(err?.response?.data?.message || (isEdit ? 'Cập nhật drone thất bại' : 'Tạo drone thất bại'));
                console.error(err);
            }
        },
    });

    // Load drone data for edit mode
    useEffect(() => {
        if (isEdit && id) {
            setLoadingData(true);
            DroneClient.findOne(Number(id))
                .then(drone => {
                    form.setFieldValue('modelId', drone.modelId);
                    form.setFieldValue('serialNumber', drone.serialNumber);
                    form.setFieldValue('name', drone.name);
                    form.setFieldValue('status', drone.status);
                    form.setFieldValue('firmwareVersion', drone.firmwareVersion || '');
                    form.setFieldValue('batteryHealth', drone.batteryHealth || undefined);
                    form.setFieldValue('totalFlightHours', drone.totalFlightHours);
                    form.setFieldValue('lastMaintenance', drone.lastMaintenance ? drone.lastMaintenance.split('T')[0] : '');
                    setLoadingData(false);
                })
                .catch(err => {
                    console.error('Failed to load drone:', err);
                    toast.error('Không thể tải thông tin drone');
                    setLoadingData(false);
                    navigate('/drones');
                });
        }
    }, [isEdit, id, form, navigate]);

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>{isEdit ? 'Chỉnh sửa drone' : 'Thêm drone mới'}</CardTitle>
                <CardDescription>
                    {isEdit ? 'Cập nhật thông tin drone' : 'Nhập thông tin drone để quản lý'}
                </CardDescription>
            </CardHeader>
            <CardContent>
                {loadingData ? (
                    <div className="text-center py-8 text-muted-foreground">
                        Đang tải dữ liệu...
                    </div>
                ) : (
                    <form
                        id="drone-form"
                        onSubmit={e => {
                            e.preventDefault();
                            form.handleSubmit();
                        }}
                    >
                        <FieldGroup>
                        <form.Field
                            name="modelId"
                            children={field => {
                                const isInvalid =
                                    field.state.meta.isTouched && !field.state.meta.isValid;
                                return (
                                    <Field data-invalid={isInvalid}>
                                        <FieldLabel htmlFor={field.name}>Model *</FieldLabel>
                                        <Select
                                            value={field.state.value?.toString() || ''}
                                            onValueChange={val =>
                                                field.handleChange(val ? Number(val) : undefined)
                                            }
                                            disabled={loading}
                                        >
                                            <SelectTrigger className="w-full" id={field.name}>
                                                <SelectValue placeholder="Chọn model" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {droneModels.map(model => (
                                                    <SelectItem
                                                        key={model.id}
                                                        value={model.id.toString()}
                                                    >
                                                        {model.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FieldDescription>
                                            Chọn model drone từ danh sách
                                        </FieldDescription>
                                        {isInvalid && (
                                            <FieldError errors={field.state.meta.errors} />
                                        )}
                                    </Field>
                                );
                            }}
                        />

                        <form.Field
                            name="serialNumber"
                            children={field => {
                                const isInvalid =
                                    field.state.meta.isTouched && !field.state.meta.isValid;
                                return (
                                    <Field data-invalid={isInvalid}>
                                        <FieldLabel htmlFor={field.name}>
                                            Serial Number *
                                        </FieldLabel>
                                        <Input
                                            id={field.name}
                                            name={field.name}
                                            value={field.state.value}
                                            onBlur={field.handleBlur}
                                            onChange={e => field.handleChange(e.target.value)}
                                            aria-invalid={isInvalid}
                                            placeholder="Nhập serial number"
                                            autoComplete="off"
                                        />
                                        <FieldDescription>
                                            Serial number duy nhất của drone
                                        </FieldDescription>
                                        {isInvalid && (
                                            <FieldError errors={field.state.meta.errors} />
                                        )}
                                    </Field>
                                );
                            }}
                        />

                        <form.Field
                            name="name"
                            children={field => {
                                const isInvalid =
                                    field.state.meta.isTouched && !field.state.meta.isValid;
                                return (
                                    <Field data-invalid={isInvalid}>
                                        <FieldLabel htmlFor={field.name}>Tên drone *</FieldLabel>
                                        <Input
                                            id={field.name}
                                            name={field.name}
                                            value={field.state.value}
                                            onBlur={field.handleBlur}
                                            onChange={e => field.handleChange(e.target.value)}
                                            aria-invalid={isInvalid}
                                            placeholder="Nhập tên drone"
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
                                        <FieldLabel htmlFor={field.name}>Trạng thái</FieldLabel>
                                        <Select
                                            value={field.state.value || 'available'}
                                            onValueChange={val =>
                                                field.handleChange(val as DroneStatus)
                                            }
                                        >
                                            <SelectTrigger className="w-full" id={field.name}>
                                                <SelectValue placeholder="Chọn trạng thái" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="available">Available</SelectItem>
                                                <SelectItem value="in_mission">In Mission</SelectItem>
                                                <SelectItem value="flying">Flying</SelectItem>
                                                <SelectItem value="hovering">Hovering</SelectItem>
                                                <SelectItem value="landing">Landing</SelectItem>
                                                <SelectItem value="maintenance">Maintenance</SelectItem>
                                                <SelectItem value="decommissioned">
                                                    Decommissioned
                                                </SelectItem>
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
                            name="firmwareVersion"
                            children={field => {
                                return (
                                    <Field>
                                        <FieldLabel htmlFor={field.name}>
                                            Firmware Version
                                        </FieldLabel>
                                        <Input
                                            id={field.name}
                                            name={field.name}
                                            value={field.state.value || ''}
                                            onBlur={field.handleBlur}
                                            onChange={e => field.handleChange(e.target.value)}
                                            placeholder="Nhập phiên bản firmware"
                                            autoComplete="off"
                                        />
                                    </Field>
                                );
                            }}
                        />

                        <form.Field
                            name="batteryHealth"
                            children={field => {
                                const isInvalid =
                                    field.state.meta.isTouched && !field.state.meta.isValid;
                                return (
                                    <Field data-invalid={isInvalid}>
                                        <FieldLabel htmlFor={field.name}>
                                            Battery Health (%)
                                        </FieldLabel>
                                        <Input
                                            id={field.name}
                                            name={field.name}
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={field.state.value}
                                            onBlur={field.handleBlur}
                                            onChange={e =>
                                                field.handleChange(
                                                    e.target.value ? Number(e.target.value) : undefined,
                                                )
                                            }
                                            aria-invalid={isInvalid}
                                            placeholder="0-100"
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
                            name="totalFlightHours"
                            children={field => {
                                const isInvalid =
                                    field.state.meta.isTouched && !field.state.meta.isValid;
                                return (
                                    <Field data-invalid={isInvalid}>
                                        <FieldLabel htmlFor={field.name}>
                                            Total Flight Hours
                                        </FieldLabel>
                                        <Input
                                            id={field.name}
                                            name={field.name}
                                            type="number"
                                            min="0"
                                            value={field.state.value?.toString() || '0'}
                                            onBlur={field.handleBlur}
                                            onChange={e =>
                                                field.handleChange(
                                                    e.target.value ? Number(e.target.value) : 0,
                                                )
                                            }
                                            aria-invalid={isInvalid}
                                            placeholder="0"
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
                            name="lastMaintenance"
                            children={field => {
                                return (
                                    <Field>
                                        <FieldLabel htmlFor={field.name}>
                                            Last Maintenance Date
                                        </FieldLabel>
                                        <Input
                                            id={field.name}
                                            name={field.name}
                                            type="date"
                                            value={field.state.value || ''}
                                            onBlur={field.handleBlur}
                                            onChange={e => field.handleChange(e.target.value)}
                                            placeholder="Chọn ngày"
                                            autoComplete="off"
                                        />
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
                    <Button type="submit" form="drone-form" disabled={loadingData}>
                        {loadingData ? 'Đang tải...' : isEdit ? 'Cập nhật' : 'Tạo drone'}
                    </Button>
                </Field>
            </CardFooter>
        </Card>
    );
}
