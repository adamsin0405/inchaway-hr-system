import { createClient } from '@supabase/supabase-js'
import type { Employee, Attendance, Trip, Allowance } from './types'

// Fallbacks prevent build-time throw; real values must be set in .env.local at runtime.
// auth.lock is overridden to a no-op to avoid the 5-second StorageMutex hang that
// occurs in Next.js when the lock from a previous render is not released in time.
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key',
  {
    auth: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      lock: (_name: string, _acquireTimeout: number, fn: () => Promise<any>) => fn(),
    },
  },
)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapEmployee(r: any): Employee {
  return {
    id: r.id,
    name: r.name,
    email: r.email ?? '',
    phone: r.phone ?? '',
    employeeCode: r.employee_code,
    baseSalary: Number(r.base_salary),
    tripRate: Number(r.trip_rate),
    otHourlyRate: Number(r.ot_hourly_rate),
    standardHours: Number(r.standard_hours),
    role: r.role,
    isActive: r.is_active,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapAttendance(r: any): Attendance {
  return {
    id: r.id,
    employeeId: r.employee_id,
    date: r.date,
    clockInAt: r.clock_in_at,
    clockOutAt: r.clock_out_at,
    clockInLat: r.clock_in_lat,
    clockInLng: r.clock_in_lng,
    clockOutLat: r.clock_out_lat,
    clockOutLng: r.clock_out_lng,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapTrip(r: any): Trip {
  return {
    id: r.id,
    employeeId: r.employee_id,
    date: r.date,
    tripCount: r.trip_count,
    destination: r.destination ?? '',
    notes: r.notes ?? '',
    submittedBy: r.submitted_by,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapAllowance(r: any): Allowance {
  return {
    id: r.id,
    employeeId: r.employee_id,
    date: r.date,
    type: r.type,
    amount: Number(r.amount),
    description: r.description ?? '',
    status: r.status,
    reviewedBy: r.reviewed_by,
    reviewedAt: r.reviewed_at,
    createdAt: r.created_at,
  }
}
