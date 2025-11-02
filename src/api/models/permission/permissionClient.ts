import axios from 'axios'

export interface Permission {
  id: number
  name: string
  description: string
  createdAt: string
  updatedAt: string
}

export interface CreatePermissionDto {
  name: string
  description?: string
}

export interface UpdatePermissionDto {
  name?: string
  description?: string
}

export const PermissionClient = {
  axios: axios.create({
    baseURL: '/api/v1/permissions',
    withCredentials: true,
  }),

  async findAll() {
    const res = await this.axios.get<Permission[]>('/')
    return res.data
  },

  async findOne(id: number) {
    const res = await this.axios.get<Permission>(`/${id}`)
    return res.data
  },

  async create(data: CreatePermissionDto) {
    const res = await this.axios.post<Permission>('/', data)
    return res.data
  },

  async update(id: number, data: UpdatePermissionDto) {
    const res = await this.axios.patch<Permission>(`/${id}`, data)
    return res.data
  },

  async remove(id: number) {
    await this.axios.delete(`/${id}`)
    return true
  },
}
