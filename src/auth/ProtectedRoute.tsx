import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from './AuthContext'

export function ProtectedRoute({ children, role }: { children: React.ReactElement; role?: 'admin' }) {
  const { user, loading } = useAuth()
  
  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }
  
  // Redirect to login if not authenticated
  if (!user) return <Navigate to="/login" replace />
  
  // Check role if specified
  if (role === 'admin' && (user.role || '').toLowerCase() !== 'admin') {
    return <Navigate to="/" replace />
  }
  
  return children
}


