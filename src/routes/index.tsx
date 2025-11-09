import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PrivateRoute } from '@/components/navigation/PrivateRoute';
import { PublicRoute } from '@/components/navigation/PublicRoute';
import Login from '@/pages/auth/Login';
import DroneBrandCreate from '@/pages/models/drone-brand/DroneBrandCreate';
import DroneBrandEdit from '@/pages/models/drone-brand/DroneBrandEdit';
import DroneBrandList from '@/pages/models/drone-brand/DroneBrandList';
import DroneCategoryList from '@/pages/models/drone-category/DroneCategoryList';
import DroneCategoryCreate from '@/pages/models/drone-category/DroneCategoryCreate';
import DroneCategoryEdit from '@/pages/models/drone-category/DroneCategoryEdit';
import DroneCreate from '@/pages/models/drone/DroneCreate';
import DroneEdit from '@/pages/models/drone/DroneEdit';
import PilotList from '@/pages/models/pilot/PilotList';
import PilotCreate from '@/pages/models/pilot/PilotCreate';
import PilotEdit from '@/pages/models/pilot/PilotEdit';
import MissionList from '@/pages/models/mission/MissionList';
import MissionCreate from '@/pages/models/mission/MissionCreate';
import MissionEdit from '@/pages/models/mission/MissionEdit';
import DroneModelList from '@/pages/models/drone-model/DroneModelList';
import DroneModelCreate from '@/pages/models/drone-model/DroneModelCreate';
import DroneModelEdit from '@/pages/models/drone-model/DroneModelEdit';
import DroneSensorList from '@/pages/models/drone-sensor/DroneSensorList';
import DroneSensorCreate from '@/pages/models/drone-sensor/DroneSensorCreate';
import DroneSensorEdit from '@/pages/models/drone-sensor/DroneSensorEdit';
import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

const Dashboard = lazy(() => import('../pages/Dashboard'));
const DroneList = lazy(() => import('../pages/models/drone/DroneList'));
const DroneControl = lazy(() => import('../pages/control/DroneControl'));
const MavlinkDemo = lazy(() => import('../pages/demo/MavlinkDemo'));

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
            { path: 'drones/create', element: <DroneCreate /> },
            { path: 'drones/edit/:id', element: <DroneEdit /> },
            { path: 'drone-brand', element: <DroneBrandList /> },
            { path: 'drone-brand/create', element: <DroneBrandCreate /> },
            { path: 'drone-brand/edit/:id', element: <DroneBrandEdit /> },
            { path: 'drone-category', element: <DroneCategoryList /> },
            { path: 'drone-category/create', element: <DroneCategoryCreate /> },
            { path: 'drone-category/edit/:id', element: <DroneCategoryEdit /> },
            { path: 'pilots', element: <PilotList /> },
            { path: 'pilots/create', element: <PilotCreate /> },
            { path: 'pilots/edit/:id', element: <PilotEdit /> },
            { path: 'missions', element: <MissionList /> },
            { path: 'missions/create', element: <MissionCreate /> },
            { path: 'missions/edit/:id', element: <MissionEdit /> },
            { path: 'drone-models', element: <DroneModelList /> },
            { path: 'drone-models/create', element: <DroneModelCreate /> },
            { path: 'drone-models/edit/:id', element: <DroneModelEdit /> },
            { path: 'drone-sensors', element: <DroneSensorList /> },
            { path: 'drone-sensors/create', element: <DroneSensorCreate /> },
            { path: 'drone-sensors/edit/:id', element: <DroneSensorEdit /> },

            { path: 'control', element: <DroneControl /> },
            { path: 'demo/mavlink', element: <MavlinkDemo /> },
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
