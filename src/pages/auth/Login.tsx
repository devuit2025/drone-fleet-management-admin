import { z } from 'zod';
import { toast } from 'sonner';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { FormGenerator } from '@/components/form/FormGenerator';
import { Drone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLogin } from '@/hooks/useAuth';

// -------- Zod schema for login --------
const loginSchema = z.object({
    email: z.string().email({ message: 'Địa chỉ email không hợp lệ' }),
    password: z.string().min(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' }),
});

// -------- Fields definition --------
const loginFields = [
    {
        name: 'email',
        label: 'Email',
        placeholder: 'ban@example.com',
    },
    {
        name: 'password',
        label: 'Mật khẩu',
        placeholder: 'Nhập mật khẩu của bạn',
        inputType: 'password',
    },
];

export default function LoginPage() {
    const { login } = useLogin();
    const handleSubmit = (values: z.infer<typeof loginSchema>) => {
        login(values.email, values.password);
        console.log('Thông tin đăng nhập:', values);
        toast.success('Đăng nhập thành công!');
    };

    return (
        <AuthLayout>
            <FormGenerator
                schema={loginSchema}
                fields={loginFields}
                defaultValues={{ email: '', password: '' }}
                onSubmit={handleSubmit}
                title="Đăng nhập"
                description="Nhập thông tin tài khoản để quản lý đội bay drone của bạn"
            />
        </AuthLayout>
    );
}
