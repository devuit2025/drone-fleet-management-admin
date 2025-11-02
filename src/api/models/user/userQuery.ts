import { useQuery } from '@tanstack/react-query';
import { UserClient } from './userClient';

export const useUsersQuery = () =>
    useQuery({
        queryKey: ['users'],
        queryFn: UserClient.getAll,
    });

export const useUserQuery = (id?: number) =>
    useQuery({
        queryKey: ['user', id],
        queryFn: () => UserClient.getById(id!),
        enabled: !!id,
    });
