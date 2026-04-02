'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/AuthProvider'
import Link from 'next/link'
import Image from 'next/image'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Search,
  MapPin,
  Shield,
  MessageCircle,
  CheckCircle,
  Star,
  ArrowRight,
  GraduationCap,
  Home,
  Users,
  Clock,
} from 'lucide-react'
import { ListingCard } from '@/components/listings/listing-card'
import { getFeaturedListings } from '@/lib/api/adapter'
import type { Listing } from '@/lib/types'
import { popularCities } from '@/lib/mock-data'
import { useT } from '@/lib/i18n/use-t'

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const t = useT()
  const [featuredListings, setFeaturedListings] = useState<Listing[]>([])
  const [listingsLoading, setListingsLoading] = useState(true)

  // Redirect owners/admins to their respective dashboards
  useEffect(() => {
    if (!loading && user) {
      const role = user.user_metadata?.role
      if (role === 'owner' || role === 'admin') {
        router.push(role === 'owner' ? '/owner/dashboard' : '/admin')
      }
    }
  }, [user, loading, router])

  // Load featured listings from database
  useEffect(() => {
    const loadListings = async () => {
      setListingsLoading(true)
      const listings = await getFeaturedListings()
      setFeaturedListings(listings.slice(0, 4))
      setListingsLoading(false)
    }
    loadListings()
  }, [])

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background">
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
          <div className="container relative mx-auto px-4 py-16 sm:py-24 lg:py-32">
            <div className="mx-auto max-w-3xl text-center">
              <Badge variant="secondary" className="mb-4">
                <GraduationCap className="mr-1 h-3 w-3" />
                {t('home.trustedBy', { count: '10,000' })}
              </Badge>
              <h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl text-balance">
                {t('home.heroTitle')}
              </h1>
              <p className="mb-8 text-lg text-muted-foreground sm:text-xl text-pretty">
                {t('home.heroSubtitle')}
              </p>

              {/* Search Box */}
              <div className="mx-auto max-w-2xl">
                <div className="flex flex-col gap-3 rounded-xl border bg-card p-3 shadow-lg sm:flex-row sm:items-center">
                  <div className="relative flex-1">
                    <MapPin className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder={t('home.searchPlaceholder')}
                      className="border-0 bg-transparent pl-10 text-base shadow-none focus-visible:ring-0"
                    />
                  </div>
                  <Button size="lg" asChild className="sm:w-auto">
                    <Link href="/search">
                      <Search className="mr-2 h-5 w-5" />
                      {t('common.search')}
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Popular Cities */}
              <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
                <span className="text-sm text-muted-foreground">{t('home.popular')}</span>
                {popularCities.slice(0, 5).map((city) => (
                  <Link key={city.name} href={`/search?city=${city.name}`}>
                    <Badge
                      variant="outline"
                      className="cursor-pointer transition-colors hover:bg-primary hover:text-primary-foreground"
                    >
                      {city.name}
                    </Badge>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="border-y bg-card py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary sm:text-4xl">1,500+</p>
                <p className="text-sm text-muted-foreground">{t('home.statsVerifiedListings')}</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-primary sm:text-4xl">50+</p>
                <p className="text-sm text-muted-foreground">{t('home.statsCities')}</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-primary sm:text-4xl">10,000+</p>
                <p className="text-sm text-muted-foreground">{t('home.statsHappyStudents')}</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-primary sm:text-4xl">4.8</p>
                <p className="text-sm text-muted-foreground">{t('home.statsAverageRating')}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Listings */}
        <section className="py-16 sm:py-24">
          <div className="container mx-auto px-4">
            <div className="mb-10 flex items-end justify-between">
              <div>
                <h2 className="text-3xl font-bold text-foreground">{t('home.featuredTitle')}</h2>
                <p className="mt-2 text-muted-foreground">
                  {t('home.featuredSubtitle')}
                </p>
              </div>
              <Button variant="outline" asChild className="hidden sm:flex bg-transparent">
                <Link href="/search">
                  {t('home.viewAll')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            
            {/* Loading State */}
            {listingsLoading && (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                  <Card key={i}>
                    <Skeleton className="h-48 w-full rounded-t-lg" />
                    <div className="p-4 space-y-3">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* Listings */}
            {!listingsLoading && featuredListings.length > 0 && (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {featuredListings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            )}

            {/* Empty State */}
            {!listingsLoading && featuredListings.length === 0 && (
              <div className="text-center py-12">
                <Home className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">{t('home.noListingsTitle')}</h3>
                <p className="text-muted-foreground mb-4">
                  {t('home.noListingsSubtitle')}
                </p>
                <Button asChild>
                  <Link href="/search">{t('home.browseAllListings')}</Link>
                </Button>
              </div>
            )}

            <div className="mt-8 text-center sm:hidden">
              <Button asChild>
                <Link href="/search">
                  {t('home.viewAllListings')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Popular Cities */}
        <section className="bg-muted/50 py-16 sm:py-24">
          <div className="container mx-auto px-4">
            <div className="mb-10 text-center">
              <h2 className="text-3xl font-bold text-foreground">{t('home.popularCitiesTitle')}</h2>
              <p className="mt-2 text-muted-foreground">
                {t('home.popularCitiesSubtitle')}
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {popularCities.map((city) => (
                <Link key={city.name} href={`/search?city=${city.name}`}>
                  <Card className="group overflow-hidden transition-shadow hover:shadow-lg">
                    <div className="relative aspect-[16/9]">
                      <Image
                        src={city.image || "/placeholder.svg"}
                        alt={city.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                      <div className="absolute bottom-4 left-4">
                        <h3 className="text-xl font-bold text-white">{city.name}</h3>
                        <p className="text-sm text-white/80">
                          {t('home.listingsAvailable', { count: city.listingCount })}
                        </p>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 sm:py-24">
          <div className="container mx-auto px-4">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold text-foreground">{t('home.howItWorksTitle')}</h2>
              <p className="mt-2 text-muted-foreground">
                {t('home.howItWorksSubtitle')}
              </p>
            </div>
            <div className="grid gap-8 sm:grid-cols-3">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Search className="h-8 w-8 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">{t('home.step1Title')}</h3>
                <p className="text-muted-foreground">
                  {t('home.step1Text')}
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <MessageCircle className="h-8 w-8 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">{t('home.step2Title')}</h3>
                <p className="text-muted-foreground">
                  {t('home.step2Text')}
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Home className="h-8 w-8 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">{t('home.step3Title')}</h3>
                <p className="text-muted-foreground">
                  {t('home.step3Text')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Trust & Safety */}
        <section className="border-y bg-card py-16 sm:py-24">
          <div className="container mx-auto px-4">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div>
                <Badge variant="secondary" className="mb-4">
                  <Shield className="mr-1 h-3 w-3" />
                  {t('home.trustSafetyBadge')}
                </Badge>
                <h2 className="mb-4 text-3xl font-bold text-foreground">
                  {t('home.trustSafetyTitle')}
                </h2>
                <p className="mb-6 text-muted-foreground">
                  {t('home.trustSafetyText')}
                </p>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="mt-0.5 h-5 w-5 text-accent" />
                    <div>
                      <p className="font-medium">{t('home.trustVerifiedTitle')}</p>
                      <p className="text-sm text-muted-foreground">
                        {t('home.trustVerifiedText')}
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="mt-0.5 h-5 w-5 text-accent" />
                    <div>
                      <p className="font-medium">{t('home.trustMessagingTitle')}</p>
                      <p className="text-sm text-muted-foreground">
                        {t('home.trustMessagingText')}
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="mt-0.5 h-5 w-5 text-accent" />
                    <div>
                      <p className="font-medium">{t('home.trustIdentityTitle')}</p>
                      <p className="text-sm text-muted-foreground">
                        {t('home.trustIdentityText')}
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="mt-0.5 h-5 w-5 text-accent" />
                    <div>
                      <p className="font-medium">{t('home.trustSupportTitle')}</p>
                      <p className="text-sm text-muted-foreground">
                        {t('home.trustSupportText')}
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
              <div className="relative">
                <div className="aspect-square overflow-hidden rounded-2xl bg-muted">
                  <Image
                    src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&h=600&fit=crop"
                    alt={t('home.studentsCollaboratingAlt')}
                    fill
                    className="object-cover"
                  />
                </div>
                <Card className="absolute -bottom-6 -left-6 w-64 shadow-lg">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
                        <Users className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <p className="font-semibold">10,000+</p>
                        <p className="text-sm text-muted-foreground">{t('home.studentsHoused')}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="absolute -right-6 -top-6 w-56 shadow-lg">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-warning/10">
                        <Star className="h-5 w-5 text-warning" />
                      </div>
                      <div>
                        <p className="font-semibold">{t('home.ratingCard', { rating: '4.8/5' })}</p>
                        <p className="text-sm text-muted-foreground">{t('home.ratingFromStudents')}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16 sm:py-24">
          <div className="container mx-auto px-4">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold text-foreground">{t('home.testimonialsTitle')}</h2>
              <p className="mt-2 text-muted-foreground">
                {t('home.testimonialsSubtitle')}
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  name: 'Emma Chen',
                  university: 'Université Mohammed V - Rabat',
                  country: 'China',
                  text: t('home.testimonial1Text'),
                  avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
                },
                {
                  name: 'Carlos Rodriguez',
                  university: 'Université Hassan II - Casablanca',
                  country: 'Mexico',
                  text: t('home.testimonial2Text'),
                  avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
                },
                {
                  name: 'Anna Schmidt',
                  university: 'Al Akhawayn University - Ifrane',
                  country: 'Germany',
                  text: t('home.testimonial3Text'),
                  avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
                },
              ].map((testimonial) => (
                <Card key={testimonial.name}>
                  <CardContent className="p-6">
                    <div className="mb-4 flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className="h-4 w-4 fill-warning text-warning"
                        />
                      ))}
                    </div>
                    <p className="mb-4 text-muted-foreground">
                      {'"'}{testimonial.text}{'"'}
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 overflow-hidden rounded-full">
                        <Image
                          src={testimonial.avatar || "/placeholder.svg"}
                          alt={testimonial.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-medium">{testimonial.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {testimonial.university}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-primary py-16 sm:py-24">
          <div className="container mx-auto px-4 text-center">
            <h2 className="mb-4 text-3xl font-bold text-primary-foreground sm:text-4xl">
              {t('home.ctaTitle')}
            </h2>
            <p className="mx-auto mb-8 max-w-2xl text-primary-foreground/80">
              {t('home.ctaSubtitle')}
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/search">
                  <Search className="mr-2 h-5 w-5" />
                  {t('home.browseListings')}
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-primary-foreground/20 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
                asChild
              >
                <Link href="/register">
                  {t('home.createFreeAccount')}
                </Link>
              </Button>
            </div>
            <p className="mt-6 flex items-center justify-center gap-2 text-sm text-primary-foreground/60">
              <Clock className="h-4 w-4" />
              {t('home.averageTime', { days: 5 })}
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
