import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
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

  const { data, error } = await supabase
    .from('listings')
    .select(`*, listing_images ( id, image_url, is_primary, sort_order )`)
    .eq('id', id)
    .eq('owner_id', user.id)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json({ listing: data }, { status: 200 })
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
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

  const body = await request.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Bad request' }, { status: 400 })

  const { listing, images } = body

  if (listing) {
    const { error } = await supabase.from('listings').update(listing).eq('id', id).eq('owner_id', user.id)
    if (error) return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }

  if (Array.isArray(images)) {
    // Replace images for this listing
    await supabase.from('listing_images').delete().eq('listing_id', id)
    if (images.length > 0) {
      const rows = images.map((img: any, idx: number) => ({
        listing_id: id,
        image_url: img.image_url,
        is_primary: Boolean(img.is_primary),
        sort_order: img.sort_order ?? idx,
      }))
      await supabase.from('listing_images').insert(rows)
    }
  }

  const { data: updated } = await supabase
    .from('listings')
    .select(`*, listing_images ( id, image_url, is_primary, sort_order )`)
    .eq('id', id)
    .eq('owner_id', user.id)
    .single()

  return NextResponse.json({ listing: updated || null }, { status: 200 })
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
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

  await supabase.from('listing_images').delete().eq('listing_id', id)
  const { error } = await supabase.from('listings').delete().eq('id', id).eq('owner_id', user.id)

  if (error) {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
  }

  return NextResponse.json({ ok: true }, { status: 200 })
}
