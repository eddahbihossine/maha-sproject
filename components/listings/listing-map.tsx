'use client'

import React from 'react'
import { useT } from '@/lib/i18n/use-t'

function clamp(num: number, min: number, max: number) {
  return Math.min(max, Math.max(min, num))
}

type ListingMapProps = {
  latitude?: number
  longitude?: number
  title?: string
}

export function ListingMap({ latitude, longitude, title = 'Listing location' }: ListingMapProps) {
  const t = useT()

  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    return (
      <div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-sm text-muted-foreground">{t('listings.mapNotAvailable')}</p>
        </div>
      </div>
    )
  }

  const lat = clamp(latitude, -90, 90)
  const lon = clamp(longitude, -180, 180)

  const delta = 0.01
  const left = lon - delta
  const right = lon + delta
  const top = lat + delta
  const bottom = lat - delta

  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(
    `${left},${bottom},${right},${top}`,
  )}&layer=mapnik&marker=${encodeURIComponent(`${lat},${lon}`)}`

  return (
    <div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
      <iframe
        title={title}
        src={src}
        className="absolute inset-0 h-full w-full"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  )
}
