// src/components/navigation/PrivateRoute.tsx
import React, { type JSX } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';

interface PrivateRouteProps {
    children: JSX.Element;
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
    const token = useAuthStore(s => s.token);
    const location = useLocation();

    if (!token) {
        // Redirect to login page and preserve the attempted path
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // If logged in, render the protected component
    return children;
};
