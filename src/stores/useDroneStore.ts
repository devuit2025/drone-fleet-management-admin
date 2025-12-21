import { create } from 'zustand';
import {
    getDrones,
    createDrone,
    updateDrone,
    deleteDrone,
    getDroneById,
    getStatus,
} from '@/api/models/drone/droneEndpoint';
import type { Drone } from '@/api/models/drone/droneEndpoint';

interface DroneState {
    // Data
    drones: Drone[];
    selectedDrone: Drone | null;
    statuses: string[];

    // Loading states
    loading: boolean;
    creating: boolean;
    updating: boolean;
    deleting: boolean;

    // Filters
    filters: Record<string, string>;
    sort: { field: string; direction: 'asc' | 'desc' } | null;

    // Actions
    fetchDrones: (params?: Record<string, any>) => Promise<{ total: number }>;
    fetchDroneById: (id: number) => Promise<Drone>;
    createDrone: (data: Partial<Drone>) => Promise<Drone>;
    updateDrone: (id: number, data: Partial<Drone>) => Promise<Drone>;
    deleteDrone: (id: number) => Promise<void>;

    // State management
    setFilters: (filters: Record<string, string>) => void;
    setSort: (sort: { field: string; direction: 'asc' | 'desc' } | null) => void;
    setSelectedDrone: (drone: Drone | null) => void;
    reset: () => void;
    fetchStatus: () => Promise<string[]>;
}

const initialState = {
    drones: [],
    selectedDrone: null,
    statuses: [],
    loading: false,
    creating: false,
    updating: false,
    deleting: false,
    filters: {},
    sort: null,
};

export const useDroneStore = create<DroneState>((set, get) => ({
    ...initialState,

    fetchDrones: async (params?: Record<string, any>) => {
        set({ loading: true });
        try {
            const { filters, sort } = get();
            const queryParams = {
                ...filters,
                ...params,
                ...(sort && { sort: sort.direction === 'desc' ? `-${sort.field}` : sort.field }),
            };

            const response = await getDrones(queryParams);
            const drones = Array.isArray(response.data) ? response.data : [];

            // Get total from X-Total header (backend sets this via setPaginationHeaders)
            // Axios normalizes headers to lowercase, so 'x-total' is the expected key
            const totalHeader = response.headers?.['x-total'] || response.headers?.['X-Total'];

            // Parse total from header, fallback to drones.length only if header is missing
            const total = totalHeader ? parseInt(String(totalHeader), 10) : drones.length;

            // Log for debugging (can be removed later)
            if (!totalHeader) {
                console.warn(
                    'X-Total header not found in response, using drones.length as fallback',
                );
            }

            set({ drones, loading: false });
            return { total };
        } catch (error) {
            console.error('Failed to fetch drones:', error);
            set({ drones: [], loading: false });
            throw error;
        }
    },

    fetchDroneById: async (id: number) => {
        try {
            const response = await getDroneById(id);
            const drone = response.data;
            set({ selectedDrone: drone });
            return drone;
        } catch (error) {
            console.error('Failed to fetch drone:', error);
            set({ selectedDrone: null });
            throw error;
        }
    },

    createDrone: async (data: Partial<Drone>) => {
        set({ creating: true });
        try {
            const response = await createDrone(data);
            const newDrone = response.data;
            set(state => ({
                drones: [...state.drones, newDrone],
                creating: false,
            }));
            return newDrone;
        } catch (error) {
            console.error('Failed to create drone:', error);
            set({ creating: false });
            throw error;
        }
    },

    updateDrone: async (id: number, data: Partial<Drone>) => {
        set({ updating: true });
        try {
            const response = await updateDrone(id, data);
            const updatedDrone = response.data;
            set(state => ({
                drones: state.drones.map(d => (d.id === id ? updatedDrone : d)),
                selectedDrone: state.selectedDrone?.id === id ? updatedDrone : state.selectedDrone,
                updating: false,
            }));
            return updatedDrone;
        } catch (error) {
            console.error('Failed to update drone:', error);
            set({ updating: false });
            throw error;
        }
    },

    deleteDrone: async (id: number) => {
        set({ deleting: true });
        try {
            await deleteDrone(id);
            set(state => ({
                drones: state.drones.filter(d => d.id !== id),
                selectedDrone: state.selectedDrone?.id === id ? null : state.selectedDrone,
                deleting: false,
            }));
        } catch (error) {
            console.error('Failed to delete drone:', error);
            set({ deleting: false });
            throw error;
        }
    },

    setFilters: (filters: Record<string, string>) => {
        set({ filters });
    },

    setSort: (sort: { field: string; direction: 'asc' | 'desc' } | null) => {
        set({ sort });
        get().fetchDrones();
    },

    setSelectedDrone: (drone: Drone | null) => {
        set({ selectedDrone: drone });
    },

    reset: () => {
        set(initialState);
    },

    fetchStatus: async (): Promise<string[]> => {
        try {
            const response = await getStatus();
            // Backend returns string[] directly
            const statuses = Array.isArray(response) ? response : [];

            set({ statuses });
            return statuses;
        } catch (error) {
            console.error('Failed to fetch statuses:', error);
            set({ statuses: [] });
            throw error;
        }
    },
}));
