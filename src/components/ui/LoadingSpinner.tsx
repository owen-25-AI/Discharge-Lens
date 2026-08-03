import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

type Props = {
  message?: string
}

export default function LoadingSpinner({ message = 'Analyzing with AI...' }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-16 gap-4"
    >
      <div className="relative">
        {/* Outer ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          className="w-20 h-20 rounded-full border-2 border-transparent border-t-neon-cyan border-r-neon-green"
        />
        {/* Inner icon */}
        <Loader2
          className="absolute inset-0 m-auto text-neon-cyan animate-spin"
          size={32}
        />
      </div>
      <p className="text-gray-400 text-sm animate-pulse">{message}</p>
    </motion.div>
  )
}
