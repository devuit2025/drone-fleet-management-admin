import { NoFlyZoneClient, type NoFlyZone, type CreateNoFlyZoneDto, type UpdateNoFlyZoneDto } from './noFlyZoneClient'

export const NoFlyZoneMutation = {
  async create(data: CreateNoFlyZoneDto): Promise<NoFlyZone> {
    return NoFlyZoneClient.create(data)
  },

  async update(id: number, data: UpdateNoFlyZoneDto): Promise<NoFlyZone> {
    return NoFlyZoneClient.update(id, data)
  },

  async remove(id: number): Promise<void> {
    return NoFlyZoneClient.remove(id)
  },
}
