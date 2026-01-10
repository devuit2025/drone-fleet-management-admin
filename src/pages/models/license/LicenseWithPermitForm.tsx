import { useForm } from '@tanstack/react-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { FeatureCollection, Polygon } from 'geojson';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { MapboxPolygonEditor } from '@/components/map/MapboxPolygonEditor';
import {
    type CreateLicenseWithPermitDto,
    type LicenseType,
    type QualificationLevel,
    LicenseClient,
} from '@/api/models/license/licenseClient';
import { PilotClient, type Pilot } from '@/api/models/pilot/pilotClient';

const licenseTypeValues = ['commercial', 'recreational'] as const;
const qualificationLevelValues = ['basic', 'advanced', 'expert'] as const;

const combinedSchema = z.object({
    // License fields
    pilotId: z.number().min(1, 'Pilot is required'),
    licenseNumber: z.string().min(1, 'License number is required'),
    licenseType: z.enum(licenseTypeValues),
    qualificationLevel: z.enum(qualificationLevelValues),
    issuingAuthority: z.string().min(1, 'Issuing authority is required'),
    licenseIssuedDate: z.string().min(1, 'License issued date is required'),
    licenseExpiryDate: z.string().min(1, 'License expiry date is required'),
    licenseActive: z.boolean().optional(),

    // Flight permit fields
    permitNumber: z.string().min(1, 'Permit number is required'),
    applicantName: z.string().min(1, 'Applicant name is required'),
    applicantAddress: z.string().optional(),
    applicantNationality: z.string().optional(),
    applicantPhone: z.string().optional(),
    flightPurpose: z.string().optional(),
    description: z.string().optional(),
    permitIssuedDate: z.string().optional(),
    permitExpiryDate: z.string().optional(),
    takeoffLandingLocation: z.string().optional(),
});

// Helper to extract error message from Zod error object
const getErrorMessage = (error: any): string | null => {
    if (!error) return null;
    if (typeof error === 'string') return error;
    if (error.message) return error.message;
    return JSON.stringify(error);
};

