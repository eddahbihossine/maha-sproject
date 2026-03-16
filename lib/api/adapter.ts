/**
 * API Adapter
 *
 * This project currently uses Supabase Auth + Realtime messaging.
 * To keep entity IDs consistent across features, listings are fetched from Supabase by default.
 *
 * You can opt-in to the Django backend by setting:
 *   NEXT_PUBLIC_USE_DJANGO=true
 */

import { Listing, ListingFilters, ListingImage } from '../types'
import * as djangoApi from './listings'
import { apiFetchJson } from '@/lib/api/http'

const USE_DJANGO =
  process.env.NEXT_PUBLIC_USE_DJANGO === 'true' ||
  process.env.NEXT_PUBLIC_USE_DJANGO_BACKEND === 'true'
const DJANGO_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

const isBrowser = typeof window !== 'undefined'

function toListingsQueryParams(filters?: ListingFilters): string {
  const params = new URLSearchParams()
  if (!filters) return params.toString()

  if (filters.city) params.set('city', filters.city)
  if (filters.propertyType) params.set('propertyType', String(filters.propertyType))
  if (typeof filters.minPrice === 'number') params.set('minPrice', String(filters.minPrice))
  if (typeof filters.maxPrice === 'number') params.set('maxPrice', String(filters.maxPrice))
  if (typeof filters.bedrooms === 'number') params.set('bedrooms', String(filters.bedrooms))
  if (typeof filters.furnished === 'boolean') params.set('furnished', String(filters.furnished))
  if (typeof filters.minSurface === 'number') params.set('minSurface', String(filters.minSurface))
  if (typeof filters.maxSurface === 'number') params.set('maxSurface', String(filters.maxSurface))

  return params.toString()
}

// Map Django listing format to frontend format
const mapDjangoImage = (image: any): ListingImage => ({
  id: String(image.id),
  url: image.image,
  thumbnailUrl: image.image,
  altText: image.alt_text,
  isPrimary: Boolean(image.is_primary),
  sortOrder: image.sort_order ?? 0,
})

const mapDjangoListing = (listing: any): Listing => ({
  id: String(listing.id),
  ownerId: String(listing.owner_id ?? listing.owner ?? ''),
  ownerName: listing.owner_name ?? '',
  ownerAvatar: listing.owner_avatar ?? undefined,
  title: listing.title,
  description: listing.description,
  propertyType: listing.property_type,
  status: listing.status,
  address: listing.address,
  city: listing.city,
  postalCode: listing.postal_code,
  latitude: listing.latitude ?? undefined,
  longitude: listing.longitude ?? undefined,
  hideExactAddress: Boolean(listing.hide_exact_address),
  surfaceArea: Number(listing.surface_area),
  numBedrooms: Number(listing.num_bedrooms),
  numBathrooms: Number(listing.num_bathrooms),
  floorNumber: listing.floor_number ?? undefined,
  totalFloors: listing.total_floors ?? undefined,
  furnished: Boolean(listing.furnished),
  rentMonthly: Number(listing.rent_monthly),
  chargesIncluded: Boolean(listing.charges_included),
  chargesAmount: listing.charges_amount ?? undefined,
  depositAmount: Number(listing.deposit_amount),
  agencyFees: listing.agency_fees ?? undefined,
  availableFrom: listing.available_from,
  minimumStayMonths: Number(listing.minimum_stay_months),
  maximumStayMonths: listing.maximum_stay_months ?? undefined,
  amenities: listing.amenities ?? [],
  rules: {
    smoking: Boolean(listing.smoking_allowed),
    pets: Boolean(listing.pets_allowed),
    couples: Boolean(listing.couples_allowed),
    parties: Boolean(listing.parties_allowed),
  },
  nearbyTransport: (listing.nearby_transport ?? []).map((name: string) => ({
    type: 'transport',
    name,
    distance: 0,
  })),
  nearbyUniversities: (listing.nearby_universities ?? []).map((name: string) => ({
    name,
    distance: 0,
  })),
  images: Array.isArray(listing.images) ? listing.images.map(mapDjangoImage) : [],
  viewCount: Number(listing.view_count ?? 0),
  favoriteCount: Number(listing.favorite_count ?? 0),
  verified: Boolean(listing.owner_verified ?? false),
  createdAt: listing.created_at,
  updatedAt: listing.updated_at,
  publishedAt: listing.published_at ?? undefined,
})

