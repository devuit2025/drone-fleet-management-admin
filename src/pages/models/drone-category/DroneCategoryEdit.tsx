import { z } from 'zod';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { FormGenerator } from '@/components/form/FormGenerator';
import { type CreateDroneCategoryDto, type UpdateDroneCategoryDto, DroneCategoryClient } from '@/api/models/drone-category/droneCategoryClient';
import { DroneCategoryMutation } from '@/api/models/drone-category/droneCategoryMutation';
import { AutoBreadcrumb } from '@/components/breadcrumb/AutoBreadcrumb';
import { toast } from 'sonner';

const droneCategorySchema = z.object({
    name: z.string().min(1, { message: 'Tên danh mục không được để trống' }),
    description: z.string().optional(),
});

const droneCategoryFields = [
    {
        name: 'name',
        label: 'Tên danh mục',
        placeholder: 'Nhập tên danh mục drone',
    },
    {
        name: 'description',
        label: 'Mô tả',
        type: 'textarea' as const,
        placeholder: 'Nhập mô tả (tùy chọn)',
    },
];

export default function DroneCategoryEdit() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [loading, setLoading] = useState(true);
    const [defaultValues, setDefaultValues] = useState({ name: '', description: '' });

    useEffect(() => {
        if (id) {
            DroneCategoryClient.findOne(Number(id))
                .then(category => {
                    setDefaultValues({
                        name: category.name,
                        description: category.description || '',
                    });
                    setLoading(false);
                })
                .catch(err => {
                    console.error(err);
                    toast.error('Không thể tải thông tin danh mục');
                    setLoading(false);
                    navigate('/drone-category');
                });
        } else {
            setLoading(false);
        }
    }, [id, navigate]);

    const handleSubmit = async (values: z.infer<typeof droneCategorySchema>) => {
        if (!id) return;
        const payload: UpdateDroneCategoryDto = {
            name: values.name,
            description: values.description || undefined,
        };

        try {
            await DroneCategoryMutation.update(Number(id), payload);
            navigate('/drone-category');
            toast.success('Cập nhật danh mục thành công!');
        } catch (err: any) {
            console.error(err);
            toast.error(err?.response?.data?.message || 'Cập nhật danh mục thất bại');
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
                schema={droneCategorySchema}
                fields={droneCategoryFields}
                defaultValues={defaultValues}
                onSubmit={handleSubmit}
                title="Chỉnh sửa danh mục drone"
                description="Cập nhật thông tin danh mục drone"
            />
        </div>
    );
}

