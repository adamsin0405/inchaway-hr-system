'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'
import type { AllowanceType, Allowance } from '@/lib/types'

const TODAY = '2026-04-18'

const TYPES: { value: AllowanceType; label: string; icon: string }[] = [
  { value: 'petrol', label: 'Petrol', icon: '⛽' },
  { value: 'toll', label: 'Toll', icon: '🛣️' },
  { value: 'meal', label: 'Meal', icon: '🍱' },
  { value: 'other', label: 'Other', icon: '📎' },
]

export default function AllowanceNew() {
  const { state, dispatch } = useStore()
  const router = useRouter()
  const [type, setType] = useState<AllowanceType>('petrol')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const allowance: Allowance = {
      id: `al${Date.now()}`,
      employeeId: state.currentUserId!,
      date: TODAY,
      type,
      amount: parseFloat(amount),
      description,
      status: 'pending',
      reviewedBy: null,
      reviewedAt: null,
      createdAt: new Date().toISOString(),
    }
    dispatch({ type: 'ADD_ALLOWANCE', allowance })
    setSubmitted(true)
    setTimeout(() => router.push('/driver'), 1500)
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <div className="text-5xl">✅</div>
        <p className="text-slate-700 font-semibold">Submitted! Pending boss approval.</p>
      </div>
    )
  }

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold text-slate-800 mb-4">Submit Allowance</h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-2">Type</label>
          <div className="grid grid-cols-2 gap-2">
            {TYPES.map(t => (
              <button
                key={t.value}
                type="button"
                onClick={() => setType(t.value)}
                className={`py-3 rounded-xl font-medium text-sm border transition flex items-center justify-center gap-2 ${type === t.value ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'}`}
              >
                <span>{t.icon}</span> {t.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-2">Amount (RM)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            required
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-2xl font-mono focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-2">Description</label>
          <input
            type="text"
            required
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="e.g. Petrol Klang trip"
            className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl text-base hover:bg-blue-700 transition"
        >
          Submit for Approval
        </button>
      </form>
    </div>
  )
}
