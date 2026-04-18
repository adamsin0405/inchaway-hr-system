'use client'

import { useState } from 'react'
import { useStore } from '@/lib/store'
import type { Employee } from '@/lib/types'

type FormData = Omit<Employee, 'id'>

const DEFAULT_FORM: FormData = {
  name: '', phone: '', employeeCode: '', baseSalary: 2000,
  tripRate: 8, otHourlyRate: 10, standardHours: 8, role: 'driver', isActive: true,
}

export default function EmployeesPage() {
  const { state, dispatch } = useStore()
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState<FormData>(DEFAULT_FORM)

  const drivers = state.employees.filter(e => e.role === 'driver')

  function startAdd() {
    setForm(DEFAULT_FORM)
    setAdding(true)
    setEditingEmployee(null)
  }

  function startEdit(emp: Employee) {
    setForm({ ...emp })
    setEditingEmployee(emp)
    setAdding(false)
  }

  function handleSave() {
    if (editingEmployee) {
      dispatch({ type: 'UPDATE_EMPLOYEE', employee: { ...editingEmployee, ...form } })
    } else {
      dispatch({ type: 'ADD_EMPLOYEE', employee: { ...form, id: `drv${Date.now()}` } })
    }
    setEditingEmployee(null)
    setAdding(false)
  }

  function setField<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm(f => ({ ...f, [key]: value }))
  }

  const showForm = adding || !!editingEmployee

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Employees</h1>
          <p className="text-sm text-slate-500">{drivers.length} drivers</p>
        </div>
        <button
          onClick={startAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition"
        >
          + Add Driver
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm p-5 mb-6 border border-blue-200">
          <h3 className="font-semibold text-slate-700 mb-4">{adding ? 'Add New Driver' : `Edit — ${editingEmployee?.name}`}</h3>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Full Name">
              <input type="text" value={form.name} onChange={e => setField('name', e.target.value)}
                placeholder="Ahmad Razif" className={inputCls} />
            </Field>
            <Field label="Phone">
              <input type="text" value={form.phone} onChange={e => setField('phone', e.target.value)}
                placeholder="0123456789" className={inputCls} />
            </Field>
            <Field label="Employee Code">
              <input type="text" value={form.employeeCode} onChange={e => setField('employeeCode', e.target.value)}
                placeholder="DRV006" className={inputCls} />
            </Field>
            <Field label="Base Salary (RM/month)">
              <input type="number" value={form.baseSalary} onChange={e => setField('baseSalary', Number(e.target.value))}
                className={inputCls} />
            </Field>
            <Field label="Trip Rate (RM/trip)">
              <input type="number" value={form.tripRate} onChange={e => setField('tripRate', Number(e.target.value))}
                className={inputCls} />
            </Field>
            <Field label="OT Rate (RM/hour)">
              <input type="number" value={form.otHourlyRate} onChange={e => setField('otHourlyRate', Number(e.target.value))}
                className={inputCls} />
            </Field>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={handleSave}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition">
              Save
            </button>
            <button onClick={() => { setEditingEmployee(null); setAdding(false) }}
              className="text-slate-500 text-sm hover:text-slate-700 transition">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-xs text-slate-400 uppercase tracking-wide">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3 text-right">Base (RM)</th>
              <th className="px-4 py-3 text-right">Trip Rate</th>
              <th className="px-4 py-3 text-right">OT Rate</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {drivers.map(d => (
              <tr key={d.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-800">{d.name}</td>
                <td className="px-4 py-3 text-slate-500">{d.employeeCode}</td>
                <td className="px-4 py-3 text-slate-500">{d.phone}</td>
                <td className="px-4 py-3 text-right text-slate-600">{d.baseSalary.toLocaleString()}</td>
                <td className="px-4 py-3 text-right text-slate-600">RM {d.tripRate}</td>
                <td className="px-4 py-3 text-right text-slate-600">RM {d.otHourlyRate}/h</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => startEdit(d)} className="text-xs text-blue-500 hover:underline">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const inputCls = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs text-slate-400 font-semibold uppercase tracking-wide block mb-1">{label}</label>
      {children}
    </div>
  )
}
