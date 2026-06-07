'use client'

import { useEffect, useState } from 'react'
import { HeroHeader } from '@/components/HeroHeader'
import { Dashboard } from '@/components/Dashboard'

export default function HomePage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <main className="min-h-screen bg-white">
      <HeroHeader />
      <Dashboard />
    </main>
  )
}