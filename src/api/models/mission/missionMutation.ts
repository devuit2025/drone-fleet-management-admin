import { MissionClient, type CreateMissionDto, type UpdateMissionDto, type Mission } from './missionClient'

export const MissionMutation = {
  async create(data: CreateMissionDto): Promise<Mission> {
    const res = await MissionClient.post('/', data)
    return res.data
  },

  async update(id: number, data: UpdateMissionDto): Promise<Mission> {
    const res = await MissionClient.patch(`/${id}`, data)
    return res.data
  },

  async remove(id: number): Promise<void> {
    await MissionClient.delete(`/${id}`)
  },
}
