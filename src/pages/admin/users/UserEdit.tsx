import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { UserForm } from './UserForm';
import { AutoBreadcrumb } from '@/components/breadcrumb/AutoBreadcrumb';
import { UserClient, type User } from '@/api/models/user/userClient';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function UserEdit() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        if (id) {
            fetchUser(parseInt(id));
        }
    }, [id]);

    const fetchUser = async (userId: number) => {
        setFetching(true);
        try {
            const response = await UserClient.getById(userId);
            setUser(response as unknown as User);
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Failed to fetch user');
            console.error(error);
            navigate('/admin/users');
        } finally {
            setFetching(false);
        }
    };

    const handleSubmit = async (data: any) => {
        if (!id) return;

        setLoading(true);
        try {
            const updateData: any = {
                name: data.name,
                email: data.email,
                role: data.role,
            };

            // Only include password if it was changed
            if (data.password && data.password.trim() !== '') {
                updateData.password = data.password;
            }

            await UserClient.update(parseInt(id), updateData);
            toast.success('User updated successfully');
            navigate('/admin/users');
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Failed to update user');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <p className="text-muted-foreground">User not found</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <AutoBreadcrumb />

            <div>
                <h1 className="text-3xl font-bold tracking-tight">Edit User</h1>
                <p className="text-muted-foreground">
                    Update user information and permissions
                </p>
            </div>

            <UserForm user={user} onSubmit={handleSubmit} loading={loading} isEdit />
        </div>
    );
}

