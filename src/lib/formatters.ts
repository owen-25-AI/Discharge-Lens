/**
 * Dosage and date formatting utilities for Discharge Lens.
 */

/**
 * Parse frequency string like "2 times per day" to a number.
 */
export function parseFrequency(freq: string): number {
  const match = freq.match(/(\d+)/)
  return match ? parseInt(match[1], 10) : 1
}

/**
 * Format a time string "14:00" to human-readable "2:00 PM".
 */
export function formatTime(time24: string): string {
  const [hours, minutes] = time24.split(':').map(Number)
  const period = hours >= 12 ? 'PM' : 'AM'
  const displayHours = hours % 12 || 12
  return `${displayHours}:${String(minutes).padStart(2, '0')} ${period}`
}

/**
 * Format a date string to locale-friendly display.
 */
export function formatDate(dateStr: string): string {
  if (!dateStr || dateStr === 'Not specified') return 'Not specified'
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return dateStr
  }
}

/**
 * Truncate text to maxLength with ellipsis.
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength - 3) + '...'
}

/**
 * Format a WhatsApp message from discharge report data.
 */
export function formatWhatsAppMessage(
  simplified: string,
  redFlags: string[],
  medications: { name: string; dose_plain: string; frequency: string }[]
): string {
  let msg = `🏥 *Discharge Summary*\n\n${simplified}\n\n`

  if (medications.length > 0) {
    msg += `💊 *Medications:*\n`
    medications.forEach(m => {
      msg += `• ${m.name}: ${m.dose_plain}, ${m.frequency}\n`
    })
    msg += '\n'
  }

  if (redFlags.length > 0) {
    msg += `🚨 *Go to ER if:*\n`
    redFlags.forEach(f => {
      msg += `• ${f}\n`
    })
  }

  msg += `\n_Sent via Discharge Lens_`
  return msg
}

/**
 * Chunked base64 encoding that won't crash on large files.
 * The spread operator approach fails for files > ~100KB.
 */
export function uint8ToBase64(bytes: Uint8Array): string {
  let binary = ''
  const chunkSize = 8192
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize))
  }
  return btoa(binary)
}
