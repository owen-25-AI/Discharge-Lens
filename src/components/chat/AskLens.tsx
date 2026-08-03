import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Bot, X, Loader2, MessageSquareText } from 'lucide-react'
import { supabase } from '../../lib/supabase'

type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
}

type Props = {
  dischargeId?: string
  originalText?: string
}

export default function AskLensChat({ dischargeId, originalText }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hi! I'm Lens. I can answer questions about your discharge instructions. Ask me anything!",
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom on new message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isLoading])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: ChatMessage = { id: Date.now().toString(), role: 'user', content: input.trim() }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      // In a full implementation, this calls the Supabase Edge Function 'ask-lens'
      // which uses RAG (Retrieval-Augmented Generation) on the discharge document.
      
      const { data, error } = await supabase.functions.invoke('ask-lens', {
        body: {
          question: userMessage.content,
          discharge_id: dischargeId,
          original_text: originalText, // fallback if no discharge_id
          history: messages.filter(m => m.id !== 'welcome').map(m => ({ role: m.role, content: m.content }))
        }
      })

      if (error) throw error

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.answer || "I'm sorry, I couldn't find an answer to that in your discharge papers. Please ask your doctor."
      }])
      
    } catch (err) {
      console.error('Ask Lens Error:', err)
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Oops! Something went wrong connecting to my brain. Please try again later."
      }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="chat-fab"
        style={{ display: isOpen ? 'none' : 'flex' }}
      >
        <MessageSquareText size={24} color="black" />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 w-[350px] h-[500px] glass-card-heavy flex flex-col shadow-[0_10px_40px_rgba(0,0,0,0.5)] z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/20">
              <div className="flex items-center gap-2">
                <Bot className="text-neon-cyan" size={20} />
                <h3 className="font-bold text-sm">Ask Lens</h3>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-neon-cyan to-neon-green text-black rounded-tr-sm'
                      : 'bg-white/10 text-white rounded-tl-sm border border-white/5'
                  }`}>
                    {msg.role === 'assistant' && msg.id !== 'welcome' && (
                      <div className="flex items-center gap-1 mb-1 opacity-70">
                        <Bot size={12} /> <span className="text-[10px] uppercase font-bold tracking-wider">Lens AI</span>
                      </div>
                    )}
                    {msg.content}
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white/5 border border-white/10 p-3 rounded-2xl rounded-tl-sm flex items-center gap-2">
                    <Loader2 size={14} className="text-neon-cyan animate-spin" />
                    <span className="text-xs text-gray-400">Searching discharge papers...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-3 border-t border-white/10 bg-black/20">
              <form 
                onSubmit={e => { e.preventDefault(); handleSend() }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Ask a question..."
                  className="flex-1 bg-black/40 border border-white/10 rounded-full px-4 py-2 text-sm outline-none focus:border-neon-cyan transition-colors"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-neon-cyan hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send size={16} className="ml-1" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
