import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PrivateRoute } from '@/components/navigation/PrivateRoute';
import { PublicRoute } from '@/components/navigation/PublicRoute';
import Login from '@/pages/auth/Login';
import DroneBrandCreate from '@/pages/models/drone-branch/DroneBranchCreate';
import DroneBrandList from '@/pages/models/drone-branch/DroneBrandList';
import DroneCategoryList from '@/pages/models/drone-category/DroneCategoryList';
import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

const Dashboard = lazy(() => import('../pages/Dashboard'));
const DroneList = lazy(() => import('../pages/models/drone/DroneList'));
const DroneControl = lazy(() => import('../pages/control/DroneControl'));

export const routes: RouteObject[] = [
    // Public route (no layout)
    {
        path: '/login',
        element: (
            <PublicRoute>
                <Login />
            </PublicRoute>
        ),
    },

    // Protected section with Dashboard layout
    {
        path: '/',
        element: (
            <PrivateRoute>
                <DashboardLayout />
            </PrivateRoute>
        ),
        children: [
            { index: true, element: <Dashboard /> },
            { path: 'drones', element: <DroneList /> },
            { path: 'drones/create', element: <DroneList /> },
            { path: 'brands', element: <DroneBrandList /> },
            { path: 'brands/create', element: <DroneBrandCreate /> },

            { path: 'categories', element: <DroneCategoryList /> },

            { path: 'control', element: <DroneControl /> },
        ],
    },
];

// export const routes: RouteObject[] = [
//     {
//         path: '/',
//         element: <Dashboard />,
//     },
//     {
//         path: '/users/create',
//         element: <UserCreate />,
//     },
//     {
//         path: '/drones',
//         element: <DroneList />,
//     },
//     {
//         path: '/drones/create',
//         element: <DroneCreate />,
//     },
//     {
//         path: '/branchs',
//         element: <DroneBranchList />,
//     },
//     {
//         path: '/categories',
//         element: <DroneCategoryList />,
//     },
//     {
//         path: '/monitoring/map',
//         element: <MonitoringMap />,
//     },
//     // {
//     //     path: '/monitoring/map-view',
//     //     element: <MapView />,
//     // },

// ];
