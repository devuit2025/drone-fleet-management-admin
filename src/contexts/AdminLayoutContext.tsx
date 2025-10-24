import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface AdminLayoutContextType {
    collapsed: boolean;
    toggleCollapse: () => void;
}

const AdminLayoutContext = createContext<AdminLayoutContextType | undefined>(undefined);

export function AdminLayoutProvider({ children }: { children: ReactNode }) {
    const [collapsed, setCollapsed] = useState(false);

    const toggleCollapse = () => setCollapsed(prev => !prev);

    return (
        <AdminLayoutContext.Provider value={{ collapsed, toggleCollapse }}>
            {children}
        </AdminLayoutContext.Provider>
    );
}

export function useAdminLayout() {
    const context = useContext(AdminLayoutContext);
    if (!context) throw new Error('useAdminLayout must be used within AdminLayoutProvider');
    return context;
}
