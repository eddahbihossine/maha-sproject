'use client'

import React from "react"

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/AuthProvider'
import { startConversation } from '@/lib/api/messages'
import { getListing } from '@/lib/api/adapter'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { ListingMap } from '@/components/listings/listing-map'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Home,
  Search,
  Heart,
  Share2,
  MapPin,
  Bed,
  Bath,
  Square,
  Building2,
  CheckCircle,
  Calendar,
  Clock,
  Star,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  X,
  Wifi,
  Car,
  Wind,
  Thermometer,
  Shield,
  Phone,
  Mail,
  Flag,
  ExternalLink,
  Train,
  Bus,
  GraduationCap,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatMoneyMad, formatShortDate } from '@/lib/i18n'
import { useT } from '@/lib/i18n/use-t'
import { useFavorites } from '@/lib/favorites'

const propertyTypeLabels: Record<string, string> = {
  studio: 'Studio',
  apartment: 'Apartment',
  room: 'Room',
  shared: 'Shared Apartment',
  residence: 'Student Residence',
}

const amenityIcons: Record<string, React.ReactNode> = {
  wifi: <Wifi className="h-4 w-4" />,
  parking: <Car className="h-4 w-4" />,
  air_conditioning: <Wind className="h-4 w-4" />,
  heating: <Thermometer className="h-4 w-4" />,
  security: <Shield className="h-4 w-4" />,
}

const amenityLabels: Record<string, string> = {
  wifi: 'Wi‑Fi',
  parking: 'Parking',
  air_conditioning: 'Air conditioning',
  heating: 'Heating',
  security: 'Security',
}

const getImageUrl = (image: any) => {
  if (!image) return '/placeholder.svg'
  if (typeof image === 'string') return image || '/placeholder.svg'
  return image.url || image.image || '/placeholder.svg'
}

