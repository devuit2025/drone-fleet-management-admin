import { LicenseClient } from './licenseClient'
import type { License } from './licenseClient'

export const LicenseQuery = {
  async findAll(): Promise<License[]> {
    const res = await LicenseClient.get('/')
    return res.data
  },
}
