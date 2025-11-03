import axios from 'axios';

export interface RoleWithPermissions {
    id: number;
    name: string;
    description: string;
    permissions: string[];
    createdAt: string;
    updatedAt: string;
}

/**
 * RolePermissionClient
 * Handles all API interactions for assigning, removing, or setting permissions on a role.
 */
export const RolePermissionClient = {
    axios: axios.create({
        baseURL: `${import.meta.env.VITE_API_PREFIX}/roles`,
        withCredentials: true,
    }),

    /**
     * Assign permissions to a role
     * POST /api/v1/roles/{id}/permissions
     */
    async assignPermissions(id: number): Promise<RoleWithPermissions> {
        const res = await this.axios.post<RoleWithPermissions>(`/${id}/permissions`);
        return res.data;
    },

    /**
     * Remove permissions from a role
     * DELETE /api/v1/roles/{id}/permissions
     */
    async removePermissions(id: number): Promise<RoleWithPermissions> {
        const res = await this.axios.delete<RoleWithPermissions>(`/${id}/permissions`);
        return res.data;
    },

    /**
     * Replace (set) all permissions for a role
     * PATCH /api/v1/roles/{id}/permissions
     */
    async setPermissions(id: number): Promise<RoleWithPermissions> {
        const res = await this.axios.patch<RoleWithPermissions>(`/${id}/permissions`);
        return res.data;
    },
};
