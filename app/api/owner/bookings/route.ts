import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
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

  const url = new URL(request.url)
  const limit = url.searchParams.get('limit') ? Number(url.searchParams.get('limit')) : undefined

  let query = supabase
    .from('bookings')
    .select(
      `
      *,
      listings!inner(
        id,
        title,
        city,
        rent_monthly,
        owner_id,
        listing_images (
          image_url,
          is_primary,
          sort_order
        )
      ),
      user_profiles!bookings_student_id_fkey(university, company_name, avatar_url, role)
    `
    )
    .eq('listings.owner_id', user.id)
    .order('created_at', { ascending: false })

  if (typeof limit === 'number' && Number.isFinite(limit)) {
    query = query.limit(limit)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ bookings: [] }, { status: 200 })
  }

  return NextResponse.json({ bookings: data || [] }, { status: 200 })
}
