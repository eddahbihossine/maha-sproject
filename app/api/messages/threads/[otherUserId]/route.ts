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

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ otherUserId: string }> }
) {
  const { otherUserId } = await params
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Ensure profile exists for FK joins / inserts elsewhere
  await ensureCurrentUserProfile(supabase, user)

  const userId = user.id

  const { data: messages, error } = await supabase
    .from('messages')
    .select('*')
    .or(
      `and(sender_id.eq.${userId},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${userId})`
    )
    .order('created_at', { ascending: true })

  if (error) {
    return NextResponse.json({ messages: [] }, { status: 200 })
  }

  const unreadMessageIds =
    messages?.filter((m: any) => m.recipient_id === userId && !m.is_read).map((m: any) => m.id) || []

  if (unreadMessageIds.length > 0) {
    await supabase
      .from('messages')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .in('id', unreadMessageIds)
  }

  return NextResponse.json({ messages: messages || [] }, { status: 200 })
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ otherUserId: string }> }
) {
  const { otherUserId } = await params
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Ensure sender has a profile row (messages.sender_id FK -> user_profiles.id)
  await ensureCurrentUserProfile(supabase, user)

  // Ensure recipient exists (otherwise insert can FK-fail)
  const { data: recipientProfile } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('id', otherUserId)
    .maybeSingle()

  if (!recipientProfile?.id) {
    return NextResponse.json({ error: 'Recipient not found' }, { status: 404 })
  }

  const body = await request.json().catch(() => null)
  const content = (body?.content || '').trim()
  const listingId = body?.listingId

  if (!content) {
    return NextResponse.json({ error: 'Missing content' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('messages')
    .insert({
      sender_id: user.id,
      recipient_id: otherUserId,
      content,
      listing_id: listingId,
      is_read: false,
    })
    .select()
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Failed to send' }, { status: 500 })
  }

  return NextResponse.json({ message: data }, { status: 200 })
}
