import { apiFetch } from './api'

export type BackendOrderItem = {
  product: string
  variantId: string
  quantity: number
  price: number
  size?: string
  color?: string
}

export type BackendOrder = {
  _id: string
  user: { _id?: string; name?: string; email?: string } | string
  items: BackendOrderItem[]
  shippingAddress?: {
    fullName?: string
    address?: string
    city?: string
    postalCode?: string
    country?: string
    phone?: string
  }
  paymentMethod?: string
  itemsPrice: number
  taxPrice: number
  shippingPrice: number
  totalPrice: number
  isPaid: boolean
  paidAt?: string
  isDelivered: boolean
  deliveredAt?: string
  createdAt: string
}

export async function fetchOrders(): Promise<BackendOrder[]> {
  return apiFetch('/api/orders')
}


