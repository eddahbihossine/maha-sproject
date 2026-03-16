'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/AuthProvider'
import { getConversations } from '@/lib/api/messages'
import type { Conversation } from '@/lib/types/messages'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageSquare, Search, Loader2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export default function OwnerMessagesPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (user?.id) {
      loadConversations()
    }
  }, [user])

  const loadConversations = async () => {
    if (!user?.id) return
    
    setLoading(true)
    const data = await getConversations(user.id)
    // Filter to show only students (your customers)
    const studentConversations = data.filter(conv => conv.other_user_role === 'student')
    setConversations(studentConversations)
    setLoading(false)
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const formatTime = (date?: Date) => {
    if (!date) return ''
    try {
      return formatDistanceToNow(date, { addSuffix: true })
    } catch {
      return ''
    }
  }

  const filteredConversations = conversations.filter(conv =>
    conv.other_user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.listing_title?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const unreadCount = conversations.reduce((acc, conv) => acc + conv.unread_count, 0)

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-24" />
        </div>
        {[...Array(5)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Messages</h1>
          <p className="text-muted-foreground">
            Chat with students interested in your properties
          </p>
        </div>
        {unreadCount > 0 && (
          <Badge variant="destructive" className="h-8 px-4">
            {unreadCount} unread
          </Badge>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search conversations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Conversations */}
      {filteredConversations.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="rounded-full bg-muted p-6 mb-4">
              <MessageSquare className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">
              {searchQuery ? 'No conversations found' : 'No messages yet'}
            </h2>
            <p className="text-muted-foreground max-w-sm mb-6">
              {searchQuery 
                ? 'Try a different search term' 
                : 'Students will reach out when they\'re interested in your listings'}
            </p>
            {!searchQuery && (
              <Button onClick={() => router.push('/owner/listings')}>
                View My Listings
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredConversations.map((conversation) => (
            <Card
              key={conversation.id}
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => router.push(`/owner/messages/${conversation.other_user_id}`)}
            >
              <CardContent className="p-4">
                <div className="flex items-start space-x-4">
                  <Avatar className="h-12 w-12 flex-shrink-0">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {getInitials(conversation.other_user_name)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div>
                        <h3 className="font-semibold text-base">
                          {conversation.other_user_name}
                        </h3>
                        {conversation.listing_title && (
                          <p className="text-xs text-muted-foreground">
                            About: {conversation.listing_title}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {conversation.unread_count > 0 && (
                          <Badge variant="destructive" className="h-5 px-2 text-xs">
                            {conversation.unread_count}
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatTime(conversation.last_message_time)}
                        </span>
                      </div>
                    </div>
                    
                    {conversation.last_message && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {conversation.last_message}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
