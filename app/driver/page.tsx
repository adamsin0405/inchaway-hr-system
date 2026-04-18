'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { supabase, mapAttendance, mapTrip, mapAllowance } from '@/lib/supabase'
import { todayMY, currentMonthMY, monthLabel } from '@/lib/date-utils'
import { calcOtHours, formatRM, formatTime } from '@/lib/payroll'
import type { Attendance, Trip, Allowance } from '@/lib/types'

export default function DriverHome() {
  const { employee } = useAuth()
  const [att, setAtt] = useState<Attendance | null>(null)
  const [trips, setTrips] = useState<Trip[]>([])
  const [allowances, setAllowances] = useState<Allowance[]>([])
  const [loading, setLoading] = useState(true)
  const [clocking, setClocking] = useState(false)

  const TODAY = todayMY()
  const MONTH = currentMonthMY()

  useEffect(() => {
    if (!employee) return
    async function load() {
      const [attRes, tripRes, allowRes] = await Promise.all([
        supabase.from('attendance').select('*').eq('employee_id', employee!.id).eq('date', TODAY).maybeSingle(),
        supabase.from('trips').select('*').eq('employee_id', employee!.id).gte('date', `${MONTH}-01`),
        supabase.from('allowances').select('*').eq('employee_id', employee!.id).gte('date', `${MONTH}-01`),
      ])
      setAtt(attRes.data ? mapAttendance(attRes.data) : null)
      setTrips((tripRes.data ?? []).map(mapTrip))
      setAllowances((allowRes.data ?? []).map(mapAllowance))
      setLoading(false)
    }
    load()
  }, [employee, TODAY, MONTH])

  async function handleClock() {
    if (!employee || clocking) return
    setClocking(true)

    function doAction(lat: number, lng: number) {
      return new Promise<void>(async resolve => {
        const now = new Date().toISOString()
        if (!att) {
          const { data } = await supabase.from('attendance').insert({
            employee_id: employee!.id,
            date: TODAY,
            clock_in_at: now,
            clock_in_lat: lat,
            clock_in_lng: lng,
          }).select().single()
          if (data) setAtt(mapAttendance(data))
        } else if (!att.clockOutAt) {
          const { data } = await supabase.from('attendance').update({
            clock_out_at: now,
            clock_out_lat: lat,
            clock_out_lng: lng,
          }).eq('id', att.id).select().single()
          if (data) setAtt(mapAttendance(data))
        }
        resolve()
      })
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => doAction(pos.coords.latitude, pos.coords.longitude).finally(() => setClocking(false)),
        () => doAction(3.0, 101.5).finally(() => setClocking(false)),
      )
    } else {
      await doAction(3.0, 101.5)
      setClocking(false)
    }
  }

  const isClockedIn = !!att?.clockInAt
  const isClockedOut = !!att?.clockOutAt
  const todayOt = att ? calcOtHours(att, employee?.standardHours ?? 8) : 0
  const totalTrips = trips.reduce((s, t) => s + t.tripCount, 0)
  const pendingCount = allowances.filter(a => a.status === 'pending').length
  const approvedTotal = allowances.filter(a => a.status === 'approved').reduce((s, a) => s + a.amount, 0)

  let btnLabel = 'Clock In'
  let btnClass = 'bg-green-500 hover:bg-green-600'
  if (isClockedIn && !isClockedOut) { btnLabel = 'Clock Out'; btnClass = 'bg-red-500 hover:bg-red-600' }
  if (isClockedOut) { btnLabel = 'Done for Today ✓'; btnClass = 'bg-slate-300 cursor-not-allowed' }
  if (clocking) { btnLabel = 'Please wait…'; btnClass = 'bg-slate-300 cursor-not-allowed' }

  if (loading) return <div className="flex items-center justify-center h-48 text-slate-400 text-sm">Loading…</div>

  return (
    <div className="p-4 space-y-4">
      <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
        <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Today — {TODAY}</p>
        <div className="flex justify-between text-sm text-slate-600">
          <span>Clock In</span>
          <span className="font-mono font-semibold">{formatTime(att?.clockInAt ?? null)}</span>
        </div>
        <div className="flex justify-between text-sm text-slate-600">
          <span>Clock Out</span>
          <span className="font-mono font-semibold">{formatTime(att?.clockOutAt ?? null)}</span>
        </div>
        {todayOt > 0 && (
          <div className="flex justify-between text-sm text-orange-600">
            <span>OT</span>
            <span className="font-semibold">
              {todayOt.toFixed(1)}h × {formatRM(employee!.otHourlyRate)} = {formatRM(todayOt * employee!.otHourlyRate)}
            </span>
          </div>
        )}
        <button
          onClick={handleClock}
          disabled={isClockedOut || clocking}
          className={`w-full mt-2 text-white font-bold py-4 rounded-xl text-lg transition ${btnClass}`}
        >
          {btnLabel}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-slate-400">{monthLabel(MONTH)} Trips</p>
          <p className="text-3xl font-bold text-slate-800 mt-1">{totalTrips}</p>
          <p className="text-xs text-slate-500 mt-0.5">{formatRM(totalTrips * (employee?.tripRate ?? 0))}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-slate-400">Allowances</p>
          <p className="text-3xl font-bold text-slate-800 mt-1">{allowances.length}</p>
          <p className="text-xs text-slate-500 mt-0.5">{pendingCount} pending</p>
        </div>
        <div className="col-span-2 bg-blue-50 rounded-2xl p-4">
          <p className="text-xs text-blue-400">Approved Allowances ({monthLabel(MONTH)})</p>
          <p className="text-2xl font-bold text-blue-700 mt-1">{formatRM(approvedTotal)}</p>
        </div>
      </div>
    </div>
  )
}
