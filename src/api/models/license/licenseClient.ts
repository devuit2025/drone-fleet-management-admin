import { api } from '@/api/axios';

export type LicenseType = 'commercial' | 'recreational';
export type QualificationLevel = 'basic' | 'advanced' | 'expert';

export interface License {
    id: number;
    pilotId: number;
    licenseNumber: string;
    licenseType: LicenseType;
    qualificationLevel: QualificationLevel;
    issuingAuthority: string;
    issuedDate: string;
    expiryDate: string;
    active: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateLicenseDto {
    pilotId: number;
    licenseNumber: string;
    licenseType: LicenseType;
    qualificationLevel: QualificationLevel;
    issuingAuthority: string;
    issuedDate: string;
    expiryDate: string;
    active?: boolean;
}

export interface UpdateLicenseDto {
    pilotId?: number;
    licenseNumber?: string;
    licenseType?: LicenseType;
    qualificationLevel?: QualificationLevel;
    issuingAuthority?: string;
    issuedDate?: string;
    expiryDate?: string;
    active?: boolean;
}

export class LicenseClient {
    private static base = '/licenses';

    static async findAll(): Promise<License[]> {
        const res = await api.get<License[]>(this.base);
        return res as unknown as License[];
    }

    static async findOne(id: number): Promise<License> {
        const res = await api.get<License>(`${this.base}/${id}`);
        return res as unknown as License;
    }

    static async create(data: CreateLicenseDto): Promise<License> {
        const res = await api.post<License>(this.base, data);
        return res as unknown as License;
    }

    static async update(id: number, data: UpdateLicenseDto): Promise<License> {
        const res = await api.patch<License>(`${this.base}/${id}`, data);
        return res as unknown as License;
    }

    static async remove(id: number): Promise<void> {
        await api.delete(`${this.base}/${id}`);
    }
}
