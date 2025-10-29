import { Drone } from 'lucide-react';
import { type ReactNode } from 'react';

interface AuthLayoutProps {
    children: ReactNode;
    title?: string;
}

export function AuthLayout({ children, title }: AuthLayoutProps) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 relative overflow-hidden">
                {/* Subtle decorative shape */}
                <div className="absolute -top-10 -left-10 w-32 h-32 bg-blue-200 rounded-full opacity-20"></div>

                {/* Header */}
                <div className="flex flex-col items-center mb-8">
                    <Drone className="h-16 w-16 text-blue-600 mb-3" />
                    <span className="font-extrabold text-2xl text-gray-800 mb-1">DroneFleet</span>
                    <span className="text-sm text-gray-500 text-center">
                        Quản lý đội bay Drone — Nâng cao hiệu suất & giám sát thông minh
                    </span>
                </div>

                {/* Optional title */}
                {title && (
                    <h2 className="text-xl font-semibold text-gray-700 mb-4 text-center">
                        {title}
                    </h2>
                )}

                {/* Form / content */}
                {children}
            </div>
        </div>
    );
}
