import api from '@/utils/api';
import type {
    MissionReport,
    CreateMissionReportDto,
    UpdateMissionReportDto,
} from './missionReportQuery';

export class MissionReportMutation {
    async create(data: CreateMissionReportDto): Promise<MissionReport> {
        const res = await api.post<MissionReport>(`${import.meta.env.VITE_API_PREFIX}/mission-reports`, data);
        return res.data;
    }

    async update(id: number, data: UpdateMissionReportDto): Promise<MissionReport> {
        const res = await api.patch<MissionReport>(`/api/v1/mission-reports/${id}`, data);
        return res.data;
    }

    async delete(id: number): Promise<void> {
        await api.delete(`/api/v1/mission-reports/${id}`);
    }
}
