import { Download, LogOut } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import LanguageSelector from '../ui/LanguageSelector'

type Props = {
  language: string
  onLanguageChange: (code: string) => void
}

export default function Navbar({ language, onLanguageChange }: Props) {
  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <header className="flex justify-between items-center mb-8">
      <div className="flex items-center gap-3">
        <img src="/logo.jpg" alt="Discharge Lens" className="w-10 h-10 rounded-lg" />
        <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-neon-cyan to-neon-green bg-clip-text text-transparent">
          DISCHARGE LENS
        </h1>
      </div>
      <div className="flex items-center gap-3">
        <LanguageSelector value={language} onChange={onLanguageChange} />
        <button
          onClick={() => window.print()}
          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          title="Download / Print"
        >
          <Download size={18} />
        </button>
        <button
          onClick={handleLogout}
          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          title="Sign out"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  )
}
