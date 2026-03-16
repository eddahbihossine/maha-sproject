import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function formatDate(value: unknown): string {
  const str = typeof value === 'string' ? value : value ? String(value) : ''
  if (!str) return ''
  const date = new Date(str)
  if (Number.isNaN(date.getTime())) return str
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

function buildDisplayName(row: any): string {
  const firstName = (row?.first_name ?? row?.firstName ?? '').toString().trim()
  const lastName = (row?.last_name ?? row?.lastName ?? '').toString().trim()
  const fullName = `${firstName} ${lastName}`.trim()
  if (fullName) return fullName

  const companyName = (row?.company_name ?? row?.companyName ?? '').toString().trim()
  if (companyName) return companyName

  const university = (row?.university ?? '').toString().trim()
  if (university) return university

  return (row?.id ?? '').toString()
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

  const { data: me } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (me?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: 'Failed to load users' }, { status: 500 })
  }

  const users = (data || []).map((row: any) => {
    const createdAt = row?.created_at ?? row?.createdAt
    const updatedAt = row?.updated_at ?? row?.updatedAt

    return {
      id: row.id,
      name: row.name ?? buildDisplayName(row),
      email: row.email ?? '',
      role: row.role ?? 'student',
      verificationStatus: row.verificationStatus ?? row.verification_status ?? 'pending',
      avatarUrl: row.avatarUrl ?? row.avatar_url ?? null,
      joinedAt: row.joinedAt ?? formatDate(createdAt),
      lastActiveAt: row.lastActiveAt ?? formatDate(row.last_active_at ?? updatedAt),
      isSuspended: Boolean(row.isSuspended ?? row.is_suspended ?? false),
    }
  })

  return NextResponse.json({ users }, { status: 200 })
}
