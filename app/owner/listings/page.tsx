'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/lib/auth/AuthProvider'
import { apiFetchJson } from '@/lib/api/http'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Building2,
  Plus,
  Search,
  MoreVertical,
  Eye,
  Heart,
  MessageCircle,
  Edit,
  Copy,
  Pause,
  Play,
  Trash2,
  ExternalLink,
} from 'lucide-react'
import type { ListingStatus } from '@/lib/types'

const statusColors: Record<ListingStatus, string> = {
  active: 'bg-accent text-accent-foreground',
  draft: 'bg-muted text-muted-foreground',
  paused: 'bg-warning text-warning-foreground',
  rented: 'bg-primary text-primary-foreground',
  archived: 'bg-muted text-muted-foreground',
}

export default function OwnerListingsPage() {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [listings, setListings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const updateListing = async (listingId: string, patch: any) => {
    const res = await apiFetchJson<{ listing: any }>(
      `/api/owner/listings/${encodeURIComponent(listingId)}`,
      {
        method: 'PATCH',
        body: JSON.stringify({ listing: patch }),
      }
    )

    if (res?.listing) {
      setListings((prev) => prev.map((l) => (l.id === listingId ? { ...l, ...res.listing } : l)))
    }
  }

  const setListingStatus = async (listingId: string, status: ListingStatus) => {
    try {
      await updateListing(listingId, { status })
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      console.error('Failed to update listing status:', message)
      alert(`Failed to update listing status: ${message}`)
    }
  }

  const deleteListing = async (listingId: string) => {
    try {
      await apiFetchJson(`/api/owner/listings/${encodeURIComponent(listingId)}`, {
        method: 'DELETE',
      })
      setListings((prev) => prev.filter((l) => l.id !== listingId))
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      console.error('Failed to delete listing:', message)
      alert(`Failed to delete listing: ${message}`)
    }
  }

  useEffect(() => {
    if (!user?.id) return

    const loadListings = async () => {
      setLoading(true)

      try {
        const result = await apiFetchJson<{ listings: any[] }>('/api/owner/listings')
        const data = result.listings || []
        const mapped = data.map((listing: any) => {
          const images = (listing.listing_images || [])
            .sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
            .map((img: any) => {
              const url = typeof img?.image_url === 'string' ? img.image_url.trim() : ''
              return url ? encodeURI(url) : ''
            })
            .filter(Boolean)
          return { ...listing, images }
        })
        setListings(mapped)
      } catch (err) {
        console.error('Error fetching owner listings:', err)
        setListings([])
      }
      setLoading(false)
    }

    loadListings()
  }, [user])

  const ownerListings = listings

  const filteredListings = ownerListings.filter((listing) => {
    const matchesSearch =
      listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.city.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || listing.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const statusCounts = {
    all: ownerListings.length,
    active: ownerListings.filter((l) => l.status === 'active').length,
    draft: ownerListings.filter((l) => l.status === 'draft').length,
    paused: ownerListings.filter((l) => l.status === 'paused').length,
    rented: ownerListings.filter((l) => l.status === 'rented').length,
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Listings</h1>
          <p className="text-muted-foreground">
            Manage your property listings ({ownerListings.length} total)
          </p>
        </div>
        <Button asChild>
          <Link href="/owner/listings/new">
            <Plus className="mr-2 h-4 w-4" />
            Add New Listing
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search listings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All ({statusCounts.all})</SelectItem>
            <SelectItem value="active">Active ({statusCounts.active})</SelectItem>
            <SelectItem value="draft">Draft ({statusCounts.draft})</SelectItem>
            <SelectItem value="paused">Paused ({statusCounts.paused})</SelectItem>
            <SelectItem value="rented">Rented ({statusCounts.rented})</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Listings */}
      {loading ? (
        <Card>
          <CardContent className="p-6 text-muted-foreground">Loading listings...</CardContent>
        </Card>
      ) : filteredListings.length > 0 ? (
        <div className="space-y-4">
          {filteredListings.map((listing) => (
            <Card key={listing.id}>
              <CardContent className="p-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                  {/* Image */}
                  <div className="relative aspect-video w-full shrink-0 overflow-hidden rounded-lg lg:aspect-[4/3] lg:w-40">
                    {listing.images?.[0] ? (
                      <img
                        src={listing.images[0]}
                        alt={listing.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          if (process.env.NODE_ENV === 'development') {
                            console.warn('Image failed to load:', listing.images?.[0])
                          }
                          e.currentTarget.src = '/placeholder.svg'
                        }}
                      />
                    ) : (
                      <img
                        src="/placeholder.svg"
                        alt="Placeholder"
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold">{listing.title}</h3>
                          <Badge className={statusColors[listing.status]}>
                            {listing.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {listing.city}, {listing.postal_code} - {listing.surface_area}m2
                        </p>
                      </div>
                      <p className="text-lg font-bold text-primary shrink-0">
                        {listing.rent_monthly} MAD
                        <span className="text-sm font-normal text-muted-foreground">/mo</span>
                      </p>
                    </div>

                    {/* Stats */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {listing.view_count || 0} views
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="h-4 w-4" />
                        {listing.favorite_count || 0} favorites
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="h-4 w-4" />
                        0 inquiries
                      </span>
                      <span>
                        Available: {new Date(listing.available_from).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 lg:flex-col">
                    <Button variant="outline" size="sm" asChild className="flex-1 lg:w-full bg-transparent">
                      <Link href={`/owner/listings/${listing.id}/edit`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild className="flex-1 lg:w-full bg-transparent">
                      <Link href={`/listings/${listing.id}`} target="_blank">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        View
                      </Link>
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">More options</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Copy className="mr-2 h-4 w-4" />
                          Duplicate
                        </DropdownMenuItem>
                        {listing.status === 'active' ? (
                          <DropdownMenuItem
                            onSelect={(e) => {
                              e.preventDefault()
                              void setListingStatus(listing.id, 'paused')
                            }}
                          >
                            <Pause className="mr-2 h-4 w-4" />
                            Pause listing
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onSelect={(e) => {
                              e.preventDefault()
                              void setListingStatus(listing.id, 'active')
                            }}
                          >
                            <Play className="mr-2 h-4 w-4" />
                            Activate listing
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem
                              onSelect={(e) => e.preventDefault()}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete listing
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete listing?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete
                                your listing and remove all associated data.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                onClick={() => {
                                  void deleteListing(listing.id)
                                }}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Building2 className="mb-4 h-12 w-12 text-muted-foreground" />
            <h2 className="mb-2 text-xl font-semibold">No listings found</h2>
            <p className="mb-4 text-center text-muted-foreground">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your filters to see more results.'
                : 'Create your first listing to start receiving booking requests.'}
            </p>
            {!searchQuery && statusFilter === 'all' && (
              <Button asChild>
                <Link href="/owner/listings/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Listing
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
