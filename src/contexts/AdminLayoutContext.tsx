import { createContext, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';

interface AdminLayoutContextType {
    isActive: (path: string) => boolean;
    collapsed: boolean;
    toggleCollapse: () => void;
}

const AdminLayoutContext = createContext<AdminLayoutContextType | undefined>(undefined);

export function AdminLayoutProvider({ children }: { children: ReactNode }) {
    const [collapsed, setCollapsed] = useState(false);
    const location = useLocation();
    const isActive = (path: string) => {
        // Customize match rule here (startsWith, equals, regex, etc.)
        return location.pathname === path;
    };

    const toggleCollapse = () => setCollapsed(prev => !prev);

    const value = useMemo(
        () => ({ collapsed, toggleCollapse, isActive }),
        [collapsed, location.pathname],
    );

    return <AdminLayoutContext.Provider value={value}>{children}</AdminLayoutContext.Provider>;
}

export function useAdminLayout() {
    const context = useContext(AdminLayoutContext);
    if (!context) throw new Error('useAdminLayout must be used within AdminLayoutProvider');
    return context;
}
