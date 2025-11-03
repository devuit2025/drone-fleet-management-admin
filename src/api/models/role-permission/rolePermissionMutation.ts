import { RolePermissionClient, type RoleWithPermissions } from './rolePermissionClient';

/**
 * RolePermissionMutation
 * Provides mutation wrappers for assigning, removing, and setting permissions.
 */
export const RolePermissionMutation = {
    async assignPermissions(id: number): Promise<RoleWithPermissions> {
        return RolePermissionClient.assignPermissions(id);
    },

    async removePermissions(id: number): Promise<RoleWithPermissions> {
        return RolePermissionClient.removePermissions(id);
    },

    async setPermissions(id: number): Promise<RoleWithPermissions> {
        return RolePermissionClient.setPermissions(id);
    },
};
