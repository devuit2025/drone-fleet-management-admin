import { z } from 'zod';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { FormGenerator } from '@/components/form/FormGenerator';
import { type CreateDroneBrandDto, type UpdateDroneBrandDto, DroneBrandClient } from '@/api/models/drone-brand/droneBrandClient';
import { DroneBrandMutation } from '@/api/models/drone-brand/droneBrandMutation';
import { AutoBreadcrumb } from '@/components/breadcrumb/AutoBreadcrumb';
import { toast } from 'sonner';

const droneBrandSchema = z.object({
    name: z.string().min(1, { message: 'Tên thương hiệu không được để trống' }),
    country: z.string().optional(),
    website: z.string().url({ message: 'Website không hợp lệ' }).optional().or(z.literal('')),
});

const droneBrandFields = [
    {
        name: 'name',
        label: 'Tên thương hiệu',
        placeholder: 'Nhập tên thương hiệu drone',
    },
    {
        name: 'country',
        label: 'Quốc gia',
        placeholder: 'Nhập quốc gia (tùy chọn)',
    },
    {
        name: 'website',
        label: 'Website',
        placeholder: 'Nhập website (tùy chọn)',
    },
];

export default function DroneBrandEdit() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [loading, setLoading] = useState(true);
    const [defaultValues, setDefaultValues] = useState({ name: '', country: '', website: '' });

    useEffect(() => {
        if (id) {
            DroneBrandClient.findOne(Number(id))
                .then(brand => {
                    setDefaultValues({
                        name: brand.name,
                        country: brand.country || '',
                        website: brand.website || '',
                    });
                    setLoading(false);
                })
                .catch(err => {
                    console.error(err);
                    toast.error('Không thể tải thông tin thương hiệu');
                    setLoading(false);
                    navigate('/drone-brand');
                });
        } else {
            setLoading(false);
        }
    }, [id, navigate]);

    const handleSubmit = async (values: z.infer<typeof droneBrandSchema>) => {
        if (!id) return;
        const payload: UpdateDroneBrandDto = {
            name: values.name,
            country: values.country || undefined,
            website: values.website || undefined,
        };

        try {
            await DroneBrandMutation.update(Number(id), payload);
            navigate('/drone-brand');
            toast.success('Cập nhật thương hiệu thành công!');
        } catch (err: any) {
            console.error(err);
            toast.error(err?.response?.data?.message || 'Cập nhật thương hiệu thất bại');
        }
    };

    if (loading) {
        return (
            <div>
                <AutoBreadcrumb />
                <div className="text-center py-8 text-muted-foreground">Đang tải dữ liệu...</div>
            </div>
        );
    }

    return (
        <div>
            <AutoBreadcrumb />
            <FormGenerator
                schema={droneBrandSchema}
                fields={droneBrandFields}
                defaultValues={defaultValues}
                onSubmit={handleSubmit}
                title="Chỉnh sửa thương hiệu drone"
                description="Cập nhật thông tin thương hiệu drone"
            />
        </div>
    );
}

