import { RoleClient, type Role, type CreateRoleDto, type UpdateRoleDto } from './roleClient';

export const RoleMutation = {
    async create(data: CreateRoleDto): Promise<Role> {
        return RoleClient.create(data);
    },

    async update(id: number, data: UpdateRoleDto): Promise<Role> {
        return RoleClient.update(id, data);
    },

    async remove(id: number): Promise<boolean> {
        return RoleClient.remove(id);
    },
};
