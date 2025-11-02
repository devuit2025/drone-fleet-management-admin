import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from '../sidebar/Sidebar';
import { AdminLayoutProvider } from '@/contexts/AdminLayoutContext';

export function DashboardLayout() {
    return (
        <AdminLayoutProvider>
            <div className="flex h-screen overflow-hidden">
                <Sidebar />
                <div className="flex flex-col flex-1">
                    <Header />

                    <main className="flex-1 overflow-y-auto p-6 bg-muted/10">
                        <Outlet />
                    </main>
                </div>
            </div>
        </AdminLayoutProvider>
    );
}
