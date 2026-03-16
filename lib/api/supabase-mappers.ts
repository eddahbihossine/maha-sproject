import type { Listing, ListingImage } from '../types'

export const mapSupabaseListingImage = (image: any): ListingImage => ({
  id: String(image.id),
  url: image.image_url,
  thumbnailUrl: image.image_url,
  altText: image.alt_text ?? undefined,
  isPrimary: Boolean(image.is_primary),
  sortOrder: image.sort_order ?? 0,
})

export const mapSupabaseListing = (row: any): Listing => {
  const images = Array.isArray(row.listing_images)
    ? [...row.listing_images].sort(
        (a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
      )
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
    viewCount: Number(row.views_count ?? row.view_count ?? 0),
    favoriteCount: Number(row.favorite_count ?? 0),
    verified: Boolean(row.verified ?? row.owner_verified ?? false),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    publishedAt: row.published_at ?? undefined,
  }
}
