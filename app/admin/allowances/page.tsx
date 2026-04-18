'use client'

import { useEffect, useState } from 'react'
import { supabase, mapEmployee, mapAllowance } from '@/lib/supabase'
import { currentMonthMY, monthLabel } from '@/lib/date-utils'
import type { Employee, Allowance, AllowanceStatus } from '@/lib/types'
import { useAuth } from '@/lib/auth-context'

export default function AllowancesPage() {
  const { employee: admin } = useAuth()
  const [drivers, setDrivers] = useState<Employee[]>([])
  const [allowances, setAllowances] = useState<Allowance[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<AllowanceStatus | 'all'>('pending')
  const [driverFilter, setDriverFilter] = useState('all')

  const MONTH = currentMonthMY()

  async function load() {
    const [empRes, allowRes] = await Promise.all([
      supabase.from('employees').select('*').eq('role', 'driver').order('name'),
      supabase.from('allowances').select('*').gte('date', `${MONTH}-01`).order('created_at', { ascending: false }),
    ])
    setDrivers((empRes.data ?? []).map(mapEmployee))
    setAllowances((allowRes.data ?? []).map(mapAllowance))
    setLoading(false)
  }

  useEffect(() => { load() }, [MONTH])

  async function review(id: string, status: AllowanceStatus) {
    if (!admin) return
    const now = new Date().toISOString()
    await supabase
      .from('allowances')
      .update({ status, reviewed_by: admin.id, reviewed_at: now })
      .eq('id', id)
    setAllowances(prev => prev.map(a => a.id === id ? { ...a, status, reviewedBy: admin.id, reviewedAt: now } : a))
  }

  let filtered = allowances
  if (statusFilter !== 'all') filtered = filtered.filter(a => a.status === statusFilter)
  if (driverFilter !== 'all') filtered = filtered.filter(a => a.employeeId === driverFilter)

  const pendingCount = allowances.filter(a => a.status === 'pending').length
  const driverMap = Object.fromEntries(drivers.map(d => [d.id, d]))

  if (loading) return <div className="p-6 text-slate-400">Loading…</div>

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Allowances</h1>
          <p className="text-sm text-slate-500">{monthLabel(MONTH)}</p>
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
        {filtered.length === 0 ? (
          <p className="text-center text-slate-400 py-12">No allowances found</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map(a => {
              const driver = driverMap[a.employeeId]
              return (
                <div key={a.id} className="px-4 py-3 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-slate-800">{driver?.name}</span>
                      <span className="text-xs text-slate-400">{a.date}</span>
                      <span className="capitalize text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{a.type}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 truncate">{a.description}</p>
                  </div>
                  <span className="font-semibold text-slate-800 shrink-0">RM {a.amount.toFixed(2)}</span>
                  {a.status === 'pending' ? (
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => review(a.id, 'approved')}
                        className="px-3 py-1.5 bg-green-500 text-white text-xs font-semibold rounded-lg hover:bg-green-600 transition"
                      >Approve</button>
                      <button
                        onClick={() => review(a.id, 'rejected')}
                        className="px-3 py-1.5 bg-red-100 text-red-600 text-xs font-semibold rounded-lg hover:bg-red-200 transition"
                      >Reject</button>
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
