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

  const userId = user.id

  const { data: messages, error } = await supabase
    .from('messages')
    .select(
      `
      id,
      sender_id,
      recipient_id,
      content,
      is_read,
      created_at,
      listing_id,
      listings (
        id,
        title,
        listing_images (
          image_url,
          is_primary,
          sort_order
        )
      )
    `
    )
    .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
    .order('created_at', { ascending: false })

  if (error || !messages) {
    return NextResponse.json({ conversations: [] }, { status: 200 })
  }

  const conversationsMap = new Map<string, any[]>()
  for (const message of messages) {
    const otherUserId = message.sender_id === userId ? message.recipient_id : message.sender_id
    if (!conversationsMap.has(otherUserId)) conversationsMap.set(otherUserId, [])
    conversationsMap.get(otherUserId)!.push(message)
  }

  const otherUserIds = Array.from(conversationsMap.keys())
  const { data: profiles } = await supabase
    .from('user_profiles')
    .select('id, role, company_name, university, avatar_url')
    .in('id', otherUserIds)

  const profilesMap = new Map((profiles || []).map((p: any) => [p.id, p]))

  const conversations = [] as any[]
  for (const [otherUserId, msgs] of conversationsMap.entries()) {
    const profile = profilesMap.get(otherUserId)
    if (!profile) continue

    const lastMessage = msgs[0]
    const unreadCount = msgs.filter((m) => m.recipient_id === userId && !m.is_read).length

    const listingImages = lastMessage.listings?.listing_images || []
    const listingImage =
      listingImages.find((img: any) => img.is_primary)?.image_url ||
      listingImages.sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0))[0]?.image_url ||
      undefined

    const displayName =
      profile.role === 'owner' ? profile.company_name || 'Owner' : profile.university || 'Student'

    conversations.push({
      id: otherUserId,
      listing_id: lastMessage.listing_id,
      listing_title: lastMessage.listings?.title,
      listing_image: listingImage,
      other_user_id: otherUserId,
      other_user_name: displayName,
      other_user_role: profile.role,
      last_message: lastMessage.content,
      last_message_time: lastMessage.created_at,
      unread_count: unreadCount,
      created_at: msgs[msgs.length - 1].created_at,
    })
  }

  conversations.sort(
    (a, b) => new Date(b.last_message_time).getTime() - new Date(a.last_message_time).getTime()
  )

  return NextResponse.json({ conversations }, { status: 200 })
}
