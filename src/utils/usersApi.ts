import { apiFetch } from './api'

export type BackendUser = {
  _id: string
  name: string
  email: string
  role?: 'customer' | 'admin' | string
  isActive?: boolean
  createdAt?: string
  updatedAt?: string
}

export async function fetchUsers(): Promise<BackendUser[]> {
  return apiFetch('/api/users')
}


