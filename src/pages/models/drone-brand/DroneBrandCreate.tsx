import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { AuthLayout } from '@/components/layout/AuthLayout'; // Or any admin layout
import { FormGenerator } from '@/components/form/FormGenerator';
import { type CreateDroneBrandDto } from '@/api/models/drone-brand/droneBrandClient'
import { DroneBrandMutation } from '@/api/models/drone-brand/droneBrandMutation'
import { AutoBreadcrumb } from '@/components/breadcrumb/AutoBreadcrumb';
import { toast } from 'sonner';

const droneBrandSchema = z.object({
  name: z.string().min(1, { message: 'Tên thương hiệu không được để trống' }),
  country: z.string().optional(),
  website: z.string().url({ message: 'Website không hợp lệ' }).optional(),
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

export default function DroneBrandCreate() {
  const navigate = useNavigate();

  const handleSubmit = async (values: z.infer<typeof droneBrandSchema>) => {
    console.log('values', values);
    const payload: CreateDroneBrandDto = {
      name: values.name,
      country: values.country || undefined,
      website: values.website || undefined,
    };

    try {
      await DroneBrandMutation.create(payload);
      navigate('/drone-brands');
      toast.success('Drone brand created successfully!');
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || 'Failed to create drone brand');
    }
  };

  return (
    <div>
        <AutoBreadcrumb />
      <FormGenerator
        schema={droneBrandSchema}
        fields={droneBrandFields}
        defaultValues={{ name: '', country: '', website: '' }}
        onSubmit={handleSubmit}
        title="Thêm thương hiệu drone"
        description="Nhập thông tin thương hiệu drone để quản lý"
      />
    </div>
  );
}
