import { MissionReportQuery } from './missionReportQuery';
import { MissionReportMutation } from './missionReportMutation';
import type { CreateMissionReportDto, UpdateMissionReportDto, MissionReport } from './missionReportQuery';

export class MissionReportClient {
  query = new MissionReportQuery();
  mutation = new MissionReportMutation();

  getAll(missionId?: number) {
    return this.query.getAll(missionId);
  }

  getOne(id: number) {
    return this.query.getOne(id);
  }

  create(data: CreateMissionReportDto) {
    return this.mutation.create(data);
  }

  update(id: number, data: UpdateMissionReportDto) {
    return this.mutation.update(id, data);
  }

  delete(id: number) {
    return this.mutation.delete(id);
  }
}
