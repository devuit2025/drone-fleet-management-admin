import { PermissionClient, type Permission, type CreatePermissionDto, type UpdatePermissionDto } from './permissionClient'

export const PermissionMutation = {
  async create(data: CreatePermissionDto): Promise<Permission> {
    return PermissionClient.create(data)
  },

  async update(id: number, data: UpdatePermissionDto): Promise<Permission> {
    return PermissionClient.update(id, data)
  },

  async remove(id: number): Promise<boolean> {
    return PermissionClient.remove(id)
  },
}
