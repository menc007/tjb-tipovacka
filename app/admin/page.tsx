'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function AdminPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [creating, setCreating] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
        if (!user) router.push('/login')
      } catch (error) {
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }
    checkUser()
  }, [])

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)

    try {
      const response = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (response.ok) {
        alert('User created successfully!')
        setEmail('')
        setPassword('')
      } else {
        alert('Error creating user')
      }
    } catch (error) {
      alert('Error: ' + error)
    } finally {
      setCreating(false)
    }
  }

  if (loading) return <div className="p-4">Loading...</div>
  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-md mx-auto bg-white p-8 rounded shadow-md">
        <h1 className="text-2xl font-bold mb-6">Admin Panel</h1>

        <form onSubmit={handleCreateUser} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border p-2 rounded"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border p-2 rounded"
              required
            />
          </div>

          <button
            type="submit"
            disabled={creating}
            className="w-full bg-blue-600 text-white p-2 rounded font-bold hover:bg-blue-700"
          >
            {creating ? 'Creating...' : 'Create User'}
          </button>
        </form>
      </div>
    </div>
  )
}