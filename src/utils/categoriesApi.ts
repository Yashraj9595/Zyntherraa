import { apiFetch } from './api'

export type BackendSubcategory = {
  _id: string
  name: string
  status: 'Active' | 'Inactive'
  productCount?: number
}

export type BackendCategory = {
  _id: string
  name: string
  status: 'Active' | 'Inactive'
  productCount?: number
  subcategories?: BackendSubcategory[]
}

export async function fetchCategories(): Promise<BackendCategory[]> {
  return apiFetch('/api/categories')
}


