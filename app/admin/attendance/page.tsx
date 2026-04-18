'use client'

import { useState } from 'react'
import { useStore } from '@/lib/store'
import { formatTime, calcOtHours } from '@/lib/payroll'
import type { Attendance } from '@/lib/types'

const TODAY = '2026-04-18'

export default function AttendancePage() {
  const { state, dispatch } = useStore()
  const drivers = state.employees.filter(e => e.role === 'driver')
  const [fixingId, setFixingId] = useState<string | null>(null)
  const [fixTime, setFixTime] = useState('')

  function getAtt(employeeId: string): Attendance | undefined {
    return state.attendance.find(a => a.employeeId === employeeId && a.date === TODAY)
  }

  function handleFix(attendanceId: string) {
    if (!fixTime) return
    dispatch({ type: 'FIX_CLOCK_OUT', attendanceId, clockOutAt: `${TODAY}T${fixTime}:00` })
    setFixingId(null)
    setFixTime('')
  }

  const clockedIn = drivers.filter(d => getAtt(d.id)?.clockInAt).length

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
              const att = getAtt(driver.id)
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
                            onClick={() => handleFix(att.id)}
                            className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded"
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
                    {ot > 0 ? (
                      <span className="text-orange-600 font-medium">{ot.toFixed(1)}h</span>
                    ) : '—'}
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
