import { PermissionClient } from './permissionClient';
import type { Permission } from './permissionClient';

export const PermissionQuery = {
    async findAll(): Promise<Permission[]> {
        return PermissionClient.findAll();
    },

    async findOne(id: number): Promise<Permission> {
        return PermissionClient.findOne(id);
    },
};
