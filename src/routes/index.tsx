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
import NoFlyZoneList from '@/pages/models/no-fly-zone/NoFlyZoneList';
import NoFlyZoneCreate from '@/pages/models/no-fly-zone/NoFlyZoneCreate';
import NoFlyZoneEdit from '@/pages/models/no-fly-zone/NoFlyZoneEdit';
import LicenseList from '@/pages/models/license/LicenseList';
import LicenseCreate from '@/pages/models/license/LicenseCreate';
import LicenseEdit from '@/pages/models/license/LicenseEdit';
import LicenseWithPermitCreate from '@/pages/models/license/LicenseWithPermitCreate';
import FlightPermitList from '@/pages/models/flight-permit/FlightPermitList';
import FlightPermitCreate from '@/pages/models/flight-permit/FlightPermitCreate';
import FlightPermitEdit from '@/pages/models/flight-permit/FlightPermitEdit';
import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

const Dashboard = lazy(() => import('../pages/dashboard/Dashboard'));
const DroneList = lazy(() => import('../pages/models/drone/DroneList'));
const DroneControl = lazy(() => import('../pages/control/DroneControl'));
const MavlinkDemo = lazy(() => import('../pages/demo/MavlinkDemo'));
const EnhancedMonitoringMap = lazy(() => import('../pages/monitoring/EnhancedMonitoringMap'));
const FlightsAnalytics = lazy(() => import('../pages/analytics/FlightsAnalytics'));
const Reports = lazy(() => import('../pages/analytics/Reports'));
const Trends = lazy(() => import('../pages/analytics/Trends'));
const UserList = lazy(() => import('../pages/admin/users/UserList'));
const UserCreate = lazy(() => import('../pages/admin/users/UserCreate'));
const UserEdit = lazy(() => import('../pages/admin/users/UserEdit'));
// const Logs = lazy(() => import('../pages/admin/logs/Logs'));
const AlertsLogs = lazy(() => import('../pages/alerts/AlertsLogs'));

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

            { path: 'no-fly-zones', element: <NoFlyZoneList /> },
            { path: 'no-fly-zones/create', element: <NoFlyZoneCreate /> },
            { path: 'no-fly-zones/:id/edit', element: <NoFlyZoneEdit /> },
            { path: 'licenses', element: <LicenseList /> },
            { path: 'licenses/create', element: <LicenseCreate /> },
            { path: 'licenses/edit/:id', element: <LicenseEdit /> },
            { path: 'licenses/create-with-permit', element: <LicenseWithPermitCreate /> },
            { path: 'flight-permits', element: <FlightPermitList /> },
            { path: 'flight-permits/create', element: <FlightPermitCreate /> },
            { path: 'flight-permits/:id/edit', element: <FlightPermitEdit /> },

            { path: 'control', element: <DroneControl /> },
            { path: 'demo/mavlink', element: <MavlinkDemo /> },
            { path: 'monitoring', element: <EnhancedMonitoringMap /> },

            // Analytics routes
            { path: 'analytics/flights', element: <FlightsAnalytics /> },
            { path: 'analytics/reports', element: <Reports /> },
            { path: 'analytics/trends', element: <Trends /> },

            // Admin routes
            { path: 'admin/users', element: <UserList /> },
            { path: 'admin/users/create', element: <UserCreate /> },
            { path: 'admin/users/edit/:id', element: <UserEdit /> },
            // { path: 'admin/logs', element: <Logs /> },

            // Alerts routes
            { path: 'alerts/logs', element: <AlertsLogs /> },
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
