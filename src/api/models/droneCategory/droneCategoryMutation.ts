import {
  DroneCategoryClient,
  type DroneCategory,
  type CreateDroneCategoryDto,
  type UpdateDroneCategoryDto,
} from './droneCategoryClient'

/**
 * DroneCategoryMutation
 * Contains write operations (POST, PATCH, DELETE endpoints).
 */
export const DroneCategoryMutation = {
  async create(data: CreateDroneCategoryDto): Promise<DroneCategory> {
    return DroneCategoryClient.create(data)
  },

  async update(id: number, data: UpdateDroneCategoryDto): Promise<DroneCategory> {
    return DroneCategoryClient.update(id, data)
  },

  async remove(id: number): Promise<void> {
    return DroneCategoryClient.remove(id)
  },
}
