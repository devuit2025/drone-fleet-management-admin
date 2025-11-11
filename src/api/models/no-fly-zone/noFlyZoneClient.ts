import { api } from '@/api/axios';

export interface NoFlyZone {
  id: number;
  name: string;
  description?: string | null;
  geometry: string; // backend returns stringified geometry
  zoneType: 'polygon' | 'circle';
  createdAt: string;
  updatedAt: string;
}

export interface CreateNoFlyZoneDto {
  name: string;
  description?: string;
  zoneType: 'polygon' | 'circle';
  geometry: string; // stringified GeoJSON for polygon or circle definition
}

export interface UpdateNoFlyZoneDto extends Partial<CreateNoFlyZoneDto> { }

export class NoFlyZoneClient {
  private static base = '/no-fly-zones';

  static async findAll(params?: any): Promise<NoFlyZone[]> {
    const res = await api.get<NoFlyZone[]>(this.base, { params });
    return res as unknown as NoFlyZone[];
  }

  static async findOne(id: number): Promise<NoFlyZone> {
    const res = await api.get<NoFlyZone>(`${this.base}/${id}`);
    return res as unknown as NoFlyZone;
  }

  static async create(data: CreateNoFlyZoneDto): Promise<NoFlyZone> {
    const res = await api.post<NoFlyZone>(this.base, data);
    return res as unknown as NoFlyZone;
  }

  static async update(id: number, data: UpdateNoFlyZoneDto): Promise<NoFlyZone> {
    const res = await api.patch<NoFlyZone>(`${this.base}/${id}`, data);
    return res as unknown as NoFlyZone;
  }

  static async remove(id: number): Promise<void> {
    await api.delete(`${this.base}/${id}`);
  }
}
