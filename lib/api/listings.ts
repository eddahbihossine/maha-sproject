/**
 * Listings API - Django Backend
 */

import { apiRequest } from './client';

export interface ListingImage {
  id: number;
  image: string;
  alt_text: string;
  is_primary: boolean;
  sort_order: number;
  created_at: string;
}

export interface Listing {
  id: number;
  title: string;
  description: string;
  property_type: 'studio' | 'apartment' | 'room' | 'shared' | 'residence';
  status: 'draft' | 'active' | 'paused' | 'rented' | 'archived';
  address: string;
  city: string;
  postal_code: string;
  latitude?: number;
  longitude?: number;
  hide_exact_address: boolean;
  surface_area: number;
  num_bedrooms: number;
  num_bathrooms: number;
  floor_number?: number;
  total_floors?: number;
  furnished: boolean;
  rent_monthly: number;
  charges_included: boolean;
  charges_amount?: number;
  deposit_amount: number;
  agency_fees?: number;
  available_from: string;
  minimum_stay_months: number;
  maximum_stay_months?: number;
  amenities: string[];
  nearby_transport: string[];
  nearby_universities: string[];
  smoking_allowed: boolean;
  pets_allowed: boolean;
  couples_allowed: boolean;
  parties_allowed: boolean;
  view_count: number;
  avg_rating: number;
  review_count: number;
  images: ListingImage[];
  owner_id: number;
  owner_name: string;
  owner_avatar?: string;
  owner_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface ListingFilters {
  city?: string;
  property_type?: string;
  furnished?: boolean;
  status?: string;
  min_price?: number;
  max_price?: number;
  bedrooms?: number;
  min_surface?: number;
  max_surface?: number;
  search?: string;
  ordering?: string;
  page?: number;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

type LegacyGetListingsOptions = {
  city?: string;
  property_type?: string;
  propertyType?: string;
  furnished?: boolean;
  status?: string;
  min_price?: number;
  max_price?: number;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  min_surface?: number;
  max_surface?: number;
  minSurface?: number;
  maxSurface?: number;
  search?: string;
  ordering?: string;
  page?: number;
  limit?: number;
  offset?: number;
};

const DEFAULT_PAGE_SIZE = 20;

function toImageUrl(image: any): string {
  if (!image) return '';
  if (typeof image === 'string') return image;
  return image.url || image.image || '';
}

function mapImagesToLegacy(images: any[] | undefined | null): any[] {
  if (!Array.isArray(images)) return [];
  return images
    .map((img) => {
      const url = toImageUrl(img);
      return {
        ...img,
        url,
      };
    })
    .filter((img) => !!img.url);
}

function mapListingToLegacy(listing: any): any {
  if (!listing || typeof listing !== 'object') return listing;

  const ownerId =
    listing.owner_id ??
    listing.ownerId ??
    (typeof listing.owner === 'number' ? listing.owner : listing.owner?.id);
  const ownerName =
    listing.owner_name ??
    listing.ownerName ??
    (listing.owner
      ? `${listing.owner.first_name ?? ''} ${listing.owner.last_name ?? ''}`.trim()
      : undefined);

  return {
    ...listing,
    owner_id: ownerId,
    ownerId,
    owner_name: ownerName,
    ownerName,
    owner_avatar: listing.owner_avatar ?? listing.ownerAvatar ?? listing.owner?.avatar_url,
    ownerAvatar: listing.ownerAvatar ?? listing.owner_avatar ?? listing.owner?.avatar_url,
    owner_verified: listing.owner_verified ?? listing.ownerVerified ?? listing.owner?.verified,
    ownerVerified: listing.ownerVerified ?? listing.owner_verified ?? listing.owner?.verified,
    images: mapImagesToLegacy(listing.images),
  };
}

function normalizeListingFilters(options?: LegacyGetListingsOptions): ListingFilters {
  const filters: ListingFilters = {};
  if (!options) return filters;

  if (options.city) filters.city = options.city;
  if (options.status) filters.status = options.status;
  if (options.furnished !== undefined) filters.furnished = options.furnished;

  const propertyType = options.property_type ?? options.propertyType;
  if (propertyType) filters.property_type = propertyType;

  const minPrice = options.min_price ?? options.minPrice;
  const maxPrice = options.max_price ?? options.maxPrice;
  if (minPrice !== undefined) filters.min_price = minPrice;
  if (maxPrice !== undefined) filters.max_price = maxPrice;

  const minSurface = options.min_surface ?? options.minSurface;
  const maxSurface = options.max_surface ?? options.maxSurface;
  if (minSurface !== undefined) filters.min_surface = minSurface;
  if (maxSurface !== undefined) filters.max_surface = maxSurface;

  if (options.bedrooms !== undefined) filters.bedrooms = options.bedrooms;
  if (options.search) filters.search = options.search;
  if (options.ordering) filters.ordering = options.ordering;

  return filters;
}

export const listingsApi = {
  /**
   * Get all listings with optional filters
   */
  getListings: async (filters?: ListingFilters) => {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }

    const endpoint = `/listings/listings/${params.toString() ? `?${params.toString()}` : ''}`;
    return apiRequest<PaginatedResponse<Listing>>(endpoint);
  },

  /**
   * Get a single listing by ID
   */
  getListing: async (id: number) => {
    return apiRequest<Listing>(`/listings/listings/${id}/`);
  },

  /**
   * Get featured listings
   */
  getFeaturedListings: async () => {
    return apiRequest<Listing[]>('/listings/listings/featured/');
  },

  /**
   * Get current user's listings (owners only)
   */
  getMyListings: async () => {
    return apiRequest<Listing[]>('/listings/listings/my_listings/');
  },

  /**
   * Create a new listing (owners only)
   */
  createListing: async (data: Partial<Listing>) => {
    return apiRequest<Listing>('/listings/listings/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Update a listing
   */
  updateListing: async (id: number, data: Partial<Listing>) => {
    return apiRequest<Listing>(`/listings/listings/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete a listing
   */
  deleteListing: async (id: number) => {
    return apiRequest(`/listings/listings/${id}/`, {
      method: 'DELETE',
    });
  },

  /**
   * Increment view count for a listing
   */
  incrementViews: async (id: number) => {
    return apiRequest<{ view_count: number }>(`/listings/listings/${id}/increment_views/`, {
      method: 'POST',
    });
  },
};

/**
 * Legacy exports used throughout the UI.
 * These provide backwards-compatible function signatures/return shapes
 * while the rest of the app migrates to `listingsApi`/`adapter`.
 */

export async function getListings(options?: LegacyGetListingsOptions): Promise<any[]> {
  const filters = normalizeListingFilters(options);

  const limit = options?.limit;
  const offset = options?.offset ?? 0;
  const desired = limit !== undefined ? offset + limit : undefined;

  let page = options?.page ?? Math.floor(offset / DEFAULT_PAGE_SIZE) + 1;
  const accumulated: any[] = [];

  while (true) {
    const response = await listingsApi.getListings({ ...filters, page });
    const batch = response.results.map(mapListingToLegacy);
    accumulated.push(...batch);

    if (!response.next) break;
    if (desired !== undefined && accumulated.length >= desired) break;

    page += 1;
  }

  const sliced = accumulated.slice(offset, desired ?? accumulated.length);
  return sliced;
}

export async function getListing(id: string | number): Promise<any> {
  const numericId = typeof id === 'string' ? Number(id) : id;
  const listing = await apiRequest<any>(`/listings/listings/${numericId}/`);
  return mapListingToLegacy(listing);
}

export async function getFeaturedListings(): Promise<any[]> {
  const listings = await listingsApi.getFeaturedListings();
  return listings.map(mapListingToLegacy);
}

export async function getMyListings(): Promise<any[]> {
  const listings = await listingsApi.getMyListings();
  return listings.map(mapListingToLegacy);
}

export async function createListing(data: Partial<Listing>): Promise<any> {
  const listing = await listingsApi.createListing(data);
  return mapListingToLegacy(listing);
}

export async function updateListing(id: string | number, data: Partial<Listing>): Promise<any> {
  const numericId = typeof id === 'string' ? Number(id) : id;
  const listing = await listingsApi.updateListing(numericId, data);
  return mapListingToLegacy(listing);
}

export async function deleteListing(id: string | number): Promise<void> {
  const numericId = typeof id === 'string' ? Number(id) : id;
  await listingsApi.deleteListing(numericId);
}

export async function incrementViews(id: string | number): Promise<{ view_count: number } | any> {
  const numericId = typeof id === 'string' ? Number(id) : id;
  return listingsApi.incrementViews(numericId);
}
