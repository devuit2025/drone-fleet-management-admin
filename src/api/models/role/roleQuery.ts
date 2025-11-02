import { RoleClient } from './roleClient'
import type { Role } from './roleClient'

export const RoleQuery = {
  async findAll(): Promise<Role[]> {
    return RoleClient.findAll()
  },

  async findOne(id: number): Promise<Role> {
    return RoleClient.findOne(id)
  },
}
