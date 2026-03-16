import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data } = await supabase
    .from('user_profiles')
    .select('id, role, company_name, phone_number, preferred_language, university, avatar_url')
    .eq('id', user.id)
    .maybeSingle()

  return NextResponse.json({ profile: data || null }, { status: 200 })
}

export async function PATCH(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Bad request' }, { status: 400 })

  const allowed = {
    company_name: body.company_name ?? null,
    phone_number: body.phone_number ?? null,
    preferred_language: body.preferred_language ?? null,
    university: body.university ?? null,
    avatar_url: body.avatar_url ?? null,
  }

  const { error } = await supabase.from('user_profiles').update(allowed).eq('id', user.id)
  if (error) return NextResponse.json({ error: 'Failed to update' }, { status: 500 })

  return NextResponse.json({ ok: true }, { status: 200 })
}
