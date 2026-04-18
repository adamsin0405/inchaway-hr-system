'use client'

import { useStore } from '@/lib/store'
import { calcOtHours, formatRM, formatTime } from '@/lib/payroll'

const TODAY = '2026-04-18'
const MONTH = '2026-04'

export default function DriverHome() {
  const { state, dispatch } = useStore()
  const userId = state.currentUserId!
  const employee = state.employees.find(e => e.id === userId)!

  const todayAtt = state.attendance.find(a => a.employeeId === userId && a.date === TODAY)
  const isClockedIn = !!todayAtt?.clockInAt
  const isClockedOut = !!todayAtt?.clockOutAt

  const monthTrips = state.trips.filter(t => t.employeeId === userId && t.date.startsWith(MONTH))
  const totalTrips = monthTrips.reduce((s, t) => s + t.tripCount, 0)

  const monthAllowances = state.allowances.filter(a => a.employeeId === userId && a.date.startsWith(MONTH))
  const pendingCount = monthAllowances.filter(a => a.status === 'pending').length
  const approvedTotal = monthAllowances.filter(a => a.status === 'approved').reduce((s, a) => s + a.amount, 0)

  const todayOt = todayAtt ? calcOtHours(todayAtt, employee.standardHours) : 0

  function handleClock() {
    const doAction = (lat: number, lng: number) => {
      if (!isClockedIn) {
        dispatch({ type: 'CLOCK_IN', employeeId: userId, lat, lng })
      } else if (!isClockedOut) {
        dispatch({ type: 'CLOCK_OUT', employeeId: userId, lat, lng })
      }
    }
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => doAction(pos.coords.latitude, pos.coords.longitude),
        () => doAction(3.139, 101.687),
      )
    } else {
      doAction(3.139, 101.687)
    }
  }

  let btnLabel = 'Clock In'
  let btnClass = 'bg-green-500 hover:bg-green-600'
  if (isClockedIn && !isClockedOut) { btnLabel = 'Clock Out'; btnClass = 'bg-red-500 hover:bg-red-600' }
  if (isClockedOut) { btnLabel = 'Done for Today ✓'; btnClass = 'bg-slate-300 cursor-not-allowed' }

  return (
    <div className="p-4 space-y-4">
      <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
        <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Today — {TODAY}</p>
        <div className="flex justify-between text-sm text-slate-600">
          <span>Clock In</span>
          <span className="font-mono font-semibold">{formatTime(todayAtt?.clockInAt ?? null)}</span>
        </div>
        <div className="flex justify-between text-sm text-slate-600">
          <span>Clock Out</span>
          <span className="font-mono font-semibold">{formatTime(todayAtt?.clockOutAt ?? null)}</span>
        </div>
        {todayOt > 0 && (
          <div className="flex justify-between text-sm text-orange-600">
            <span>OT</span>
            <span className="font-semibold">
              {todayOt.toFixed(1)}h × {formatRM(employee.otHourlyRate)} = {formatRM(todayOt * employee.otHourlyRate)}
            </span>
          </div>
        )}
        <button
          onClick={handleClock}
          disabled={isClockedOut}
          className={`w-full mt-2 text-white font-bold py-4 rounded-xl text-lg transition ${btnClass}`}
        >
          {btnLabel}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-slate-400">April Trips</p>
          <p className="text-3xl font-bold text-slate-800 mt-1">{totalTrips}</p>
          <p className="text-xs text-slate-500 mt-0.5">{formatRM(totalTrips * employee.tripRate)}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-slate-400">Allowances</p>
          <p className="text-3xl font-bold text-slate-800 mt-1">{monthAllowances.length}</p>
          <p className="text-xs text-slate-500 mt-0.5">{pendingCount} pending</p>
        </div>
        <div className="col-span-2 bg-blue-50 rounded-2xl p-4">
          <p className="text-xs text-blue-400">Approved Allowances (Apr)</p>
          <p className="text-2xl font-bold text-blue-700 mt-1">{formatRM(approvedTotal)}</p>
        </div>
      </div>
    </div>
  )
}
