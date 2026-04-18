'use client'

import { useEffect, useState } from 'react'
import { supabase, mapEmployee, mapAttendance, mapTrip, mapAllowance } from '@/lib/supabase'
import { currentMonthMY, monthLabel } from '@/lib/date-utils'
import { calcGrossPay, formatRM } from '@/lib/payroll'
import { useAuth } from '@/lib/auth-context'
import type { Employee, Attendance, Trip, Allowance } from '@/lib/types'

interface PayrollRow {
  driver: Employee
  baseSalary: number
  tripEarnings: number
  otAmount: number
  allowancesTotal: number
  grossPay: number
  totalOtHours: number
  finalized: boolean
}

export default function PayrollPage() {
  const { employee: admin } = useAuth()
  const [rows, setRows] = useState<PayrollRow[]>([])
  const [loading, setLoading] = useState(true)
  const [finalizing, setFinalizing] = useState<string | null>(null)

  const MONTH = currentMonthMY()

  useEffect(() => {
    async function load() {
      const [empRes, attRes, tripRes, allowRes, payRes] = await Promise.all([
        supabase.from('employees').select('*').eq('role', 'driver').eq('is_active', true).order('name'),
        supabase.from('attendance').select('*').gte('date', `${MONTH}-01`),
        supabase.from('trips').select('*').gte('date', `${MONTH}-01`),
        supabase.from('allowances').select('*').gte('date', `${MONTH}-01`).eq('status', 'approved'),
        supabase.from('payroll_records').select('employee_id,status').eq('month', MONTH),
      ])

      const drivers: Employee[] = (empRes.data ?? []).map(mapEmployee)
      const attendance: Attendance[] = (attRes.data ?? []).map(mapAttendance)
      const trips: Trip[] = (tripRes.data ?? []).map(mapTrip)
      const allowances: Allowance[] = (allowRes.data ?? []).map(mapAllowance)
      const finalizedSet = new Set((payRes.data ?? []).filter(r => r.status === 'finalized').map(r => r.employee_id))

      const computed: PayrollRow[] = drivers.map(driver => ({
        driver,
        ...calcGrossPay(driver, MONTH, attendance, trips, allowances),
        finalized: finalizedSet.has(driver.id),
      }))
      setRows(computed)
      setLoading(false)
    }
    load()
  }, [MONTH])

  async function handleFinalise(row: PayrollRow) {
    if (!admin) return
    setFinalizing(row.driver.id)
    const now = new Date().toISOString()
    await supabase.from('payroll_records').upsert({
      employee_id: row.driver.id,
      month: MONTH,
      base_salary: row.baseSalary,
      trip_earnings: row.tripEarnings,
      ot_amount: row.otAmount,
      allowances_total: row.allowancesTotal,
      gross_pay: row.grossPay,
      status: 'finalized',
      finalized_by: admin.id,
      finalized_at: now,
    }, { onConflict: 'employee_id,month' })
    setRows(prev => prev.map(r => r.driver.id === row.driver.id ? { ...r, finalized: true } : r))
    setFinalizing(null)
  }

  if (loading) return <div className="p-6 text-slate-400">Loading…</div>

  const totalGross = rows.reduce((s, r) => s + r.grossPay, 0)
  const allFinalized = rows.length > 0 && rows.every(r => r.finalized)

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Payroll</h1>
          <p className="text-sm text-slate-500">
            {monthLabel(MONTH)} — {allFinalized ? '✓ All finalised' : 'Draft'}
          </p>
        </div>
        <div className="bg-white rounded-xl px-4 py-3 shadow-sm text-right">
          <p className="text-xs text-slate-400">Total payout</p>
          <p className="text-xl font-bold text-blue-700">{formatRM(totalGross)}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-xs text-slate-400 uppercase tracking-wide">
              <th className="px-4 py-3 text-left">Driver</th>
              <th className="px-4 py-3 text-right">Base</th>
              <th className="px-4 py-3 text-right">Trips</th>
              <th className="px-4 py-3 text-right">OT</th>
              <th className="px-4 py-3 text-right">Allowances</th>
              <th className="px-4 py-3 text-right">Gross</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {rows.map(({ driver, baseSalary, tripEarnings, otAmount, allowancesTotal, grossPay, totalOtHours, finalized }) => (
              <tr key={driver.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-800">{driver.name}</p>
                  <p className="text-xs text-slate-400">{driver.employeeCode}</p>
                </td>
                <td className="px-4 py-3 text-right text-slate-600">{formatRM(baseSalary)}</td>
                <td className="px-4 py-3 text-right text-slate-600">{formatRM(tripEarnings)}</td>
                <td className="px-4 py-3 text-right">
                  {otAmount > 0 ? (
                    <span className="text-orange-600" title={`${totalOtHours.toFixed(1)}h OT`}>{formatRM(otAmount)}</span>
                  ) : <span className="text-slate-300">—</span>}
                </td>
                <td className="px-4 py-3 text-right">
                  {allowancesTotal > 0 ? (
                    <span className="text-slate-600">{formatRM(allowancesTotal)}</span>
                  ) : <span className="text-slate-300">—</span>}
                </td>
                <td className="px-4 py-3 text-right font-bold text-slate-800">{formatRM(grossPay)}</td>
                <td className="px-4 py-3 text-right">
                  {finalized ? (
                    <span className="text-xs text-green-600 font-medium">✓ Finalised</span>
                  ) : (
                    <button
                      onClick={() => handleFinalise({ driver, baseSalary, tripEarnings, otAmount, allowancesTotal, grossPay, totalOtHours, finalized })}
                      disabled={finalizing === driver.id}
                      className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                    >
                      {finalizing === driver.id ? '…' : 'Finalise'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-blue-50 border-t-2 border-blue-100">
              <td colSpan={5} className="px-4 py-3 text-right font-bold text-slate-700">Total</td>
              <td className="px-4 py-3 text-right font-bold text-blue-700 text-base">{formatRM(totalGross)}</td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>

      <p className="text-xs text-slate-400 mt-3">
        * OT = hours worked beyond {rows[0]?.driver.standardHours ?? 8}h standard × driver OT rate. Allowances = approved only. Finalised rows are permanently locked.
      </p>
    </div>
  )
}
