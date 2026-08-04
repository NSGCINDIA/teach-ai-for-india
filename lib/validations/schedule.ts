/**
 * Validates that a date and start time combination is not in the past relative to the current local time.
 * Returns null if valid, or a human-friendly error message if invalid.
 */
export function validateFutureSchedule(dateStr: string, timeStr?: string | null): string | null {
  if (!dateStr) return null

  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const todayStr = `${year}-${month}-${day}`

  if (dateStr < todayStr) {
    return 'Planned date cannot be in the past. Please select today or a future date.'
  }

  if (dateStr === todayStr && timeStr) {
    const [h, m] = timeStr.split(':').map(Number)
    if (!isNaN(h) && !isNaN(m)) {
      const scheduledMinutes = h * 60 + m
      const currentMinutes = now.getHours() * 60 + now.getMinutes()
      if (scheduledMinutes < currentMinutes) {
        return 'Planned start time cannot be in the past. Please select a future time.'
      }
    }
  }

  return null
}

/**
 * Returns default date and next upcoming hour strings for scheduling forms.
 */
export function getInitialScheduleDefaults() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const todayStr = `${year}-${month}-${day}`

  // Next rounded hour (e.g. 14:29 -> 15:00)
  const nextHour = now.getMinutes() > 0 ? now.getHours() + 1 : now.getHours()
  const defaultHour = Math.min(Math.max(nextHour, 8), 18) // Clamp between 08:00 and 18:00
  const timeStr = `${String(defaultHour).padStart(2, '0')}:00`

  return { todayStr, timeStr }
}
