import { DroneCategoryClient, type DroneCategory } from './droneCategoryClient'

/**
 * DroneCategoryQuery
 * Contains read-only operations (GET endpoints).
 */
export const DroneCategoryQuery = {
  async findAll(): Promise<DroneCategory[]> {
    return DroneCategoryClient.findAll()
  },

  async findOne(id: number): Promise<DroneCategory> {
    return DroneCategoryClient.findOne(id)
  },
}
