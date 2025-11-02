import { z } from 'zod';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { FormGenerator } from '@/components/form/FormGenerator';
import { useLogin } from '@/hooks/useAuth';

const loginSchema = z.object({
    email: z.string().email({ message: 'Địa chỉ email không hợp lệ' }),
    password: z.string().min(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' }),
});

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
    const navigate = useNavigate();
    
    const handleSubmit = async (values: z.infer<typeof loginSchema>) => {
        try {
            await login(values.email, values.password);
            toast.success('Đăng nhập thành công!');
            navigate('/');
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại email và mật khẩu.');
        }
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
