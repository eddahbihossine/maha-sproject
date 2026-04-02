import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function extractBucketAndPathFromUrl(publicUrl: string): { bucket: string; path: string } | null {
  // Common Supabase public/signed URL formats
  const patterns: RegExp[] = [
    /\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/,
    /\/storage\/v1\/object\/sign\/([^/]+)\/(.+)$/,
    /\/storage\/v1\/s3\/([^/]+)\/(.+)$/,
  ]

  for (const pattern of patterns) {
    const match = publicUrl.match(pattern)
    if (match?.[1] && match?.[2]) {
      return { bucket: match[1], path: match[2] }
    }
  }

  return null
}

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
  if (userRole !== 'owner' && userRole !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data, error } = await supabase
    .from('listings')
    .select(`*, listing_images ( id, image_url, is_primary, sort_order )`)
    .eq('id', id)
    .single()

  if (userRole !== 'admin') {
    // Enforce ownership for owners
    if (!data || data.owner_id !== user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
  }

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
  if (userRole !== 'owner' && userRole !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Bad request' }, { status: 400 })

  const { listing, images } = body

  if (listing) {
    let query = supabase.from('listings').update(listing).eq('id', id)
    if (userRole !== 'admin') query = query.eq('owner_id', user.id)
    const { error } = await query
    if (error) return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }

  if (Array.isArray(images)) {
    // Replace images for this listing (no silent failures)
    const normalized = images
      .map((img: any, idx: number) => ({
        image_url: typeof img?.image_url === 'string' ? img.image_url.trim() : '',
        alt_text: typeof img?.alt_text === 'string' ? img.alt_text.trim() : null,
        is_primary: Boolean(img?.is_primary),
        sort_order: Number.isFinite(Number(img?.sort_order)) ? Number(img.sort_order) : idx,
        idx,
      }))
      .filter((img) => img.image_url.length > 0)

    if (images.length > 0 && normalized.length === 0) {
      return NextResponse.json(
        { error: 'Invalid images payload', details: 'Expected at least one image_url string' },
        { status: 400 }
      )
    }

    // Ensure a single primary image if any exist
    if (normalized.length > 0 && !normalized.some((x) => x.is_primary)) {
      normalized[0].is_primary = true
    }
    let primarySeen = false
    for (const img of normalized) {
      if (img.is_primary) {
        if (primarySeen) img.is_primary = false
        primarySeen = true
      }
    }

    const { error: deleteError } = await supabase.from('listing_images').delete().eq('listing_id', id)
    if (deleteError) {
      return NextResponse.json(
        { error: 'Failed to delete existing images', details: deleteError.message, code: (deleteError as any).code },
        { status: 400 }
      )
    }

    if (normalized.length > 0) {
      const rows = normalized.map((img) => ({
        listing_id: id,
        image_url: img.image_url,
        alt_text: img.alt_text,
        is_primary: img.is_primary,
        sort_order: img.sort_order,
      }))

      const { error: insertError } = await supabase.from('listing_images').insert(rows)
      if (insertError) {
        return NextResponse.json(
          { error: 'Failed to save images', details: insertError.message, code: (insertError as any).code, hint: (insertError as any).hint },
          { status: 400 }
        )
      }
    }
  }

  const { data: updated } = await supabase
    .from('listings')
    .select(`*, listing_images ( id, image_url, is_primary, sort_order )`)
    .eq('id', id)
    .single()

  if (userRole !== 'admin') {
    if (!updated || (updated as any).owner_id !== user.id) {
      return NextResponse.json({ listing: null }, { status: 200 })
    }
  }

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
  if (userRole !== 'owner' && userRole !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Enforce ownership explicitly. Note: Supabase RLS also enforces this, but when RLS blocks a
  // delete, Supabase often returns success with 0 affected rows, so we check ourselves.
  const { data: listing, error: listingError } = await supabase
    .from('listings')
    .select('id, owner_id')
    .eq('id', id)
    .eq('owner_id', user.id)
    .maybeSingle()

  if (listingError) {
    return NextResponse.json(
      { error: 'Failed to delete', details: listingError.message },
      { status: 500 }
    )
  }

  if (!listing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  // Best-effort: delete storage objects referenced by listing_images.
  // Even if this fails (permissions/policies), we still delete the listing record.
  const { data: images } = await supabase
    .from('listing_images')
    .select('image_url')
    .eq('listing_id', id)

  const byBucket = new Map<string, string[]>()
  for (const row of images || []) {
    const url = typeof (row as any)?.image_url === 'string' ? (row as any).image_url.trim() : ''
    if (!url) continue
    const extracted = extractBucketAndPathFromUrl(url)
    if (!extracted?.bucket || !extracted?.path) continue
    const paths = byBucket.get(extracted.bucket) || []
    paths.push(extracted.path)
    byBucket.set(extracted.bucket, paths)
  }

  for (const [bucket, paths] of byBucket.entries()) {
    if (paths.length === 0) continue
    const { error: storageError } = await supabase.storage.from(bucket).remove(paths)
    if (storageError) {
      console.warn(`Failed to delete storage objects from ${bucket}:`, storageError.message)
    }
  }

  const { data: deleted, error: deleteError } = await supabase
    .from('listings')
    .delete()
    .eq('id', id)
    .eq('owner_id', user.id)
    .select('id')

  if (deleteError) {
    return NextResponse.json(
      { error: 'Failed to delete', details: deleteError.message, code: (deleteError as any).code },
      { status: 500 }
    )
  }

  if (!deleted || deleted.length === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json({ ok: true }, { status: 200 })
}
