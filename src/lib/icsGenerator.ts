/**
 * .ICS calendar file generator for medication reminders.
 * Creates VEVENT entries compatible with Google Calendar, Apple Calendar, Outlook.
 */

import type { Medication } from '../types/discharge'

function formatICSDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
}

function generateUID(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}@discharge-lens`
}

/**
 * Parse a time string like "08:00" and return a Date set to that time today.
 */
function parseTime(timeStr: string, dayOffset = 0): Date {
  const [hours, minutes] = timeStr.split(':').map(Number)
  const date = new Date()
  date.setDate(date.getDate() + dayOffset)
  date.setHours(hours, minutes, 0, 0)
  return date
}

/**
 * Generate .ICS content for all medication reminders.
 */
export function generateICS(medications: Medication[]): string {
  const events: string[] = []

  for (const med of medications) {
    const times = med.times || ['08:00'] // default to morning if no times
    const durationDays = med.duration_days || 7

    for (const time of times) {
      const startDate = parseTime(time)
      const endDate = new Date(startDate.getTime() + 15 * 60 * 1000) // 15 min duration

      const event = [
        'BEGIN:VEVENT',
        `UID:${generateUID()}`,
        `DTSTART:${formatICSDate(startDate)}`,
        `DTEND:${formatICSDate(endDate)}`,
        `SUMMARY:💊 Take ${med.name} - ${med.dose_plain}`,
        `DESCRIPTION:${med.dose_plain}\\n${med.frequency}${med.with_food ? '\\nTake with food' : ''}`,
        `RRULE:FREQ=DAILY;COUNT=${durationDays}`,
        'BEGIN:VALARM',
        'TRIGGER:-PT5M',
        'ACTION:DISPLAY',
        `DESCRIPTION:Time to take ${med.name}`,
        'END:VALARM',
        'END:VEVENT',
      ].join('\r\n')

      events.push(event)
    }
  }

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Discharge Lens//Medication Reminders//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    ...events,
    'END:VCALENDAR',
  ].join('\r\n')
}

/**
 * Trigger download of the .ICS file.
 */
export function downloadICS(medications: Medication[]): void {
  const content = generateICS(medications)
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'medication-reminders.ics'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
