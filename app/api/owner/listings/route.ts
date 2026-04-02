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
  if (userRole !== 'owner' && userRole !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data, error } = await supabase
    .from('listings')
    .select(
      `
      *,
      listing_images ( image_url, is_primary, sort_order )
    `
    )
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ listings: [] }, { status: 200 })
  }

  return NextResponse.json({ listings: data || [] }, { status: 200 })
}

export async function POST(request: Request) {
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

  // Basic server-side validation (Supabase schema has NOT NULL + CHECK constraints)
  const missing: string[] = []
  const requiredTextFields = ['title', 'description', 'property_type', 'address', 'city', 'postal_code', 'available_from']
  for (const key of requiredTextFields) {
    const value = body?.[key]
    if (typeof value !== 'string' || value.trim().length === 0) missing.push(key)
  }
  if (typeof body?.surface_area !== 'number' || !Number.isFinite(body.surface_area) || body.surface_area <= 0) {
    missing.push('surface_area')
  }
  if (typeof body?.num_bathrooms !== 'number' || !Number.isFinite(body.num_bathrooms) || body.num_bathrooms < 1) {
    missing.push('num_bathrooms')
  }
  if (typeof body?.rent_monthly !== 'number' || !Number.isFinite(body.rent_monthly) || body.rent_monthly < 0) {
    missing.push('rent_monthly')
  }
  if (typeof body?.deposit_amount !== 'number' || !Number.isFinite(body.deposit_amount) || body.deposit_amount < 0) {
    missing.push('deposit_amount')
  }
  if (
    typeof body?.minimum_stay_months !== 'number' ||
    !Number.isFinite(body.minimum_stay_months) ||
    body.minimum_stay_months < 1
  ) {
    missing.push('minimum_stay_months')
  }

  if (missing.length > 0) {
    return NextResponse.json(
      {
        error: 'Missing or invalid required fields',
        fields: Array.from(new Set(missing)),
      },
      { status: 400 }
    )
  }

  // Ensure the owner's user_profile exists (some schemas FK listings.owner_id -> user_profiles.id)
  const { error: upsertError } = await supabase
    .from('user_profiles')
    .upsert(
      {
        id: user.id,
        role: 'owner',
        preferred_language: 'en',
      },
      { onConflict: 'id' }
    )

  if (upsertError) {
    return NextResponse.json(
      {
        error: 'Failed to ensure owner profile',
        details: upsertError.message,
        code: (upsertError as any).code,
        hint: (upsertError as any).hint,
      },
      { status: 500 }
    )
  }

  // Ensure owner_id is always the current user
  const allowedStatuses = new Set(['draft', 'active', 'paused', 'rented', 'archived'])
  const desiredStatus = typeof body?.status === 'string' ? body.status.trim() : ''
  const status = allowedStatuses.has(desiredStatus) ? desiredStatus : 'active'

  const payload = { ...body, owner_id: user.id, status }

  const { data, error } = await supabase.from('listings').insert(payload).select().single()

  if (error || !data) {
    return NextResponse.json(
      {
        error: 'Failed to create',
        details: error?.message || 'Unknown error',
        code: (error as any)?.code,
        hint: (error as any)?.hint,
      },
      { status: 400 }
    )
  }

  return NextResponse.json({ listing: data }, { status: 200 })
}
