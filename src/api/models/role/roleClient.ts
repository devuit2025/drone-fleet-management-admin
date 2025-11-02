import axios from 'axios';

export interface Role {
    id: number;
    name: string;
    description: string;
    permissions: string[];
    createdAt: string;
    updatedAt: string;
}

export interface CreateRoleDto {
    name: string;
    description?: string;
    permissionIds?: number[];
}

export interface UpdateRoleDto {
    name?: string;
    description?: string;
    permissionIds?: number[];
}

export const RoleClient = {
    axios: axios.create({
        baseURL: '/api/v1/roles',
        withCredentials: true,
    }),

    async findAll() {
        const res = await this.axios.get<Role[]>('/');
        return res.data;
    },

    async findOne(id: number) {
        const res = await this.axios.get<Role>(`/${id}`);
        return res.data;
    },

    async create(data: CreateRoleDto) {
        const res = await this.axios.post<Role>('/', data);
        return res.data;
    },

    async update(id: number, data: UpdateRoleDto) {
        const res = await this.axios.patch<Role>(`/${id}`, data);
        return res.data;
    },

    async remove(id: number) {
        await this.axios.delete(`/${id}`);
        return true;
    },
};