// Map Supabase listing format to frontend format
const mapSupabaseListingImage = (image: any): ListingImage => ({
  id: String(image.id),
  url: image.image_url,
  thumbnailUrl: image.image_url,
  altText: image.alt_text ?? undefined,
  isPrimary: Boolean(image.is_primary),
  sortOrder: image.sort_order ?? 0,
})

const mapSupabaseListing = (row: any): Listing => {
  const images = Array.isArray(row.listing_images)
    ? [...row.listing_images].sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    : []

  const ownerProfile = row.owner_profile || row.user_profiles || row.owner || null

  const ownerName = ownerProfile?.company_name || ownerProfile?.university || ''

  return {
    id: String(row.id),
    ownerId: String(row.owner_id),
    ownerName,
    ownerAvatar: ownerProfile?.avatar_url ?? undefined,
    title: row.title,
    description: row.description,
    propertyType: row.property_type,
    status: row.status,
    address: row.address,
    city: row.city,
    postalCode: row.postal_code,
    latitude: row.latitude ?? undefined,
    longitude: row.longitude ?? undefined,
    hideExactAddress: Boolean(row.hide_exact_address),
    surfaceArea: Number(row.surface_area),
    numBedrooms: Number(row.num_bedrooms),
    numBathrooms: Number(row.num_bathrooms),
    floorNumber: row.floor_number ?? undefined,
    totalFloors: row.total_floors ?? undefined,
    furnished: Boolean(row.furnished),
    rentMonthly: Number(row.rent_monthly),
    chargesIncluded: Boolean(row.charges_included),
    chargesAmount: row.charges_amount ?? undefined,
    depositAmount: Number(row.deposit_amount),
    agencyFees: row.agency_fees ?? undefined,
    availableFrom: row.available_from,
    minimumStayMonths: Number(row.minimum_stay_months),
    maximumStayMonths: row.maximum_stay_months ?? undefined,
    amenities: row.amenities ?? [],
    rules: {
      smoking: Boolean(row.smoking_allowed),
      pets: Boolean(row.pets_allowed),
      couples: Boolean(row.couples_allowed),
      parties: Boolean(row.parties_allowed),
    },
    nearbyTransport: (row.nearby_transport ?? []).map((name: string) => ({
      type: 'transport',
      name,
      distance: 0,
    })),
    nearbyUniversities: (row.nearby_universities ?? []).map((name: string) => ({
      name,
      distance: 0,
    })),
    images: images.map(mapSupabaseListingImage),
    viewCount: Number(row.view_count ?? 0),
    favoriteCount: Number(row.favorite_count ?? 0),
    verified: ownerProfile?.verification_status === 'verified',
    verifiedAt: undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    publishedAt: undefined,
  }
}

// Adapter exports - routes to Django backend
export const getListings = async (filters?: ListingFilters): Promise<Listing[]> => {
  if (USE_DJANGO) {
    const result = await djangoApi.listingsApi.getListings({
      city: filters?.city,
      property_type: filters?.propertyType,
      furnished: filters?.furnished,
      min_price: filters?.minPrice,
      max_price: filters?.maxPrice,
      bedrooms: filters?.bedrooms,
      min_surface: filters?.minSurface,
      max_surface: filters?.maxSurface,
    })

    if (result.data?.results) {
      return result.data.results.map(mapDjangoListing)
    }
    return []
  }

  // Supabase DB access is proxied through Next.js API routes.
  const qs = toListingsQueryParams(filters)
  const url = qs ? `/api/listings?${qs}` : '/api/listings'
  const data = await apiFetchJson<{ listings: Listing[] }>(url)
  return data.listings || []
}

export const getListing = async (id: string): Promise<Listing> => {
  if (USE_DJANGO) {
    const result = await djangoApi.listingsApi.getListing(Number(id))
    if (result.data) {
      return mapDjangoListing(result.data)
    }
    throw new Error('Listing not found')
  }

  const data = await apiFetchJson<{ listing: Listing }>(
    `/api/listings/${encodeURIComponent(id)}`
  )
  if (!data.listing) throw new Error('Listing not found')
  return data.listing
}

export const getFeaturedListings = async (): Promise<Listing[]> => {
  if (USE_DJANGO) {
    const result = await djangoApi.listingsApi.getFeaturedListings()
    if (result.data) {
      return (Array.isArray(result.data) ? result.data : []).map(mapDjangoListing)
    }
    return []
  }

  const data = await apiFetchJson<{ listings: Listing[] }>('/api/listings')
  return (data.listings || []).slice(0, 4)
}

