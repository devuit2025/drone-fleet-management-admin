import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

const Dashboard = lazy(() => import('../pages/Dashboard'));
const UserCreate = lazy(() => import('../pages/models/user/UserCreate'));
const DroneList = lazy(() => import('../pages/models/drone/DroneList'));

export const routes: RouteObject[] = [
    {
        path: '/',
        element: <Dashboard />,
    },
    {
        path: '/users/create',
        element: <UserCreate />,
    },
    {
        path: '/drones',
        element: <DroneList />,
    },
];
