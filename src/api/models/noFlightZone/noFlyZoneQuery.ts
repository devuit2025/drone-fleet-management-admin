import { NoFlyZoneClient, type NoFlyZone } from './noFlyZoneClient'

export const NoFlyZoneQuery = {
  async findAll(): Promise<NoFlyZone[]> {
    return NoFlyZoneClient.findAll()
  },

  async findOne(id: number): Promise<NoFlyZone> {
    return NoFlyZoneClient.findOne(id)
  },
}
