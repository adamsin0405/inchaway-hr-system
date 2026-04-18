import type { Employee, Attendance, Trip, Allowance } from './types'

export function calcOtHours(att: Attendance, standardHours: number): number {
  if (!att.clockInAt || !att.clockOutAt) return 0
  const ms = new Date(att.clockOutAt).getTime() - new Date(att.clockInAt).getTime()
  return Math.max(0, ms / 3_600_000 - standardHours)
}

export function calcMonthlyOt(
  employeeId: string,
  month: string,
  attendance: Attendance[],
  standardHours: number,
  otHourlyRate: number,
): { totalOtHours: number; otAmount: number } {
  const rows = attendance.filter(a => a.employeeId === employeeId && a.date.startsWith(month))
  const totalOtHours = rows.reduce((s, a) => s + calcOtHours(a, standardHours), 0)
  return { totalOtHours, otAmount: Math.round(totalOtHours * otHourlyRate * 100) / 100 }
}

export function calcTripEarnings(employeeId: string, month: string, trips: Trip[], tripRate: number): number {
  return trips
    .filter(t => t.employeeId === employeeId && t.date.startsWith(month))
    .reduce((s, t) => s + t.tripCount, 0) * tripRate
}

export function calcAllowancesTotal(employeeId: string, month: string, allowances: Allowance[]): number {
  return allowances
    .filter(a => a.employeeId === employeeId && a.date.startsWith(month) && a.status === 'approved')
    .reduce((s, a) => s + a.amount, 0)
}

export function calcGrossPay(
  employee: Employee,
  month: string,
  attendance: Attendance[],
  trips: Trip[],
  allowances: Allowance[],
) {
  const { totalOtHours, otAmount } = calcMonthlyOt(employee.id, month, attendance, employee.standardHours, employee.otHourlyRate)
  const tripEarnings = calcTripEarnings(employee.id, month, trips, employee.tripRate)
  const allowancesTotal = calcAllowancesTotal(employee.id, month, allowances)
  const grossPay = employee.baseSalary + tripEarnings + otAmount + allowancesTotal
  return { baseSalary: employee.baseSalary, tripEarnings, otAmount, allowancesTotal, grossPay, totalOtHours }
}

export function formatRM(amount: number): string {
  return `RM ${amount.toFixed(2)}`
}

export function formatTime(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleTimeString('en-MY', { hour: '2-digit', minute: '2-digit' })
}
