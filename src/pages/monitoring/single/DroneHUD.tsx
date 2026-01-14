import { useActiveDroneStore } from '@/stores/active/useActiveDroneStore';

function DroneHUD({ droneId }: { droneId: string }) {
    const drone = useActiveDroneStore(s => s.drones[droneId]);

    if (!drone) return null;

    return (
        <div className="absolute bottom-4 left-4 bg-black/70 text-white p-4 rounded">
            <div>ID: {droneId}</div>
            <div>Alt: {drone.position.altitudeM?.toFixed(1)} m</div>
            <div>Speed: {drone.motion.speedMps?.toFixed(1)} m/s</div>
            <div>Mode: {drone.system.mode}</div>
        </div>
    );
}
