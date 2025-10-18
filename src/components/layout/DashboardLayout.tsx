import type { ReactNode } from 'react';
import { Header } from './Header';
import { Sidebar } from '../sidebar/Sidebar';

export function DashboardLayout({ children }: { children: ReactNode }) {
    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <div className="flex flex-col flex-1">
                <Header />
                <main className="flex-1 overflow-y-auto p-6 bg-muted/10">{children}</main>
            </div>
        </div>
    );
}
