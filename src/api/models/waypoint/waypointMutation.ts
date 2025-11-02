import { WaypointClient, type Waypoint, type CreateWaypointDto, type UpdateWaypointDto } from './waypointClient'

export const WaypointMutation = {
  async create(data: CreateWaypointDto): Promise<Waypoint> {
    return WaypointClient.create(data)
  },

  async update(id: number, data: UpdateWaypointDto): Promise<Waypoint> {
    return WaypointClient.update(id, data)
  },

  async remove(id: number): Promise<void> {
    return WaypointClient.remove(id)
  },
}
