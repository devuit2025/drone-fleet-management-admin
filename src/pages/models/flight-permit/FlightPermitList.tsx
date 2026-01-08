import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Field, FieldLabel, FieldDescription } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/table/DataTable';
import type { ColumnDef } from '@/components/table/types';
import { MapboxMap } from '@/components/map/MapboxMap';
import { FlightPermitClient, type FlightPermit } from '@/api/models/flight-permit/flightPermitClient';
import { FlightPermitMutation } from '@/api/models/flight-permit/flightPermitMutation';
import { toast } from 'sonner';
import { AutoBreadcrumb } from '@/components/breadcrumb/AutoBreadcrumb';
import type { FeatureCollection, Polygon } from 'geojson';
import { LicenseClient } from '@/api/models/license/licenseClient';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

export default function FlightPermitList() {
    const navigate = useNavigate();
    const [data, setData] = useState<FlightPermit[]>([]);
    const [licenses, setLicenses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [total, setTotal] = useState(0);
    const [filters, setFilters] = useState<Record<string, string>>({});
    const [activeTab, setActiveTab] = useState('list');
    const [modalOpen, setModalOpen] = useState(false);
    const [modalPolygon, setModalPolygon] = useState<Polygon | null>(null);
    const [modalPermitNumber, setModalPermitNumber] = useState('');
    const [modalLicenseId, setModalLicenseId] = useState<number | undefined>(undefined);
    const [modalDescription, setModalDescription] = useState('');
    const [modalApplicantName, setModalApplicantName] = useState('');
    const [mapKey, setMapKey] = useState(0);
    const loadingRef = useRef(false);

    useEffect(() => {
        LicenseClient.findAll()
            .then(setLicenses)
            .catch(err => console.error('Failed to load licenses:', err));
    }, []);

    const loadData = async () => {
        if (loadingRef.current) return;
        loadingRef.current = true;
        setLoading(true);
        try {
            const res = await FlightPermitClient.findAll();
            setData(res);
            setTotal(res.length);
        } catch (err) {
            console.error(err);
            toast.error('Không thể tải danh sách Flight Permits');
        } finally {
            setLoading(false);
            loadingRef.current = false;
        }
    };

    useEffect(() => {
        loadData();
    }, [page, pageSize, filters]);

    const getStatusBadge = (status: string) => {
        const colors: Record<string, string> = {
            pending: 'bg-yellow-100 text-yellow-800',
            approved: 'bg-green-100 text-green-800',
            rejected: 'bg-red-100 text-red-800',
            expired: 'bg-gray-100 text-gray-800',
        };
        return (
            <span className={`px-2 py-1 rounded text-xs ${colors[status] || 'bg-gray-100'}`}>
                {status}
            </span>
        );
    };

    const columns: ColumnDef<FlightPermit>[] = [
        { key: 'id', header: 'ID', sortable: true },
        { key: 'permitNumber', header: 'Số phép', filterable: true },
        {
            key: 'status',
            header: 'Trạng thái',
            render: row => getStatusBadge(row.status),
        },
        {
            key: 'applicantName',
            header: 'Người đề nghị',
            render: row => row.applicantName || '-',
        },
        {
            key: 'licenseId',
            header: 'License ID',
            render: row => row.licenseId,
        },
        {
            key: 'expiryDate',
            header: 'Ngày hết hạn',
            render: row => (row.expiryDate ? new Date(row.expiryDate).toLocaleDateString('vi-VN') : '-'),
        },
    ];

    const handleEdit = (row: FlightPermit) => navigate(`/flight-permits/${row.id}/edit`);
    const handleDelete = async (row: FlightPermit) => {
        if (!confirm('Bạn có chắc chắn muốn xóa Flight Permit này?')) {
            return;
        }
        try {
            await FlightPermitMutation.remove(row.id);
            toast.success('Đã xóa Flight Permit');
            await loadData();
        } catch (e: any) {
            console.error(e);
            toast.error(e?.response?.data?.message || 'Xóa thất bại');
        }
    };

    const handleDrawCreate = (feature: Polygon) => {
        setModalPolygon(feature);
        setModalPermitNumber('');
        setModalLicenseId(undefined);
        setModalDescription('');
        setModalApplicantName('');
        setModalOpen(true);
    };

    const handleDrawUpdate = async (id: string | number, feature: Polygon) => {
        try {
            const permit = data.find(p => p.id === Number(id));
            if (!permit) {
                toast.error('Không tìm thấy Flight Permit');
                return;
            }
            const geometry = JSON.stringify(feature);
            await FlightPermitClient.update(Number(id), {
                airspaceArea: geometry,
            });
            toast.success('Cập nhật Flight Permit thành công');
            await loadData();
            setMapKey(prev => prev + 1);
        } catch (e: any) {
            console.error(e);
            toast.error(e?.response?.data?.message || 'Cập nhật thất bại');
        }
    };

    const handleDrawDelete = async (id: string | number) => {
        try {
            await FlightPermitMutation.remove(Number(id));
            toast.success('Đã xóa Flight Permit');
            await loadData();
            setMapKey(prev => prev + 1);
        } catch (e: any) {
            console.error(e);
            toast.error(e?.response?.data?.message || 'Xóa thất bại');
        }
    };

    const handleModalSubmit = async () => {
        if (!modalPolygon || !modalLicenseId || !modalPermitNumber.trim() || !modalApplicantName.trim()) {
            toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
            return;
        }
        try {
            const geometry = JSON.stringify(modalPolygon);
            await FlightPermitClient.create({
                licenseId: modalLicenseId,
                permitNumber: modalPermitNumber.trim(),
                airspaceArea: geometry,
                description: modalDescription || undefined,
                applicantName: modalApplicantName.trim(),
                status: 'pending',
            });
            toast.success('Tạo Flight Permit thành công');
            setModalOpen(false);
            setModalPolygon(null);
            setModalPermitNumber('');
            setModalLicenseId(undefined);
            setModalDescription('');
            setModalApplicantName('');
            await loadData();
            setMapKey(prev => prev + 1);
        } catch (e: any) {
            console.error(e);
            toast.error(e?.response?.data?.message || 'Lưu Flight Permit thất bại');
        }
    };

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };

    const handleFilterChange = (newFilters: Record<string, string>) => {
        setFilters(newFilters);
        setPage(1);
    };

    // Convert permits to GeoJSON FeatureCollection for map
    const permitFeatures: FeatureCollection<Polygon> = {
        type: 'FeatureCollection',
        features: data
            .map(permit => {
                try {
                    const geometry = typeof permit.airspaceArea === 'string' 
                        ? JSON.parse(permit.airspaceArea) 
                        : permit.airspaceArea;
                    if (!geometry || geometry.type !== 'Polygon') {
                        return null;
                    }
                    return {
                        type: 'Feature' as const,
                        id: permit.id,
                        geometry: geometry as Polygon,
                        properties: {
                            name: permit.permitNumber,
                            status: permit.status,
                        },
                    };
                } catch {
                    return null;
                }
            })
            .filter(Boolean) as any[],
    };

    return (
        <>
            <AutoBreadcrumb />
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList>
                    <TabsTrigger value="list">Danh sách</TabsTrigger>
                    <TabsTrigger value="overview">Bản đồ tổng quan</TabsTrigger>
                </TabsList>
                <TabsContent value="list" className="mt-6">
                    <DataTable
                        prefix="flight-permits"
                        columns={columns}
                        data={data}
                        total={total}
                        page={page}
                        pageSize={pageSize}
                        loading={loading}
                        getId={row => row.id}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onPageChange={handlePageChange}
                        onFilterChange={handleFilterChange}
                    />
                </TabsContent>
                <TabsContent value="overview" className="mt-6">
                    <div className="space-y-4">
                        <Field>
                            <FieldLabel>Bản đồ tổng quan</FieldLabel>
                            {loading ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    Đang tải dữ liệu...
                                </div>
                            ) : (
                                <MapboxMap
                                    key={mapKey}
                                    features={permitFeatures.features.length > 0 ? permitFeatures : null}
                                    permitAreas={permitFeatures.features.length > 0 ? permitFeatures : null}
                                    readOnly={false}
                                    onDrawCreate={handleDrawCreate}
                                    onDrawUpdate={handleDrawUpdate}
                                    onDrawDelete={handleDrawDelete}
                                    style={{ height: '600px', width: '100%' }}
                                />
                            )}
                            <FieldDescription>
                                Vẽ polygon trên bản đồ để tạo Flight Permit mới. Tất cả các permit hiện
                                có sẽ được hiển thị ({permitFeatures.features.length} permit{permitFeatures.features.length !== 1 ? 's' : ''}).
                            </FieldDescription>
                        </Field>
                    </div>
                </TabsContent>
            </Tabs>

            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Tạo Flight Permit mới</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <Field>
                            <FieldLabel>License *</FieldLabel>
                            <Select
                                value={modalLicenseId?.toString() || ''}
                                onValueChange={val => setModalLicenseId(val ? Number(val) : undefined)}
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
                        </Field>
                        <Field>
                            <FieldLabel>Số phép *</FieldLabel>
                            <Input
                                value={modalPermitNumber}
                                onChange={e => setModalPermitNumber(e.target.value)}
                                placeholder="VD: FP-2024-001"
                            />
                        </Field>
                        <Field>
                            <FieldLabel>Người đề nghị *</FieldLabel>
                            <Input
                                value={modalApplicantName}
                                onChange={e => setModalApplicantName(e.target.value)}
                                placeholder="Tên người/tổ chức đề nghị"
                            />
                        </Field>
                        <Field>
                            <FieldLabel>Mô tả</FieldLabel>
                            <Input
                                value={modalDescription}
                                onChange={e => setModalDescription(e.target.value)}
                                placeholder="Mô tả về phép bay (tùy chọn)"
                            />
                        </Field>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setModalOpen(false)}>
                            Hủy
                        </Button>
                        <Button onClick={handleModalSubmit}>Tạo mới</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

