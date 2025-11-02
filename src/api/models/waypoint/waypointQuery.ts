import { WaypointClient } from './waypointClient'
import type { Waypoint } from './waypointClient'

export const WaypointQuery = {
  async findAll(missionId?: number): Promise<Waypoint[]> {
    return WaypointClient.findAll(missionId)
  },

  async findOne(id: number): Promise<Waypoint> {
    return WaypointClient.findOne(id)
  },
}
