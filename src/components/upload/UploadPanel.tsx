import { useState, useCallback, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import { Upload, Camera, FileText, ClipboardPaste, Sparkles, Loader2 } from 'lucide-react'

type Props = {
  onTextReady: (text: string, file?: File) => void
  loading: boolean
  onAnalyze: () => void
  allergies: string
  onAllergiesChange: (val: string) => void
}

export default function UploadPanel({ onTextReady, loading, onAnalyze, allergies, onAllergiesChange }: Props) {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste' | 'camera'>('upload')
  const [file, setFile] = useState<File | null>(null)
  const [pastedText, setPastedText] = useState('')
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [cameraError, setCameraError] = useState('')

  useEffect(() => {
    let currentStream: MediaStream | null = null;
    
    if (activeTab === 'camera') {
      setCameraError('')
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then(s => {
          currentStream = s
          setStream(s)
          if (videoRef.current) {
             videoRef.current.srcObject = s
             videoRef.current.play().catch(e => console.error(e))
          }
        })
        .catch(() => setCameraError("Camera access denied or unavailable."))
    }
    
    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach(t => t.stop())
      }
    }
  }, [activeTab])

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')
      ctx?.drawImage(video, 0, 0)
      
      canvas.toBlob(blob => {
        if (blob) {
          const f = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' })
          setFile(f)
          onTextReady('', f)
          // Stop stream and show success
          stream?.getTracks().forEach(t => t.stop())
          setStream(null)
          setActiveTab('upload') // switch back to upload tab to show the file
        }
      }, 'image/jpeg', 0.9)
    }
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const f = acceptedFiles[0]
    setFile(f)
    onTextReady('', f)
  }, [onTextReady])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.jpg', '.jpeg', '.png'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxSize: 50 * 1024 * 1024, // 50MB
  })

  const handlePasteSubmit = () => {
    if (pastedText.trim()) {
      onTextReady(pastedText.trim())
    }
  }

  const tabs = [
    { id: 'upload' as const, label: 'Upload', icon: Upload },
    { id: 'paste' as const, label: 'Paste', icon: ClipboardPaste },
    { id: 'camera' as const, label: 'Camera', icon: Camera },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="glass-card p-6 shadow-2xl"
    >
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2 neon-text-cyan">
        <Upload size={20} /> Upload Discharge
      </h2>

      {/* Tabs */}
      <div className="flex gap-1 bg-black/30 p-1 rounded-lg mb-4">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`tab-btn flex items-center justify-center gap-1 ${activeTab === tab.id ? 'active' : ''}`}
          >
            <tab.icon size={14} /> {tab.label}
          </button>
        ))}
      </div>

      {/* Upload Tab */}
      {activeTab === 'upload' && (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all dropzone
            ${isDragActive ? 'border-neon-cyan bg-neon-cyan/10' : 'border-white/20 hover:border-neon-cyan/50'}`}
        >
          <input {...getInputProps()} id="file-upload" />
          <Upload className="mx-auto mb-3 text-neon-cyan" size={40} />
          <p className="text-sm">Drop PDF, Image, or DOCX here</p>
          <p className="text-xs text-gray-500 mt-1">or click to browse • Max 50MB</p>
          <div className="flex gap-2 justify-center mt-4">
            {['PDF', 'JPG', 'DOCX'].map(t => (
              <span key={t} className="px-3 py-1 text-xs bg-neon-cyan/10 text-neon-cyan rounded-md">{t}</span>
            ))}
          </div>
        </div>
      )}

      {/* Paste Tab */}
      {activeTab === 'paste' && (
        <div>
          <textarea
            value={pastedText}
            onChange={e => setPastedText(e.target.value)}
            placeholder="Paste discharge text here..."
            className="glass-input h-40 resize-none"
            id="paste-text"
          />
          <button
            onClick={handlePasteSubmit}
            disabled={!pastedText.trim()}
            className="glow-btn w-full mt-3 flex items-center justify-center gap-2 text-sm"
          >
            <FileText size={16} /> Use This Text
          </button>
        </div>
      )}

      {/* Camera Tab */}
      {activeTab === 'camera' && (
        <div className="flex flex-col items-center py-4 space-y-4">
          {cameraError ? (
            <div className="text-center py-6 text-red-400">
              <Camera className="mx-auto mb-3 opacity-50" size={40} />
              <p className="text-sm">{cameraError}</p>
              <p className="text-xs mt-1">Please allow camera permissions or use the Upload tab.</p>
            </div>
          ) : (
            <>
              <div className="relative w-full max-w-sm rounded-xl overflow-hidden border border-white/20 bg-black/50 aspect-[3/4] flex items-center justify-center">
                {!stream && <Loader2 className="animate-spin text-neon-cyan" size={30} />}
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  className={`absolute inset-0 w-full h-full object-cover ${!stream ? 'opacity-0' : 'opacity-100 transition-opacity'}`}
                />
              </div>
              <canvas ref={canvasRef} className="hidden" />
              <button
                onClick={captureImage}
                disabled={!stream}
                className="glow-btn flex items-center gap-2"
              >
                <Camera size={18} /> Capture Document
              </button>
            </>
          )}
        </div>
      )}

      {/* File indicator */}
      {file && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-3 text-sm text-neon-green flex items-center gap-1"
        >
          ✓ {file.name}
        </motion.p>
      )}

      {/* Allergy input */}
      <div className="mt-4">
        <label className="text-xs text-gray-400 mb-1 block">
          Known allergies? (optional)
        </label>
        <input
          type="text"
          value={allergies}
          onChange={e => onAllergiesChange(e.target.value)}
          placeholder="e.g., penicillin, sulfa, latex"
          className="glass-input text-sm"
          id="allergy-input"
        />
      </div>

      {/* Analyze button */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={onAnalyze}
        disabled={loading || (!file && !pastedText.trim())}
        className="glow-btn w-full mt-4 flex items-center justify-center gap-2"
        id="analyze-btn"
      >
        {loading ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
        {loading ? 'Analyzing with AI...' : 'Translate & Simplify'}
      </motion.button>
    </motion.div>
  )
}
