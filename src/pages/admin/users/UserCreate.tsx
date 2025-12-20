import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserForm } from './UserForm';
import { AutoBreadcrumb } from '@/components/breadcrumb/AutoBreadcrumb';
import { UserClient } from '@/api/models/user/userClient';
import { toast } from 'sonner';

export default function UserCreate() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (data: any) => {
        if (!data.password) {
            toast.error('Password is required for new users');
            return;
        }

        setLoading(true);
        try {
            await UserClient.create({
                name: data.name,
                email: data.email,
                password: data.password,
                role: data.role,
            });
            toast.success('User created successfully');
            navigate('/admin/users');
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Failed to create user');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <AutoBreadcrumb />

            <div>
                <h1 className="text-3xl font-bold tracking-tight">Create New User</h1>
                <p className="text-muted-foreground">
                    Add a new user to the system with appropriate role and permissions
                </p>
            </div>

            <UserForm onSubmit={handleSubmit} loading={loading} />
        </div>
    );
}