export const getOwnerListings = async (ownerId: string): Promise<Listing[]> => {
  if (USE_DJANGO) {
    const result = await djangoApi.listingsApi.getMyListings()
    if (result.data) {
      return (Array.isArray(result.data) ? result.data : []).map(mapDjangoListing)
    }
    return []
  }

  // Owner is derived from session cookies server-side.
  void ownerId
  const data = await apiFetchJson<{ listings: any[] }>('/api/owner/listings')
  return (data.listings || []).map(mapSupabaseListing)
}

export const searchListings = async (query: string): Promise<Listing[]> => {
  if (USE_DJANGO) {
    const result = await djangoApi.listingsApi.getListings({ search: query })
    if (result.data?.results) {
      return result.data.results.map(mapDjangoListing)
    }
    return []
  }

  const data = await apiFetchJson<{ listings: Listing[] }>(
    `/api/listings?query=${encodeURIComponent(query)}`
  )
  return data.listings || []
}

export const createListing = async (listing: Partial<Listing>, token?: string): Promise<Listing> => {
  if (USE_DJANGO) {
    const result = await djangoApi.listingsApi.createListing({
      title: listing.title,
      description: listing.description,
      property_type: listing.propertyType,
      address: listing.address,
      city: listing.city,
      postal_code: listing.postalCode,
      latitude: listing.latitude,
      longitude: listing.longitude,
      hide_exact_address: listing.hideExactAddress,
      surface_area: listing.surfaceArea,
      num_bedrooms: listing.numBedrooms,
      num_bathrooms: listing.numBathrooms,
      floor_number: listing.floorNumber,
      total_floors: listing.totalFloors,
      furnished: listing.furnished,
      rent_monthly: listing.rentMonthly,
      charges_included: listing.chargesIncluded,
      charges_amount: listing.chargesAmount,
      deposit_amount: listing.depositAmount,
      agency_fees: listing.agencyFees,
      available_from: listing.availableFrom,
      minimum_stay_months: listing.minimumStayMonths,
      maximum_stay_months: listing.maximumStayMonths,
      amenities: listing.amenities,
      nearby_transport: (listing.nearbyTransport || []).map(t => t.name),
      nearby_universities: (listing.nearbyUniversities || []).map(u => u.name),
      smoking_allowed: listing.rules?.smoking,
      pets_allowed: listing.rules?.pets,
      couples_allowed: listing.rules?.couples,
      parties_allowed: listing.rules?.parties,
    })

    if (result.data) {
      return mapDjangoListing(result.data)
    }
    throw new Error('Failed to create listing')
  }

  void token

  const payload: any = {
    title: listing.title,
    description: listing.description,
    property_type: listing.propertyType,
    status: listing.status ?? 'draft',
    address: listing.address,
    city: listing.city,
    postal_code: listing.postalCode,
    latitude: listing.latitude,
    longitude: listing.longitude,
    hide_exact_address: listing.hideExactAddress ?? true,
    surface_area: listing.surfaceArea,
    num_bedrooms: listing.numBedrooms,
    num_bathrooms: listing.numBathrooms,
    floor_number: listing.floorNumber,
    total_floors: listing.totalFloors,
    furnished: listing.furnished ?? true,
    rent_monthly: listing.rentMonthly,
    charges_included: listing.chargesIncluded ?? false,
    charges_amount: listing.chargesAmount,
    deposit_amount: listing.depositAmount,
    agency_fees: listing.agencyFees,
    available_from: listing.availableFrom,
    minimum_stay_months: listing.minimumStayMonths,
    maximum_stay_months: listing.maximumStayMonths,
    amenities: listing.amenities ?? [],
    nearby_transport: (listing.nearbyTransport || []).map((t) => t.name),
    nearby_universities: (listing.nearbyUniversities || []).map((u) => u.name),
    smoking_allowed: listing.rules?.smoking ?? false,
    pets_allowed: listing.rules?.pets ?? false,
    couples_allowed: listing.rules?.couples ?? true,
    parties_allowed: listing.rules?.parties ?? false,
  }

  const created = await apiFetchJson<{ listing: any }>('/api/owner/listings', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  const createdId = created.listing?.id
  if (!createdId) throw new Error('Failed to create listing')

  const full = await apiFetchJson<{ listing: Listing }>(
    `/api/listings/${encodeURIComponent(String(createdId))}`
  )
  if (!full.listing) throw new Error('Failed to create listing')
  return full.listing
}

export const updateListing = async (id: string, updates: Partial<Listing>, token?: string): Promise<Listing> => {
  if (USE_DJANGO) {
    const result = await djangoApi.listingsApi.updateListing(Number(id), {
      title: updates.title,
      description: updates.description,
      property_type: updates.propertyType,
      address: updates.address,
      city: updates.city,
      postal_code: updates.postalCode,
      latitude: updates.latitude,
      longitude: updates.longitude,
      hide_exact_address: updates.hideExactAddress,
      surface_area: updates.surfaceArea,
      num_bedrooms: updates.numBedrooms,
      num_bathrooms: updates.numBathrooms,
      floor_number: updates.floorNumber,
      total_floors: updates.totalFloors,
      furnished: updates.furnished,
      rent_monthly: updates.rentMonthly,
      charges_included: updates.chargesIncluded,
      charges_amount: updates.chargesAmount,
      deposit_amount: updates.depositAmount,
      agency_fees: updates.agencyFees,
      available_from: updates.availableFrom,
      minimum_stay_months: updates.minimumStayMonths,
      maximum_stay_months: updates.maximumStayMonths,
      amenities: updates.amenities,
      nearby_transport: (updates.nearbyTransport || []).map(t => t.name),
      nearby_universities: (updates.nearbyUniversities || []).map(u => u.name),
      smoking_allowed: updates.rules?.smoking,
      pets_allowed: updates.rules?.pets,
      couples_allowed: updates.rules?.couples,
      parties_allowed: updates.rules?.parties,
    })

    if (result.data) {
      return mapDjangoListing(result.data)
    }
    throw new Error('Failed to update listing')
  }

  void token

  const listingPayload: any = {
    title: updates.title,
    description: updates.description,
    property_type: updates.propertyType,
    status: updates.status,
    address: updates.address,
    city: updates.city,
    postal_code: updates.postalCode,
    latitude: updates.latitude,
    longitude: updates.longitude,
    hide_exact_address: updates.hideExactAddress,
    surface_area: updates.surfaceArea,
    num_bedrooms: updates.numBedrooms,
    num_bathrooms: updates.numBathrooms,
    floor_number: updates.floorNumber,
    total_floors: updates.totalFloors,
    furnished: updates.furnished,
    rent_monthly: updates.rentMonthly,
    charges_included: updates.chargesIncluded,
    charges_amount: updates.chargesAmount,
    deposit_amount: updates.depositAmount,
    agency_fees: updates.agencyFees,
    available_from: updates.availableFrom,
    minimum_stay_months: updates.minimumStayMonths,
    maximum_stay_months: updates.maximumStayMonths,
    amenities: updates.amenities,
    nearby_transport: updates.nearbyTransport ? updates.nearbyTransport.map((t) => t.name) : undefined,
    nearby_universities: updates.nearbyUniversities ? updates.nearbyUniversities.map((u) => u.name) : undefined,
    smoking_allowed: updates.rules?.smoking,
    pets_allowed: updates.rules?.pets,
    couples_allowed: updates.rules?.couples,
    parties_allowed: updates.rules?.parties,
  }

  await apiFetchJson<{ listing: any }>(`/api/owner/listings/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify({ listing: listingPayload }),
  })

  const full = await apiFetchJson<{ listing: Listing }>(
    `/api/listings/${encodeURIComponent(id)}`
  )
  if (!full.listing) throw new Error('Failed to update listing')
  return full.listing
}

export const deleteListing = async (id: string, token?: string): Promise<void> => {
  if (USE_DJANGO) {
    await djangoApi.listingsApi.deleteListing(Number(id))
    return
  }

  void token

  await apiFetchJson<{ ok: boolean }>(`/api/owner/listings/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
}

export const incrementViewCount = async (id: string): Promise<void> => {
  if (USE_DJANGO) {
    await djangoApi.listingsApi.incrementViews(Number(id))
    return
  }

  // Supabase DB access is proxied through API routes, and view-count increment is best-effort.
  // No-op for now to avoid client-side DB writes.
  void id
}

// Export backend info for debugging
export const getBackendInfo = () => ({
  backend: USE_DJANGO ? 'Django' : 'Supabase',
  url: USE_DJANGO ? DJANGO_API_URL : 'supabase',
})