export default function LicenseWithPermitForm() {
    const navigate = useNavigate();
    const [pilots, setPilots] = useState<Pilot[]>([]);
    const [loading, setLoading] = useState(true);
    const [polygon, setPolygon] = useState<FeatureCollection<Polygon>>({
        type: 'FeatureCollection',
        features: [],
    });

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
            // License
            pilotId: undefined as number | undefined,
            licenseNumber: '',
            licenseType: 'commercial' as LicenseType,
            qualificationLevel: 'basic' as QualificationLevel,
            issuingAuthority: '',
            licenseIssuedDate: '',
            licenseExpiryDate: '',
            licenseActive: true,

            // Flight Permit
            permitNumber: '',
            applicantName: '',
            applicantAddress: '',
            applicantNationality: 'Việt Nam',
            applicantPhone: '',
            flightPurpose: '',
            description: '',
            permitIssuedDate: '',
            permitExpiryDate: '',
            takeoffLandingLocation: '',
        },
        validators: {
            onSubmit: combinedSchema as any,
        },
        onSubmit: async ({ value }) => {
            try {
                // Validate polygon
                const polyGeom = polygon?.features?.[0]?.geometry;
                if (!polyGeom || polyGeom.type !== 'Polygon') {
                    toast.error('Vui lòng vẽ polygon hợp lệ cho vùng bay');
                    return;
                }

                const payload: CreateLicenseWithPermitDto = {
                    license: {
                        pilotId: value.pilotId!,
                        licenseNumber: value.licenseNumber,
                        licenseType: value.licenseType,
                        qualificationLevel: value.qualificationLevel,
                        issuingAuthority: value.issuingAuthority,
                        issuedDate: value.licenseIssuedDate,
                        expiryDate: value.licenseExpiryDate,
                        active: value.licenseActive,
                    },
                    flightPermit: {
                        permitNumber: value.permitNumber,
                        airspaceArea: JSON.stringify(polyGeom),
                        applicantName: value.applicantName,
                        description: value.description || undefined,
                        applicantAddress: value.applicantAddress || undefined,
                        applicantNationality: value.applicantNationality || undefined,
                        applicantPhone: value.applicantPhone || undefined,
                        flightPurpose: value.flightPurpose || undefined,
                        issuedDate: value.permitIssuedDate || undefined,
                        expiryDate: value.permitExpiryDate || undefined,
                        takeoffLandingLocation: value.takeoffLandingLocation || undefined,
                    },
                };

                await LicenseClient.createWithPermit(payload);
                toast.success('Tạo License và Flight Permit thành công!');
                navigate('/licenses');
            } catch (err: any) {
                toast.error(
                    err?.response?.data?.message || 'Tạo License và Flight Permit thất bại',
                );
                console.error(err);
            }
        },
    });

    // Auto-fill applicant info when pilot is selected
    useEffect(() => {
        const pilotId = form.getFieldValue('pilotId');
        if (pilotId) {
            const selectedPilot = pilots.find(p => p.id === pilotId);
            if (selectedPilot) {
                form.setFieldValue('applicantName', selectedPilot.name);
                // Note: Pilot type doesn't have address/phone, user would need to fill manually
            }
        }
    }, [form.getFieldValue('pilotId'), pilots]);

    if (loading) {
        return <div>Đang tải...</div>;
    }

    return (
        <form
            onSubmit={e => {
                e.preventDefault();
                e.stopPropagation();
                form.handleSubmit();
            }}
        >
            <div className="space-y-6">
                {/* License Section */}
                <Card className="w-full">
                    <CardHeader>
                        <CardTitle>Thông tin License</CardTitle>
                        <CardDescription>
                            Nhập thông tin chứng chỉ hành nghề cho phi công
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <form.Field name="pilotId">
                            {field => (
                                <FieldGroup>
                                    <FieldLabel>Pilot *</FieldLabel>
                                    <Select
                                        value={field.state.value?.toString()}
                                        onValueChange={v => field.handleChange(Number(v))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Chọn pilot..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {pilots.map(p => (
                                                <SelectItem key={p.id} value={p.id.toString()}>
                                                    {p.name} (ID: {p.id})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FieldError>
                                        {getErrorMessage(field.state.meta.errors?.[0])}
                                    </FieldError>
                                </FieldGroup>
                            )}
                        </form.Field>

                        <form.Field name="licenseNumber">
                            {field => (
                                <FieldGroup>
                                    <FieldLabel>Số License *</FieldLabel>
                                    <Input
                                        type="text"
                                        value={field.state.value || ''}
                                        onChange={e => field.handleChange(e.target.value)}
                                        placeholder="VD: LIC-2024-001"
                                    />
                                    <FieldError>
                                        {getErrorMessage(field.state.meta.errors?.[0])}
                                    </FieldError>
                                </FieldGroup>
                            )}
                        </form.Field>

                        <div className="grid grid-cols-2 gap-4">
                            <form.Field name="licenseType">
                                {field => (
                                    <FieldGroup>
                                        <FieldLabel>Loại License *</FieldLabel>
                                        <Select
                                            value={field.state.value}
                                            onValueChange={v =>
                                                field.handleChange(v as LicenseType)
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="commercial">
                                                    Commercial
                                                </SelectItem>
                                                <SelectItem value="recreational">
                                                    Recreational
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FieldError>
                                            {getErrorMessage(field.state.meta.errors?.[0])}
                                        </FieldError>
                                    </FieldGroup>
                                )}
                            </form.Field>

                            <form.Field name="qualificationLevel">
                                {field => (
                                    <FieldGroup>
                                        <FieldLabel>Cấp độ *</FieldLabel>
                                        <Select
                                            value={field.state.value}
                                            onValueChange={v =>
                                                field.handleChange(v as QualificationLevel)
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="basic">Basic</SelectItem>
                                                <SelectItem value="advanced">Advanced</SelectItem>
                                                <SelectItem value="expert">Expert</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FieldError>
                                            {getErrorMessage(field.state.meta.errors?.[0])}
                                        </FieldError>
                                    </FieldGroup>
                                )}
                            </form.Field>
                        </div>

                        <form.Field name="issuingAuthority">
                            {field => (
                                <FieldGroup>
                                    <FieldLabel>Cơ quan cấp *</FieldLabel>
                                    <Input
                                        type="text"
                                        value={field.state.value || ''}
                                        onChange={e => field.handleChange(e.target.value)}
                                        placeholder="VD: Cục Hàng không Việt Nam"
                                    />
                                    <FieldError>
                                        {getErrorMessage(field.state.meta.errors?.[0])}
                                    </FieldError>
                                </FieldGroup>
                            )}
                        </form.Field>

                        <div className="grid grid-cols-2 gap-4">
                            <form.Field name="licenseIssuedDate">
                                {field => (
                                    <FieldGroup>
                                        <FieldLabel>Ngày cấp *</FieldLabel>
                                        <Input
                                            type="date"
                                            value={field.state.value || ''}
                                            onChange={e => field.handleChange(e.target.value)}
                                        />
                                        <FieldError>
                                            {getErrorMessage(field.state.meta.errors?.[0])}
                                        </FieldError>
                                    </FieldGroup>
                                )}
                            </form.Field>

                            <form.Field name="licenseExpiryDate">
                                {field => (
                                    <FieldGroup>
                                        <FieldLabel>Ngày hết hạn *</FieldLabel>
                                        <Input
                                            type="date"
                                            value={field.state.value || ''}
                                            onChange={e => field.handleChange(e.target.value)}
                                        />
                                        <FieldError>
                                            {getErrorMessage(field.state.meta.errors?.[0])}
                                        </FieldError>
                                    </FieldGroup>
                                )}
                            </form.Field>
                        </div>
                    </CardContent>
                </Card>

                {/* Flight Permit Section */}
                <Card className="w-full">
                    <CardHeader>
                        <CardTitle>Thông tin Flight Permit</CardTitle>
                        <CardDescription>
                            Nhập thông tin đề nghị cấp phép bay và vẽ vùng trời được phép
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <form.Field name="permitNumber">
                            {field => (
                                <FieldGroup>
                                    <FieldLabel>Số Permit *</FieldLabel>
                                    <Input
                                        type="text"
                                        value={field.state.value || ''}
                                        onChange={e => field.handleChange(e.target.value)}
                                        placeholder="VD: FP-2024-001"
                                    />
                                    <FieldError>
                                        {getErrorMessage(field.state.meta.errors?.[0])}
                                    </FieldError>
                                </FieldGroup>
                            )}
                        </form.Field>

                        <form.Field name="applicantName">
                            {field => (
                                <FieldGroup>
                                    <FieldLabel>Tên người đề nghị *</FieldLabel>
                                    <Input
                                        type="text"
                                        value={field.state.value || ''}
                                        onChange={e => field.handleChange(e.target.value)}
                                        placeholder="Tự động điền từ Pilot"
                                    />
                                    <FieldDescription>Tự động điền khi chọn Pilot</FieldDescription>
                                    <FieldError>
                                        {getErrorMessage(field.state.meta.errors?.[0])}
                                    </FieldError>
                                </FieldGroup>
                            )}
                        </form.Field>

                        <div className="grid grid-cols-2 gap-4">
                            <form.Field name="applicantAddress">
                                {field => (
                                    <FieldGroup>
                                        <FieldLabel>Địa chỉ</FieldLabel>
                                        <Input
                                            type="text"
                                            value={field.state.value || ''}
                                            onChange={e => field.handleChange(e.target.value)}
                                        />
                                    </FieldGroup>
                                )}
                            </form.Field>

                            <form.Field name="applicantNationality">
                                {field => (
                                    <FieldGroup>
                                        <FieldLabel>Quốc tịch</FieldLabel>
                                        <Input
                                            type="text"
                                            value={field.state.value || ''}
                                            onChange={e => field.handleChange(e.target.value)}
                                        />
                                    </FieldGroup>
                                )}
                            </form.Field>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <form.Field name="applicantPhone">
                                {field => (
                                    <FieldGroup>
                                        <FieldLabel>Số điện thoại</FieldLabel>
                                        <Input
                                            type="text"
                                            value={field.state.value || ''}
                                            onChange={e => field.handleChange(e.target.value)}
                                        />
                                    </FieldGroup>
                                )}
                            </form.Field>

                            <form.Field name="takeoffLandingLocation">
                                {field => (
                                    <FieldGroup>
                                        <FieldLabel>Địa điểm cất/hạ cánh</FieldLabel>
                                        <Input
                                            type="text"
                                            value={field.state.value || ''}
                                            onChange={e => field.handleChange(e.target.value)}
                                        />
                                    </FieldGroup>
                                )}
                            </form.Field>
                        </div>

                        <form.Field name="flightPurpose">
                            {field => (
                                <FieldGroup>
                                    <FieldLabel>Mục đích bay</FieldLabel>
                                    <Input
                                        type="text"
                                        value={field.state.value || ''}
                                        onChange={e => field.handleChange(e.target.value)}
                                        placeholder="VD: Khảo sát, chụp ảnh, ..."
                                    />
                                </FieldGroup>
                            )}
                        </form.Field>

                        <form.Field name="description">
                            {field => (
                                <FieldGroup>
                                    <FieldLabel>Mô tả</FieldLabel>
                                    <Input
                                        type="text"
                                        value={field.state.value || ''}
                                        onChange={e => field.handleChange(e.target.value)}
                                    />
                                </FieldGroup>
                            )}
                        </form.Field>

                        <div className="grid grid-cols-2 gap-4">
                            <form.Field name="permitIssuedDate">
                                {field => (
                                    <FieldGroup>
                                        <FieldLabel>Ngày hiệu lực</FieldLabel>
                                        <Input
                                            type="date"
                                            value={field.state.value || ''}
                                            onChange={e => field.handleChange(e.target.value)}
                                        />
                                    </FieldGroup>
                                )}
                            </form.Field>

                            <form.Field name="permitExpiryDate">
                                {field => (
                                    <FieldGroup>
                                        <FieldLabel>Ngày hết hạn</FieldLabel>
                                        <Input
                                            type="date"
                                            value={field.state.value || ''}
                                            onChange={e => field.handleChange(e.target.value)}
                                        />
                                    </FieldGroup>
                                )}
                            </form.Field>
                        </div>

                        <FieldGroup>
                            <FieldLabel>Vùng trời được phép bay *</FieldLabel>
                            <FieldDescription>
                                Vẽ polygon để xác định khu vực được phép bay
                            </FieldDescription>
                            <div className="mt-2">
                                <MapboxPolygonEditor value={polygon} onChange={setPolygon} />
                            </div>
                        </FieldGroup>
                    </CardContent>
                </Card>

                {/* Actions */}
                <Card>
                    <CardFooter className="flex justify-between pt-6">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate('/licenses')}
                        >
                            Hủy
                        </Button>
                        <Button type="submit">Tạo License & Permit</Button>
                    </CardFooter>
                </Card>
            </div>
        </form>
    );
}
