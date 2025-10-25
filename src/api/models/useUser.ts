import { api } from '../axios';

export interface User {
    id?: number;
    name: string;
    email: string;
    role: 'admin' | 'user';
}

export const createUser = async (user: User) => {
    const { data } = await api.post<User>('/users', user);
    return data;
};
