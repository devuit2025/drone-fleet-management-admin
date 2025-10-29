import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PrivateRoute } from '@/components/navigation/PrivateRoute';
import { PublicRoute } from '@/components/navigation/PublicRoute';
import Login from '@/pages/auth/Login';
import DroneCategoryList from '@/pages/models/drone_category/DroneCategoryList';
import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

const Dashboard = lazy(() => import('../pages/Dashboard'));
const UserCreate = lazy(() => import('../pages/models/user/UserCreate'));
const DroneList = lazy(() => import('../pages/models/drone/DroneList'));
const DroneCreate = lazy(() => import('../pages/models/drone/DroneCreate'));
const DroneBranchList = lazy(() => import('../pages/models/drone_branch/DroneBranchList'));
const MonitoringMap = lazy(() => import('../pages/monitoring/MonitoringMap'));

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
            // add more dashboard routes here
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
