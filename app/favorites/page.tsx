'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'

import { ListingCard } from '@/components/listings/listing-card'
import { Button } from '@/components/ui/button'
import { useFavorites } from '@/lib/favorites'
import { getListings } from '@/lib/api/listings'
import { useT } from '@/lib/i18n/use-t'

export default function FavoritesPage() {
  const t = useT()
  const favorites = useFavorites()

  const [allListings, setAllListings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        setLoading(true)
        const listings = await getListings()
        if (!cancelled) setAllListings(Array.isArray(listings) ? listings : [])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  const favoriteListings = useMemo(() => {
    const idSet = new Set(favorites.ids)
    return allListings.filter((listing) => idSet.has(String(listing?.id)))
  }, [allListings, favorites.ids])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">{t('favorites.title')}</h1>
        <div className="text-muted-foreground">{t('common.loading')}</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">{t('favorites.title')}</h1>
        <Button asChild variant="outline">
          <Link href="/search">{t('favorites.browse')}</Link>
        </Button>
      </div>

      {favoriteListings.length === 0 ? (
        <div className="rounded-lg border bg-card p-8 text-center">
          <div className="text-lg font-semibold">{t('favorites.emptyTitle')}</div>
          <div className="text-muted-foreground mt-2">{t('favorites.emptyText')}</div>
          <div className="mt-6">
            <Button asChild>
              <Link href="/search">{t('favorites.browse')}</Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favoriteListings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  )
}
