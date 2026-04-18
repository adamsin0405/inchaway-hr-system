'use client'

import { useState } from 'react'
import { useStore } from '@/lib/store'
import type { AllowanceStatus } from '@/lib/types'

const MONTH = '2026-04'

export default function AllowancesPage() {
  const { state, dispatch } = useStore()
  const [statusFilter, setStatusFilter] = useState<AllowanceStatus | 'all'>('pending')
  const [driverFilter, setDriverFilter] = useState('all')

  const drivers = state.employees.filter(e => e.role === 'driver')

  let allowances = state.allowances.filter(a => a.date.startsWith(MONTH))
  if (statusFilter !== 'all') allowances = allowances.filter(a => a.status === statusFilter)
  if (driverFilter !== 'all') allowances = allowances.filter(a => a.employeeId === driverFilter)
  allowances = [...allowances].sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  const pendingCount = state.allowances.filter(a => a.date.startsWith(MONTH) && a.status === 'pending').length

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Allowances</h1>
          <p className="text-sm text-slate-500">April 2026</p>
        </div>
        {pendingCount > 0 && (
          <span className="bg-yellow-100 text-yellow-700 text-sm font-semibold px-3 py-1 rounded-full">
            {pendingCount} pending approval
          </span>
        )}
      </div>

      <div className="flex gap-2 mb-4 flex-wrap items-center">
        {(['pending', 'approved', 'rejected', 'all'] as const).map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition capitalize ${statusFilter === s ? 'bg-blue-600 text-white' : 'bg-white text-slate-500 hover:bg-slate-100'}`}
          >
            {s === 'all' ? 'All' : s}
          </button>
        ))}
        <select
          value={driverFilter}
          onChange={e => setDriverFilter(e.target.value)}
          className="ml-auto px-3 py-1.5 rounded-full text-sm bg-white border border-slate-200 text-slate-600 focus:outline-none"
        >
          <option value="all">All drivers</option>
          {drivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {allowances.length === 0 ? (
          <p className="text-center text-slate-400 py-12">No allowances found</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {allowances.map(a => {
              const driver = state.employees.find(e => e.id === a.employeeId)
              return (
                <div key={a.id} className="px-4 py-3 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-slate-800">{driver?.name}</span>
                      <span className="text-xs text-slate-400">{a.date}</span>
                      <span className="capitalize text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {a.type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 truncate">{a.description}</p>
                  </div>
                  <span className="font-semibold text-slate-800 shrink-0">RM {a.amount.toFixed(2)}</span>
                  {a.status === 'pending' ? (
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => dispatch({ type: 'REVIEW_ALLOWANCE', allowanceId: a.id, status: 'approved' })}
                        className="px-3 py-1.5 bg-green-500 text-white text-xs font-semibold rounded-lg hover:bg-green-600 transition"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => dispatch({ type: 'REVIEW_ALLOWANCE', allowanceId: a.id, status: 'rejected' })}
                        className="px-3 py-1.5 bg-red-100 text-red-600 text-xs font-semibold rounded-lg hover:bg-red-200 transition"
                      >
                        Reject
                      </button>
                    </div>
                  ) : (
                    <StatusBadge status={a.status} />
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: AllowanceStatus }) {
  const cls: Partial<Record<AllowanceStatus, string>> = {
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-600',
  }
  return (
    <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize shrink-0 ${cls[status] ?? ''}`}>
      {status}
    </span>
  )
}
