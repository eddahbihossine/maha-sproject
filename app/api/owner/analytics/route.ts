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

  const userRole = user.user_metadata?.role
  if (userRole !== 'owner') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data: listings } = await supabase
    .from('listings')
    .select('id, status, view_count, favorite_count')
    .eq('owner_id', user.id)

  const listingIds = (listings || []).map((l: any) => l.id)

  const { data: bookings } = listingIds.length
    ? await supabase.from('bookings').select('id, status, listing_id').in('listing_id', listingIds)
    : { data: [] as any[] }

  const { data: messages } = await supabase
    .from('messages')
    .select('id, sender_id, recipient_id')
    .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)

  const totalViews = (listings || []).reduce((acc: number, l: any) => acc + (l.view_count || 0), 0)
  const totalFavorites = (listings || []).reduce((acc: number, l: any) => acc + (l.favorite_count || 0), 0)
  const activeListings = (listings || []).filter((l: any) => l.status === 'active').length
  const pendingBookings = (bookings || []).filter((b: any) => b.status === 'pending').length

  return NextResponse.json(
    {
      listings: listings?.length || 0,
      activeListings,
      totalViews,
      totalFavorites,
      bookings: bookings?.length || 0,
      pendingBookings,
      messages: messages?.length || 0,
    },
    { status: 200 }
  )
}
