export type Role = 'driver' | 'admin'

export interface Employee {
  id: string
  name: string
  phone: string
  employeeCode: string
  baseSalary: number
  tripRate: number
  otHourlyRate: number
  standardHours: number
  role: Role
  isActive: boolean
}

export interface Attendance {
  id: string
  employeeId: string
  date: string
  clockInAt: string | null
  clockOutAt: string | null
  clockInLat: number | null
  clockInLng: number | null
  clockOutLat: number | null
  clockOutLng: number | null
}

export interface Trip {
  id: string
  employeeId: string
  date: string
  tripCount: number
  destination: string
  notes: string
  submittedBy: 'driver' | 'admin'
  createdAt: string
  updatedAt: string
}

export type AllowanceType = 'petrol' | 'toll' | 'meal' | 'other'
export type AllowanceStatus = 'pending' | 'approved' | 'rejected'

export interface Allowance {
  id: string
  employeeId: string
  date: string
  type: AllowanceType
  amount: number
  description: string
  status: AllowanceStatus
  reviewedBy: string | null
  reviewedAt: string | null
  createdAt: string
}
