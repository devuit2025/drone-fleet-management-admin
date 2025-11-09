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
import { type CreatePilotDto, type UpdatePilotDto, type PilotStatus, PilotClient } from '@/api/models/pilot/pilotClient';
import { PilotMutation } from '@/api/models/pilot/pilotMutation';
import { UserClient, type User } from '@/api/models/user/userClient';

const pilotStatusValues = ['active', 'inactive'] as const;

const pilotSchema = z.object({
    userId: z.number().min(1, 'User is required'),
    name: z.string().min(1, 'Name is required'),
    status: z.enum(pilotStatusValues).optional(),
});

interface PilotFormProps {
    isEdit?: boolean;
}

export default function PilotForm({ isEdit = false }: PilotFormProps) {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingData, setLoadingData] = useState(isEdit);

    useEffect(() => {
        UserClient.getAll()
            .then(res => {
                const usersData = Array.isArray(res) ? res : (res as any)?.data || [];
                setUsers(usersData);
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to load users:', err);
                setLoading(false);
            });
    }, []);

    const form = useForm({
        defaultValues: {
            userId: undefined as number | undefined,
            name: '',
            status: 'active' as PilotStatus | undefined,
        },
        validators: {
            onSubmit: pilotSchema as any,
        },
        onSubmit: async ({ value }) => {
            try {
                if (isEdit && id) {
                    const payload: UpdatePilotDto = {
                        userId: value.userId,
                        name: value.name,
                        status: value.status,
                    };
                    await PilotMutation.update(Number(id), payload);
                    toast.success('Cập nhật pilot thành công!');
                } else {
                    const payload: CreatePilotDto = {
                        userId: value.userId!,
                        name: value.name,
                        status: value.status,
                    };
                    await PilotMutation.create(payload);
                    toast.success('Tạo pilot thành công!');
                }
                navigate('/pilots');
            } catch (err: any) {
                toast.error(err?.response?.data?.message || (isEdit ? 'Cập nhật pilot thất bại' : 'Tạo pilot thất bại'));
                console.error(err);
            }
        },
    });

    // Load pilot data for edit mode
    useEffect(() => {
        if (isEdit && id) {
            setLoadingData(true);
            PilotClient.findOne(Number(id))
                .then(pilot => {
                    form.setFieldValue('userId', pilot.userId);
                    form.setFieldValue('name', pilot.name);
                    form.setFieldValue('status', pilot.status);
                    setLoadingData(false);
                })
                .catch(err => {
                    console.error('Failed to load pilot:', err);
                    toast.error('Không thể tải thông tin pilot');
                    setLoadingData(false);
                    navigate('/pilots');
                });
        }
    }, [isEdit, id, form, navigate]);

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>{isEdit ? 'Chỉnh sửa pilot' : 'Thêm pilot mới'}</CardTitle>
                <CardDescription>
                    {isEdit ? 'Cập nhật thông tin pilot' : 'Nhập thông tin pilot để quản lý'}
                </CardDescription>
            </CardHeader>
            <CardContent>
                {loadingData ? (
                    <div className="text-center py-8 text-muted-foreground">
                        Đang tải dữ liệu...
                    </div>
                ) : (
                    <form
                        id="pilot-form"
                        onSubmit={e => {
                            e.preventDefault();
                            form.handleSubmit();
                        }}
                    >
                        <FieldGroup>
                            <form.Field
                                name="userId"
                                children={field => {
                                    const isInvalid =
                                        field.state.meta.isTouched && !field.state.meta.isValid;
                                    return (
                                        <Field data-invalid={isInvalid}>
                                            <FieldLabel htmlFor={field.name}>User *</FieldLabel>
                                            <Select
                                                value={field.state.value?.toString() || ''}
                                                onValueChange={val =>
                                                    field.handleChange(val ? Number(val) : undefined)
                                                }
                                                disabled={loading}
                                            >
                                                <SelectTrigger className="w-full" id={field.name}>
                                                    <SelectValue placeholder="Chọn user" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {users.map(user => (
                                                        <SelectItem
                                                            key={user.id}
                                                            value={user.id.toString()}
                                                        >
                                                            {user.name} ({user.email})
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FieldDescription>
                                                Chọn user từ danh sách
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
                                            <FieldLabel htmlFor={field.name}>Tên pilot *</FieldLabel>
                                            <Input
                                                id={field.name}
                                                name={field.name}
                                                value={field.state.value}
                                                onBlur={field.handleBlur}
                                                onChange={e => field.handleChange(e.target.value)}
                                                aria-invalid={isInvalid}
                                                placeholder="Nhập tên pilot"
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
                                                value={field.state.value || 'active'}
                                                onValueChange={val =>
                                                    field.handleChange(val as PilotStatus)
                                                }
                                            >
                                                <SelectTrigger className="w-full" id={field.name}>
                                                    <SelectValue placeholder="Chọn trạng thái" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="active">Active</SelectItem>
                                                    <SelectItem value="inactive">Inactive</SelectItem>
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
                    <Button type="submit" form="pilot-form" disabled={loadingData}>
                        {loadingData ? 'Đang tải...' : isEdit ? 'Cập nhật' : 'Tạo pilot'}
                    </Button>
                </Field>
            </CardFooter>
        </Card>
    );
}

