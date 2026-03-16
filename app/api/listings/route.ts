import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { mapSupabaseListing } from '@/lib/api/supabase-mappers'

type ListingsApiFilters = {
  query?: string
  city?: string
  propertyType?: string
  minRent?: number
  maxRent?: number
  minBedrooms?: number
  maxBedrooms?: number
  minSurface?: number
  maxSurface?: number
  furnished?: boolean
  availableFrom?: string
  amenities?: string[]
  sortBy?: string
  sortOrder?: string
}

function parseFilters(searchParams: URLSearchParams): ListingsApiFilters {
  const minRentRaw = searchParams.get('minRent') ?? searchParams.get('minPrice')
  const maxRentRaw = searchParams.get('maxRent') ?? searchParams.get('maxPrice')
  const minBedroomsRaw = searchParams.get('minBedrooms') ?? searchParams.get('bedrooms')
  const minSurfaceRaw = searchParams.get('minSurface')
  const maxSurfaceRaw = searchParams.get('maxSurface')

  return {
    query: searchParams.get('query') || undefined,
    city: searchParams.get('city') || undefined,
    propertyType: (searchParams.get('propertyType') as any) || undefined,
    minRent: minRentRaw ? Number(minRentRaw) : undefined,
    maxRent: maxRentRaw ? Number(maxRentRaw) : undefined,
    minBedrooms: minBedroomsRaw ? Number(minBedroomsRaw) : undefined,
    maxBedrooms: searchParams.get('maxBedrooms') ? Number(searchParams.get('maxBedrooms')) : undefined,
    minSurface: minSurfaceRaw ? Number(minSurfaceRaw) : undefined,
    maxSurface: maxSurfaceRaw ? Number(maxSurfaceRaw) : undefined,
    furnished: searchParams.get('furnished') ? searchParams.get('furnished') === 'true' : undefined,
    availableFrom: searchParams.get('availableFrom') || undefined,
    amenities: searchParams.getAll('amenities') || undefined,
    sortBy: (searchParams.get('sortBy') as any) || undefined,
    sortOrder: (searchParams.get('sortOrder') as any) || undefined,
  }
}

export async function GET(request: Request) {
  const supabase = await createClient()
  const url = new URL(request.url)
  const filters = parseFilters(url.searchParams)

  let query = supabase
    .from('listings')
    .select(
      `
      *,
      listing_images ( id, image_url, alt_text, is_primary, sort_order ),
      owner_profile:user_profiles!listings_owner_id_fkey ( id, role, company_name, university, avatar_url )
    `
    )

  // Public browse/search should only show active listings.
  query = query.eq('status', 'active')

  if (filters.query) {
    query = query.or(`title.ilike.%${filters.query}%,description.ilike.%${filters.query}%`)
  }
  if (filters.city) query = query.ilike('city', `%${filters.city}%`)
  if (filters.propertyType) query = query.eq('property_type', filters.propertyType)
  if (typeof filters.minRent === 'number') query = query.gte('rent_monthly', filters.minRent)
  if (typeof filters.maxRent === 'number') query = query.lte('rent_monthly', filters.maxRent)
  if (typeof filters.minBedrooms === 'number') query = query.gte('num_bedrooms', filters.minBedrooms)
  if (typeof filters.maxBedrooms === 'number') query = query.lte('num_bedrooms', filters.maxBedrooms)
  if (typeof filters.minSurface === 'number') query = query.gte('surface_area', filters.minSurface)
  if (typeof filters.maxSurface === 'number') query = query.lte('surface_area', filters.maxSurface)
  if (typeof filters.furnished === 'boolean') query = query.eq('furnished', filters.furnished)
  if (filters.availableFrom) query = query.gte('available_from', filters.availableFrom)
  if (filters.amenities && filters.amenities.length > 0) {
    query = query.contains('amenities', filters.amenities)
  }

  const sortBy = filters.sortBy || 'createdAt'
  const sortOrder = filters.sortOrder || 'desc'

  if (sortBy === 'price') {
    query = query.order('rent_monthly', { ascending: sortOrder === 'asc' })
  } else if (sortBy === 'viewCount') {
    query = query.order('views_count', { ascending: sortOrder === 'asc' })
  } else {
    query = query.order('created_at', { ascending: sortOrder === 'asc' })
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ listings: [] }, { status: 200 })
  }

  return NextResponse.json({ listings: (data || []).map(mapSupabaseListing) }, { status: 200 })
}
