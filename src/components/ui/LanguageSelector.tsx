import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Globe, ChevronDown } from 'lucide-react'
import { LANGUAGES, detectBrowserLanguage } from '../../lib/languages'

type Props = {
  value: string
  onChange: (code: string) => void
}

export default function LanguageSelector({ value, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Auto-detect on mount
  useEffect(() => {
    if (!value) {
      onChange(detectBrowserLanguage())
    }
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const selected = LANGUAGES.find(l => l.code === value) || LANGUAGES[0]

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-sm"
      >
        <Globe size={16} className="text-neon-cyan" />
        <span>{selected.flag} {selected.name}</span>
        <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-56 glass-card-heavy p-2 z-50 max-h-72 overflow-y-auto"
          >
            {LANGUAGES.map(lang => (
              <button
                key={lang.code}
                onClick={() => { onChange(lang.code); setOpen(false) }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors
                  ${lang.code === value ? 'bg-neon-cyan/20 text-neon-cyan' : 'hover:bg-white/10 text-gray-300'}`}
              >
                <span>{lang.flag}</span>
                <span>{lang.name}</span>
                <span className="text-xs text-gray-500 ml-auto">{lang.nativeName}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
