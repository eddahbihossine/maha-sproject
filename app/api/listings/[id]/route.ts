import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { mapSupabaseListing } from '@/lib/api/supabase-mappers'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('listings')
    .select(
      `
      *,
      listing_images ( id, image_url, alt_text, is_primary, sort_order ),
      owner_profile:user_profiles!listings_owner_id_fkey ( id, role, company_name, university, avatar_url )
    `
    )
    .eq('id', id)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  // Hide drafts/paused/rented/etc from public users; owners can still preview their own listings.
  if (data.status !== 'active') {
    const {
      data: { user },
    } = await supabase.auth.getUser().catch(() => ({ data: { user: null } } as any))

    if (!user || user.id !== data.owner_id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
  }

  return NextResponse.json({ listing: mapSupabaseListing(data) }, { status: 200 })
}
