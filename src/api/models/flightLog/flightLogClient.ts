import axios from 'axios'

export interface FlightLog {
  id: number
  missionId: number
  eventType: string
  description: string
  timestamp: string
}

export interface CreateFlightLogDto {
  missionId: number
  eventType: string
  description: string
  timestamp: string
}

export interface UpdateFlightLogDto {
  missionId?: number
  eventType?: string
  description?: string
  timestamp?: string
}

export const FlightLogClient = {
  axios: axios.create({
    baseURL: '/api/v1/flight-logs',
    withCredentials: true,
  }),

  async findAll(params?: { missionId?: number }): Promise<FlightLog[]> {
    const res = await this.axios.get<FlightLog[]>('/', { params })
    return res.data
  },

  async findOne(id: number): Promise<FlightLog> {
    const res = await this.axios.get<FlightLog>(`/${id}`)
    return res.data
  },

  async create(data: CreateFlightLogDto): Promise<FlightLog> {
    const res = await this.axios.post<FlightLog>('/', data)
    return res.data
  },

  async update(id: number, data: UpdateFlightLogDto): Promise<FlightLog> {
    const res = await this.axios.patch<FlightLog>(`/${id}`, data)
    return res.data
  },

  async remove(id: number): Promise<void> {
    await this.axios.delete(`/${id}`)
  },
}
