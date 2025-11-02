import { PilotClient, type Pilot, type CreatePilotDto } from './pilotClient'

export const PilotMutation = {
  async create(data: CreatePilotDto): Promise<Pilot> {
    return PilotClient.create(data)
  },
}
