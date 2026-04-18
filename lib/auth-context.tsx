'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { supabase, mapEmployee } from './supabase'
import type { Employee } from './types'

interface AuthState {
  employee: Employee | null
  loading: boolean
}

const AuthContext = createContext<AuthState>({ employee: null, loading: true })

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ employee: null, loading: true })

  useEffect(() => {
    async function loadEmployee(userId: string): Promise<Employee | null> {
      const { data } = await supabase.from('employees').select('*').eq('user_id', userId).maybeSingle()
      return data ? mapEmployee(data) : null
    }

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        const employee = await loadEmployee(session.user.id)
        setState({ employee, loading: false })
      } else {
        setState({ employee: null, loading: false })
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        // Set loading: true immediately so layout guards don't redirect before we finish
        setState({ employee: null, loading: true })
        const employee = await loadEmployee(session.user.id)
        setState({ employee, loading: false })
      } else {
        setState({ employee: null, loading: false })
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
