import { useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { Mail, Lock, LogIn, UserPlus, AlertCircle } from 'lucide-react'

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAuth = async () => {
    // Developer bypass if no real supabase url is configured
    if (import.meta.env.VITE_SUPABASE_URL === undefined || import.meta.env.VITE_SUPABASE_URL === 'https://your-project.supabase.co') {
        alert("Developer Mode: Bypassing auth since no real Supabase URL is set in .env.local")
        // We can't set a real session, but we can fake a reload to bypass if we handled it in App.tsx. 
        // For now, let's just use localStorage to fake a login state.
        localStorage.setItem('dev_bypass_auth', 'true')
        window.dispatchEvent(new Event('storage')) // Trigger a re-render in App.tsx
        return
    }

    setError(null)
    setLoading(true)
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      } else {
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters')
        }
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAuth()
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass-card p-8 shadow-2xl"
      >
        {/* Logo */}
        <div className="text-center mb-6">
          <img src="/logo.jpg" alt="Discharge Lens Logo" className="w-24 h-24 mx-auto mb-4 rounded-2xl shadow-[0_0_15px_rgba(0,245,255,0.3)] object-cover" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-neon-cyan to-neon-green bg-clip-text text-transparent">
            DISCHARGE LENS
          </h1>
          <p className="text-gray-400 text-sm mt-1">Healthcare Intelligence • 2050</p>
        </div>

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm"
          >
            <AlertCircle size={16} />
            {error}
          </motion.div>
        )}

        {/* Form */}
        <div className="space-y-4" onKeyDown={handleKeyDown}>
          <div className="relative">
            <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Email"
              className="glass-input pl-10"
              id="auth-email"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Password"
              className="glass-input pl-10"
              id="auth-password"
            />
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleAuth}
            disabled={loading || !email || !password}
            className="glow-btn w-full flex items-center justify-center gap-2"
            id="auth-submit"
          >
            {isLogin ? <LogIn size={18} /> : <UserPlus size={18} />}
            {loading ? 'Loading...' : isLogin ? 'Sign In' : 'Create Account'}
          </motion.button>
        </div>

        <button
          onClick={() => { setIsLogin(!isLogin); setError(null) }}
          className="w-full mt-4 text-sm text-gray-400 hover:text-neon-cyan transition-colors"
        >
          {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
        </button>
      </motion.div>
    </div>
  )
}
