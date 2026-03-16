import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    throw new Error(
      'Missing Supabase env vars: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY'
    )
  }

  return createBrowserClient(url, anonKey, {
    auth: {
      // Prevent background refresh calls that can surface as "TypeError: Failed to fetch" in dev
      // when Supabase is not reachable or env vars are misconfigured.
      autoRefreshToken: false,
      persistSession: true,
      detectSessionInUrl: true,
    },
  })
}
