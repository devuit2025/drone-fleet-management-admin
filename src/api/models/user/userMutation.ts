import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UserClient, type CreateUserDto, type UpdateUserDto } from './userClient';

export const useCreateUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateUserDto) => UserClient.create(data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
    });
};

export const useUpdateUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateUserDto }) =>
            UserClient.update(id, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
    });
};

export const useDeleteUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => UserClient.delete(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
    });
};
