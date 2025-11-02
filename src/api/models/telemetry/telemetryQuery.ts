import { TelemetryClient, type Telemetry } from './telemetryClient'

export const TelemetryQuery = {
  async findAll(filters?: { missionId?: number; droneId?: number }): Promise<Telemetry[]> {
    return TelemetryClient.findAll(filters)
  },

  async findOne(id: number): Promise<Telemetry> {
    return TelemetryClient.findOne(id)
  },
}
