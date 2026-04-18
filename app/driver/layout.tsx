'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'

const NAV = [
  { label: 'Home', href: '/driver', icon: '🏠' },
  { label: 'Allowance', href: '/driver/allowance/new', icon: '💰' },
  { label: 'Trip', href: '/driver/trip/new', icon: '🚛' },
  { label: 'Payslip', href: '/driver/payslip', icon: '📋' },
]

export default function DriverLayout({ children }: { children: React.ReactNode }) {
  const { employee, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!loading) {
      if (!employee) router.replace('/login')
      else if (employee.role === 'admin') router.replace('/admin/attendance')
    }
  }, [employee, loading, router])

  if (loading || !employee || employee.role !== 'driver') return null

  async function handleLogout() {
    await supabase.auth.signOut()
    router.replace('/login')
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col max-w-md mx-auto">
      <header className="bg-blue-600 text-white px-4 py-3 flex items-center justify-between">
        <div>
          <p className="font-semibold">{employee.name}</p>
          <p className="text-xs text-blue-200">{employee.employeeCode}</p>
        </div>
        <button
          onClick={handleLogout}
          className="text-xs text-blue-200 hover:text-white transition"
        >
          Logout
        </button>
      </header>

      <main className="flex-1 overflow-y-auto pb-20">{children}</main>

      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-slate-200 flex">
        {NAV.map(item => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center py-2 text-xs gap-0.5 transition ${active ? 'text-blue-600' : 'text-slate-400'}`}
            >
              <span className="text-lg leading-none">{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
