import { api } from '@/api/axios';

// ------------------------------------------
// Interface Definitions
// ------------------------------------------

export type UserRole = 'admin' | 'operator' | 'viewer';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string; // ISO date
  updatedAt: string; // ISO date
  pilots?: any[]; // Associated pilots (structure not defined in schema)
}

export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  password?: string;
  role?: UserRole;
}

// ------------------------------------------
// Client Definition
// ------------------------------------------

export const UserClient = {
  getAll: () => api.get<User[]>('/users'),

  getById: (id: number) => api.get<User>(`/users/${id}`),

  create: (data: CreateUserDto) => api.post<User>('/users', data),

  update: (id: number, data: UpdateUserDto) => api.patch<User>(`/users/${id}`, data),

  delete: (id: number) => api.delete(`/users/${id}`),
};
