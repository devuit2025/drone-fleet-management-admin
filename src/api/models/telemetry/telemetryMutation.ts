import { TelemetryClient, type Telemetry, type CreateTelemetryDto } from './telemetryClient'

export const TelemetryMutation = {
  async create(data: CreateTelemetryDto): Promise<Telemetry> {
    return TelemetryClient.create(data)
  },

  async remove(id: number): Promise<void> {
    return TelemetryClient.remove(id)
  },
}
