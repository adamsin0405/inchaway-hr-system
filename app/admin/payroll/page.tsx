'use client'

import { useState } from 'react'
import { useStore } from '@/lib/store'
import { calcGrossPay, formatRM } from '@/lib/payroll'

const MONTH = '2026-04'

export default function PayrollPage() {
  const { state } = useStore()
  const [finalized, setFinalized] = useState<Record<string, boolean>>({})

  const drivers = state.employees.filter(e => e.role === 'driver')
  const rows = drivers.map(driver => ({
    driver,
    ...calcGrossPay(driver, MONTH, state.attendance, state.trips, state.allowances),
  }))

  const totalGross = rows.reduce((s, r) => s + r.grossPay, 0)
  const allFinalized = drivers.length > 0 && drivers.every(d => finalized[d.id])

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Payroll</h1>
          <p className="text-sm text-slate-500">April 2026 — {allFinalized ? '✓ All finalised' : 'Draft'}</p>
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
            {rows.map(({ driver, baseSalary, tripEarnings, otAmount, allowancesTotal, grossPay, totalOtHours }) => (
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
                  {finalized[driver.id] ? (
                    <span className="text-xs text-green-600 font-medium">✓ Finalised</span>
                  ) : (
                    <button
                      onClick={() => setFinalized(f => ({ ...f, [driver.id]: true }))}
                      className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition"
                    >
                      Finalise
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
        * OT = hours worked beyond {drivers[0]?.standardHours ?? 8}h standard × driver OT rate. Allowances = approved only.
      </p>
    </div>
  )
}
