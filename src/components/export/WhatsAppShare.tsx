import { Share2 } from 'lucide-react'
import { formatWhatsAppMessage } from '../../lib/formatters'
import type { DischargeReport } from '../../types/discharge'

type Props = {
  report: DischargeReport
}

export default function WhatsAppShare({ report }: Props) {
  const handleShare = () => {
    const text = formatWhatsAppMessage(
      report.simplified_text,
      report.red_flag_warnings || [],
      report.medications || []
    )
    
    // Create WhatsApp intent URL
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`
    window.open(url, '_blank')
  }

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-2 px-4 py-2 bg-[#25D366]/20 hover:bg-[#25D366]/30 text-[#25D366] rounded-lg text-sm transition-colors border border-[#25D366]/30"
    >
      <Share2 size={16} />
      Share via WhatsApp
    </button>
  )
}
