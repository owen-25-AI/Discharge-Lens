import { ShieldAlert } from 'lucide-react'

export default function Disclaimer() {
  return (
    <div className="glass-card px-4 py-3 flex items-center gap-3 text-sm text-amber-300/80">
      <ShieldAlert size={18} className="shrink-0" />
      <span>
        <strong>Discharge Lens</strong> help patients understand their medications and doctor's prescriptions, discharge information content and translate medical jargon to language everyone understands. This is not a substitute for professional medical advice.
      </span>
    </div>
  )
}
