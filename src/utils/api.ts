const defaultBaseUrl = process.env.REACT_APP_API_URL || ''
const AUTH_TOKEN_KEY = 'auth_token'

export function setAuthToken(token: string | null) {
  if (token) {
    localStorage.setItem(AUTH_TOKEN_KEY, token)
  } else {
    localStorage.removeItem(AUTH_TOKEN_KEY)
  }
}

export function getAuthToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY)
}

export function getApiBaseUrl(): string {
  // If REACT_APP_API_URL is defined, use it; otherwise rely on CRA proxy or same-origin
  return defaultBaseUrl
}

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const baseUrl = getApiBaseUrl()
  const url = path.startsWith('http') ? path : `${baseUrl}${path}`

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(getAuthToken() ? { Authorization: `Bearer ${getAuthToken()}` } : {}),
      ...(options.headers || {}),
    },
    ...options,
  })

  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new Error(`API ${response.status} ${response.statusText}: ${text}`)
  }

  const contentType = response.headers.get('content-type') || ''
  if (contentType.includes('application/json')) {
    return (await response.json()) as T
  }

  return (await response.text()) as unknown as T
}

export async function getHealth(): Promise<{ status: string; message: string; timestamp: string }> {
  return apiFetch('/api/health')
}

export type UploadResponse = {
  message: string
  file: {
    filename: string
    path: string
    fullPath?: string
    size?: number
    mimetype?: string
  }
}

export async function uploadSingleFile(file: File): Promise<string> {
  const baseUrl = getApiBaseUrl()
  const url = `${baseUrl}/api/upload`

  const formData = new FormData()
  formData.append('file', file)

  const res = await fetch(url, {
    method: 'POST',
    body: formData,
    headers: {
      ...(getAuthToken() ? { Authorization: `Bearer ${getAuthToken()}` } : {}),
    },
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Upload ${res.status} ${res.statusText}: ${text}`)
  }

  const data = (await res.json()) as UploadResponse
  return data.file.path
}



// Product API
export const productApi = {
  getAll: async (params?: any) => {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : ''
    return apiFetch(`/api/products${queryString}`)
  },
  
  getById: async (id: string) => {
    return apiFetch(`/api/products/${id}`)
  },
  
  create: async (productData: any) => {
    return apiFetch('/api/products', {
      method: 'POST',
      body: JSON.stringify(productData)
    })
  },
  
  update: async (id: string, productData: any) => {
    return apiFetch(`/api/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData)
    })
  },
  
  delete: async (id: string) => {
    return apiFetch(`/api/products/${id}`, {
      method: 'DELETE'
    })
  },
  
  toggleStatus: async (id: string) => {
    return apiFetch(`/api/products/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({})
    })
  }
}

// Category API
export const categoryApi = {
  getAll: async () => {
    return apiFetch('/api/categories')
  },
  
  getById: async (id: string) => {
    return apiFetch(`/api/categories/${id}`)
  },
  
  create: async (categoryData: any) => {
    return apiFetch('/api/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData)
    })
  },
  
  update: async (id: string, categoryData: any) => {
    return apiFetch(`/api/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(categoryData)
    })
  },
  
  delete: async (id: string) => {
    return apiFetch(`/api/categories/${id}`, {
      method: 'DELETE'
    })
  },
  
  addSubcategory: async (categoryId: string, subcategoryData: any) => {
    return apiFetch(`/api/categories/${categoryId}/subcategories`, {
      method: 'POST',
      body: JSON.stringify(subcategoryData)
    })
  },
  
  updateSubcategory: async (categoryId: string, subcategoryId: string, subcategoryData: any) => {
    return apiFetch(`/api/categories/${categoryId}/subcategories/${subcategoryId}`, {
      method: 'PUT',
      body: JSON.stringify(subcategoryData)
    })
  },
  
  deleteSubcategory: async (categoryId: string, subcategoryId: string) => {
    return apiFetch(`/api/categories/${categoryId}/subcategories/${subcategoryId}`, {
      method: 'DELETE'
    })
  }
}

// User API
export const userApi = {
  login: async (email: string, password: string) => {
    return apiFetch('/api/users/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    })
  },
  
  register: async (userData: any) => {
    return apiFetch('/api/users/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    })
  },
  
  getProfile: async () => {
    return apiFetch('/api/users/profile')
  },
  
  updateProfile: async (userData: any) => {
    return apiFetch('/api/users/profile', {
      method: 'PUT',
      body: JSON.stringify(userData)
    })
  },
  
  changePassword: async (oldPassword: string, newPassword: string) => {
    return apiFetch('/api/users/change-password', {
      method: 'PUT',
      body: JSON.stringify({ oldPassword, newPassword })
    })
  }
}