export default function ListingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user, language, loading: authLoading } = useAuth()
  const t = useT()
  const listingId = params.id as string

  // Listings are private: redirect logged-out users.
  useEffect(() => {
    if (authLoading) return
    if (user) return
    router.push(`/login?redirectTo=/listings/${encodeURIComponent(listingId)}`)
  }, [authLoading, user, router, listingId])

  const [listing, setListing] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isGalleryOpen, setIsGalleryOpen] = useState(false)
  const favorites = useFavorites()
  const [message, setMessage] = useState('')
  const [sendingMessage, setSendingMessage] = useState(false)
  const [messageDialogOpen, setMessageDialogOpen] = useState(false)

  useEffect(() => {
    if (authLoading) return
    if (!user) return

    const loadListing = async () => {
      try {
        const data = await getListing(listingId)
        setListing(data)
      } catch (err) {
        console.error('Error loading listing:', err)
        setListing(null)
      } finally {
        setLoading(false)
      }
    }
    loadListing()
  }, [listingId, authLoading, user])

  if (loading || !listing) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  const listingAmenities: string[] = Array.isArray(listing.amenities) ? listing.amenities : []
  const rules = listing.rules || {
    smoking: false,
    pets: false,
    couples: false,
    parties: false,
  }

  const reviews: any[] = [] // TODO: Load from API

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % (listing.images?.length || 1))
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + (listing.images?.length || 1)) % (listing.images?.length || 1))
  }

  const formatDate = (dateString: string) => {
    return formatShortDate(dateString, language, { day: 'numeric', month: 'long', year: 'numeric' })
  }

  const handleSendMessage = async () => {
    if (!message.trim() || !user?.id) return

    // Check if user is logged in
    if (!user) {
      router.push('/login?redirectTo=' + encodeURIComponent(`/listings/${listingId}`))
      return
    }

    // Don't allow owners to message themselves
    if (user.id === listing.ownerId) {
      alert(t('listings.cantMessageYourself'))
      return
    }

    setSendingMessage(true)
    
    const conversationId = await startConversation(
      user.id,
      listing.ownerId,
      listingId,
      message.trim()
    )

    setSendingMessage(false)

    if (conversationId) {
      // Navigate to the conversation - students go to /messages, owners would go to /owner/messages
      const userRole = user.user_metadata?.role || 'student'
      const messagePath = userRole === 'owner' ? `/owner/messages/${conversationId}` : `/messages/${conversationId}`
      
      // Close the dialog and redirect
      setMessageDialogOpen(false)
      router.push(messagePath)
    } else {
      alert(t('listings.failedToSendMessage'))
    }
  }

  const isFavorite = favorites.isFavorite(String(listingId))

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {/* Image Gallery */}
        <section className="relative bg-muted">
          <div className="container mx-auto px-4">
            <div className="grid gap-2 py-4 sm:grid-cols-4 sm:grid-rows-2">
              {/* Main Image */}
              <div
                className="relative col-span-2 row-span-2 aspect-[4/3] cursor-pointer overflow-hidden rounded-l-xl sm:aspect-auto"
                onClick={() => setIsGalleryOpen(true)}
              >
                <Image
                  src={getImageUrl(listing.images?.[0])}
                  alt={listing.title}
                  fill
                  className="object-cover transition-transform hover:scale-105"
                  priority
                />
              </div>
              {/* Secondary Images */}
              {listing.images?.slice(1, 5).map((image: any, index: number) => (
                <div
                  key={index}
                  className={cn(
                    'relative hidden aspect-video cursor-pointer overflow-hidden sm:block',
                    index === 1 && 'rounded-tr-xl',
                    index === 3 && 'rounded-br-xl'
                  )}
                  onClick={() => {
                    setCurrentImageIndex(index + 1)
                    setIsGalleryOpen(true)
                  }}
                >
                  <Image
                    src={getImageUrl(image)}
                    alt={`${listing.title} - Image ${index + 2}`}
                    fill
                    className="object-cover transition-transform hover:scale-105"
                  />
                  {index === 3 && listing.images.length > 5 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                      <span className="text-lg font-semibold text-white">
                        +{listing.images.length - 5} more
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="grid gap-8 lg:grid-cols-3">
              {/* Main Content */}
              <div className="lg:col-span-2">
                {/* Header */}
                <div className="mb-6">
                  <div className="mb-4 flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">
                      {propertyTypeLabels[listing.propertyType]}
                    </Badge>
                    {listing.verified && (
                      <Badge className="gap-1 bg-accent text-accent-foreground">
                        <CheckCircle className="h-3 w-3" />
                        Verified
                      </Badge>
                    )}
                    {listing.furnished && <Badge variant="outline">Furnished</Badge>}
                  </div>
                  <h1 className="mb-2 text-2xl font-bold text-foreground sm:text-3xl">
                    {listing.title}
                  </h1>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>
                      {listing.hideExactAddress ? `${listing.city}, ${listing.postalCode}` : listing.address}
                    </span>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div className="rounded-lg border bg-card p-4 text-center">
                    <Bed className="mx-auto mb-2 h-5 w-5 text-muted-foreground" />
                    <p className="text-lg font-semibold">{listing.numBedrooms}</p>
                    <p className="text-sm text-muted-foreground">
                      Bedroom{listing.numBedrooms !== 1 && 's'}
                    </p>
                  </div>
                  <div className="rounded-lg border bg-card p-4 text-center">
                    <Bath className="mx-auto mb-2 h-5 w-5 text-muted-foreground" />
                    <p className="text-lg font-semibold">{listing.numBathrooms}</p>
                    <p className="text-sm text-muted-foreground">
                      Bathroom{listing.numBathrooms !== 1 && 's'}
                    </p>
                  </div>
                  <div className="rounded-lg border bg-card p-4 text-center">
                    <Square className="mx-auto mb-2 h-5 w-5 text-muted-foreground" />
                    <p className="text-lg font-semibold">{listing.surfaceArea}</p>
                    <p className="text-sm text-muted-foreground">m2</p>
                  </div>
                  <div className="rounded-lg border bg-card p-4 text-center">
                    <Building2 className="mx-auto mb-2 h-5 w-5 text-muted-foreground" />
                    <p className="text-lg font-semibold">
                      {listing.floorNumber}/{listing.totalFloors}
                    </p>
                    <p className="text-sm text-muted-foreground">Floor</p>
                  </div>
                </div>

                {/* Description */}
                <Card className="mb-8">
                  <CardHeader>
                    <CardTitle>Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-line text-muted-foreground">
                      {listing.description}
                    </p>
                  </CardContent>
                </Card>

                {/* Amenities */}
                <Card className="mb-8">
                  <CardHeader>
                    <CardTitle>Amenities</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {listingAmenities.map((amenityId) => {
                        return (
                          <div
                            key={amenityId}
                            className="flex items-center gap-2 text-sm"
                          >
                            {amenityIcons[amenityId] || (
                              <CheckCircle className="h-4 w-4 text-accent" />
                            )}
                            <span>{amenityLabels[amenityId] || amenityId}</span>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* House Rules */}
                <Card className="mb-8">
                  <CardHeader>
                    <CardTitle>{t('listings.houseRules')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                      <div className="flex items-center gap-2">
                        {rules.smoking ? (
                          <CheckCircle className="h-4 w-4 text-accent" />
                        ) : (
                          <X className="h-4 w-4 text-destructive" />
                        )}
                        <span className="text-sm">{t('listings.rules.smoking')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {rules.pets ? (
                          alert(t('listings.failedToSendMessage'))
                        ) : (
                          <X className="h-4 w-4 text-destructive" />
                        )}
                        <span className="text-sm">{t('listings.rules.pets')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {rules.couples ? (
                          <CheckCircle className="h-4 w-4 text-accent" />
                        ) : (
                          <X className="h-4 w-4 text-destructive" />
                        )}
                        <span className="text-sm">{t('listings.rules.couples')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {rules.parties ? (
                          <CheckCircle className="h-4 w-4 text-accent" />
                        ) : (
                          <X className="h-4 w-4 text-destructive" />
                        )}
                        <span className="text-sm">{t('listings.rules.parties')}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Location & Transport */}
                <Card className="mb-8">
                  <CardHeader>
                    <CardTitle>{t('listings.locationTransport')}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <ListingMap latitude={listing.latitude} longitude={listing.longitude} />

                    {/* Nearby Transport */}
                    {listing.nearbyTransport.length > 0 && (
                      <div>
                        <h4 className="mb-3 font-medium">{t('listings.nearbyTransport')}</h4>
                        <div className="space-y-2">
                          {listing.nearbyTransport.map((transport, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between"
                            >
                              <div className="flex items-center gap-2">
                                {transport.type === 'metro' ? (
                                  <Train className="h-4 w-4 text-primary" />
                                ) : (
                                  <Bus className="h-4 w-4 text-primary" />
                                )}
                                <span className="text-sm">{transport.name}</span>
                              </div>
                              <span className="text-sm text-muted-foreground">
                                {transport.distance}m
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Nearby Universities */}
                    {listing.nearbyUniversities.length > 0 && (
                      <div>
                        <h4 className="mb-3 font-medium">{t('listings.nearbyUniversities')}</h4>
                        <div className="space-y-2">
                          {listing.nearbyUniversities.map((uni, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between"
                            >
                              <div className="flex items-center gap-2">
                                <GraduationCap className="h-4 w-4 text-primary" />
                                <span className="text-sm">{uni.name}</span>
                              </div>
                              <span className="text-sm text-muted-foreground">
                                {uni.distance < 1000
                                  ? `${uni.distance}m`
                                  : `${(uni.distance / 1000).toFixed(1)}km`}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Reviews */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Star className="h-5 w-5 fill-warning text-warning" />
                      {reviews.length > 0
                        ? `${(reviews.reduce((acc, r) => acc + r.overallRating, 0) / reviews.length).toFixed(1)} (${reviews.length} reviews)`
                        : 'No reviews yet'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {reviews.length > 0 ? (
                      <div className="space-y-6">
                        {reviews.map((review) => (
                          <div key={review.id}>
                            <div className="flex items-start gap-3">
                              <Avatar>
                                <AvatarImage src={review.reviewerAvatar || "/placeholder.svg"} />
                                <AvatarFallback>
                                  {review.reviewerName.split(' ').map((n) => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <p className="font-medium">{review.reviewerName}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {formatDate(review.createdAt)}
                                  </p>
                                </div>
                                <div className="mb-2 flex gap-0.5">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={cn(
                                        'h-4 w-4',
                                        i < review.overallRating
                                          ? 'fill-warning text-warning'
                                          : 'text-muted'
                                      )}
                                    />
                                  ))}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {review.content}
                                </p>
                                {review.response && (
                                  <div className="mt-3 rounded-lg bg-muted p-3">
                                    <p className="mb-1 text-sm font-medium">
                                      Response from owner
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      {review.response}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                            <Separator className="mt-6" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground">
                        This listing has no reviews yet. Be the first to review after your
                        stay!
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="sticky top-20 space-y-6">
                  {/* Pricing Card */}
                  <Card>
                    <CardContent className="p-6">
                      <div className="mb-4">
                        <p className="text-3xl font-bold text-primary">
                          {formatMoneyMad(listing.rentMonthly, language)} MAD
                          <span className="text-base font-normal text-muted-foreground">
                            /month
                          </span>
                        </p>
                        {listing.chargesIncluded ? (
                          <p className="text-sm text-accent">{t('listings.chargesIncluded')}</p>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            + {formatMoneyMad(typeof listing.chargesAmount === 'number' ? listing.chargesAmount : 0, language)} MAD {t('listings.charges')}
                          </p>
                        )}
                      </div>

                      <div className="space-y-3">
                        <Dialog open={messageDialogOpen} onOpenChange={setMessageDialogOpen}>
                          <DialogTrigger asChild>
                            <Button className="w-full" size="lg">
                              <MessageCircle className="mr-2 h-4 w-4" />
                              {t('listings.contactOwner')}
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>{t('listings.sendMessage')}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 pt-4">
                              <div className="flex items-center gap-3">
                                <Avatar>
                                  <AvatarImage src={listing.ownerAvatar || "/placeholder.svg"} />
                                  <AvatarFallback>
                                    {listing.ownerName.split(' ').map((n) => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">{listing.ownerName}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {t('listings.usuallyResponds', { hours: 2 })}
                                  </p>
                                </div>
                              </div>
                              <Textarea
                                placeholder={t('listings.messagePlaceholder')}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                rows={4}
                              />
                              <Button 
                                className="w-full" 
                                onClick={handleSendMessage}
                                disabled={sendingMessage || !message.trim()}
                              >
                                {sendingMessage ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {t('listings.sending')}
                                  </>
                                ) : (
                                  t('listings.sendMessageCta')
                                )}
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button variant="outline" className="w-full bg-transparent" size="lg">
                          {t('listings.requestBooking')}
                        </Button>
                      </div>

                      <div className="mt-4 flex gap-2">
                        <Button
                          variant="outline"
                          className="flex-1 bg-transparent"
                          onClick={() => favorites.toggle(String(listingId))}
                        >
                          <Heart
                            className={cn(
                              'mr-2 h-4 w-4',
                              isFavorite && 'fill-destructive text-destructive'
                            )}
                          />
                          {isFavorite ? t('favorites.saved') : t('favorites.save')}
                        </Button>
                        <Button variant="outline" className="flex-1 bg-transparent">
                          <Share2 className="mr-2 h-4 w-4" />
                          {t('common.share')}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Owner Card */}
                  <Card>
                    <CardContent className="p-6">
                      <div className="mb-4 flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={listing.ownerAvatar || "/placeholder.svg"} />
                          <AvatarFallback>
                            {listing.ownerName.split(' ').map((n) => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{listing.ownerName}</p>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            {listing.verified && (
                              <>
                                <CheckCircle className="h-3.5 w-3.5 text-accent" />
                                <span>Verified owner</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="mb-4 space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{t('listings.usuallyResponds', { hours: 2 })}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Star className="h-4 w-4 text-warning" />
                          <span>4.8 rating from 24 reviews</span>
                        </div>
                      </div>

                      <Button variant="outline" className="w-full bg-transparent" asChild>
                        <Link href={`/owners/${listing.ownerId}`}>
                          View Profile
                          <ExternalLink className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Report */}
                  <div className="text-center">
                    <Button variant="ghost" size="sm" className="text-muted-foreground">
                      <Flag className="mr-2 h-4 w-4" />
                      Report this listing
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* Image Gallery Modal */}
      <Dialog open={isGalleryOpen} onOpenChange={setIsGalleryOpen}>
        <DialogContent className="max-w-4xl bg-black p-0">
          <div className="relative aspect-video">
            <Image
              src={getImageUrl(listing.images?.[currentImageIndex])}
              alt={`${listing.title} - Image ${currentImageIndex + 1}`}
              fill
              className="object-contain"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 text-white hover:bg-white/40"
              onClick={prevImage}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 text-white hover:bg-white/40"
              onClick={nextImage}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-4 py-2 text-sm text-white">
              {currentImageIndex + 1} / {listing.images.length}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
