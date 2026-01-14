import { getDrones } from '@/api/models/drone/droneEndpoint';
import { createEmptyDroneState } from './useActiveDroneHelper';
import type { ActiveDroneState } from './useActiveDroneType';
import { create } from 'zustand';

interface ActiveDroneStore {
    drones: Record<string, ActiveDroneState>;
    upsertDrone: (droneId: string, partial: Partial<ActiveDroneState>) => void;
    activeDroneInit: () => Promise<void>; // <-- add this
}

export const useActiveDroneStore = create<ActiveDroneStore>(set => ({
    drones: {},

    upsertDrone: (droneId, partial) => {
        set(state => {
            const existing = state.drones[droneId] ?? createEmptyDroneState(droneId);

            return {
                drones: {
                    ...state.drones,
                    [droneId]: {
                        ...existing,
                        ...partial,
                        connected: true, // connected with any message
                        lastUpdate: Date.now(),
                    },
                },
            };
        });
    },

    activeDroneInit: async () => {
        try {
            const response = await getDrones();

            // map API drones into ActiveDroneState snapshots
            set(state => {
                const newDrones = { ...state.drones };
                for (const d of response) {
                    const droneId = 'drone' + d.id;
                    newDrones[droneId] = {
                        ...createEmptyDroneState(droneId),
                        missionId: null, // or d.missionId if exists
                        lastUpdate: Date.now(),
                        name: d.name,
                    };

                    if (droneId == import.meta.env.VITE_DJI_MINI_3_PRO_ID) {
                        // newDrones[droneId].connected = true // static
                    }
                }
                return { drones: newDrones };
            });
        } catch (error) {
            console.error('Failed to initialize drones:', error);
        }
    },
}));
