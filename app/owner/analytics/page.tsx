'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth/AuthProvider'
import { apiFetchJson } from '@/lib/api/http'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function OwnerAnalyticsPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    listings: 0,
    activeListings: 0,
    totalViews: 0,
    totalFavorites: 0,
    bookings: 0,
    pendingBookings: 0,
    messages: 0,
  })

  useEffect(() => {
    if (!user?.id) return

    const loadStats = async () => {
      setLoading(true)
      const data = await apiFetchJson<typeof stats>('/api/owner/analytics').catch(() => null)
      if (data) setStats(data)
      setLoading(false)
    }

    loadStats()
  }, [user])

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">Overview of your portfolio performance</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Listings</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{stats.listings}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Active Listings</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{stats.activeListings}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Views</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{stats.totalViews}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Favorites</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{stats.totalFavorites}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Bookings</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{stats.bookings}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Pending Bookings</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{stats.pendingBookings}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Messages</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{stats.messages}</CardContent>
        </Card>
      </div>
    </div>
  )
}
