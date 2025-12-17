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
import { type CreateLicenseDto, type UpdateLicenseDto, type LicenseType, type QualificationLevel, LicenseClient } from '@/api/models/license/licenseClient';
import { LicenseMutation } from '@/api/models/license/licenseMutation';
import { PilotClient, type Pilot } from '@/api/models/pilot/pilotClient';

const licenseTypeValues = ['commercial', 'recreational'] as const;
const qualificationLevelValues = ['basic', 'advanced', 'expert'] as const;

const licenseSchema = z.object({
    pilotId: z.number().min(1, 'Pilot is required'),
    licenseNumber: z.string().min(1, 'License number is required'),
    licenseType: z.enum(licenseTypeValues),
    qualificationLevel: z.enum(qualificationLevelValues),
    issuingAuthority: z.string().min(1, 'Issuing authority is required'),
    issuedDate: z.string().min(1, 'Issued date is required'),
    expiryDate: z.string().min(1, 'Expiry date is required'),
    active: z.boolean().optional(),
});

interface LicenseFormProps {
    isEdit?: boolean;
}

export default function LicenseForm({ isEdit = false }: LicenseFormProps) {
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
            licenseNumber: '',
            licenseType: 'commercial' as LicenseType,
            qualificationLevel: 'basic' as QualificationLevel,
            issuingAuthority: '',
            issuedDate: '',
            expiryDate: '',
            active: true,
        },
        validators: {
            onSubmit: licenseSchema as any,
        },
        onSubmit: async ({ value }) => {
            try {
                if (isEdit && id) {
                    const payload: UpdateLicenseDto = {
                        pilotId: value.pilotId,
                        licenseNumber: value.licenseNumber,
                        licenseType: value.licenseType,
                        qualificationLevel: value.qualificationLevel,
                        issuingAuthority: value.issuingAuthority,
                        issuedDate: value.issuedDate,
                        expiryDate: value.expiryDate,
                        active: value.active,
                    };
                    await LicenseMutation.update(Number(id), payload);
                    toast.success('Cập nhật license thành công!');
                } else {
                    const payload: CreateLicenseDto = {
                        pilotId: value.pilotId!,
                        licenseNumber: value.licenseNumber,
                        licenseType: value.licenseType,
                        qualificationLevel: value.qualificationLevel,
                        issuingAuthority: value.issuingAuthority,
                        issuedDate: value.issuedDate,
                        expiryDate: value.expiryDate,
                        active: value.active,
                    };
                    await LicenseMutation.create(payload);
                    toast.success('Tạo license thành công!');
                }
                navigate('/licenses');
            } catch (err: any) {
                toast.error(err?.response?.data?.message || (isEdit ? 'Cập nhật license thất bại' : 'Tạo license thất bại'));
                console.error(err);
            }
        },
    });

    // Load license data for edit mode
    useEffect(() => {
        if (isEdit && id) {
            setLoadingData(true);
            LicenseClient.findOne(Number(id))
                .then(license => {
                    form.setFieldValue('pilotId', license.pilotId);
                    form.setFieldValue('licenseNumber', license.licenseNumber);
                    form.setFieldValue('licenseType', license.licenseType);
                    form.setFieldValue('qualificationLevel', license.qualificationLevel);
                    form.setFieldValue('issuingAuthority', license.issuingAuthority);
                    form.setFieldValue('issuedDate', license.issuedDate ? license.issuedDate.split('T')[0] : '');
                    form.setFieldValue('expiryDate', license.expiryDate ? license.expiryDate.split('T')[0] : '');
                    form.setFieldValue('active', license.active);
                    setLoadingData(false);
                })
                .catch(err => {
                    console.error('Failed to load license:', err);
                    toast.error('Không thể tải thông tin license');
                    setLoadingData(false);
                    navigate('/licenses');
                });
        }
    }, [isEdit, id, form, navigate]);

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>{isEdit ? 'Chỉnh sửa license' : 'Thêm license mới'}</CardTitle>
                <CardDescription>
                    {isEdit ? 'Cập nhật thông tin license' : 'Nhập thông tin license để quản lý'}
                </CardDescription>
            </CardHeader>
            <CardContent>
                {loadingData ? (
                    <div className="text-center py-8 text-muted-foreground">
                        Đang tải dữ liệu...
                    </div>
                ) : (
                    <form
                        id="license-form"
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
                                name="licenseNumber"
                                children={field => {
                                    const isInvalid =
                                        field.state.meta.isTouched && !field.state.meta.isValid;
                                    return (
                                        <Field data-invalid={isInvalid}>
                                            <FieldLabel htmlFor={field.name}>License Number *</FieldLabel>
                                            <Input
                                                id={field.name}
                                                name={field.name}
                                                value={field.state.value}
                                                onBlur={field.handleBlur}
                                                onChange={e => field.handleChange(e.target.value)}
                                                aria-invalid={isInvalid}
                                                placeholder="Nhập license number"
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
                                name="licenseType"
                                children={field => {
                                    const isInvalid =
                                        field.state.meta.isTouched && !field.state.meta.isValid;
                                    return (
                                        <Field data-invalid={isInvalid}>
                                            <FieldLabel htmlFor={field.name}>License Type *</FieldLabel>
                                            <Select
                                                value={field.state.value}
                                                onValueChange={val =>
                                                    field.handleChange(val as LicenseType)
                                                }
                                            >
                                                <SelectTrigger className="w-full" id={field.name}>
                                                    <SelectValue placeholder="Chọn license type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="commercial">Commercial</SelectItem>
                                                    <SelectItem value="recreational">Recreational</SelectItem>
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
                                name="qualificationLevel"
                                children={field => {
                                    const isInvalid =
                                        field.state.meta.isTouched && !field.state.meta.isValid;
                                    return (
                                        <Field data-invalid={isInvalid}>
                                            <FieldLabel htmlFor={field.name}>Qualification Level *</FieldLabel>
                                            <Select
                                                value={field.state.value}
                                                onValueChange={val =>
                                                    field.handleChange(val as QualificationLevel)
                                                }
                                            >
                                                <SelectTrigger className="w-full" id={field.name}>
                                                    <SelectValue placeholder="Chọn qualification level" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="basic">Basic</SelectItem>
                                                    <SelectItem value="advanced">Advanced</SelectItem>
                                                    <SelectItem value="expert">Expert</SelectItem>
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
                                name="issuingAuthority"
                                children={field => {
                                    const isInvalid =
                                        field.state.meta.isTouched && !field.state.meta.isValid;
                                    return (
                                        <Field data-invalid={isInvalid}>
                                            <FieldLabel htmlFor={field.name}>Issuing Authority *</FieldLabel>
                                            <Input
                                                id={field.name}
                                                name={field.name}
                                                value={field.state.value}
                                                onBlur={field.handleBlur}
                                                onChange={e => field.handleChange(e.target.value)}
                                                aria-invalid={isInvalid}
                                                placeholder="Nhập issuing authority"
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
                                name="issuedDate"
                                children={field => {
                                    const isInvalid =
                                        field.state.meta.isTouched && !field.state.meta.isValid;
                                    return (
                                        <Field data-invalid={isInvalid}>
                                            <FieldLabel htmlFor={field.name}>Issued Date *</FieldLabel>
                                            <Input
                                                id={field.name}
                                                name={field.name}
                                                type="date"
                                                value={field.state.value}
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
                                name="expiryDate"
                                children={field => {
                                    const isInvalid =
                                        field.state.meta.isTouched && !field.state.meta.isValid;
                                    return (
                                        <Field data-invalid={isInvalid}>
                                            <FieldLabel htmlFor={field.name}>Expiry Date *</FieldLabel>
                                            <Input
                                                id={field.name}
                                                name={field.name}
                                                type="date"
                                                value={field.state.value}
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
                                name="active"
                                children={field => {
                                    return (
                                        <Field>
                                            <FieldLabel htmlFor={field.name}>Active</FieldLabel>
                                            <Select
                                                value={field.state.value ? 'true' : 'false'}
                                                onValueChange={val =>
                                                    field.handleChange(val === 'true')
                                                }
                                            >
                                                <SelectTrigger className="w-full" id={field.name}>
                                                    <SelectValue placeholder="Chọn trạng thái" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="true">Active</SelectItem>
                                                    <SelectItem value="false">Inactive</SelectItem>
                                                </SelectContent>
                                            </Select>
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
                    <Button type="submit" form="license-form" disabled={loadingData}>
                        {loadingData ? 'Đang tải...' : isEdit ? 'Cập nhật' : 'Tạo license'}
                    </Button>
                </Field>
            </CardFooter>
        </Card>
    );
}


