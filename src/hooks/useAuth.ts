// src/hooks/useAuth.ts
import { login as loginApi } from '@/api/auth';
import { useAuthStore } from '../stores/useAuthStore';

export function useLogin() {
    const setToken = useAuthStore(s => s.setToken);
    const setUser = useAuthStore(s => s.setUser);

    const login = async (email: string, password: string) => {
        const { data } = await loginApi({ email, password });
        setToken(data.token);
        setUser(data.user);
        return data;
    };

    return { login };
}

export function useLogout() {
    const logout = useAuthStore(s => s.logout);

    const handleLogout = () => {
        logout();
    };

    return { logout: handleLogout };
}
