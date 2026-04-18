// DEMO DATA — all names, phone numbers, and coordinates are fictional.
// Replace this file with real Supabase queries before going to production.
import type { Employee, Attendance, Trip, Allowance } from './types'

export const MOCK_EMPLOYEES: Employee[] = [
  { id: '1', name: 'Demo Driver A', email: '', phone: '0100000001', employeeCode: 'DRV001', baseSalary: 2000, tripRate: 8, otHourlyRate: 10, standardHours: 8, role: 'driver', isActive: true },
  { id: '2', name: 'Demo Driver B', email: '', phone: '0100000002', employeeCode: 'DRV002', baseSalary: 2200, tripRate: 8, otHourlyRate: 10, standardHours: 8, role: 'driver', isActive: true },
  { id: '3', name: 'Demo Driver C', email: '', phone: '0100000003', employeeCode: 'DRV003', baseSalary: 2000, tripRate: 8, otHourlyRate: 10, standardHours: 8, role: 'driver', isActive: true },
  { id: '4', name: 'Demo Driver D', email: '', phone: '0100000004', employeeCode: 'DRV004', baseSalary: 2100, tripRate: 8, otHourlyRate: 10, standardHours: 8, role: 'driver', isActive: true },
  { id: '5', name: 'Demo Driver E', email: '', phone: '0100000005', employeeCode: 'DRV005', baseSalary: 2000, tripRate: 8, otHourlyRate: 10, standardHours: 8, role: 'driver', isActive: true },
  { id: 'admin', name: 'Demo Boss', email: '', phone: '0100000000', employeeCode: 'ADM001', baseSalary: 0, tripRate: 0, otHourlyRate: 0, standardHours: 8, role: 'admin', isActive: true },
]

const D = '2026-04-18'

// GPS coordinates are placeholder values (not real work locations)
const LAT = 3.0
const LNG = 101.5

export const MOCK_ATTENDANCE: Attendance[] = [
  { id: 'a1', employeeId: '1', date: D, clockInAt: `${D}T08:05:00`, clockOutAt: `${D}T17:35:00`, clockInLat: LAT, clockInLng: LNG, clockOutLat: LAT, clockOutLng: LNG },
  { id: 'a2', employeeId: '2', date: D, clockInAt: `${D}T07:45:00`, clockOutAt: null, clockInLat: LAT, clockInLng: LNG, clockOutLat: null, clockOutLng: null },
  { id: 'a4', employeeId: '4', date: D, clockInAt: `${D}T08:30:00`, clockOutAt: `${D}T16:30:00`, clockInLat: LAT, clockInLng: LNG, clockOutLat: LAT, clockOutLng: LNG },
  { id: 'a5', employeeId: '5', date: D, clockInAt: `${D}T08:00:00`, clockOutAt: `${D}T20:00:00`, clockInLat: LAT, clockInLng: LNG, clockOutLat: LAT, clockOutLng: LNG },
  { id: 'a6', employeeId: '1', date: '2026-04-17', clockInAt: '2026-04-17T08:00:00', clockOutAt: '2026-04-17T19:00:00', clockInLat: LAT, clockInLng: LNG, clockOutLat: LAT, clockOutLng: LNG },
  { id: 'a7', employeeId: '5', date: '2026-04-17', clockInAt: '2026-04-17T08:00:00', clockOutAt: '2026-04-17T18:00:00', clockInLat: LAT, clockInLng: LNG, clockOutLat: LAT, clockOutLng: LNG },
  { id: 'a8', employeeId: '2', date: '2026-04-17', clockInAt: '2026-04-17T08:00:00', clockOutAt: '2026-04-17T17:00:00', clockInLat: LAT, clockInLng: LNG, clockOutLat: LAT, clockOutLng: LNG },
  { id: 'a9', employeeId: '3', date: '2026-04-17', clockInAt: '2026-04-17T08:30:00', clockOutAt: '2026-04-17T17:30:00', clockInLat: LAT, clockInLng: LNG, clockOutLat: LAT, clockOutLng: LNG },
]

