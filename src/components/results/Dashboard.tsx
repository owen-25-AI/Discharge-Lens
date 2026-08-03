import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar as CalendarIcon, Volume2 } from 'lucide-react'
import type { DischargeReport } from '../../types/discharge'

import GlassCard from '../ui/GlassCard'
import VisualActions from './VisualActions'
import MedicationTimeline from './MedicationTimeline'
import DrugInteractions from './DrugInteractions'
import RiskRadar from './RiskRadar'
import PdfExport from '../export/PdfExport'
import WhatsAppShare from '../export/WhatsAppShare'
import { downloadICS } from '../../lib/icsGenerator'

type Props = {
  report: DischargeReport | null
}

export default function Dashboard({ report }: Props) {
  const [activeTab, setActiveTab] = useState<'summary' | 'meds' | 'details'>('summary')

  if (!report) return null

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel() // stop any ongoing speech
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.9 // slightly slower for clarity
      window.speechSynthesis.speak(utterance)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-6xl mx-auto space-y-6"
      id="discharge-report-content" // For PDF export
    >
      {/* Header Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 glass-card p-4">
        <div>
          <h2 className="text-xl font-bold text-white">Discharge Analysis Complete</h2>
          <p className="text-sm text-gray-400">Language: {report.detected_language}</p>
        </div>
        <div className="flex items-center gap-2">
          {report.medications?.length > 0 && (
            <button
              onClick={() => downloadICS(report.medications)}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm transition-colors border border-white/10 text-white"
            >
              <CalendarIcon size={16} /> Add to Calendar
            </button>
          )}
          <WhatsAppShare report={report} />
          <PdfExport elementId="discharge-report-content" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-black/30 p-1 rounded-lg w-full max-w-md mx-auto">
        {(['summary', 'meds', 'details'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`tab-btn capitalize ${activeTab === tab ? 'active' : ''}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* SUMMARY TAB */}
        {activeTab === 'summary' && (
          <motion.div
            key="summary"
            variants={containerVariants}
            initial="hidden"
            animate="show"
            exit="hidden"
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-6">
                <motion.div variants={itemVariants}>
                  <GlassCard title="Simplified Summary">
                    <div className="flex justify-end mb-2">
                      <button 
                        onClick={() => speakText(report.simplified_text)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-neon-cyan/10 hover:bg-neon-cyan/20 text-neon-cyan rounded-lg text-sm transition-colors border border-neon-cyan/20"
                      >
                        <Volume2 size={16} /> Read Aloud
                      </button>
                    </div>
                    <p className="text-gray-200 text-lg leading-relaxed whitespace-pre-wrap">
                      {report.simplified_text}
                    </p>
                  </GlassCard>
                </motion.div>
                <motion.div variants={itemVariants}>
                  <VisualActions actions={report.actions_checklist} />
                </motion.div>
              </div>
              <div className="space-y-6">
                <motion.div variants={itemVariants}>
                  <RiskRadar warnings={report.red_flag_warnings} />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <GlassCard title="Follow Up">
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-400">Date</p>
                      <p className="font-medium text-neon-cyan">{report.follow_up?.appointment_date}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Doctor/Type</p>
                      <p className="font-medium">{report.follow_up?.doctor_type}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Instructions</p>
                      <p className="font-medium text-sm text-gray-300">{report.follow_up?.instructions}</p>
                    </div>
                  </div>
                </GlassCard>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}

        {/* MEDS TAB */}
        {activeTab === 'meds' && (
          <motion.div
            key="meds"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <MedicationTimeline medications={report.medications} />
              </div>
              <div>
                <GlassCard title="Safety Checks">
                  <DrugInteractions 
                    interactions={report.interactions} 
                    allergyAlerts={report.allergy_alerts} 
                  />
                </GlassCard>
              </div>
            </div>
          </motion.div>
        )}

        {/* DETAILS TAB */}
        {activeTab === 'details' && (
          <motion.div
            key="details"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <GlassCard title="Original Details (Translated if needed)">
              <div className="space-y-4">
                {report.summary_3_bullets?.map((bullet, i) => (
                  <div key={i} className="flex gap-3">
                    <span className="text-neon-cyan">•</span>
                    <span className="text-gray-300">{bullet}</span>
                  </div>
                ))}
              </div>
              
              {report.notes && report.notes.length > 0 && (
                <div className="mt-6 pt-6 border-t border-white/10">
                  <h4 className="text-sm font-bold text-gray-400 mb-3">Additional Notes</h4>
                  <ul className="list-disc pl-5 space-y-2 text-sm text-gray-300">
                    {report.notes.map((note, i) => <li key={i}>{note}</li>)}
                  </ul>
                </div>
              )}
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
