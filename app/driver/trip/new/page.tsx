'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'
import type { Trip } from '@/lib/types'

const TODAY = '2026-04-18'

export default function TripNew() {
  const { state, dispatch } = useStore()
  const router = useRouter()
  const [date, setDate] = useState(TODAY)
  const [tripCount, setTripCount] = useState(1)
  const [destination, setDestination] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const employee = state.employees.find(e => e.id === state.currentUserId)!

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trip: Trip = {
      id: `t${Date.now()}`,
      employeeId: state.currentUserId!,
      date,
      tripCount,
      destination,
      notes: '',
      submittedBy: 'driver',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    dispatch({ type: 'ADD_TRIP', trip })
    setSubmitted(true)
    setTimeout(() => router.push('/driver'), 1500)
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <div className="text-5xl">🚛</div>
        <p className="text-slate-700 font-semibold">Trip recorded!</p>
      </div>
    )
  }

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold text-slate-800 mb-4">Record Trip</h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-2">Date</label>
          <input
            type="date"
            required
            value={date}
            onChange={e => setDate(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-2">Destination</label>
          <input
            type="text"
            required
            value={destination}
            onChange={e => setDestination(e.target.value)}
            placeholder="e.g. Klang, Shah Alam"
            className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-2">Number of Trips</label>
          <div className="flex items-center gap-4 bg-white rounded-xl border border-slate-200 p-4">
            <button
              type="button"
              onClick={() => setTripCount(c => Math.max(1, c - 1))}
              className="w-12 h-12 rounded-full bg-slate-100 text-xl font-bold flex items-center justify-center hover:bg-slate-200 transition"
            >−</button>
            <span className="text-4xl font-bold text-slate-800 flex-1 text-center">{tripCount}</span>
            <button
              type="button"
              onClick={() => setTripCount(c => c + 1)}
              className="w-12 h-12 rounded-full bg-slate-100 text-xl font-bold flex items-center justify-center hover:bg-slate-200 transition"
            >+</button>
          </div>
          <p className="text-center text-sm text-slate-400 mt-2">
            = RM {(tripCount * employee.tripRate).toFixed(2)} earnings
          </p>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl text-base hover:bg-blue-700 transition"
        >
          Save Trip
        </button>
      </form>
    </div>
  )
}
