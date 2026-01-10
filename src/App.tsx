// src/app.tsx
import './App.css';
import { Suspense, useEffect } from 'react';
import { useRoutes } from 'react-router-dom';
import { routes } from './routes';
import { useActiveDroneStore } from '@/stores/active/useActiveDroneStore';
import { useDroneSubscriptions } from './hooks/useDroneSubscriptions';
function App() {
    const routing = useRoutes(routes);

    useDroneSubscriptions();

    const { activeDroneInit, drones } = useActiveDroneStore();

    useEffect(() => {
        activeDroneInit();
    }, []);

    return (
        // <DashboardLayout>
        <div>
            <div>
                <h2>Drone List</h2>
                <ul>
                    {Object.entries(drones).map(([droneId, drone]) => (
                        <li key={droneId}>
                            {droneId} possition: {drone.position.lat}
                        </li>
                    ))}
                </ul>
            </div>
            <Suspense fallback={<div>Loading...</div>}>{routing}</Suspense>
        </div>
        // </DashboardLayout>
    );
}

export default App;
