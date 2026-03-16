'use client'

import React from "react"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/lib/auth/AuthProvider'
import { apiFetchJson } from '@/lib/api/http'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Calendar,
  Clock,
  MessageCircle,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  GraduationCap,
  ArrowRight,
  Building2,
} from 'lucide-react'
import type { BookingStatus } from '@/lib/types'

const statusConfig: Record<BookingStatus, { label: string; color: string; icon: React.ReactNode }> = {
  pending: {
    label: 'Pending',
    color: 'bg-warning text-warning-foreground',
    icon: <Clock className="h-3 w-3" />,
  },
  accepted: {
    label: 'Accepted',
    color: 'bg-accent text-accent-foreground',
    icon: <CheckCircle className="h-3 w-3" />,
  },
  rejected: {
    label: 'Rejected',
    color: 'bg-destructive text-destructive-foreground',
    icon: <XCircle className="h-3 w-3" />,
  },
  cancelled: {
    label: 'Cancelled',
    color: 'bg-muted text-muted-foreground',
    icon: <XCircle className="h-3 w-3" />,
  },
  completed: {
    label: 'Completed',
    color: 'bg-primary text-primary-foreground',
    icon: <CheckCircle className="h-3 w-3" />,
  },
}

export default function OwnerBookingsPage() {
  const { user } = useAuth()
  const [selectedTab, setSelectedTab] = useState('pending')
  const [rejectReason, setRejectReason] = useState('')
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.id) return

    const loadBookings = async () => {
      setLoading(true)
      try {
        const result = await apiFetchJson<{ bookings: any[] }>('/api/owner/bookings')
        setBookings(result.bookings || [])
      } catch (err) {
        console.error('Error fetching bookings:', err)
        setBookings([])
      }
      setLoading(false)
    }

    loadBookings()
  }, [user])

  const filterByStatus = (status: string) => {
    if (status === 'all') return bookings
    return bookings.filter((r) => r.status === status)
  }

  const pendingCount = bookings.filter((r) => r.status === 'pending').length
  const acceptedCount = bookings.filter((r) => r.status === 'accepted').length

  const getDisplayName = (profile?: any) => {
    if (!profile) return 'Student'
    return profile.company_name || profile.university || 'Student'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <Card>
          <CardContent className="p-6 text-muted-foreground">Loading bookings...</CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Booking Requests</h1>
        <p className="text-muted-foreground">
          Manage booking requests from students
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="pending" className="gap-2">
            Pending
            {pendingCount > 0 && (
              <Badge variant="secondary" className="h-5 w-5 rounded-full p-0 text-xs">
                {pendingCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="accepted" className="gap-2">
            Accepted
            {acceptedCount > 0 && (
              <Badge variant="secondary" className="h-5 w-5 rounded-full p-0 text-xs">
                {acceptedCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>

        {['pending', 'accepted', 'rejected', 'all'].map((tab) => (
          <TabsContent key={tab} value={tab} className="mt-6">
            {filterByStatus(tab).length > 0 ? (
              <div className="space-y-4">
                {filterByStatus(tab).map((request) => (
                  <Card key={request.id}>
                    <CardContent className="p-6">
                      <div className="flex flex-col gap-6 lg:flex-row">
                        {/* Listing Preview */}
                        <div className="flex gap-4 lg:w-1/3">
                          <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-lg">
                            {request.listings?.listing_images?.length ? (
                            <Image
                              src={request.listings.listing_images
                                .sort((a: any, b: any) => a.sort_order - b.sort_order)[0]?.image_url || '/placeholder.svg'}
                              alt={request.listings.title}
                              fill
                              className="object-cover"
                            />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-muted">
                                <Building2 className="h-6 w-6 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <Link
                              href={`/listings/${request.listings?.id}`}
                              className="font-medium hover:text-primary line-clamp-2"
                            >
                              {request.listings?.title}
                            </Link>
                            <p className="text-sm text-muted-foreground">
                              {request.listings?.city}
                            </p>
                            <p className="text-sm font-medium text-primary">
                              {request.listings?.rent_monthly} MAD/month
                            </p>
                          </div>
                        </div>

                        {/* Student Info */}
                        <div className="flex-1 space-y-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-12 w-12">
                                <AvatarFallback>
                                  {getDisplayName(request.user_profiles)
                                    .split(' ')
                                    .map((part: string) => part[0])
                                    .slice(0, 2)
                                    .join('')
                                    .toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">
                                  {getDisplayName(request.user_profiles)}
                                </p>
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <GraduationCap className="h-3.5 w-3.5" />
                                  {request.user_profiles?.role || 'student'}
                                </div>
                              </div>
                            </div>
                            <Badge className={`gap-1 ${statusConfig[request.status].color}`}>
                              {statusConfig[request.status].icon}
                              {statusConfig[request.status].label}
                            </Badge>
                          </div>

                          {/* Request Details */}
                          <div className="grid gap-4 sm:grid-cols-3">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="text-xs text-muted-foreground">Move-in Date</p>
                                <p className="text-sm font-medium">
                                  {formatDate(request.check_in_date)}
                                </p>
                              </div>
                            </div>
                            {request.check_out_date && (
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <p className="text-xs text-muted-foreground">Move-out Date</p>
                                  <p className="text-sm font-medium">
                                    {formatDate(request.check_out_date)}
                                  </p>
                                </div>
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <div className="h-4 w-4 text-muted-foreground">MAD</div>
                              <div>
                                <p className="text-xs text-muted-foreground">Total First Payment</p>
                                <p className="text-sm font-medium">
                                  {request.total_amount} MAD
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Message */}
                          <div className="rounded-lg bg-muted p-3">
                            <p className="mb-1 text-xs font-medium text-muted-foreground">
                              Student message:
                            </p>
                            <p className="text-sm">{request.student_message || 'No message provided.'}</p>
                          </div>

                          {/* Owner Response */}
                          {request.owner_response && (
                            <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
                              <p className="mb-1 text-xs font-medium text-primary">
                                Your response:
                              </p>
                              <p className="text-sm">{request.owner_response}</p>
                            </div>
                          )}

                          {/* Actions */}
                          {request.status === 'pending' && (
                            <div className="flex flex-wrap gap-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button>
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Accept Request
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Accept Booking Request</DialogTitle>
                                    <DialogDescription>
                                      You are about to accept the booking request from{' '}
                                      {getDisplayName(request.user_profiles)}.
                                      They will be notified and you can proceed with the next steps.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="py-4">
                                    <p className="mb-2 text-sm font-medium">
                                      Add a message (optional)
                                    </p>
                                    <Textarea
                                      placeholder="Welcome! I'm happy to accept your booking. Let's arrange the next steps..."
                                      rows={3}
                                    />
                                  </div>
                                  <DialogFooter>
                                    <Button variant="outline">Cancel</Button>
                                    <Button>Confirm Acceptance</Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>

                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline">
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Decline
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Decline Booking Request</DialogTitle>
                                    <DialogDescription>
                                      Please provide a reason for declining this request.
                                      This helps maintain a good experience for students.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="py-4">
                                    <Textarea
                                      placeholder="The property is no longer available for the requested dates..."
                                      value={rejectReason}
                                      onChange={(e) => setRejectReason(e.target.value)}
                                      rows={3}
                                    />
                                  </div>
                                  <DialogFooter>
                                    <Button variant="outline">Cancel</Button>
                                    <Button variant="destructive">Decline Request</Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>

                              <Button variant="outline" asChild>
                                <Link href={`/owner/messages/${request.student_id}`}>
                                  <MessageCircle className="mr-2 h-4 w-4" />
                                  Message
                                </Link>
                              </Button>

                              <Button variant="ghost" asChild>
                                <Link href={`/owner/messages/${request.student_id}`}>
                                  <User className="mr-2 h-4 w-4" />
                                  View Profile
                                </Link>
                              </Button>
                            </div>
                          )}

                          {request.status === 'accepted' && (
                            <div className="flex flex-wrap gap-2">
                              <Button asChild>
                                <Link href={`/messages/new?student=${request.studentId}`}>
                                  <MessageCircle className="mr-2 h-4 w-4" />
                                  Message Student
                                </Link>
                              </Button>
                              <Button variant="outline">
                                Generate Contract
                                <ArrowRight className="ml-2 h-4 w-4" />
                              </Button>
                            </div>
                          )}

                          {/* Request Meta */}
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>
                              Requested on {formatDate(request.createdAt)}
                            </span>
                            {request.status === 'pending' && (
                              <span className="flex items-center gap-1 text-warning">
                                <AlertCircle className="h-3 w-3" />
                                Expires {formatDate(request.expiresAt)}
                              </span>
                            )}
                            {request.respondedAt && (
                              <span>
                                Responded on {formatDate(request.respondedAt)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <Calendar className="mb-4 h-12 w-12 text-muted-foreground" />
                  <h2 className="mb-2 text-xl font-semibold">No {tab} requests</h2>
                  <p className="text-center text-muted-foreground">
                    {tab === 'pending'
                      ? 'You have no pending booking requests at the moment.'
                      : `You have no ${tab} booking requests.`}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
