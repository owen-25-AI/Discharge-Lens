import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { question, original_text, history } = await req.json()
    const apiKey = Deno.env.get('GEMINI_API_KEY')

    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is missing")
    }

    if (!original_text && !question) {
      throw new Error("Missing required fields: question and original_text")
    }

    const systemPrompt = `You are Lens, a helpful medical assistant. 
    You are answering questions about a patient's discharge instructions.
    
    CRITICAL RULE: You can ONLY answer using the provided discharge text. 
    If the answer is not in the text, you MUST say exactly: 'I cannot find that in your discharge papers. Please ask your doctor.'
    Do not guess, do not use outside medical knowledge, do not offer medical advice beyond what is explicitly written in the document.
    
    Here is the patient's discharge text:
    """
    ${original_text}
    """`

    const contents = [
      {
        role: "user",
        parts: [{ text: systemPrompt }]
      },
      {
        role: "model",
        parts: [{ text: "Understood. I will only answer based on the provided text." }]
      }
    ]

    // Append chat history
    if (history && history.length > 0) {
      for (const msg of history) {
        contents.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }]
        })
      }
    }

    // Append current question
    contents.push({
      role: "user",
      parts: [{ text: question }]
    })

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.1 // Keep it grounded
        }
      })
    })

    const result = await response.json()
    
    if (!response.ok) {
      console.error("Gemini API Error:", result)
      throw new Error(`Gemini API Error: ${result.error?.message || 'Unknown'}`)
    }

    const answer = result.candidates[0].content.parts[0].text

    return new Response(JSON.stringify({ answer }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
