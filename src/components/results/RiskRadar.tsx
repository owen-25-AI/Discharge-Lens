import { motion } from 'framer-motion'
import { Activity, Siren, PhoneCall } from 'lucide-react'
import GlassCard from '../ui/GlassCard'

type Props = {
  warnings: string[]
}

export default function RiskRadar({ warnings }: Props) {
  if (!warnings || warnings.length === 0) return null

  return (
    <GlassCard danger className="relative overflow-hidden">
      {/* Radar Background Effect */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 rounded-full border border-red-500/30 radar-pulse pointer-events-none" />
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 rounded-full border border-red-500/10 radar-pulse pointer-events-none" style={{ animationDelay: '1s' }} />

      <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-red-400">
        <Activity size={24} className="animate-pulse" /> Risk Radar
      </h3>
      
      <p className="text-sm text-red-300 mb-4 font-semibold flex items-center gap-2">
        <Siren size={16} /> Go to the Emergency Room if you experience:
      </p>

      <ul className="space-y-3 relative z-10">
        {warnings.map((warning, i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-start gap-3 p-3 bg-red-950/40 rounded-lg border border-red-500/20"
          >
            <div className="w-2 h-2 mt-1.5 rounded-full bg-red-500 shrink-0 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
            <span className="text-sm font-medium">{warning}</span>
          </motion.li>
        ))}
      </ul>
      
      <div className="mt-5 pt-4 border-t border-red-500/20 flex items-center justify-between">
        <span className="text-xs text-red-400/80 uppercase tracking-wider font-bold">In Emergency: Call 911</span>
        <a href="tel:911" className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-500 transition-colors shadow-[0_0_15px_rgba(239,68,68,0.4)]">
          <PhoneCall size={16} /> Call Now
        </a>
      </div>
    </GlassCard>
  )
}
