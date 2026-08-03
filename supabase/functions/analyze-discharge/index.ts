import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Edge Function CORS Headers
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SYSTEM_PROMPT = `You are Discharge Lens, an advanced medical AI designed to translate complex hospital discharge papers into simple, actionable, and visual instructions for patients.
You must return your analysis strictly as a JSON object matching the provided schema. Do not include markdown code blocks, just the raw JSON.
Simplify medical jargon (e.g. use "Take 1 pill, 2 times a day" instead of "500mg BID").
Identify potential red flags that require immediate ER visits.
Detect the primary language of the document and translate the simplified text and labels to that language if requested, but keep the JSON keys in English.`

const JSON_SCHEMA = {
  "type": "object",
  "properties": {
    "detected_language": { "type": "string" },
    "simplified_text": { "type": "string", "description": "A 6th-grade reading level summary of the discharge." },
    "summary_3_bullets": {
      "type": "array",
      "items": { "type": "string" },
      "description": "3 key takeaways."
    },
    "actions_checklist": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "action": { "type": "string" },
          "when": { "type": "string" },
          "icon_hint": { "type": "string", "description": "Must be one of: pill, droplet, bed, thermometer, bandage, apple, person-standing, ban, calendar, siren, stethoscope, heart, wind, eye, ear, brain." },
          "visual_label": { "type": "string", "description": "One word label for the icon." }
        },
        "required": ["action", "when", "icon_hint"]
      }
    },
    "medications": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "name": { "type": "string" },
          "dose_plain": { "type": "string" },
          "frequency": { "type": "string" },
          "with_food": { "type": "boolean" },
          "duration_days": { "type": "number" },
          "times": { "type": "array", "items": { "type": "string" } }
        },
        "required": ["name", "dose_plain", "frequency"]
      }
    },
    "follow_up": {
      "type": "object",
      "properties": {
        "appointment_date": { "type": "string" },
        "doctor_type": { "type": "string" },
        "instructions": { "type": "string" }
      },
      "required": ["appointment_date", "doctor_type", "instructions"]
    },
    "red_flag_warnings": {
      "type": "array",
      "items": { "type": "string" }
    },
    "interactions": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "severity": { "type": "string", "enum": ["critical", "moderate", "info"] },
          "drugs": { "type": "array", "items": { "type": "string" } },
          "message": { "type": "string" }
        },
        "required": ["severity", "drugs", "message"]
      }
    },
    "allergy_alerts": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "allergen": { "type": "string" },
          "flagged_drugs": { "type": "array", "items": { "type": "string" } },
          "severity": { "type": "string", "enum": ["critical", "moderate"] },
          "message": { "type": "string" }
        },
        "required": ["allergen", "flagged_drugs", "severity", "message"]
      }
    },
    "confidence_score": { "type": "number", "minimum": 0, "maximum": 100 }
  },
  "required": [
    "detected_language", "simplified_text", "summary_3_bullets",
    "actions_checklist", "medications", "follow_up", "red_flag_warnings", "confidence_score"
  ]
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { text, file_url, mime_type, target_language, allergies } = await req.json()
    const apiKey = Deno.env.get('GEMINI_API_KEY')

    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is missing")
    }

    const contents = []
    
    // Gemini Payload Construction
    if (file_url) {
      // In a real implementation, you would fetch the file and convert it to Base64
      // For this hackathon stub, we simulate reading a base64 file string if provided directly,
      // or we just rely on text if OCR was done client-side.
      contents.push({
        role: "user",
        parts: [
          { text: `Please analyze this discharge document. Patient allergies: ${allergies || 'None reported'}. Target language for simplification: ${target_language || 'English'}` }
          // If we had the raw base64:
          // { inlineData: { mimeType: mime_type || "application/pdf", data: base64Data } }
        ]
      })
    } else if (text) {
      contents.push({
        role: "user",
        parts: [
          { text: `Please analyze this discharge text:\n\n${text}\n\nPatient allergies: ${allergies || 'None reported'}. Target language for simplification: ${target_language || 'English'}` }
        ]
      })
    } else {
      throw new Error("Must provide text or file_url")
    }

    // Add System Prompt Instructions
    contents[0].parts.push({
      text: `SYSTEM INSTRUCTIONS: ${SYSTEM_PROMPT}\n\nOUTPUT SCHEMA: ${JSON.stringify(JSON_SCHEMA)}`
    })

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.1 // Low temp for more deterministic output
        }
      })
    })

    const result = await response.json()
    
    if (!response.ok) {
      console.error("Gemini API Error:", result)
      throw new Error(`Gemini API Error: ${result.error?.message || 'Unknown'}`)
    }

    const aiOutputText = result.candidates[0].content.parts[0].text
    const jsonOutput = JSON.parse(aiOutputText)

    return new Response(JSON.stringify(jsonOutput), {
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
