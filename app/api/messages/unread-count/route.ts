import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

async function ensureCurrentUserProfile(supabase: any, user: any) {
  const role = (user?.user_metadata?.role || 'student').toString()
  const companyName = (user?.user_metadata?.company_name || user?.user_metadata?.companyName || '').toString().trim()
  const university = (user?.user_metadata?.university || '').toString().trim()
  const avatarUrl = (user?.user_metadata?.avatar_url || user?.user_metadata?.avatarUrl || '').toString().trim()

  await supabase
    .from('user_profiles')
    .upsert(
      {
        id: user.id,
        role,
        company_name: companyName || null,
        university: university || null,
        avatar_url: avatarUrl || null,
        preferred_language: 'en',
      },
      { onConflict: 'id' }
    )
}

export async function GET() {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await ensureCurrentUserProfile(supabase, user)

  const { count, error } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('recipient_id', user.id)
    .eq('is_read', false)

  if (error) {
    return NextResponse.json({ count: 0 }, { status: 200 })
  }

  return NextResponse.json({ count: count || 0 }, { status: 200 })
}
