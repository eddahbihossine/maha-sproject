import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { mapSupabaseListing } from '@/lib/api/supabase-mappers'

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
    .from('listings')
    .select(
      `
      *,
      listing_images ( id, image_url, alt_text, is_primary, sort_order ),
      owner_profile:user_profiles!listings_owner_id_fkey ( id, role, company_name, university, avatar_url )
    `
    )
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: 'Failed to load listings' }, { status: 500 })
  }

  return NextResponse.json({ listings: (data || []).map(mapSupabaseListing) }, { status: 200 })
}
