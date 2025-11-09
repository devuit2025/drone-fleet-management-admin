import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { FormGenerator } from '@/components/form/FormGenerator';
import { type CreateDroneCategoryDto } from '@/api/models/drone-category/droneCategoryClient';
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

export default function DroneCategoryCreate() {
    const navigate = useNavigate();

    const handleSubmit = async (values: z.infer<typeof droneCategorySchema>) => {
        const payload: CreateDroneCategoryDto = {
            name: values.name,
            description: values.description || undefined,
        };

        try {
            await DroneCategoryMutation.create(payload);
            navigate('/drone-category');
            toast.success('Drone category created successfully!');
        } catch (err: any) {
            console.error(err);
            toast.error(err?.response?.data?.message || 'Failed to create drone category');
        }
    };

    return (
        <div>
            <AutoBreadcrumb />
            <FormGenerator
                schema={droneCategorySchema}
                fields={droneCategoryFields}
                defaultValues={{ name: '', description: '' }}
                onSubmit={handleSubmit}
                title="Thêm danh mục drone"
                description="Nhập thông tin danh mục drone để quản lý"
            />
        </div>
    );
}

