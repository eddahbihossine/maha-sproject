'use client'

import { useAuth } from '@/lib/auth/AuthProvider'
import { t } from './t'

export function useT() {
  const { language } = useAuth()
  return (key: string, vars?: Record<string, string | number>) => t(language, key, vars)
}
