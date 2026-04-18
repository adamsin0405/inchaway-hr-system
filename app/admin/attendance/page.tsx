'use client'

import { useEffect, useState } from 'react'
import { supabase, mapEmployee, mapAttendance } from '@/lib/supabase'
import { todayMY } from '@/lib/date-utils'
import { formatTime, calcOtHours } from '@/lib/payroll'
import type { Employee, Attendance } from '@/lib/types'

export default function AttendancePage() {
  const [drivers, setDrivers] = useState<Employee[]>([])
  const [attMap, setAttMap] = useState<Record<string, Attendance>>({})
  const [loading, setLoading] = useState(true)
  const [fixingId, setFixingId] = useState<string | null>(null)
  const [fixTime, setFixTime] = useState('')
  const [saving, setSaving] = useState(false)

  const TODAY = todayMY()

  async function load() {
    const [empRes, attRes] = await Promise.all([
      supabase.from('employees').select('*').eq('role', 'driver').eq('is_active', true).order('name'),
      supabase.from('attendance').select('*').eq('date', TODAY),
    ])
    const driverList = (empRes.data ?? []).map(mapEmployee)
    const map: Record<string, Attendance> = {}
    for (const row of attRes.data ?? []) {
      const a = mapAttendance(row)
      map[a.employeeId] = a
    }
    setDrivers(driverList)
    setAttMap(map)
    setLoading(false)
  }

  useEffect(() => { load() }, [TODAY])

  async function handleFix(att: Attendance) {
    if (!fixTime) return
    setSaving(true)
    // Interpret entered time as Malaysia time (UTC+8)
    const clockOutAt = `${TODAY}T${fixTime}:00+08:00`
    const { data } = await supabase
      .from('attendance')
      .update({ clock_out_at: clockOutAt })
      .eq('id', att.id)
      .select()
      .single()
    if (data) {
      setAttMap(prev => ({ ...prev, [att.employeeId]: mapAttendance(data) }))
    }
    setFixingId(null)
    setFixTime('')
    setSaving(false)
  }

  if (loading) return <div className="p-6 text-slate-400">Loading…</div>

  const clockedIn = drivers.filter(d => attMap[d.id]?.clockInAt).length

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Attendance</h1>
          <p className="text-sm text-slate-500">{TODAY}</p>
        </div>
        <div className="bg-white rounded-xl px-4 py-2 shadow-sm text-center">
          <p className="text-2xl font-bold text-green-600">{clockedIn}</p>
          <p className="text-xs text-slate-400">/ {drivers.length} clocked in</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-xs text-slate-400 uppercase tracking-wide">
              <th className="px-4 py-3">Driver</th>
              <th className="px-4 py-3">Clock In</th>
              <th className="px-4 py-3">Clock Out</th>
              <th className="px-4 py-3">OT</th>
              <th className="px-4 py-3">GPS</th>
              <th className="px-4 py-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {drivers.map(driver => {
              const att = attMap[driver.id]
              const ot = att ? calcOtHours(att, driver.standardHours) : 0
              return (
                <tr key={driver.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-800">{driver.name}</p>
                    <p className="text-xs text-slate-400">{driver.employeeCode}</p>
                  </td>
                  <td className="px-4 py-3">
                    {att?.clockInAt ? (
                      <span className="text-green-600 font-mono">{formatTime(att.clockInAt)}</span>
                    ) : (
                      <span className="text-red-400">Not in</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {att?.clockOutAt ? (
                      <span className="font-mono text-slate-600">{formatTime(att.clockOutAt)}</span>
                    ) : att?.clockInAt ? (
                      fixingId === att.id ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="time"
                            value={fixTime}
                            onChange={e => setFixTime(e.target.value)}
                            className="border rounded px-1 py-0.5 text-xs"
                          />
                          <button
                            onClick={() => handleFix(att)}
                            disabled={saving}
                            className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded disabled:opacity-50"
                          >OK</button>
                          <button
                            onClick={() => setFixingId(null)}
                            className="text-xs text-slate-400 hover:text-slate-600"
                          >✕</button>
                        </div>
                      ) : (
                        <button
                          onClick={() => { setFixingId(att.id); setFixTime('') }}
                          className="text-xs text-orange-500 underline hover:text-orange-700"
                        >
                          Fix clock-out
                        </button>
                      )
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {ot > 0 ? <span className="text-orange-600 font-medium">{ot.toFixed(1)}h</span> : '—'}
                  </td>
                  <td className="px-4 py-3">
                    {att?.clockInLat ? (
                      <span className="text-green-500 text-xs">📍 Yes</span>
                    ) : (
                      <span className="text-slate-300 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {!att?.clockInAt && <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-400" title="Not clocked in" />}
                    {att?.clockInAt && !att.clockOutAt && <span className="inline-block w-2.5 h-2.5 rounded-full bg-yellow-400" title="Working" />}
                    {att?.clockOutAt && <span className="inline-block w-2.5 h-2.5 rounded-full bg-green-400" title="Complete" />}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="flex gap-4 mt-4 text-xs text-slate-500">
        <span><span className="inline-block w-2 h-2 rounded-full bg-green-400 mr-1" />Complete</span>
        <span><span className="inline-block w-2 h-2 rounded-full bg-yellow-400 mr-1" />Clocked in, not out</span>
        <span><span className="inline-block w-2 h-2 rounded-full bg-red-400 mr-1" />Not clocked in</span>
      </div>
    </div>
  )
}
