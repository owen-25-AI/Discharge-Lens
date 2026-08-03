import { useState, useEffect } from 'react'

import MainLayout from './components/MainLayout'

export default function App() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Just stop loading after a tiny delay
    setTimeout(() => setLoading(false), 100)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <div className="w-12 h-12 rounded-full border-2 border-transparent border-t-neon-cyan animate-spin" />
      </div>
    )
  }

  return (
    <>
      <MainLayout />
    </>
  )
}