export const MOCK_TRIPS: Trip[] = [
  { id: 't1', employeeId: '1', date: '2026-04-15', tripCount: 4, destination: 'Location A', notes: '', submittedBy: 'driver', createdAt: '2026-04-15T18:00:00', updatedAt: '2026-04-15T18:00:00' },
  { id: 't2', employeeId: '1', date: '2026-04-16', tripCount: 3, destination: 'Location B', notes: '', submittedBy: 'driver', createdAt: '2026-04-16T18:00:00', updatedAt: '2026-04-16T18:00:00' },
  { id: 't3', employeeId: '1', date: '2026-04-17', tripCount: 5, destination: 'Location A', notes: '', submittedBy: 'driver', createdAt: '2026-04-17T18:00:00', updatedAt: '2026-04-17T18:00:00' },
  { id: 't4', employeeId: '1', date: D, tripCount: 3, destination: 'Location C', notes: '', submittedBy: 'driver', createdAt: `${D}T14:00:00`, updatedAt: `${D}T14:00:00` },
  { id: 't5', employeeId: '2', date: '2026-04-15', tripCount: 2, destination: 'Location D', notes: '', submittedBy: 'driver', createdAt: '2026-04-15T18:00:00', updatedAt: '2026-04-15T18:00:00' },
  { id: 't6', employeeId: '2', date: '2026-04-16', tripCount: 2, destination: 'Location D', notes: '', submittedBy: 'driver', createdAt: '2026-04-16T18:00:00', updatedAt: '2026-04-16T18:00:00' },
  { id: 't7', employeeId: '2', date: '2026-04-17', tripCount: 3, destination: 'Location E', notes: '', submittedBy: 'driver', createdAt: '2026-04-17T18:00:00', updatedAt: '2026-04-17T18:00:00' },
  { id: 't8', employeeId: '3', date: '2026-04-15', tripCount: 3, destination: 'Location F', notes: '', submittedBy: 'driver', createdAt: '2026-04-15T18:00:00', updatedAt: '2026-04-15T18:00:00' },
  { id: 't9', employeeId: '3', date: '2026-04-16', tripCount: 4, destination: 'Location F', notes: '', submittedBy: 'driver', createdAt: '2026-04-16T18:00:00', updatedAt: '2026-04-16T18:00:00' },
  { id: 't10', employeeId: '4', date: '2026-04-15', tripCount: 2, destination: 'Location G', notes: '', submittedBy: 'driver', createdAt: '2026-04-15T18:00:00', updatedAt: '2026-04-15T18:00:00' },
  { id: 't11', employeeId: '4', date: '2026-04-16', tripCount: 2, destination: 'Location G', notes: '', submittedBy: 'driver', createdAt: '2026-04-16T18:00:00', updatedAt: '2026-04-16T18:00:00' },
  { id: 't12', employeeId: '4', date: '2026-04-17', tripCount: 2, destination: 'Location G', notes: '', submittedBy: 'driver', createdAt: '2026-04-17T18:00:00', updatedAt: '2026-04-17T18:00:00' },
  { id: 't13', employeeId: '5', date: '2026-04-15', tripCount: 5, destination: 'Location H', notes: '', submittedBy: 'driver', createdAt: '2026-04-15T18:00:00', updatedAt: '2026-04-15T18:00:00' },
  { id: 't14', employeeId: '5', date: '2026-04-16', tripCount: 5, destination: 'Location H', notes: '', submittedBy: 'driver', createdAt: '2026-04-16T18:00:00', updatedAt: '2026-04-16T18:00:00' },
  { id: 't15', employeeId: '5', date: '2026-04-17', tripCount: 4, destination: 'Location H', notes: '', submittedBy: 'driver', createdAt: '2026-04-17T18:00:00', updatedAt: '2026-04-17T18:00:00' },
  { id: 't16', employeeId: '5', date: D, tripCount: 3, destination: 'Location H', notes: '', submittedBy: 'driver', createdAt: `${D}T14:00:00`, updatedAt: `${D}T14:00:00` },
]

