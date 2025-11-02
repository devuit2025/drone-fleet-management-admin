import { LicenseClient, type License, type CreateLicenseDto } from './licenseClient';

export const LicenseMutation = {
    async create(data: CreateLicenseDto): Promise<License> {
        const res = await LicenseClient.post('/', data);
        return res.data;
    },
};
