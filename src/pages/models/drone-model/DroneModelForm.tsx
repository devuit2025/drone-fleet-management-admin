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
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    type CreateDroneModelDto,
    type UpdateDroneModelDto,
    DroneModelClient,
} from '@/api/models/drone-model/droneModelClient';
import { DroneModelMutation } from '@/api/models/drone-model/droneModelMutation';
import { DroneBrandClient, type DroneBrand } from '@/api/models/drone-brand/droneBrandClient';
import {
    DroneCategoryClient,
    type DroneCategory,
} from '@/api/models/drone-category/droneCategoryClient';

const droneModelSchema = z.object({
    brandId: z.number().min(1, 'Brand is required'),
    categoryId: z.number().min(1, 'Category is required'),
    name: z.string().min(1, 'Model name is required'),
    maxSpeed: z.number().optional(),
    maxAltitude: z.number().optional(),
    maxFlightTime: z.number().optional(),
    maxPayload: z.number().optional(),
    batteryCapacity: z.number().optional(),
    dimensions: z
        .object({
            length: z.number().optional(),
            width: z.number().optional(),
            height: z.number().optional(),
            weight: z.number().optional(),
        })
        .optional(),
});

interface DroneModelFormProps {
    isEdit?: boolean;
}

export default function DroneModelForm({ isEdit = false }: DroneModelFormProps) {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [brands, setBrands] = useState<DroneBrand[]>([]);
    const [categories, setCategories] = useState<DroneCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingData, setLoadingData] = useState(isEdit);

    useEffect(() => {
        Promise.all([DroneBrandClient.findAll(), DroneCategoryClient.findAll()])
            .then(([brandsRes, categoriesRes]) => {
                setBrands(brandsRes);
                setCategories(categoriesRes);
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to load data:', err);
                setLoading(false);
            });
    }, []);

    const form = useForm({
        defaultValues: {
            brandId: undefined as number | undefined,
            categoryId: undefined as number | undefined,
            name: '',
            maxSpeed: undefined as number | undefined,
            maxAltitude: undefined as number | undefined,
            maxFlightTime: undefined as number | undefined,
            maxPayload: undefined as number | undefined,
            batteryCapacity: undefined as number | undefined,
            dimensions: {
                length: undefined as number | undefined,
                width: undefined as number | undefined,
                height: undefined as number | undefined,
                weight: undefined as number | undefined,
            },
        },
        validators: {
            onSubmit: droneModelSchema as any,
        },
        onSubmit: async ({ value }) => {
            try {
                if (isEdit && id) {
                    const payload: UpdateDroneModelDto = {
                        brandId: value.brandId,
                        categoryId: value.categoryId,
                        name: value.name,
                        maxSpeed: value.maxSpeed,
                        maxAltitude: value.maxAltitude,
                        maxFlightTime: value.maxFlightTime,
                        maxPayload: value.maxPayload,
                        batteryCapacity: value.batteryCapacity,
                        dimensions: value.dimensions,
                    };
                    await DroneModelMutation.update(Number(id), payload);
                    toast.success('Cập nhật drone model thành công!');
                } else {
                    const payload: CreateDroneModelDto = {
                        brandId: value.brandId!,
                        categoryId: value.categoryId!,
                        name: value.name,
                        maxSpeed: value.maxSpeed,
                        maxAltitude: value.maxAltitude,
                        maxFlightTime: value.maxFlightTime,
                        maxPayload: value.maxPayload,
                        batteryCapacity: value.batteryCapacity,
                        dimensions: value.dimensions,
                    };
                    await DroneModelMutation.create(payload);
                    toast.success('Tạo drone model thành công!');
                }
                navigate('/drone-models');
            } catch (err: any) {
                toast.error(
                    err?.response?.data?.message ||
                        (isEdit ? 'Cập nhật drone model thất bại' : 'Tạo drone model thất bại'),
                );
                console.error(err);
            }
        },
    });

    // Load drone model data for edit mode
    useEffect(() => {
        if (isEdit && id) {
            setLoadingData(true);
            DroneModelClient.findOne(Number(id))
                .then(model => {
                    form.setFieldValue('brandId', model.brandId);
                    form.setFieldValue('categoryId', model.categoryId);
                    form.setFieldValue('name', model.name);
                    form.setFieldValue('maxSpeed', model.maxSpeed || undefined);
                    form.setFieldValue('maxAltitude', model.maxAltitude || undefined);
                    form.setFieldValue('maxFlightTime', model.maxFlightTime || undefined);
                    form.setFieldValue('maxPayload', model.maxPayload || undefined);
                    form.setFieldValue('batteryCapacity', model.batteryCapacity || undefined);
                    const modelDims = model.dimensions || {};
                    form.setFieldValue('dimensions', {
                        length: modelDims.length ?? undefined,
                        width: modelDims.width ?? undefined,
                        height: modelDims.height ?? undefined,
                        weight: modelDims.weight ?? undefined,
                    });
                    setLoadingData(false);
                })
                .catch(err => {
                    console.error('Failed to load drone model:', err);
                    toast.error('Không thể tải thông tin drone model');
                    setLoadingData(false);
                    navigate('/drone-models');
                });
        }
    }, [isEdit, id, form, navigate]);

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>{isEdit ? 'Chỉnh sửa drone model' : 'Thêm drone model mới'}</CardTitle>
                <CardDescription>
                    {isEdit
                        ? 'Cập nhật thông tin drone model'
                        : 'Nhập thông tin drone model để quản lý'}
                </CardDescription>
            </CardHeader>
            <CardContent>
                {loadingData ? (
                    <div className="text-center py-8 text-muted-foreground">
                        Đang tải dữ liệu...
                    </div>
                ) : (
                    <form
                        id="drone-model-form"
                        onSubmit={e => {
                            e.preventDefault();
                            form.handleSubmit();
                        }}
                    >
                        <FieldGroup>
                            <form.Field
                                name="brandId"
                                children={field => {
                                    const isInvalid =
                                        field.state.meta.isTouched && !field.state.meta.isValid;
                                    return (
                                        <Field data-invalid={isInvalid}>
                                            <FieldLabel htmlFor={field.name}>Brand *</FieldLabel>
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
                                                    <SelectValue placeholder="Chọn brand" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {brands.map(brand => (
                                                        <SelectItem
                                                            key={brand.id}
                                                            value={brand.id.toString()}
                                                        >
                                                            {brand.name}
                                                        </SelectItem>
                                                    ))}
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
                                name="categoryId"
                                children={field => {
                                    const isInvalid =
                                        field.state.meta.isTouched && !field.state.meta.isValid;
                                    return (
                                        <Field data-invalid={isInvalid}>
                                            <FieldLabel htmlFor={field.name}>Category *</FieldLabel>
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
                                                    <SelectValue placeholder="Chọn category" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {categories.map(category => (
                                                        <SelectItem
                                                            key={category.id}
                                                            value={category.id.toString()}
                                                        >
                                                            {category.name}
                                                        </SelectItem>
                                                    ))}
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
                                name="name"
                                children={field => {
                                    const isInvalid =
                                        field.state.meta.isTouched && !field.state.meta.isValid;
                                    return (
                                        <Field data-invalid={isInvalid}>
                                            <FieldLabel htmlFor={field.name}>
                                                Model Name *
                                            </FieldLabel>
                                            <Input
                                                id={field.name}
                                                name={field.name}
                                                value={field.state.value}
                                                onBlur={field.handleBlur}
                                                onChange={e => field.handleChange(e.target.value)}
                                                aria-invalid={isInvalid}
                                                placeholder="Nhập tên model"
                                                autoComplete="off"
                                            />
                                            {isInvalid && (
                                                <FieldError errors={field.state.meta.errors} />
                                            )}
                                        </Field>
                                    );
                                }}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <form.Field
                                    name="maxSpeed"
                                    children={field => {
                                        const isInvalid =
                                            field.state.meta.isTouched && !field.state.meta.isValid;
                                        return (
                                            <Field data-invalid={isInvalid}>
                                                <FieldLabel htmlFor={field.name}>
                                                    Max Speed (km/h)
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
                                                    placeholder="Nhập max speed"
                                                />
                                                {isInvalid && (
                                                    <FieldError errors={field.state.meta.errors} />
                                                )}
                                            </Field>
                                        );
                                    }}
                                />

                                <form.Field
                                    name="maxAltitude"
                                    children={field => {
                                        const isInvalid =
                                            field.state.meta.isTouched && !field.state.meta.isValid;
                                        return (
                                            <Field data-invalid={isInvalid}>
                                                <FieldLabel htmlFor={field.name}>
                                                    Max Altitude (m)
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
                                                    placeholder="Nhập max altitude"
                                                />
                                                {isInvalid && (
                                                    <FieldError errors={field.state.meta.errors} />
                                                )}
                                            </Field>
                                        );
                                    }}
                                />

                                <form.Field
                                    name="maxFlightTime"
                                    children={field => {
                                        const isInvalid =
                                            field.state.meta.isTouched && !field.state.meta.isValid;
                                        return (
                                            <Field data-invalid={isInvalid}>
                                                <FieldLabel htmlFor={field.name}>
                                                    Max Flight Time (min)
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
                                                    placeholder="Nhập max flight time"
                                                />
                                                {isInvalid && (
                                                    <FieldError errors={field.state.meta.errors} />
                                                )}
                                            </Field>
                                        );
                                    }}
                                />

                                <form.Field
                                    name="maxPayload"
                                    children={field => {
                                        const isInvalid =
                                            field.state.meta.isTouched && !field.state.meta.isValid;
                                        return (
                                            <Field data-invalid={isInvalid}>
                                                <FieldLabel htmlFor={field.name}>
                                                    Max Payload (g)
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
                                                    placeholder="Nhập max payload"
                                                />
                                                {isInvalid && (
                                                    <FieldError errors={field.state.meta.errors} />
                                                )}
                                            </Field>
                                        );
                                    }}
                                />

                                <form.Field
                                    name="batteryCapacity"
                                    children={field => {
                                        const isInvalid =
                                            field.state.meta.isTouched && !field.state.meta.isValid;
                                        return (
                                            <Field data-invalid={isInvalid}>
                                                <FieldLabel htmlFor={field.name}>
                                                    Battery Capacity (mAh)
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
                                                    placeholder="Nhập battery capacity"
                                                />
                                                {isInvalid && (
                                                    <FieldError errors={field.state.meta.errors} />
                                                )}
                                            </Field>
                                        );
                                    }}
                                />
                            </div>

                            <form.Field
                                name="dimensions"
                                children={field => {
                                    const dims = field.state.value || {
                                        length: undefined,
                                        width: undefined,
                                        height: undefined,
                                        weight: undefined,
                                    };
                                    return (
                                        <div className="space-y-2">
                                            <FieldLabel>Dimensions (tùy chọn)</FieldLabel>
                                            <div className="grid grid-cols-2 gap-4">
                                                <Field>
                                                    <FieldLabel htmlFor="dim-length">
                                                        Length (cm)
                                                    </FieldLabel>
                                                    <Input
                                                        id="dim-length"
                                                        type="number"
                                                        value={dims.length || ''}
                                                        onChange={e => {
                                                            field.handleChange({
                                                                length: e.target.value
                                                                    ? Number(e.target.value)
                                                                    : undefined,
                                                                width: dims.width,
                                                                height: dims.height,
                                                                weight: dims.weight,
                                                            });
                                                        }}
                                                        placeholder="Nhập length"
                                                    />
                                                </Field>

                                                <Field>
                                                    <FieldLabel htmlFor="dim-width">
                                                        Width (cm)
                                                    </FieldLabel>
                                                    <Input
                                                        id="dim-width"
                                                        type="number"
                                                        value={dims.width || ''}
                                                        onChange={e => {
                                                            field.handleChange({
                                                                length: dims.length,
                                                                width: e.target.value
                                                                    ? Number(e.target.value)
                                                                    : undefined,
                                                                height: dims.height,
                                                                weight: dims.weight,
                                                            });
                                                        }}
                                                        placeholder="Nhập width"
                                                    />
                                                </Field>

                                                <Field>
                                                    <FieldLabel htmlFor="dim-height">
                                                        Height (cm)
                                                    </FieldLabel>
                                                    <Input
                                                        id="dim-height"
                                                        type="number"
                                                        value={dims.height || ''}
                                                        onChange={e => {
                                                            field.handleChange({
                                                                length: dims.length,
                                                                width: dims.width,
                                                                height: e.target.value
                                                                    ? Number(e.target.value)
                                                                    : undefined,
                                                                weight: dims.weight,
                                                            });
                                                        }}
                                                        placeholder="Nhập height"
                                                    />
                                                </Field>

                                                <Field>
                                                    <FieldLabel htmlFor="dim-weight">
                                                        Weight (g)
                                                    </FieldLabel>
                                                    <Input
                                                        id="dim-weight"
                                                        type="number"
                                                        value={dims.weight || ''}
                                                        onChange={e => {
                                                            field.handleChange({
                                                                length: dims.length,
                                                                width: dims.width,
                                                                height: dims.height,
                                                                weight: e.target.value
                                                                    ? Number(e.target.value)
                                                                    : undefined,
                                                            });
                                                        }}
                                                        placeholder="Nhập weight"
                                                    />
                                                </Field>
                                            </div>
                                        </div>
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
                    <Button type="submit" form="drone-model-form" disabled={loadingData}>
                        {loadingData ? 'Đang tải...' : isEdit ? 'Cập nhật' : 'Tạo model'}
                    </Button>
                </Field>
            </CardFooter>
        </Card>
    );
}
