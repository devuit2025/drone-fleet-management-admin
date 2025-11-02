import { DroneModelClient, type DroneModel } from './droneModelClient'

export const DroneModelQuery = {
  async findAll(): Promise<DroneModel[]> {
    return DroneModelClient.findAll()
  },

  async findOne(id: number): Promise<DroneModel> {
    return DroneModelClient.findOne(id)
  },
}
