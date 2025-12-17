import { LicenseClient, type License, type CreateLicenseDto, type UpdateLicenseDto } from './licenseClient';

export const LicenseMutation = {
    async create(data: CreateLicenseDto): Promise<License> {
        return LicenseClient.create(data);
    },

    async update(id: number, data: UpdateLicenseDto): Promise<License> {
        return LicenseClient.update(id, data);
    },

    async remove(id: number): Promise<void> {
        return LicenseClient.remove(id);
    },
};
