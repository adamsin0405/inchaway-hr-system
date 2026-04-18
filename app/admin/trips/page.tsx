'use client'

import { useEffect, useState } from 'react'
import { supabase, mapEmployee, mapTrip } from '@/lib/supabase'
import { currentMonthMY, monthLabel } from '@/lib/date-utils'
import type { Employee, Trip } from '@/lib/types'

export default function TripsPage() {
  const [drivers, setDrivers] = useState<Employee[]>([])
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editCount, setEditCount] = useState(0)
  const [editDest, setEditDest] = useState('')
  const [driverFilter, setDriverFilter] = useState('all')
  const [saving, setSaving] = useState(false)

  const MONTH = currentMonthMY()

  useEffect(() => {
    async function load() {
      const [empRes, tripRes] = await Promise.all([
        supabase.from('employees').select('*').eq('role', 'driver').order('name'),
        supabase.from('trips').select('*').gte('date', `${MONTH}-01`).order('date', { ascending: false }),
      ])
      setDrivers((empRes.data ?? []).map(mapEmployee))
      setTrips((tripRes.data ?? []).map(mapTrip))
      setLoading(false)
    }
    load()
  }, [MONTH])

  async function saveEdit(trip: Trip) {
    if (!editingId) return
    setSaving(true)
    const now = new Date().toISOString()
    const { data } = await supabase
      .from('trips')
      .update({ trip_count: editCount, destination: editDest, submitted_by: 'admin', updated_at: now })
      .eq('id', editingId)
      .select()
      .single()
    if (data) {
      setTrips(prev => prev.map(t => t.id === trip.id ? mapTrip(data) : t))
    }
    setEditingId(null)
    setSaving(false)
  }

  let filtered = trips
  if (driverFilter !== 'all') filtered = filtered.filter(t => t.employeeId === driverFilter)
  const totalTrips = filtered.reduce((s, t) => s + t.tripCount, 0)
  const driverMap = Object.fromEntries(drivers.map(d => [d.id, d]))

  if (loading) return <div className="p-6 text-slate-400">Loading…</div>

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Trips</h1>
          <p className="text-sm text-slate-500">{monthLabel(MONTH)} — {totalTrips} total trips</p>
        </div>
        <select
          value={driverFilter}
          onChange={e => setDriverFilter(e.target.value)}
          className="px-3 py-2 rounded-lg text-sm bg-white border border-slate-200 text-slate-600 focus:outline-none"
        >
          <option value="all">All drivers</option>
          {drivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-xs text-slate-400 uppercase tracking-wide">
              <th className="px-4 py-3">Driver</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Destination</th>
              <th className="px-4 py-3">Trips</th>
              <th className="px-4 py-3">By</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.map(trip => {
              const driver = driverMap[trip.employeeId]
              const editing = editingId === trip.id
              return (
                <tr key={trip.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800">{driver?.name}</td>
                  <td className="px-4 py-3 text-slate-500">{trip.date}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {editing ? (
                      <input
                        value={editDest}
                        onChange={e => setEditDest(e.target.value)}
                        className="border rounded px-2 py-1 text-sm w-32 focus:outline-none focus:ring-1 focus:ring-blue-400"
                      />
                    ) : trip.destination}
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-800">
                    {editing ? (
                      <input
                        type="number"
                        min="1"
                        value={editCount}
                        onChange={e => setEditCount(Number(e.target.value))}
                        className="border rounded px-2 py-1 text-sm w-16 focus:outline-none focus:ring-1 focus:ring-blue-400"
                      />
                    ) : trip.tripCount}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded ${trip.submittedBy === 'driver' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                      {trip.submittedBy}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {editing ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => saveEdit(trip)}
                          disabled={saving}
                          className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 disabled:opacity-50"
                        >Save</button>
                        <button onClick={() => setEditingId(null)} className="text-xs text-slate-400 hover:text-slate-600">Cancel</button>
                      </div>
                    ) : (
                      <button
                        onClick={() => { setEditingId(trip.id); setEditCount(trip.tripCount); setEditDest(trip.destination) }}
                        className="text-xs text-blue-500 hover:underline"
                      >Edit</button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
