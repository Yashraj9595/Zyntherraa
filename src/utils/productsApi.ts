import { apiFetch } from './api'

export type BackendProductVariant = {
  _id?: string
  size?: string
  color?: string
  images?: string[]
  videos?: string[]
  price: number
  stock?: number
  styleNumber?: string
  fabric?: string
}

export type BackendProduct = {
  _id: string
  title: string
  description?: string
  category: string
  subcategory?: string
  variants?: BackendProductVariant[]
  status?: 'Active' | 'Inactive'
  styleNumber?: string
  fabric?: string
}

export async function fetchProducts(): Promise<BackendProduct[]> {
  return apiFetch('/api/products')
}


