import { useState } from 'react'
import { FileDown, Loader2 } from 'lucide-react'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

type Props = {
  elementId: string
  filename?: string
}

export default function PdfExport({ elementId, filename = 'discharge-summary.pdf' }: Props) {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    const element = document.getElementById(elementId)
    if (!element) return

    setIsExporting(true)
    try {
      const canvas = await html2canvas(element, {
        scale: 2, // higher res
        useCORS: true,
        backgroundColor: '#030712' // match bg-primary
      })
      
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      })
      
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height)
      pdf.save(filename)
    } catch (err) {
      console.error('PDF Export failed:', err)
      alert('Failed to generate PDF. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm transition-colors border border-white/10 text-white"
    >
      {isExporting ? <Loader2 size={16} className="animate-spin" /> : <FileDown size={16} />}
      Save PDF
    </button>
  )
}
