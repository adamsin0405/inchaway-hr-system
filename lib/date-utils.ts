const TZ = 'Asia/Kuala_Lumpur'

// Returns today's date in Malaysia (UTC+8) as 'YYYY-MM-DD'
export function todayMY(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: TZ })
}

// Returns current month in Malaysia as 'YYYY-MM'
export function currentMonthMY(): string {
  return todayMY().slice(0, 7)
}

// Returns a month label like 'April 2026'
export function monthLabel(month: string): string {
  const [year, m] = month.split('-')
  return new Date(Number(year), Number(m) - 1, 1).toLocaleDateString('en-MY', { month: 'long', year: 'numeric' })
}
