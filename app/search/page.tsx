'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { ListingCard } from '@/components/listings/listing-card'
import { SearchFilters } from '@/components/search/search-filters'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { LayoutGrid, List, Map, Home } from 'lucide-react'
import { getListings } from '@/lib/api/adapter'
import { useAuth } from '@/lib/auth/AuthProvider'
import { apiFetchJson } from '@/lib/api/http'
import type { Listing } from '@/lib/types'
import type { SearchFilters as SearchFiltersType } from '@/lib/types'
import { useT } from '@/lib/i18n/use-t'

export default function SearchPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const t = useT()
  const [filters, setFilters] = useState<SearchFiltersType>({})
  const [sortBy, setSortBy] = useState<string>('newest')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [allListings, setAllListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const didPrefillBudgetRef = useRef(false)

  // Listings are private: redirect logged-out users.
  useEffect(() => {
    if (authLoading) return
    if (user) return
    router.push('/login?redirectTo=/search')
  }, [authLoading, user, router])

  // Load listings from database
  useEffect(() => {
    if (authLoading) return
    if (!user) return

    const loadListings = async () => {
      setLoading(true)
      const listings = await getListings()
      setAllListings(listings)
      setLoading(false)
    }
    loadListings()
  }, [authLoading, user])

  // Budget-based recommendation (minimal UX): prefill rent filters from student profile if empty
  useEffect(() => {
    if (!user?.id) return
    if (didPrefillBudgetRef.current) return
    if (filters.minRent !== undefined || filters.maxRent !== undefined) return

    const prefillFromProfile = async () => {
      const data = await apiFetchJson<{ budgetMin: number | null; budgetMax: number | null }>(
        '/api/profile/budget'
      ).catch(() => null)

      if (!data) return

      const budgetMin = data.budgetMin !== null && data.budgetMin !== undefined ? Number(data.budgetMin) : undefined
      const budgetMax = data.budgetMax !== null && data.budgetMax !== undefined ? Number(data.budgetMax) : undefined

      if (budgetMin === undefined && budgetMax === undefined) return

      didPrefillBudgetRef.current = true
      setFilters((prev) => ({
        ...prev,
        minRent: prev.minRent ?? (Number.isFinite(budgetMin) ? budgetMin : undefined),
        maxRent: prev.maxRent ?? (Number.isFinite(budgetMax) ? budgetMax : undefined),
      }))
    }

    prefillFromProfile()
  }, [user?.id, filters.minRent, filters.maxRent])

  const filteredListings = useMemo(() => {
    let results = [...allListings]

    // Apply filters
    if (filters.query) {
      const query = filters.query.toLowerCase()
      results = results.filter(
        (l) =>
          l.title.toLowerCase().includes(query) ||
          l.description.toLowerCase().includes(query) ||
          l.city.toLowerCase().includes(query)
      )
    }

    if (filters.city && filters.city !== 'all') {
      results = results.filter((l) => l.city === filters.city)
    }

    if (filters.minRent) {
      results = results.filter((l) => l.rentMonthly >= filters.minRent!)
    }

    if (filters.maxRent) {
      results = results.filter((l) => l.rentMonthly <= filters.maxRent!)
    }

    if (filters.propertyType && filters.propertyType.length > 0) {
      results = results.filter((l) => filters.propertyType!.includes(l.propertyType))
    }

    if (filters.minSurface) {
      results = results.filter((l) => l.surfaceArea >= filters.minSurface!)
    }

    if (filters.maxSurface) {
      results = results.filter((l) => l.surfaceArea <= filters.maxSurface!)
    }

    if (filters.bedrooms && filters.bedrooms.length > 0) {
      results = results.filter((l) => {
        if (filters.bedrooms!.includes(3)) {
          return filters.bedrooms!.includes(l.numBedrooms) || l.numBedrooms >= 3
        }
        return filters.bedrooms!.includes(l.numBedrooms)
      })
    }

    if (filters.furnished) {
      results = results.filter((l) => l.furnished)
    }

    if (filters.verified) {
      results = results.filter((l) => l.verified)
    }

    if (filters.amenities && filters.amenities.length > 0) {
      results = results.filter((l) =>
        filters.amenities!.every((a) => l.amenities.includes(a))
      )
    }

    if (filters.availableFrom) {
      const filterDate = new Date(filters.availableFrom)
      results = results.filter((l) => new Date(l.availableFrom) <= filterDate)
    }

    // Apply sorting
    switch (sortBy) {
      case 'price_asc':
        results.sort((a, b) => a.rentMonthly - b.rentMonthly)
        break
      case 'price_desc':
        results.sort((a, b) => b.rentMonthly - a.rentMonthly)
        break
      case 'newest':
        results.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        break
      case 'popular':
        results.sort((a, b) => b.viewCount - a.viewCount)
        break
    }

    return results
  }, [allListings, filters, sortBy])

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 py-6">
          {/* Filters */}
          <div className="mb-6">
            <SearchFilters
              filters={filters}
              onFiltersChange={setFilters}
              resultCount={filteredListings.length}
            />
          </div>

          {/* Results Header */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {loading
                  ? t('search.resultsTitleLoading')
                  : t('search.resultsTitle', { count: filteredListings.length })}
              </h1>
              <p className="text-sm text-muted-foreground">
                {filters.city && filters.city !== 'all'
                  ? t('search.inCity', { city: filters.city })
                  : t('search.acrossMorocco')}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder={t('search.sortBy')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">{t('search.newestFirst')}</SelectItem>
                  <SelectItem value="price_asc">{t('search.priceLowHigh')}</SelectItem>
                  <SelectItem value="price_desc">{t('search.priceHighLow')}</SelectItem>
                  <SelectItem value="popular">{t('search.mostPopular')}</SelectItem>
                </SelectContent>
              </Select>

              {/* View Mode */}
              <div className="hidden items-center gap-1 rounded-md border bg-card p-1 sm:flex">
                <Button
                  variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setViewMode('grid')}
                >
                  <LayoutGrid className="h-4 w-4" />
                  <span className="sr-only">{t('search.gridView')}</span>
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                  <span className="sr-only">{t('search.listView')}</span>
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" disabled>
                  <Map className="h-4 w-4" />
                  <span className="sr-only">{t('search.mapView')}</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Results */}
          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="rounded-lg border bg-card">
                  <Skeleton className="h-48 w-full rounded-t-lg" />
                  <div className="p-4 space-y-3">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredListings.length > 0 ? (
            <div
              className={
                viewMode === 'grid'
                  ? 'grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                  : 'space-y-4'
              }
            >
              {filteredListings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  variant={viewMode === 'list' ? 'horizontal' : 'default'}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <Home className="h-8 w-8 text-muted-foreground" />
              </div>
              <h2 className="mb-2 text-xl font-semibold">{t('search.noListingsFound')}</h2>
              <p className="mb-4 max-w-md text-muted-foreground">
                {t('search.noListingsFoundText')}
              </p>
              <Button onClick={() => setFilters({})}>{t('search.clearAllFilters')}</Button>
            </div>
          )}

          {/* Load More */}
          {filteredListings.length > 0 && (
            <div className="mt-8 text-center">
              <Button variant="outline" size="lg">
                {t('search.loadMore')}
              </Button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
