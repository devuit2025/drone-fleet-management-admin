import { api } from '@/api/axios';

export type PermitStatus = 'pending' | 'approved' | 'rejected' | 'expired';

export interface FlightPermit {
    id: number;
    licenseId: number;
    permitNumber: string;
    status: PermitStatus;
    airspaceArea: string; // stringified geometry
    description?: string | null;
    applicantName: string;
    applicantAddress?: string | null;
    applicantNationality?: string | null;
    applicantPhone?: string | null;
    flightPurpose?: string | null;
    issuedDate?: string | null;
    expiryDate?: string | null;
    takeoffLandingLocation?: string | null;
    attachments?: any;
    createdAt: string;
    updatedAt: string;
}

export interface CreateFlightPermitDto {
    licenseId: number;
    permitNumber: string;
    status?: PermitStatus;
    airspaceArea: string; // stringified GeoJSON
    description?: string;
    applicantName: string;
    applicantAddress?: string;
    applicantNationality?: string;
    applicantPhone?: string;
    flightPurpose?: string;
    issuedDate?: string;
    expiryDate?: string;
    takeoffLandingLocation?: string;
    attachments?: any;
}

export interface UpdateFlightPermitDto extends Partial<CreateFlightPermitDto> {}

export class FlightPermitClient {
    private static base = '/flight-permits';

    static async findAll(params?: any): Promise<FlightPermit[]> {
        const res = await api.get<FlightPermit[]>(this.base, { params });
        return res as unknown as FlightPermit[];
    }

    static async findOne(id: number): Promise<FlightPermit> {
        const res = await api.get<FlightPermit>(`${this.base}/${id}`);
        return res as unknown as FlightPermit;
    }

    static async create(data: CreateFlightPermitDto): Promise<FlightPermit> {
        const res = await api.post<FlightPermit>(this.base, data);
        return res as unknown as FlightPermit;
    }

    static async update(id: number, data: UpdateFlightPermitDto): Promise<FlightPermit> {
        const res = await api.patch<FlightPermit>(`${this.base}/${id}`, data);
        return res as unknown as FlightPermit;
    }

    static async remove(id: number): Promise<void> {
        await api.delete(`${this.base}/${id}`);
    }
}
