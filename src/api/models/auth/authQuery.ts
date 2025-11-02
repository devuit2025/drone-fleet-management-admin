import { AuthClient } from './authClient';
import type { AuthResponse } from './authClient';

export const AuthQuery = {
    async me(): Promise<AuthResponse> {
        const res = await AuthClient.get('/me');
        return res.data;
    },
};
