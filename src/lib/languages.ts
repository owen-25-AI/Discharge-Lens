import type { Language } from '../types/discharge'

export const LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska', flag: '🇸🇪' },
  { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili', flag: '🇰🇪' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'mi', name: 'Maori', nativeName: 'Māori', flag: '🇳🇿' },
  { code: 'gsw', name: 'Swiss German', nativeName: 'Schwiizerdütsch', flag: '🇨🇭' },
]

/**
 * Detect the user's preferred language from browser settings.
 * Falls back to English if not matched.
 */
export function detectBrowserLanguage(): string {
  const browserLang = navigator.language?.split('-')[0] || 'en'
  const match = LANGUAGES.find(l => l.code === browserLang)
  return match ? match.code : 'en'
}

export function getLanguageName(code: string): string {
  return LANGUAGES.find(l => l.code === code)?.name || code
}

export function getLanguageFlag(code: string): string {
  return LANGUAGES.find(l => l.code === code)?.flag || '🌐'
}
