import {
  Pill, Droplets, BedDouble, Thermometer,
  Bandage, Apple, PersonStanding, Ban,
  Calendar, Siren, Stethoscope, Heart,
  Wind, Eye, Ear, Brain
} from 'lucide-react'
import type { ComponentType } from 'react'

type IconConfig = {
  icon: ComponentType<{ size?: number; className?: string }>
  color: string     // tailwind text color class
  bgColor: string   // tailwind bg color class
  label: string     // default English label
}

/**
 * Maps AI-returned icon_hint strings to Lucide icons + styling.
 * The AI prompt instructs: icon_hint should be one of these names.
 */
export const ICON_MAP: Record<string, IconConfig> = {
  pill: {
    icon: Pill,
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-400/10',
    label: 'Pills',
  },
  droplet: {
    icon: Droplets,
    color: 'text-blue-400',
    bgColor: 'bg-blue-400/10',
    label: 'Water',
  },
  droplets: {
    icon: Droplets,
    color: 'text-blue-400',
    bgColor: 'bg-blue-400/10',
    label: 'Water',
  },
  bed: {
    icon: BedDouble,
    color: 'text-purple-400',
    bgColor: 'bg-purple-400/10',
    label: 'Rest',
  },
  'bed-double': {
    icon: BedDouble,
    color: 'text-purple-400',
    bgColor: 'bg-purple-400/10',
    label: 'Rest',
  },
  thermometer: {
    icon: Thermometer,
    color: 'text-orange-400',
    bgColor: 'bg-orange-400/10',
    label: 'Temp',
  },
  bandage: {
    icon: Bandage,
    color: 'text-red-400',
    bgColor: 'bg-red-400/10',
    label: 'Wound',
  },
  apple: {
    icon: Apple,
    color: 'text-green-400',
    bgColor: 'bg-green-400/10',
    label: 'Diet',
  },
  'person-standing': {
    icon: PersonStanding,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-400/10',
    label: 'Move',
  },
  ban: {
    icon: Ban,
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    label: 'Avoid',
  },
  calendar: {
    icon: Calendar,
    color: 'text-cyan-300',
    bgColor: 'bg-cyan-300/10',
    label: 'Appt',
  },
  siren: {
    icon: Siren,
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    label: 'ER',
  },
  stethoscope: {
    icon: Stethoscope,
    color: 'text-teal-400',
    bgColor: 'bg-teal-400/10',
    label: 'Doctor',
  },
  heart: {
    icon: Heart,
    color: 'text-pink-400',
    bgColor: 'bg-pink-400/10',
    label: 'Heart',
  },
  wind: {
    icon: Wind,
    color: 'text-sky-400',
    bgColor: 'bg-sky-400/10',
    label: 'Breathe',
  },
  eye: {
    icon: Eye,
    color: 'text-indigo-400',
    bgColor: 'bg-indigo-400/10',
    label: 'Watch',
  },
  ear: {
    icon: Ear,
    color: 'text-amber-400',
    bgColor: 'bg-amber-400/10',
    label: 'Listen',
  },
  brain: {
    icon: Brain,
    color: 'text-fuchsia-400',
    bgColor: 'bg-fuchsia-400/10',
    label: 'Mind',
  },
}

/**
 * Get icon config, with fallback to Pill if unknown hint.
 */
export function getIconConfig(hint?: string): IconConfig {
  if (!hint) return ICON_MAP.pill
  return ICON_MAP[hint.toLowerCase()] || ICON_MAP.pill
}
