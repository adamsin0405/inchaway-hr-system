'use client'

import { useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'

export default function LandingPage() {
  const { state, dispatch } = useStore()
  const router = useRouter()
  const drivers = state.employees.filter(e => e.role === 'driver')

  function loginAsDriver(id: string) {
    dispatch({ type: 'SET_USER', userId: id })
    router.push('/driver')
  }

  function loginAsAdmin() {
    dispatch({ type: 'SET_USER', userId: 'admin' })
    router.push('/admin/attendance')
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 gap-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-800">Driver Payroll</h1>
        <p className="text-slate-400 text-sm mt-1">Workshop Prototype — Select a login</p>
      </div>

      <div className="w-full max-w-sm space-y-2">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Login as Driver</p>
        {drivers.map(d => (
          <button
            key={d.id}
            onClick={() => loginAsDriver(d.id)}
            className="w-full flex items-center gap-3 bg-white border border-slate-200 rounded-xl p-4 hover:border-blue-400 hover:bg-blue-50 transition text-left"
          >
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm shrink-0">
              {d.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
            </div>
            <div>
              <p className="font-medium text-slate-800">{d.name}</p>
              <p className="text-xs text-slate-400">{d.employeeCode}</p>
            </div>
          </button>
        ))}
      </div>

      <div className="w-full max-w-sm">
        <button
          onClick={loginAsAdmin}
          className="w-full bg-slate-800 text-white rounded-xl p-4 font-semibold hover:bg-slate-700 transition"
        >
          Login as Admin (Boss)
        </button>
      </div>
    </div>
  )
}
