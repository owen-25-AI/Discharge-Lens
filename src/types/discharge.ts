// Discharge Lens — Canonical Types
// All components use these types. Matches AI JSON schema exactly.

export type ActionItem = {
  action: string
  when: string
  icon_hint?: string // lucide icon name: pill, droplet, bed, calendar, etc.
  visual_label?: string // one-word label translated to target language
  priority?: 'high' | 'medium' | 'low'
}

export type Medication = {
  name: string
  dose_plain: string // "Take 1 pill" not "500mg BID"
  frequency: string // "2 times per day"
  with_food?: boolean
  duration_days: number
  times?: string[] // ["08:00", "20:00"]
}

export type FollowUp = {
  appointment_date: string // ISO date or "Not specified"
  doctor_type: string
  instructions: string
}

export type DrugInteraction = {
  severity: 'critical' | 'moderate' | 'info'
  drugs: string[]
  message: string
  icon: string
}

export type AllergyAlert = {
  allergen: string
  flagged_drugs: string[]
  severity: 'critical' | 'moderate'
  message: string
}

export type DischargeReport = {
  id?: string
  user_id?: string
  created_at?: string
  status?: 'processing' | 'completed' | 'failed'

  // Input
  file_url?: string
  original_text?: string
  file_type?: string

  // AI Output — matches the production AI prompt schema exactly
  detected_language: string
  simplified_text: string
  summary_3_bullets: string[]
  actions_checklist: ActionItem[]
  medications: Medication[]
  follow_up: FollowUp
  red_flag_warnings: string[]
  confidence_score: number

  // Drug safety (from expanded prompt)
  interactions?: DrugInteraction[]
  allergy_alerts?: AllergyAlert[]
  notes?: string[]
}

// Chat types for Ask Lens
export type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

// Language config
export type Language = {
  code: string
  name: string
  nativeName: string
  flag: string
}
