// /src/api/auth.ts
import { api } from './axios';

export type LoginDto = {
    email: string;
    password: string;
};

export type LoginResponse = {
    data: {
        token: string;
        user: {
            id: string;
            email: string;
            name?: string;
        };
    };
};

export async function login(credentials: LoginDto): Promise<LoginResponse> {
    return api.post('/auth/login', credentials);
}
