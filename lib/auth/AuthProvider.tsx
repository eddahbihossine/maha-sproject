'use client'

import { createContext, useContext, useEffect, useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { apiFetchJson } from '@/lib/api/http'
import { DEFAULT_LANGUAGE, normalizeLanguage, type Language } from '@/lib/i18n'
import type { User } from '@supabase/supabase-js'

type AuthContextType = {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
  language: Language
  setLanguage: (language: Language) => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
  language: DEFAULT_LANGUAGE,
  setLanguage: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window === 'undefined') return DEFAULT_LANGUAGE
    try {
      const stored = localStorage.getItem('preferred_language')
      return normalizeLanguage(stored)
    } catch {
      return DEFAULT_LANGUAGE
    }
  })
  
  // Create supabase client only once
  const supabase = useMemo(() => createClient(), [])

  // Keep <html lang> + localStorage in sync
  useEffect(() => {
    try {
      localStorage.setItem('preferred_language', language)
    } catch {
      // ignore
    }
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language
    }
  }, [language])

  useEffect(() => {
    let mounted = true

    // Get initial session
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (mounted) {
          setUser(session?.user ?? null)
          setLoading(false)
        }
      } catch (error) {
        console.error('Error getting session:', error)
        if (mounted) {
          setLoading(false)
        }
      }
    }

    initializeAuth()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setUser(session?.user ?? null)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [supabase])

  // Load preferred language from profile when signed in
  useEffect(() => {
    if (!user?.id) return

    let cancelled = false
    const loadPreferredLanguage = async () => {
      const res = await apiFetchJson<{ profile: { preferred_language?: unknown } | null }>('/api/profile').catch(
        () => null,
      )
      if (cancelled || !res?.profile) return
      const preferred = normalizeLanguage(res.profile.preferred_language)
      setLanguageState(preferred)
    }

    loadPreferredLanguage()
    return () => {
      cancelled = true
    }
  }, [user?.id])

  const setLanguage = async (next: Language) => {
    const normalized = normalizeLanguage(next)
    setLanguageState(normalized)

    if (!user?.id) return

    await apiFetchJson<{ ok: boolean }>('/api/profile', {
      method: 'PATCH',
      body: JSON.stringify({ preferred_language: normalized }),
    }).catch(() => null)
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signOut, language, setLanguage }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
