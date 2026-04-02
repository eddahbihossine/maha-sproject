'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/lib/auth/AuthProvider'
import { getConversations } from '@/lib/api/messages'
import { apiFetchJson } from '@/lib/api/http'
import { formatMoneyMad } from '@/lib/i18n'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Building2,
  Eye,
  Heart,
  MessageCircle,
  TrendingUp,
  TrendingDown,
  Clock,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Calendar,
} from 'lucide-react'

interface DashboardStats {
  activeListings: number
  totalViews: number
  totalFavorites: number
  responseRate: number
}

interface Listing {
  id: string
  title: string
  city: string
  rent_monthly: number
  status: string
  view_count: number
  favorite_count: number
  created_at: string
}

interface Booking {
  id: string
  status: string
  check_in_date: string
  student_message: string
  created_at: string
  listings: {
    title: string
  }
  user_profiles: {
    university?: string
    company_name?: string
    avatar_url?: string
    role?: string
  }
}

export default function OwnerDashboardPage() {
  const { user, language } = useAuth()
  const [loading, setLoading] = useState(true)
  const [listings, setListings] = useState<Listing[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [conversations, setConversations] = useState<any[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    activeListings: 0,
    totalViews: 0,
    totalFavorites: 0,
    responseRate: 0,
  })

  useEffect(() => {
    if (user?.id) {
      loadDashboardData()
    }
  }, [user])

  const loadDashboardData = async () => {
    if (!user?.id) return
    setLoading(true)

    const listingsResult = await apiFetchJson<{ listings: Listing[] }>('/api/owner/listings').catch(
      () => ({ listings: [] as Listing[] })
    )

    const ownerListings = listingsResult.listings || []
    setListings(ownerListings)

    const bookingsResult = await apiFetchJson<{ bookings: Booking[] }>('/api/owner/bookings?limit=5').catch(
      () => ({ bookings: [] as Booking[] })
    )

    setBookings(bookingsResult.bookings || [])

    // Fetch conversations
    const conversationsData = await getConversations(user.id)
    setConversations(conversationsData.slice(0, 5))

    // Calculate stats
    const activeCount = ownerListings.filter((l: any) => l.status === 'active').length
    const totalViews = ownerListings.reduce((acc: number, l: any) => acc + (l.view_count || 0), 0)
    const totalFavorites = ownerListings.reduce((acc: number, l: any) => acc + (l.favorite_count || 0), 0)

    setStats({
      activeListings: activeCount,
      totalViews,
      totalFavorites,
      responseRate: 95, // TODO: Calculate from messages
    })

    setLoading(false)
  }

  const ownerListings = listings
  const pendingRequests = bookings.filter((r) => r.status === 'pending')
  const getProfileName = (profile?: Booking['user_profiles']) => {
    if (!profile) return 'Student'
    return profile.company_name || profile.university || 'Student'
  }

  const statsDisplay = [
    {
      title: 'Active Listings',
      value: stats.activeListings,
      change: '+2',
      trend: 'up',
      icon: Building2,
    },
    {
      title: 'Total Views',
      value: stats.totalViews,
      change: '+12%',
      trend: 'up',
      icon: Eye,
    },
    {
      title: 'Favorites',
      value: stats.totalFavorites,
      change: '+8%',
      trend: 'up',
      icon: Heart,
    },
    {
      title: 'Response Rate',
      value: `${stats.responseRate}%`,
      change: '-2%',
      trend: 'down',
      icon: MessageCircle,
    },
  ]

  if (loading) {
    return (
      <div className="space-y-8 p-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.user_metadata?.first_name}! Here is an overview of your properties.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsDisplay.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <div
                    className={`flex items-center gap-1 text-xs ${
                      stat.trend === 'up' ? 'text-accent' : 'text-destructive'
                    }`}
                  >
                    {stat.trend === 'up' ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {stat.change} this month
                  </div>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pending Requests */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Pending Requests
              </CardTitle>
              <CardDescription>
                {pendingRequests.length} request{pendingRequests.length !== 1 && 's'} awaiting your response
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/owner/bookings">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {pendingRequests.length > 0 ? (
              <div className="space-y-4">
                {pendingRequests.slice(0, 3).map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center gap-4 rounded-lg border p-4"
                  >
                    <Avatar>
                      <AvatarFallback>
                        {getProfileName(request.user_profiles)
                          .split(' ')
                          .map((part) => part[0])
                          .slice(0, 2)
                          .join('')
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {getProfileName(request.user_profiles)}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        {request.listings?.title}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        Move-in: {new Date(request.check_in_date).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        Decline
                      </Button>
                      <Button size="sm">Accept</Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CheckCircle className="mb-2 h-8 w-8 text-accent" />
                <p className="text-sm text-muted-foreground">
                  No pending requests. All caught up!
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Messages */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Recent Messages
              </CardTitle>
              <CardDescription>Latest conversations with students</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/owner/messages">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {conversations.length > 0 ? (
              <div className="space-y-4">
                {conversations.slice(0, 3).map((conv) => (
                  <Link
                    key={conv.id}
                    href={`/owner/messages/${conv.other_user_id}`}
                    className="flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50"
                  >
                    <Avatar>
                      <AvatarFallback>
                        {conv.other_user_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium truncate">
                          {conv.other_user_name || 'Unknown'}
                        </p>
                        <p className="shrink-0 text-xs text-muted-foreground">
                          {conv.last_message_time ? new Date(conv.last_message_time).toLocaleDateString() : ''}
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {conv.last_message || 'No messages'}
                      </p>
                    </div>
                    {conv.unread_count > 0 && (
                      <Badge className="shrink-0">{conv.unread_count}</Badge>
                    )}
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <MessageCircle className="mb-2 h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No messages yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* My Listings */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              My Listings
            </CardTitle>
            <CardDescription>Manage your property listings</CardDescription>
          </div>
          <Button asChild>
            <Link href="/owner/listings/new">Add Listing</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {ownerListings.map((listing) => (
              <div
                key={listing.id}
                className="flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-center"
              >
                <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-md">
                  <div className="flex h-full w-full items-center justify-center bg-muted">
                    <Building2 className="h-8 w-8 text-muted-foreground" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium truncate">{listing.title}</h3>
                    <Badge
                      variant={listing.status === 'active' ? 'default' : 'secondary'}
                      className={
                        listing.status === 'active'
                          ? 'bg-accent text-accent-foreground'
                          : ''
                      }
                    >
                      {listing.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {listing.city} - {formatMoneyMad(listing.rent_monthly || 0, language)} MAD/month
                  </p>
                  <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {listing.view_count || 0} views
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="h-3 w-3" />
                      {listing.favorite_count || 0} favorites
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 sm:flex-col">
                  <Button variant="outline" size="sm" asChild className="flex-1 sm:flex-none bg-transparent">
                    <Link href={`/owner/listings/${listing.id}/edit`}>Edit</Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild className="flex-1 sm:flex-none bg-transparent">
                    <Link href={`/listings/${listing.id}`}>View</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
