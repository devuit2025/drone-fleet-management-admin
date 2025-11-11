import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import type { FeatureCollection, Polygon } from 'geojson';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Field, FieldLabel, FieldDescription } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapboxPolygonEditor } from '@/components/map/MapboxPolygonEditor';
import { NoFlyZoneClient } from '@/api/models/no-fly-zone/noFlyZoneClient';
import { ringFromFeatureCollection } from '@/lib/geo';

interface NoFlyZoneFormProps {
    isEdit?: boolean;
}

export default function NoFlyZoneForm({ isEdit = false }: NoFlyZoneFormProps) {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [polygon, setPolygon] = useState<FeatureCollection<Polygon>>({ type: 'FeatureCollection', features: [] });
    const [zoneType] = useState<'polygon' | 'circle'>('polygon');
    const [loading, setLoading] = useState(isEdit);

    useEffect(() => {
        if (isEdit && id) {
            setLoading(true);
            NoFlyZoneClient.findOne(Number(id))
                .then(z => {
                    setName(z.name);
                    setDescription(z.description || '');
                    const geomStr = (z as any).geometry as string | undefined;
                    if (geomStr) {
                        let geom: any = null;
                        try { geom = JSON.parse(geomStr); } catch { geom = null; }
                        const fc: FeatureCollection<Polygon> = geom && geom.type === 'FeatureCollection'
                            ? geom
                            : geom && geom.type === 'Polygon'
                                ? { type: 'FeatureCollection', features: [{ type: 'Feature', geometry: geom, properties: {} }] }
                                : { type: 'FeatureCollection', features: [] };
                        setPolygon(fc);
                    }
                })
                .catch(err => {
                    console.error(err);
                    toast.error('Không thể tải No-Fly Zone');
                    navigate('/no-fly-zones');
                })
                .finally(() => setLoading(false));
        }
    }, [isEdit, id, navigate]);

    const handleSubmit = async () => {
        try {
            if (!name.trim()) {
                toast.error('Tên là bắt buộc');
                return;
            }
            const polyGeom = polygon?.features?.[0]?.geometry;
            if (!polyGeom || polyGeom.type !== 'Polygon') {
                toast.error('Vui lòng vẽ polygon hợp lệ');
                return;
            }
            const geometry = JSON.stringify(polyGeom);
            const desc = description !== undefined && description !== null ? String(description) : undefined;
            if (isEdit && id) {
                await NoFlyZoneClient.update(Number(id), { name: name.trim(), description: desc, zoneType, geometry });
                toast.success('Cập nhật No-Fly Zone thành công');
            } else {
                await NoFlyZoneClient.create({ name: name.trim(), description: desc, zoneType, geometry });
                toast.success('Tạo No-Fly Zone thành công');
            }
            navigate('/no-fly-zones');
        } catch (e: any) {
            console.error(e);
            toast.error(e?.response?.data?.message || 'Lưu No-Fly Zone thất bại');
        }
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>{isEdit ? 'Chỉnh sửa No-Fly Zone' : 'Tạo No-Fly Zone'}</CardTitle>
                <CardDescription>Vẽ vùng cấm bay và lưu lại</CardDescription>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="text-center py-8 text-muted-foreground">Đang tải...</div>
                ) : (
                    <div className="space-y-6">
                        <Field>
                            <FieldLabel>Tên *</FieldLabel>
                            <Input 
                                value={name} 
                                onChange={e => setName(e.target.value)} 
                                placeholder="VD: Khu quân sự A" 
                            />
                            <FieldDescription>Nhập tên cho No-Fly Zone</FieldDescription>
                        </Field>
                        <Field>
                            <FieldLabel>Mô tả</FieldLabel>
                            <Input 
                                value={description} 
                                onChange={e => setDescription(e.target.value)} 
                                placeholder="Mô tả về vùng cấm bay (tùy chọn)" 
                            />
                            <FieldDescription>Thông tin bổ sung về No-Fly Zone</FieldDescription>
                        </Field>
                        <Field>
                            <FieldLabel>Bản đồ *</FieldLabel>
                            <div className="space-y-4">
                                <MapboxPolygonEditor 
                                    value={polygon} 
                                    onChange={setPolygon} 
                                    style={{ height: '500px', width: '100%' }} 
                                />
                                <div className="mt-4">
                                    <div className="text-sm font-semibold mb-2">Toạ độ (lon, lat)</div>
                                    {(() => {
                                        const ring = ringFromFeatureCollection(polygon);
                                        if (!ring || ring.length === 0) {
                                            return (
                                                <div className="text-xs text-muted-foreground p-3 rounded border bg-muted/30">
                                                    Chưa có polygon. Vẽ polygon trên bản đồ để hiển thị toạ độ.
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
                                                        <div key={idx} className="grid grid-cols-3 gap-2 text-xs py-2 border-b last:border-b-0">
                                                            <div className="font-medium">{idx}</div>
                                                            <div className="font-mono">{Number(lon).toFixed(6)}</div>
                                                            <div className="font-mono">{Number(lat).toFixed(6)}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>
                            </div>
                            <FieldDescription>Vẽ polygon trên bản đồ để định nghĩa vùng cấm bay</FieldDescription>
                        </Field>
                    </div>
                )}
            </CardContent>
            <CardFooter>
                <Field orientation="horizontal">
                    <Button variant="outline" type="button" onClick={() => navigate('/no-fly-zones')}>
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
