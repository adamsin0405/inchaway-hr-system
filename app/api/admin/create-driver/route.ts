import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Uses service role key (server-only, never exposed to browser)
function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  )
}

export async function POST(req: NextRequest) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured in .env.local' }, { status: 500 })
  }

  // Verify caller holds a valid admin session
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sb = adminClient()
  const { data: { user }, error: userErr } = await sb.auth.getUser(token)
  if (userErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: caller } = await sb.from('employees').select('role').eq('user_id', user.id).single()
  if (caller?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { name, phone, employeeCode, baseSalary, tripRate, otHourlyRate, password } = await req.json()

  // Create Supabase auth user — email is phone@hr.local (internal only)
  const { data: authData, error: authErr } = await sb.auth.admin.createUser({
    email: `${phone}@hr.local`,
    password,
    email_confirm: true,
  })
  if (authErr) return NextResponse.json({ error: authErr.message }, { status: 400 })

  const { error: empErr } = await sb.from('employees').insert({
    user_id: authData.user.id,
    name,
    phone,
    employee_code: employeeCode,
    base_salary: baseSalary,
    trip_rate: tripRate,
    ot_hourly_rate: otHourlyRate,
    standard_hours: 8,
    role: 'driver',
    is_active: true,
  })

  if (empErr) {
    // Roll back the auth user so nothing is left in a half-created state
    await sb.auth.admin.deleteUser(authData.user.id)
    return NextResponse.json({ error: empErr.message }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
