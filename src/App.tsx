// src/app.tsx
import './App.css';
import { Suspense, useCallback, useEffect } from 'react';
import { useRoutes } from 'react-router-dom';
import { routes } from './routes';
import { useActiveDroneStore } from '@/stores/active/useActiveDroneStore';
import { useDroneSubscriptions } from './hooks/useDroneSubscriptions';
import { useWebSocket } from './providers/WebSocketProvider';
import { DroneTelemetryMapper } from './services/drone/DroneTelemetryMapper';
function App() {
    const routing = useRoutes(routes);
    const drones = useActiveDroneStore(s => s.drones);
    // useDroneSubscriptions();
  

    const { subscribe, unsubscribe, send } = useWebSocket();
    useEffect(() => {
        subscribe('telemetry:data', handleUpdateTelemetry);

        return () => {
            unsubscribe('telemetry:data', handleUpdateTelemetry);
        };
    });

    const handleUpdateTelemetry = useCallback(
        (data: { droneId: string; telemetry: any } | any) => {
            console.log("Update telemetry: ", data.telemetry)
            const map = DroneTelemetryMapper.toActiveDroneStateFromDJIMini3Pro(data.telemetry);
            useActiveDroneStore.getState().upsertDrone(data.droneId, map);
        }, [drones],
    );

    // const testSend = () => {
    //     const message = {
    //         action: 'telemetry:data',
    //         payload: {
    //             droneId: import.meta.env.VITE_DJI_MINI_3_PRO_ID,
    //             telemetry: {
    //                 latitude: 10.76315, // ~60–70m north of center
    //                 longitude: 106.66542, // ~70m east of center
    //                 altitude: 48.6, // meters AGL
    //                 heading: 132.4, // degrees (SE direction)
    //                 speed: 11.8, // m/s (~42 km/h)
    //                 battery: 67, // percent
    //             },
    //         },
    //     };
    //     send(message);
    // };
    // setInterval(() => {
    //     testSend();
    // }, 1000);
    
    const { activeDroneInit } = useActiveDroneStore();

    useEffect(() => {
        activeDroneInit();
    }, []);

    return (
        // <DashboardLayout>
        // This for testing only
        // <div>
        //     <div>
        //         <h2>Drone List</h2>
        //         <ul>
        //             {Object.entries(drones).map(([droneId, drone]) => (
        //                 <li key={droneId}>
        //                     {droneId} possition: {drone.position.lat}
        //                 </li>
        //             ))}
        //         </ul>
        //     </div>
        <Suspense fallback={<div>Loading...</div>}>{routing}</Suspense>
        // </div>
        // </DashboardLayout>
    );
}

export default App;
