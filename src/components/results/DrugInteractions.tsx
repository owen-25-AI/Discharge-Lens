import { motion } from 'framer-motion'
import { AlertTriangle, AlertCircle, Info } from 'lucide-react'
import type { DrugInteraction, AllergyAlert } from '../../types/discharge'

type Props = {
  interactions?: DrugInteraction[]
  allergyAlerts?: AllergyAlert[]
}

export default function DrugInteractions({ interactions = [], allergyAlerts = [] }: Props) {
  if (interactions.length === 0 && allergyAlerts.length === 0) return null

  const getSeverityStyles = (severity: 'critical' | 'moderate' | 'info') => {
    switch (severity) {
      case 'critical':
        return {
          bg: 'bg-red-500/10',
          border: 'border-red-500/30',
          text: 'text-red-400',
          icon: <AlertTriangle size={20} className="text-red-500 shrink-0" />,
          animation: 'shake',
        }
      case 'moderate':
        return {
          bg: 'bg-orange-500/10',
          border: 'border-orange-500/30',
          text: 'text-orange-400',
          icon: <AlertCircle size={20} className="text-orange-500 shrink-0" />,
          animation: '',
        }
      case 'info':
      default:
        return {
          bg: 'bg-blue-500/10',
          border: 'border-blue-500/30',
          text: 'text-blue-400',
          icon: <Info size={20} className="text-blue-500 shrink-0" />,
          animation: '',
        }
    }
  }

  return (
    <div className="space-y-3">
      {/* Allergy Alerts */}
      {allergyAlerts.map((alert, i) => {
        const styles = getSeverityStyles(alert.severity)
        return (
          <motion.div
            key={`allergy-${i}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`flex items-start gap-3 p-4 rounded-xl border ${styles.bg} ${styles.border} ${styles.animation}`}
          >
            {styles.icon}
            <div>
              <h4 className={`font-bold text-sm ${styles.text}`}>
                Allergy Alert: {alert.allergen}
              </h4>
              <p className="text-sm text-gray-300 mt-1">{alert.message}</p>
              <div className="flex gap-2 mt-2">
                {alert.flagged_drugs.map(drug => (
                  <span key={drug} className="text-xs px-2 py-1 rounded bg-black/30 border border-white/5">
                    {drug}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        )
      })}

      {/* Drug Interactions */}
      {interactions.map((interaction, i) => {
        const styles = getSeverityStyles(interaction.severity)
        return (
          <motion.div
            key={`interaction-${i}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: (allergyAlerts.length + i) * 0.1 }}
            className={`flex items-start gap-3 p-4 rounded-xl border ${styles.bg} ${styles.border} ${styles.animation}`}
          >
            {styles.icon}
            <div>
              <h4 className={`font-bold text-sm ${styles.text}`}>
                Drug Interaction
              </h4>
              <p className="text-sm text-gray-300 mt-1">{interaction.message}</p>
              <div className="flex gap-2 mt-2">
                {interaction.drugs.map(drug => (
                  <span key={drug} className="text-xs px-2 py-1 rounded bg-black/30 border border-white/5">
                    {drug}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        )
      })}
      
      <p className="text-xs text-gray-500 italic mt-2 text-right">
        * This is not a substitute for pharmacist review. Always confirm with a professional.
      </p>
    </div>
  )
}
