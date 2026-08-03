import { motion } from 'framer-motion'
import type { ActionItem } from '../../types/discharge'
import { getIconConfig } from '../../lib/iconMap'
import GlassCard from '../ui/GlassCard'

type Props = {
  actions: ActionItem[]
}

export default function VisualActions({ actions }: Props) {
  if (!actions || actions.length === 0) return null

  return (
    <GlassCard title="Do This Now">
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
        {actions.map((action, i) => {
          const config = getIconConfig(action.icon_hint)
          const Icon = config.icon

          return (
            <motion.button
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.08, type: 'spring', stiffness: 200 }}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl ${config.bgColor} border border-white/5 cursor-pointer transition-all hover:border-white/20 group`}
              title={action.action}
            >
              <Icon size={28} className={config.color} />
              <span className="text-xs font-medium text-gray-300 group-hover:text-white text-center leading-tight">
                {action.visual_label || config.label}
              </span>
            </motion.button>
          )
        })}
      </div>

      {/* Expanded list below icons */}
      <div className="mt-4 space-y-2">
        {actions.map((action, i) => {
          const config = getIconConfig(action.icon_hint)
          const Icon = config.icon

          return (
            <motion.div
              key={`detail-${i}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.05 }}
              className="flex items-center gap-3 p-3 bg-white/5 rounded-lg"
            >
              <Icon size={16} className={config.color} />
              <span className="text-sm flex-1">{action.action}</span>
              <span className="text-xs text-gray-400">{action.when}</span>
            </motion.div>
          )
        })}
      </div>
    </GlassCard>
  )
}
