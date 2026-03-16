import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('user_profiles')
    .select('id, role, avatar_url, company_name, university')
    .eq('id', id)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const displayName =
    data.role === 'owner'
      ? (data.company_name || '').trim() || 'Owner'
      : (data.university || '').trim() || 'Student'

  const parts = displayName.split(' ').filter(Boolean)
  const first_name = parts[0] || displayName || 'User'
  const last_name = parts.slice(1).join(' ') || (parts[0] ? 'User' : 'User')

  return NextResponse.json(
    {
      profile: {
        id: data.id,
        first_name,
        last_name,
        role: data.role,
      },
    },
    { status: 200 }
  )
}
