'use client'

import { createContext, useContext, useReducer, type ReactNode } from 'react'
import type { Employee, Attendance, Trip, Allowance, AllowanceStatus } from './types'
import { MOCK_EMPLOYEES, MOCK_ATTENDANCE, MOCK_TRIPS, MOCK_ALLOWANCES } from './mock-data'

const TODAY = '2026-04-18'

interface State {
  currentUserId: string | null
  employees: Employee[]
  attendance: Attendance[]
  trips: Trip[]
  allowances: Allowance[]
}

type Action =
  | { type: 'SET_USER'; userId: string }
  | { type: 'LOGOUT' }
  | { type: 'CLOCK_IN'; employeeId: string; lat: number; lng: number }
  | { type: 'CLOCK_OUT'; employeeId: string; lat: number; lng: number }
  | { type: 'ADD_ALLOWANCE'; allowance: Allowance }
  | { type: 'ADD_TRIP'; trip: Trip }
  | { type: 'REVIEW_ALLOWANCE'; allowanceId: string; status: AllowanceStatus }
  | { type: 'UPDATE_TRIP'; tripId: string; tripCount: number; destination: string }
  | { type: 'FIX_CLOCK_OUT'; attendanceId: string; clockOutAt: string }
  | { type: 'ADD_EMPLOYEE'; employee: Employee }
  | { type: 'UPDATE_EMPLOYEE'; employee: Employee }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, currentUserId: action.userId }
    case 'LOGOUT':
      return { ...state, currentUserId: null }
    case 'CLOCK_IN': {
      const existing = state.attendance.find(a => a.employeeId === action.employeeId && a.date === TODAY)
      if (existing) return state
      const rec: Attendance = {
        id: `a${Date.now()}`,
        employeeId: action.employeeId,
        date: TODAY,
        clockInAt: new Date().toISOString(),
        clockOutAt: null,
        clockInLat: action.lat,
        clockInLng: action.lng,
        clockOutLat: null,
        clockOutLng: null,
      }
      return { ...state, attendance: [...state.attendance, rec] }
    }
    case 'CLOCK_OUT':
      return {
        ...state,
        attendance: state.attendance.map(a =>
          a.employeeId === action.employeeId && a.date === TODAY && !a.clockOutAt
            ? { ...a, clockOutAt: new Date().toISOString(), clockOutLat: action.lat, clockOutLng: action.lng }
            : a
        ),
      }
    case 'ADD_ALLOWANCE':
      return { ...state, allowances: [...state.allowances, action.allowance] }
    case 'ADD_TRIP':
      return { ...state, trips: [...state.trips, action.trip] }
    case 'REVIEW_ALLOWANCE':
      return {
        ...state,
        allowances: state.allowances.map(a =>
          a.id === action.allowanceId
            ? { ...a, status: action.status, reviewedBy: 'admin', reviewedAt: new Date().toISOString() }
            : a
        ),
      }
    case 'UPDATE_TRIP':
      return {
        ...state,
        trips: state.trips.map(t =>
          t.id === action.tripId
            ? { ...t, tripCount: action.tripCount, destination: action.destination, updatedAt: new Date().toISOString(), submittedBy: 'admin' }
            : t
        ),
      }
    case 'FIX_CLOCK_OUT':
      return {
        ...state,
        attendance: state.attendance.map(a =>
          a.id === action.attendanceId ? { ...a, clockOutAt: action.clockOutAt } : a
        ),
      }
    case 'ADD_EMPLOYEE':
      return { ...state, employees: [...state.employees, action.employee] }
    case 'UPDATE_EMPLOYEE':
      return {
        ...state,
        employees: state.employees.map(e => (e.id === action.employee.id ? action.employee : e)),
      }
    default:
      return state
  }
}

const StoreContext = createContext<{ state: State; dispatch: React.Dispatch<Action> } | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    currentUserId: null,
    employees: MOCK_EMPLOYEES,
    attendance: MOCK_ATTENDANCE,
    trips: MOCK_TRIPS,
    allowances: MOCK_ALLOWANCES,
  })
  return <StoreContext.Provider value={{ state, dispatch }}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be inside StoreProvider')
  return ctx
}
