import { useState } from 'react'
import { supabase } from '../lib/supabase'
import type { DischargeReport } from '../types/discharge'

import Navbar from './layout/Navbar'
import UploadPanel from './upload/UploadPanel'
import Dashboard from './results/Dashboard'
import AskLensChat from './chat/AskLens'
import LoadingSpinner from './ui/LoadingSpinner'
import Disclaimer from './ui/Disclaimer'

export default function MainLayout() {
  const [language, setLanguage] = useState('en')
  const [report, setReport] = useState<DischargeReport | null>(null)
  const [loading, setLoading] = useState(false)
  const [allergies, setAllergies] = useState('')
  const [originalText, setOriginalText] = useState('')

  const handleTextReady = (text: string, file?: File) => {
    setOriginalText(text || (file ? `File: ${file.name}` : ''))
  }

  const handleAnalyze = async () => {
    if (!originalText || !originalText.trim()) {
      alert("Please upload a document or paste some text first!")
      return
    }

    setLoading(true)
    
    try {
      // In a real app with file upload, you would upload to Supabase Storage first,
      // then pass the file URL to the Edge Function.
      // Since this is a hackathon, we'll pass the raw text we collected.
      
      const payload = {
        text: originalText,
        target_language: language,
        allergies: allergies
      }

      const { data, error } = await supabase.functions.invoke('analyze-discharge', {
        body: payload
      })

      if (error) {
        let errorMsg = error.message;
        try {
          const context = await error.context?.json();
          if (context && context.error) errorMsg = context.error;
        } catch (e) {
           // ignore parsing errors
        }
        throw new Error(errorMsg)
      }

      setReport(data)
    } catch (err: any) {
      console.error("Analysis failed:", err)
      alert(`Failed to analyze discharge.\nError: ${err.message || 'Unknown'}\nPlease check your Supabase connection and Gemini API key.`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <Navbar language={language} onLanguageChange={setLanguage} />
      
      <main className="max-w-6xl mx-auto space-y-8 pb-24">
        <Disclaimer />

        {!report && !loading && (
          <div className="max-w-xl mx-auto mt-12">
            <UploadPanel 
              onTextReady={handleTextReady}
              loading={loading}
              onAnalyze={handleAnalyze}
              allergies={allergies}
              onAllergiesChange={setAllergies}
            />
          </div>
        )}

        {loading && <LoadingSpinner />}

        {report && (
          <>
            <Dashboard report={report} />
            <AskLensChat originalText={originalText} />
          </>
        )}
      </main>
    </div>
  )
}
