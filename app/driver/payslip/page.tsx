'use client'

import { useStore } from '@/lib/store'
import { calcGrossPay, formatRM } from '@/lib/payroll'
import type { AllowanceStatus } from '@/lib/types'

const MONTH = '2026-04'

export default function Payslip() {
  const { state } = useStore()
  const employee = state.employees.find(e => e.id === state.currentUserId)!

  const { baseSalary, tripEarnings, otAmount, allowancesTotal, grossPay, totalOtHours } = calcGrossPay(
    employee, MONTH, state.attendance, state.trips, state.allowances,
  )

  const monthTrips = state.trips
    .filter(t => t.employeeId === employee.id && t.date.startsWith(MONTH))
    .reduce((s, t) => s + t.tripCount, 0)

  const myAllowances = state.allowances
    .filter(a => a.employeeId === employee.id && a.date.startsWith(MONTH))
    .sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div className="p-4 space-y-4">
      <div className="text-center">
        <p className="text-sm text-slate-500">Payslip — April 2026</p>
        <p className="text-xs text-orange-400 mt-1">Draft (not finalised yet)</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-4 py-3 bg-blue-600 text-white">
          <p className="font-semibold">{employee.name}</p>
          <p className="text-xs text-blue-200">{employee.employeeCode}</p>
        </div>
        <div className="divide-y divide-slate-100">
          <Row label="Base Salary" value={formatRM(baseSalary)} />
          <Row
            label="Trip Earnings"
            sub={`${monthTrips} trips × RM ${employee.tripRate}`}
            value={formatRM(tripEarnings)}
          />
          <Row
            label="Overtime"
            sub={`${totalOtHours.toFixed(1)}h × RM ${employee.otHourlyRate}/h`}
            value={formatRM(otAmount)}
          />
          <Row label="Allowances (approved)" value={formatRM(allowancesTotal)} />
          <div className="px-4 py-4 flex justify-between items-center bg-blue-50">
            <span className="font-bold text-slate-800">Gross Pay</span>
            <span className="text-xl font-bold text-blue-700">{formatRM(grossPay)}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm">
        <p className="px-4 pt-4 pb-2 text-xs font-semibold text-slate-400 uppercase tracking-wide">
          Allowance Details
        </p>
        {myAllowances.length === 0 ? (
          <p className="px-4 pb-4 text-sm text-slate-400">No allowances this month</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {myAllowances.map(a => (
              <div key={a.id} className="px-4 py-3 flex justify-between items-center">
                <div>
                  <p className="text-sm text-slate-700 capitalize">{a.type} — {a.date}</p>
                  <p className="text-xs text-slate-400">{a.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium mb-1">{formatRM(a.amount)}</p>
                  <StatusBadge status={a.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function Row({ label, sub, value }: { label: string; sub?: string; value: string }) {
  return (
    <div className="px-4 py-3 flex justify-between items-center">
      <div>
        <p className="text-sm text-slate-700">{label}</p>
        {sub && <p className="text-xs text-slate-400">{sub}</p>}
      </div>
      <p className="text-sm font-semibold text-slate-800">{value}</p>
    </div>
  )
}

function StatusBadge({ status }: { status: AllowanceStatus }) {
  const cls: Record<AllowanceStatus, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-600',
  }
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cls[status]}`}>{status}</span>
  )
}
