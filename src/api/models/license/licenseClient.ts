import axios from 'axios'

export type LicenseType = 'commercial' | 'recreational'
export type QualificationLevel = 'basic' | 'advanced' | 'expert'

export interface License {
  id: number
  pilotId: number
  licenseNumber: string
  licenseType: LicenseType
  qualificationLevel: QualificationLevel
  issuingAuthority: string
  issuedDate: string
  expiryDate: string
  active: boolean
  created_at: string
  updated_at: string
}

export interface CreateLicenseDto {
  pilotId: number
  licenseNumber: string
  licenseType: LicenseType
  qualificationLevel: QualificationLevel
  issuingAuthority: string
  issuedDate: string
  expiryDate: string
  active?: boolean
}

export const LicenseClient = axios.create({
  baseURL: '/api/v1/licenses',
  withCredentials: true,
})
