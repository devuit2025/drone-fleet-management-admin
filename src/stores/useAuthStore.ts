// src/stores/useAuthStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type User = {
    id: string;
    email: string;
    name?: string;
    // add other fields
};

type AuthState = {
    user: User | null;
    accessToken: string | null;
    setUser: (u: User | null) => void;
    setToken: (token: string | null) => void;
    logout: () => void;
};

export const useAuthStore = create<AuthState>()(
    persist(
        set => ({
            user: null,
            accessToken: null,
            setUser: u => set({ user: u }),
            setToken: token => {
                // keep localStorage in sync for apiFetch convenience
                if (token) localStorage.setItem('access_token', token);
                else localStorage.removeItem('access_token');
                set({ accessToken: token });
            },
            logout: () => {
                localStorage.removeItem('access_token');
                set({ user: null, accessToken: null });
            },
        }),
        {
            name: 'auth-storage', // key in storage
            // you can provide options like getStorage: () => sessionStorage if you prefer
        },
    ),
);