export const MOCK_ALLOWANCES: Allowance[] = [
  { id: 'al1', employeeId: '1', date: '2026-04-15', type: 'petrol', amount: 60, description: 'Petrol — demo entry', status: 'approved', reviewedBy: 'admin', reviewedAt: '2026-04-16T09:00:00', createdAt: '2026-04-15T18:00:00' },
  { id: 'al2', employeeId: '1', date: '2026-04-15', type: 'toll', amount: 12, description: 'Toll — demo entry', status: 'approved', reviewedBy: 'admin', reviewedAt: '2026-04-16T09:00:00', createdAt: '2026-04-15T18:00:00' },
  { id: 'al3', employeeId: '1', date: '2026-04-17', type: 'petrol', amount: 80, description: 'Petrol — demo entry', status: 'pending', reviewedBy: null, reviewedAt: null, createdAt: '2026-04-17T18:00:00' },
  { id: 'al4', employeeId: '1', date: D, type: 'meal', amount: 15, description: 'Meal — demo entry', status: 'pending', reviewedBy: null, reviewedAt: null, createdAt: `${D}T13:00:00` },
  { id: 'al5', employeeId: '2', date: '2026-04-15', type: 'petrol', amount: 40, description: 'Petrol — demo entry', status: 'approved', reviewedBy: 'admin', reviewedAt: '2026-04-16T09:00:00', createdAt: '2026-04-15T18:00:00' },
  { id: 'al6', employeeId: '2', date: '2026-04-16', type: 'toll', amount: 8, description: 'Toll — demo entry', status: 'pending', reviewedBy: null, reviewedAt: null, createdAt: '2026-04-16T18:00:00' },
  { id: 'al7', employeeId: '3', date: '2026-04-15', type: 'petrol', amount: 55, description: 'Petrol — demo entry', status: 'approved', reviewedBy: 'admin', reviewedAt: '2026-04-16T09:00:00', createdAt: '2026-04-15T18:00:00' },
  { id: 'al8', employeeId: '3', date: '2026-04-15', type: 'other', amount: 20, description: 'Other — demo entry', status: 'rejected', reviewedBy: 'admin', reviewedAt: '2026-04-16T09:30:00', createdAt: '2026-04-15T18:00:00' },
  { id: 'al9', employeeId: '3', date: '2026-04-16', type: 'petrol', amount: 70, description: 'Petrol — demo entry', status: 'pending', reviewedBy: null, reviewedAt: null, createdAt: '2026-04-16T18:00:00' },
  { id: 'al10', employeeId: '4', date: '2026-04-15', type: 'petrol', amount: 30, description: 'Petrol — demo entry', status: 'approved', reviewedBy: 'admin', reviewedAt: '2026-04-16T09:00:00', createdAt: '2026-04-15T18:00:00' },
  { id: 'al11', employeeId: '5', date: '2026-04-15', type: 'petrol', amount: 90, description: 'Petrol — demo entry', status: 'approved', reviewedBy: 'admin', reviewedAt: '2026-04-16T09:00:00', createdAt: '2026-04-15T18:00:00' },
  { id: 'al12', employeeId: '5', date: '2026-04-15', type: 'toll', amount: 20, description: 'Toll — demo entry', status: 'approved', reviewedBy: 'admin', reviewedAt: '2026-04-16T09:00:00', createdAt: '2026-04-15T18:00:00' },
  { id: 'al13', employeeId: '5', date: D, type: 'petrol', amount: 50, description: 'Petrol — demo entry', status: 'pending', reviewedBy: null, reviewedAt: null, createdAt: `${D}T15:00:00` },
]
