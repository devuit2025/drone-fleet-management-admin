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
import { NoFlyZoneClient, type NoFlyZone } from '@/api/models/no-fly-zone/noFlyZoneClient';
import { NoFlyZoneMutation } from '@/api/models/no-fly-zone/noFlyZoneMutation';
import { useNoFlyZoneStore } from '@/stores/useNoFlyZoneStore';
import { toast } from 'sonner';
import { AutoBreadcrumb } from '@/components/breadcrumb/AutoBreadcrumb';
import type { Polygon } from 'geojson';

export default function NoFlyZoneList() {
    const navigate = useNavigate();
    const [data, setData] = useState<NoFlyZone[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [total, setTotal] = useState(0);
    const [filters, setFilters] = useState<Record<string, string>>({});
    const [activeTab, setActiveTab] = useState('list');
    const [modalOpen, setModalOpen] = useState(false);
    const [modalPolygon, setModalPolygon] = useState<Polygon | null>(null);
    const [modalName, setModalName] = useState('');
    const [modalDescription, setModalDescription] = useState('');
    const [mapKey, setMapKey] = useState(0);
    const { fetchZones, refreshZones, zones } = useNoFlyZoneStore();
    const loadingRef = useRef(false);

    const loadData = async () => {
        if (loadingRef.current) return; // Tránh duplicate calls
        loadingRef.current = true;
        setLoading(true);
        try {
            const res = await NoFlyZoneClient.findAll();
            setData(res);
            setTotal(res.length);
        } catch (err) {
            console.error(err);
            toast.error('Không thể tải danh sách No-Fly Zones');
        } finally {
            setLoading(false);
            loadingRef.current = false;
        }
    };

    useEffect(() => {
        loadData();
    }, [page, pageSize, filters]);

    useEffect(() => {
        if (activeTab === 'overview' && !zones) {
            fetchZones().catch(err => {
                console.error('Failed to fetch zones:', err);
            });
        }
    }, [activeTab, zones]); // Loại bỏ fetchZones khỏi dependencies

    const columns: ColumnDef<NoFlyZone>[] = [
        { key: 'id', header: 'ID', sortable: true },
        { key: 'name', header: 'Tên', filterable: true },
        {
            key: 'description',
            header: 'Mô tả',
            render: row => row.description || '-',
        },
        {
            key: 'zoneType',
            header: 'Loại',
            render: row => (row.zoneType === 'polygon' ? 'Polygon' : 'Circle'),
        },
    ];

    const handleEdit = (row: NoFlyZone) => navigate(`/no-fly-zones/${row.id}/edit`);
    const handleDelete = async (row: NoFlyZone) => {
        if (!confirm('Bạn có chắc chắn muốn xóa No-Fly Zone này?')) {
            return;
        }
        try {
            await NoFlyZoneMutation.remove(row.id);
            toast.success('Đã xóa No-Fly Zone');
            // Refresh data list
            await loadData();
            // Refresh store để cập nhật bản đồ
            await refreshZones();
        } catch (e: any) {
            console.error(e);
            toast.error(e?.response?.data?.message || 'Xóa thất bại');
        }
    };

    const handleDrawCreate = (feature: Polygon) => {
        setModalPolygon(feature);
        setModalName('');
        setModalDescription('');
        setModalOpen(true);
    };

    const handleDrawUpdate = async (id: string | number, feature: Polygon) => {
        try {
            // Tìm zone từ store để lấy name và description
            const store = useNoFlyZoneStore.getState();
            const zone = store.rawZones.find(z => z.id === Number(id));
            if (!zone) {
                toast.error('Không tìm thấy No-Fly Zone');
                return;
            }
            const geometry = JSON.stringify(feature);
            await NoFlyZoneClient.update(Number(id), {
                name: zone.name,
                description: zone.description ?? undefined,
                zoneType: 'polygon',
                geometry,
            });
            toast.success('Cập nhật No-Fly Zone thành công');
            // Refresh data và zones
            await loadData();
            await refreshZones();
            // Reset map để hiển thị data mới nhất
            setMapKey(prev => prev + 1);
        } catch (e: any) {
            console.error(e);
            toast.error(e?.response?.data?.message || 'Cập nhật thất bại');
        }
    };

    const handleDrawDelete = async (id: string | number) => {
        try {
            await NoFlyZoneMutation.remove(Number(id));
            toast.success('Đã xóa No-Fly Zone');
            // Refresh data và zones
            await loadData();
            await refreshZones();
            // Reset map để hiển thị data mới nhất
            setMapKey(prev => prev + 1);
        } catch (e: any) {
            console.error(e);
            toast.error(e?.response?.data?.message || 'Xóa thất bại');
        }
    };

    const handleModalSubmit = async () => {
        if (!modalPolygon) return;
        try {
            if (!modalName.trim()) {
                toast.error('Tên là bắt buộc');
                return;
            }
            const geometry = JSON.stringify(modalPolygon);
            const desc =
                modalDescription !== undefined && modalDescription !== null
                    ? String(modalDescription)
                    : undefined;
            await NoFlyZoneClient.create({
                name: modalName.trim(),
                description: desc,
                zoneType: 'polygon',
                geometry,
            });
            toast.success('Tạo No-Fly Zone thành công');
            setModalOpen(false);
            setModalPolygon(null);
            setModalName('');
            setModalDescription('');
            // Refresh data và zones
            await loadData();
            await refreshZones();
            setMapKey(prev => prev + 1);
        } catch (e: any) {
            console.error(e);
            toast.error(e?.response?.data?.message || 'Lưu No-Fly Zone thất bại');
        }
    };

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };

    const handleFilterChange = (newFilters: Record<string, string>) => {
        setFilters(newFilters);
        setPage(1);
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
                        prefix="no-fly-zones"
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
                            <MapboxMap
                                key={mapKey}
                                features={zones}
                                disabledZones={zones}
                                readOnly={false}
                                onDrawCreate={handleDrawCreate}
                                onDrawUpdate={handleDrawUpdate}
                                onDrawDelete={handleDrawDelete}
                                style={{ height: '600px', width: '100%' }}
                            />
                            <FieldDescription>
                                Vẽ polygon trên bản đồ để tạo No-Fly Zone mới. Tất cả các zone hiện
                                có sẽ được hiển thị.
                            </FieldDescription>
                        </Field>
                    </div>
                </TabsContent>
            </Tabs>

            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Tạo No-Fly Zone mới</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <Field>
                            <FieldLabel>Tên *</FieldLabel>
                            <Input
                                value={modalName}
                                onChange={e => setModalName(e.target.value)}
                                placeholder="VD: Khu quân sự A"
                            />
                            <FieldDescription>Nhập tên cho No-Fly Zone</FieldDescription>
                        </Field>
                        <Field>
                            <FieldLabel>Mô tả</FieldLabel>
                            <Input
                                value={modalDescription}
                                onChange={e => setModalDescription(e.target.value)}
                                placeholder="Mô tả về vùng cấm bay (tùy chọn)"
                            />
                            <FieldDescription>Thông tin bổ sung về No-Fly Zone</FieldDescription>
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
