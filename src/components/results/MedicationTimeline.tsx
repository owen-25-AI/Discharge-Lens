import { useState, useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts'
import { motion, AnimatePresence } from 'framer-motion'
import { Pill, CalendarDays, BarChart3 } from 'lucide-react'
import type { Medication } from '../../types/discharge'
import GlassCard from '../ui/GlassCard'

type Props = {
  medications: Medication[]
  defaultView?: 'bar' | 'calendar'
}

export function parseFrequency(freq: string): number {
  const match = freq.match(/(\d+)/)
  return match ? parseInt(match[1]) : 1
}

// Generate array of days: Day 1, Day 2...
const generateCalendarData = (meds: Medication[]) => {
  const maxDays = Math.max(...meds.map(m => m.duration_days || 7), 0)
  return Array.from({ length: maxDays }, (_, i) => {
    const day = i + 1
    const dayData: any = { day: `Day ${day}` }
    meds.forEach(med => {
      dayData[med.name] = day <= (med.duration_days || 7) ? parseFrequency(med.frequency) : 0
    })
    return dayData
  })
}

export default function MedicationTimeline({ medications, defaultView = 'bar' }: Props) {
  const [view, setView] = useState<'bar' | 'calendar'>(defaultView)

  const barData = useMemo(() => {
    return medications.map(med => ({
      name: med.name,
      total_doses: parseFrequency(med.frequency) * (med.duration_days || 7),
      duration: med.duration_days || 7
    }))
  }, [medications])

  const calendarData = useMemo(() => generateCalendarData(medications), [medications])

  if (!medications || medications.length === 0) {
    return (
      <GlassCard className="text-center py-10">
        <Pill className="mx-auto mb-4 text-neon-cyan opacity-50" size={48} />
        <p className="text-neon-cyan font-semibold">No medications found</p>
        <p className="text-sm text-gray-400 mt-1">There are no medication records to display for this discharge.</p>
      </GlassCard>
    )
  }

  return (
    <GlassCard>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold flex items-center gap-2 neon-text-cyan">
          <Pill size={20} /> Medication Timeline
        </h3>
        <div className="flex gap-1 bg-black/30 p-1 rounded-lg">
          <button
            onClick={() => setView('bar')}
            className={`p-2 rounded-md transition-colors ${view === 'bar' ? 'bg-neon-cyan text-black shadow-[0_0_10px_rgba(0,245,255,0.3)]' : 'text-gray-400 hover:text-white'}`}
            title="Overview (Bar Chart)"
          >
            <BarChart3 size={16} />
          </button>
          <button
            onClick={() => setView('calendar')}
            className={`p-2 rounded-md transition-colors ${view === 'calendar' ? 'bg-neon-cyan text-black shadow-[0_0_10px_rgba(0,245,255,0.3)]' : 'text-gray-400 hover:text-white'}`}
            title="Daily Schedule (Calendar View)"
          >
            <CalendarDays size={16} />
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {view === 'bar' && (
          <motion.div
            key="bar"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="h-[250px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="#6b7280" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#6b7280" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'rgba(3,7,18,0.9)', border: '1px solid var(--color-glass-border)', borderRadius: '0.5rem', color: '#fff' }}
                  itemStyle={{ color: 'var(--color-neon-cyan)' }}
                  formatter={(value: any, _name: any, props: any) => [`${value} doses over ${props.payload.duration} days`, 'Total']}
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                />
                <Bar dataKey="total_doses" radius={[4, 4, 0, 0]}>
                  {barData.map((_entry, index) => (
                    <Cell key={index} fill={index % 2 === 0 ? 'var(--color-neon-cyan)' : 'var(--color-neon-green)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {view === 'calendar' && (
          <motion.div
            key="calendar"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="h-[250px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={calendarData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="day" stroke="#6b7280" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#6b7280" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} label={{ value: 'Doses', angle: -90, position: 'insideLeft', fill: '#6b7280', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'rgba(3,7,18,0.9)', border: '1px solid var(--color-glass-border)', borderRadius: '0.5rem', color: '#fff' }}
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                />
                {medications.map((med, i) => (
                  <Bar
                    key={med.name}
                    dataKey={med.name}
                    stackId="a"
                    fill={i % 2 === 0 ? 'var(--color-neon-cyan)' : 'var(--color-neon-green)'}
                    radius={i === medications.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  )
}
