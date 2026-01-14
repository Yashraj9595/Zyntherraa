import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'

export default function Login() {
  const { login, loading } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      await login(email, password)
      navigate('/admin')
    } catch (e: any) {
      setError('Invalid credentials')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <form onSubmit={onSubmit} className="w-full max-w-sm border border-input rounded-lg p-6 bg-background">
        <h1 className="text-2xl font-bold mb-4 text-foreground">Sign in</h1>
        {error && <div className="mb-3 text-sm text-red-600">{error}</div>}
        <div className="mb-3">
          <label className="block text-sm mb-1">Email</label>
          <input className="w-full p-2 border border-input rounded" type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
        </div>
        <div className="mb-4">
          <label className="block text-sm mb-1">Password</label>
          <input className="w-full p-2 border border-input rounded" type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
        </div>
        <button disabled={loading} className="w-full bg-primary text-primary-foreground py-2 rounded disabled:opacity-50">
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </div>
  )
}


