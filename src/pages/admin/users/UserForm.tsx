import { useForm } from '@tanstack/react-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Field, FieldLabel } from '@/components/ui/field';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import type { User, UserRole } from '@/api/models/user/userClient';

export interface UserFormData {
    name: string;
    email: string;
    password: string;
    role: UserRole;
}

interface UserFormProps {
    user?: User;
    onSubmit: (data: UserFormData) => Promise<void>;
    loading?: boolean;
    isEdit?: boolean;
}

export function UserForm({ user, onSubmit, loading = false, isEdit = false }: UserFormProps) {
    const form = useForm({
        defaultValues: {
            name: user?.name || '',
            email: user?.email || '',
            password: '',
            role: (user?.role || 'viewer') as UserRole,
        },
        onSubmit: async ({ value }) => {
            await onSubmit(value);
        },
    });

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>{isEdit ? 'Chỉnh sửa User' : 'Tạo User mới'}</CardTitle>
            </CardHeader>
            <CardContent>
                <form
                    id="user-form"
                    onSubmit={e => {
                        e.preventDefault();
                        form.handleSubmit();
                    }}
                    className="space-y-4"
                >
                    {/* Name */}
                    <form.Field name="name">
                        {field => (
                            <Field>
                                <FieldLabel htmlFor={field.name}>Name *</FieldLabel>
                                <Input
                                    id={field.name}
                                    name={field.name}
                                    value={field.state.value}
                                    onChange={e => field.handleChange(e.target.value)}
                                    placeholder="Enter full name"
                                    autoComplete="off"
                                />
                            </Field>
                        )}
                    </form.Field>

                    {/* Email */}
                    <form.Field name="email">
                        {field => (
                            <Field>
                                <FieldLabel htmlFor={field.name}>Email *</FieldLabel>
                                <Input
                                    id={field.name}
                                    name={field.name}
                                    type="email"
                                    value={field.state.value}
                                    onChange={e => field.handleChange(e.target.value)}
                                    placeholder="user@example.com"
                                    autoComplete="off"
                                />
                            </Field>
                        )}
                    </form.Field>

                    {/* Password */}
                    <form.Field name="password">
                        {field => (
                            <Field>
                                <FieldLabel htmlFor={field.name}>
                                    Password {!isEdit && '*'}
                                    {isEdit && (
                                        <span className="text-muted-foreground text-xs ml-2">
                                            (Leave blank to keep current)
                                        </span>
                                    )}
                                </FieldLabel>
                                <Input
                                    id={field.name}
                                    name={field.name}
                                    type="password"
                                    value={field.state.value}
                                    onChange={e => field.handleChange(e.target.value)}
                                    placeholder={isEdit ? 'Enter new password' : 'Enter password'}
                                    autoComplete="off"
                                />
                            </Field>
                        )}
                    </form.Field>

                    {/* Role */}
                    <form.Field name="role">
                        {field => (
                            <Field>
                                <FieldLabel htmlFor={field.name}>Role *</FieldLabel>
                                <Select
                                    value={field.state.value}
                                    onValueChange={value => field.handleChange(value as UserRole)}
                                >
                                    <SelectTrigger className="w-full" id={field.name}>
                                        <SelectValue placeholder="Select role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="admin">Admin</SelectItem>
                                        <SelectItem value="operator">Operator</SelectItem>
                                        <SelectItem value="viewer">Viewer</SelectItem>
                                    </SelectContent>
                                </Select>
                            </Field>
                        )}
                    </form.Field>
                </form>
            </CardContent>
            <CardFooter>
                <Field orientation="horizontal">
                    <Button type="button" variant="outline" onClick={() => window.history.back()}>
                        Cancel
                    </Button>
                    <Button type="submit" form="user-form" disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isEdit ? 'Update User' : 'Create User'}
                    </Button>
                </Field>
            </CardFooter>
        </Card>
    );
}
