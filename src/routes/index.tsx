import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

const Dashboard = lazy(() => import('../pages/Dashboard'));
const UserCreate = lazy(() => import('../pages/models/user/UserCreate'));

export const routes: RouteObject[] = [
    {
        path: '/',
        element: <Dashboard />,
    },
    {
        path: '/users/create',
        element: <UserCreate />,
    },
];
