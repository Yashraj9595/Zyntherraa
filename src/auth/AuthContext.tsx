import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { apiFetch, setAuthToken, getAuthToken } from '../utils/api'

type AuthUser = { id: string; name: string; email: string; role?: string } | null

type AuthContextValue = {
  user: AuthUser
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const AUTH_USER_KEY = 'auth_user'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    // Restore user from localStorage on mount
    const token = getAuthToken()
    const savedUser = localStorage.getItem(AUTH_USER_KEY)
    
    if (token && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser)
        setUser(parsedUser)
      } catch (error) {
        console.error('Failed to parse saved user:', error)
        // Clear invalid data
        setAuthToken(null)
        localStorage.removeItem(AUTH_USER_KEY)
      }
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    setLoading(true)
    try {
      const res = await apiFetch<{ _id: string; name: string; email: string; role?: string; token: string }>(
        '/api/users/login',
        { method: 'POST', body: JSON.stringify({ email, password }) }
      )
      setAuthToken(res.token)
      const userData = { id: res._id, name: res.name, email: res.email, role: res.role }
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(userData))
      setUser(userData)
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setAuthToken(null)
    localStorage.removeItem(AUTH_USER_KEY)
    setUser(null)
  }

  const value = useMemo(() => ({ user, loading, login, logout }), [user, loading])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}


