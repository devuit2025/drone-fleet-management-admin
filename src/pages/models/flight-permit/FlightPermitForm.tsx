import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import type { FeatureCollection, Polygon } from 'geojson';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';
import { Field, FieldLabel, FieldDescription } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { MapboxPolygonEditor } from '@/components/map/MapboxPolygonEditor';
import {
    FlightPermitClient,
    type PermitStatus,
} from '@/api/models/flight-permit/flightPermitClient';
import { LicenseClient } from '@/api/models/license/licenseClient';
import { ringFromFeatureCollection } from '@/lib/geo';

interface FlightPermitFormProps {
    isEdit?: boolean;
}

export default function FlightPermitForm({ isEdit = false }: FlightPermitFormProps) {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [licenseId, setLicenseId] = useState<number | undefined>(undefined);
    const [permitNumber, setPermitNumber] = useState('');
    const [applicantName, setApplicantName] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState<PermitStatus>('pending');
    const [polygon, setPolygon] = useState<FeatureCollection<Polygon>>({
        type: 'FeatureCollection',
        features: [],
    });
    const [licenses, setLicenses] = useState<any[]>([]);
    const [loading, setLoading] = useState(isEdit);

    useEffect(() => {
        LicenseClient.findAll()
            .then(setLicenses)
            .catch(err => console.error('Failed to load licenses:', err));
    }, []);

    useEffect(() => {
        if (isEdit && id) {
            setLoading(true);
            FlightPermitClient.findOne(Number(id))
                .then(p => {
                    setLicenseId(p.licenseId);
                    setPermitNumber(p.permitNumber);
                    setApplicantName(p.applicantName);
                    setDescription(p.description || '');
                    setStatus(p.status);
                    const geomStr = (p as any).airspaceArea as string | undefined;
                    if (geomStr) {
                        let geom: any = null;
                        try {
                            geom = JSON.parse(geomStr);
                        } catch {
                            geom = null;
                        }
                        const fc: FeatureCollection<Polygon> =
                            geom && geom.type === 'FeatureCollection'
                                ? geom
                                : geom && geom.type === 'Polygon'
                                  ? {
                                        type: 'FeatureCollection',
                                        features: [
                                            { type: 'Feature', geometry: geom, properties: {} },
                                        ],
                                    }
                                  : { type: 'FeatureCollection', features: [] };
                        setPolygon(fc);
                    }
                })
                .catch(err => {
                    console.error(err);
                    toast.error('Không thể tải Flight Permit');
                    navigate('/flight-permits');
                })
                .finally(() => setLoading(false));
        }
    }, [isEdit, id, navigate]);

    const handleSubmit = async () => {
        try {
            if (!licenseId) {
                toast.error('License là bắt buộc');
                return;
            }
            if (!permitNumber.trim()) {
                toast.error('Số phép là bắt buộc');
                return;
            }
            if (!applicantName.trim()) {
                toast.error('Tên người đề nghị là bắt buộc');
                return;
            }
            const polyGeom = polygon?.features?.[0]?.geometry;
            if (!polyGeom || polyGeom.type !== 'Polygon') {
                toast.error('Vui lòng vẽ polygon hợp lệ');
                return;
            }
            const geometry = JSON.stringify(polyGeom);
            const desc =
                description !== undefined && description !== null ? String(description) : undefined;
            if (isEdit && id) {
                await FlightPermitClient.update(Number(id), {
                    licenseId,
                    permitNumber: permitNumber.trim(),
                    applicantName: applicantName.trim(),
                    description: desc,
                    airspaceArea: geometry,
                    status,
                });
                toast.success('Cập nhật Flight Permit thành công');
            } else {
                await FlightPermitClient.create({
                    licenseId,
                    permitNumber: permitNumber.trim(),
                    applicantName: applicantName.trim(),
                    description: desc,
                    airspaceArea: geometry,
                    status: 'pending',
                });
                toast.success('Tạo Flight Permit thành công');
            }
            navigate('/flight-permits');
        } catch (e: any) {
            console.error(e);
            toast.error(e?.response?.data?.message || 'Lưu Flight Permit thất bại');
        }
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>{isEdit ? 'Chỉnh sửa Flight Permit' : 'Tạo Flight Permit'}</CardTitle>
                <CardDescription>
                    {isEdit
                        ? 'Cập nhật vùng trời được phép bay'
                        : 'Vẽ vùng trời được phép bay và lưu lại'}
                </CardDescription>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="text-center py-8 text-muted-foreground">Đang tải...</div>
                ) : (
                    <div className="space-y-6">
                        <Field>
                            <FieldLabel>License *</FieldLabel>
                            <Select
                                value={licenseId?.toString() || ''}
                                onValueChange={val => setLicenseId(val ? Number(val) : undefined)}
                                disabled={isEdit}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn license" />
                                </SelectTrigger>
                                <SelectContent>
                                    {licenses.map(license => (
                                        <SelectItem key={license.id} value={license.id.toString()}>
                                            {license.licenseNumber} (ID: {license.id})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FieldDescription>
                                Chọn license liên kết với permit này
                            </FieldDescription>
                        </Field>
                        <Field>
                            <FieldLabel>Số phép *</FieldLabel>
                            <Input
                                value={permitNumber}
                                onChange={e => setPermitNumber(e.target.value)}
                                placeholder="VD: FP-2024-001"
                            />
                            <FieldDescription>Nhập số phép bay</FieldDescription>
                        </Field>
                        <Field>
                            <FieldLabel>Người đề nghị *</FieldLabel>
                            <Input
                                value={applicantName}
                                onChange={e => setApplicantName(e.target.value)}
                                placeholder="Tên người/tổ chức đề nghị"
                            />
                            <FieldDescription>
                                Tên người hoặc tổ chức đề nghị cấp phép
                            </FieldDescription>
                        </Field>
                        <Field>
                            <FieldLabel>Mô tả</FieldLabel>
                            <Input
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                placeholder="Mô tả về phép bay (tùy chọn)"
                            />
                            <FieldDescription>Thông tin bổ sung về phép bay</FieldDescription>
                        </Field>
                        {isEdit && (
                            <Field>
                                <FieldLabel>Trạng thái</FieldLabel>
                                <Select
                                    value={status}
                                    onValueChange={val => setStatus(val as PermitStatus)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn trạng thái" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="approved">Approved</SelectItem>
                                        <SelectItem value="rejected">Rejected</SelectItem>
                                        <SelectItem value="expired">Expired</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FieldDescription>
                                    Cập nhật trạng thái của phép bay
                                </FieldDescription>
                            </Field>
                        )}
                        <Field>
                            <FieldLabel>Bản đồ *</FieldLabel>
                            <div className="space-y-4">
                                <MapboxPolygonEditor
                                    value={polygon}
                                    onChange={setPolygon}
                                    style={{ height: '500px', width: '100%' }}
                                />
                                <div className="mt-4">
                                    <div className="text-sm font-semibold mb-2">
                                        Toạ độ (lon, lat)
                                    </div>
                                    {(() => {
                                        const ring = ringFromFeatureCollection(polygon);
                                        if (!ring || ring.length === 0) {
                                            return (
                                                <div className="text-xs text-muted-foreground p-3 rounded border bg-muted/30">
                                                    Chưa có polygon. Vẽ polygon trên bản đồ để hiển
                                                    thị toạ độ.
                                                </div>
                                            );
                                        }
                                        return (
                                            <div className="rounded border bg-muted/30 p-4">
                                                <div className="grid grid-cols-3 gap-2 text-xs font-medium text-muted-foreground mb-2 pb-2 border-b">
                                                    <div>#</div>
                                                    <div>Longitude</div>
                                                    <div>Latitude</div>
                                                </div>
                                                <div className="max-h-64 overflow-auto">
                                                    {ring.map(([lon, lat], idx) => (
                                                        <div
                                                            key={idx}
                                                            className="grid grid-cols-3 gap-2 text-xs py-2 border-b last:border-b-0"
                                                        >
                                                            <div className="font-medium">{idx}</div>
                                                            <div className="font-mono">
                                                                {Number(lon).toFixed(6)}
                                                            </div>
                                                            <div className="font-mono">
                                                                {Number(lat).toFixed(6)}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>
                            </div>
                            <FieldDescription>
                                Vẽ polygon trên bản đồ để định nghĩa vùng trời được phép bay
                            </FieldDescription>
                        </Field>
                    </div>
                )}
            </CardContent>
            <CardFooter>
                <Field orientation="horizontal">
                    <Button
                        variant="outline"
                        type="button"
                        onClick={() => navigate('/flight-permits')}
                    >
                        Hủy
                    </Button>
                    <Button type="button" onClick={handleSubmit} disabled={loading}>
                        {loading ? 'Đang xử lý...' : isEdit ? 'Cập nhật' : 'Tạo mới'}
                    </Button>
                </Field>
            </CardFooter>
        </Card>
    );
}
