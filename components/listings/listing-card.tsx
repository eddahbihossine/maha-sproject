'use client'

import React from "react"

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Heart,
  MapPin,
  Bed,
  Square,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import type { Listing } from '@/lib/types'
import { cn } from '@/lib/utils'

interface ListingCardProps {
  listing: any // Accept both old and new format
  isFavorite?: boolean
  onToggleFavorite?: (listingId: string) => void
  variant?: 'default' | 'compact' | 'horizontal'
}

const propertyTypeLabels: Record<string, string> = {
  studio: 'Studio',
  apartment: 'Apartment',
  room: 'Room',
  shared: 'Shared',
  residence: 'Residence',
}

export function ListingCard({
  listing,
  isFavorite = false,
  onToggleFavorite,
  variant = 'default',
}: ListingCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)

  // Handle both new API format (property_type) and old format (propertyType)
  const propertyType = listing.property_type || listing.propertyType
  const rentMonthly = listing.rent_monthly || listing.rentMonthly
  const numBedrooms = listing.num_bedrooms || listing.numBedrooms
  const surfaceArea = listing.surface_area || listing.surfaceArea
  const availableFrom = listing.available_from || listing.availableFrom
  const postalCode = listing.postal_code || listing.postalCode
  
  // Handle images - new format is array of URLs, old format is array of objects
  const images = Array.isArray(listing.images) 
    ? (typeof listing.images[0] === 'string' 
        ? listing.images 
        : listing.images.map((img: any) => img.url || img))
    : []
  
  const primaryImage = images[0] || '/placeholder.svg'
  const hasMultipleImages = images.length > 1

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onToggleFavorite?.(listing.id)
  }

  if (variant === 'horizontal') {
    return (
      <Link href={`/listings/${listing.id}`}>
        <Card className="group overflow-hidden transition-shadow hover:shadow-lg">
          <div className="flex flex-col sm:flex-row">
            {/* Image */}
            <div className="relative aspect-[4/3] w-full sm:aspect-square sm:w-48 lg:w-64">
              <Image
                src={images[currentImageIndex] || primaryImage}
                alt={listing.title}
                fill
                className="object-cover"
              />
              {listing.verified && (
                <Badge className="absolute left-2 top-2 gap-1 bg-accent text-accent-foreground">
                  <CheckCircle className="h-3 w-3" />
                  Verified
                </Badge>
              )}
              {onToggleFavorite && (
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    'absolute right-2 top-2 h-8 w-8 rounded-full bg-card/80 backdrop-blur-sm',
                    isFavorite && 'text-destructive'
                  )}
                  onClick={handleFavoriteClick}
                >
                  <Heart className={cn('h-4 w-4', isFavorite && 'fill-current')} />
                </Button>
              )}
            </div>

            {/* Content */}
            <CardContent className="flex flex-1 flex-col justify-between p-4">
              <div>
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div>
                    <Badge variant="secondary" className="mb-2">
                      {propertyTypeLabels[propertyType]}
                    </Badge>
                    <h3 className="font-semibold leading-tight text-foreground group-hover:text-primary">
                      {listing.title}
                    </h3>
                  </div>
                  <p className="text-lg font-bold text-primary">
                    {rentMonthly.toLocaleString('fr-MA')} MAD
                    <span className="text-sm font-normal text-muted-foreground">/mo</span>
                  </p>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>
                    {listing.city}{postalCode && `, ${postalCode}`}
                  </span>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Bed className="h-4 w-4" />
                  {numBedrooms} bed{numBedrooms !== 1 && 's'}
                </span>
                <span className="flex items-center gap-1">
                  <Square className="h-4 w-4" />
                  {surfaceArea} m²
                </span>
                <span>
                  Available {new Date(availableFrom).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            </CardContent>
          </div>
        </Card>
      </Link>
    )
  }

  return (
    <Link href={`/listings/${listing.id}`}>
      <Card
        className="group overflow-hidden transition-shadow hover:shadow-lg"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Image Carousel */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={images[currentImageIndex] || primaryImage}
            alt={listing.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />

          {/* Navigation Arrows */}
          {hasMultipleImages && isHovered && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-2 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full bg-card/80 backdrop-blur-sm"
                onClick={prevImage}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full bg-card/80 backdrop-blur-sm"
                onClick={nextImage}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}

          {/* Image Indicators */}
          {hasMultipleImages && (
            <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
              {images.map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    'h-1.5 w-1.5 rounded-full transition-colors',
                    index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                  )}
                />
              ))}
            </div>
          )}

          {/* Badges */}
          <div className="absolute left-2 top-2 flex flex-col gap-1">
            {listing.verified && (
              <Badge className="gap-1 bg-accent text-accent-foreground">
                <CheckCircle className="h-3 w-3" />
                Verified
              </Badge>
            )}
          </div>

          {/* Favorite Button */}
          {onToggleFavorite && (
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'absolute right-2 top-2 h-8 w-8 rounded-full bg-card/80 backdrop-blur-sm transition-colors',
                isFavorite && 'text-destructive'
              )}
              onClick={handleFavoriteClick}
            >
              <Heart className={cn('h-4 w-4', isFavorite && 'fill-current')} />
            </Button>
          )}
        </div>

        {/* Content */}
        <CardContent className="p-4">
          <div className="mb-2 flex items-start justify-between gap-2">
            <Badge variant="secondary">{propertyTypeLabels[propertyType]}</Badge>
              <p className="text-lg font-bold text-primary">
              {rentMonthly.toLocaleString('fr-MA')} MAD
              <span className="text-sm font-normal text-muted-foreground">/mo</span>
            </p>
          </div>

          <h3 className="mb-1 line-clamp-1 font-semibold text-foreground group-hover:text-primary">
            {listing.title}
          </h3>

          <div className="mb-3 flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">
              {listing.city}{postalCode && `, ${postalCode}`}
            </span>
          </div>

          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Bed className="h-4 w-4" />
              {numBedrooms}
            </span>
            <span className="flex items-center gap-1">
              <Square className="h-4 w-4" />
              {surfaceArea} m²
            </span>
            {listing.furnished && <Badge variant="outline">Furnished</Badge>}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
