// src/components/navigation/PublicRoute.tsx
import React, { type JSX } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';

interface PublicRouteProps {
    children: JSX.Element;
}

export const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
    const token = useAuthStore(s => s.token);
    const location = useLocation();

    if (token) {
        // If the user is logged in, redirect to the dashboard
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    // If not logged in, render the public component
    return children;
};
