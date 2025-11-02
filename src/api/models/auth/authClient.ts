import axios from 'axios';

export type UserRole = 'admin' | 'operator' | 'viewer';

export interface User {
    id: number;
    name: string;
    email: string;
    role: UserRole;
    createdAt?: string;
    updatedAt?: string;
}

export interface AuthResponse {
    user: User;
    token: string;
}

export interface RegisterDto {
    name: string;
    email: string;
    password: string;
    role?: UserRole;
}

export interface LoginDto {
    email: string;
    password: string;
}

export const AuthClient = axios.create({
    baseURL: '/api/v1/auth',
    withCredentials: true,
});
