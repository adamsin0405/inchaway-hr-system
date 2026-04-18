'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import { currentMonthMY } from '@/lib/date-utils'

const NAV = [
  { href: '/admin/attendance', label: 'Attendance', icon: '📋' },
  { href: '/admin/allowances', label: 'Allowances', icon: '💰' },
  { href: '/admin/trips', label: 'Trips', icon: '🚛' },
  { href: '/admin/payroll', label: 'Payroll', icon: '💵' },
  { href: '/admin/employees', label: 'Employees', icon: '👥' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { employee, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    if (!loading) {
      if (!employee) router.replace('/login')
      else if (employee.role !== 'admin') router.replace('/driver')
    }
  }, [employee, loading, router])

  useEffect(() => {
    if (employee?.role !== 'admin') return
    const MONTH = currentMonthMY()
    supabase
      .from('allowances')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending')
      .gte('date', `${MONTH}-01`)
      .then(({ count }) => setPendingCount(count ?? 0))
  }, [employee])

  if (loading || !employee || employee.role !== 'admin') return null

  async function handleLogout() {
    await supabase.auth.signOut()
    router.replace('/login')
  }

  return (
    <div className="min-h-screen flex bg-slate-100">
      <aside className="w-56 bg-slate-800 text-white flex flex-col shrink-0">
        <div className="px-4 py-5 border-b border-slate-700">
          <p className="font-bold text-lg">Driver Payroll</p>
          <p className="text-xs text-slate-400">Admin Dashboard</p>
        </div>
        <nav className="flex-1 py-4 space-y-1 px-2">
          {NAV.map(item => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${active ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`}
              >
                <span>{item.icon}</span>
                <span className="flex-1">{item.label}</span>
                {item.href === '/admin/allowances' && pendingCount > 0 && (
                  <span className="bg-yellow-400 text-slate-800 text-xs font-bold px-1.5 py-0.5 rounded-full">
                    {pendingCount}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>
        <div className="px-4 py-4 border-t border-slate-700">
          <button
            onClick={handleLogout}
            className="text-xs text-slate-400 hover:text-white transition"
          >
            ← Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
