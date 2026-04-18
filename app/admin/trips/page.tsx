'use client'

import { useState } from 'react'
import { useStore } from '@/lib/store'

const MONTH = '2026-04'

export default function TripsPage() {
  const { state, dispatch } = useStore()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editCount, setEditCount] = useState(0)
  const [editDest, setEditDest] = useState('')
  const [driverFilter, setDriverFilter] = useState('all')

  const drivers = state.employees.filter(e => e.role === 'driver')
  let trips = state.trips
    .filter(t => t.date.startsWith(MONTH))
    .sort((a, b) => b.date.localeCompare(a.date))
  if (driverFilter !== 'all') trips = trips.filter(t => t.employeeId === driverFilter)

  const totalTrips = trips.reduce((s, t) => s + t.tripCount, 0)

  function startEdit(id: string, count: number, dest: string) {
    setEditingId(id); setEditCount(count); setEditDest(dest)
  }

  function saveEdit() {
    if (!editingId) return
    dispatch({ type: 'UPDATE_TRIP', tripId: editingId, tripCount: editCount, destination: editDest })
    setEditingId(null)
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Trips</h1>
          <p className="text-sm text-slate-500">April 2026 — {totalTrips} total trips</p>
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
            {trips.map(trip => {
              const driver = state.employees.find(e => e.id === trip.employeeId)
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
                        <button onClick={saveEdit} className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700">Save</button>
                        <button onClick={() => setEditingId(null)} className="text-xs text-slate-400 hover:text-slate-600">Cancel</button>
                      </div>
                    ) : (
                      <button
                        onClick={() => startEdit(trip.id, trip.tripCount, trip.destination)}
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
