import { type ReactNode } from 'react'
import { motion } from 'framer-motion'

type GlassCardProps = {
  title?: string
  children: ReactNode
  danger?: boolean
  className?: string
}

export default function GlassCard({ title, children, danger, className = '' }: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`${danger ? 'danger-card' : 'glass-card'} p-6 shadow-2xl ${className}`}
    >
      {title && (
        <h3 className={`font-bold mb-3 text-lg ${danger ? 'text-red-400' : 'neon-text-cyan'}`}>
          {title}
        </h3>
      )}
      {children}
    </motion.div>
  )
}
