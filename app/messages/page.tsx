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
import { Skeleton } from '@/components/ui/skeleton'
import { MessageSquare, Loader2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export default function MessagesPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.id) {
      loadConversations()
    }
  }, [user])

  const loadConversations = async () => {
    if (!user?.id) return
    
    setLoading(true)
    const data = await getConversations(user.id)
    setConversations(data)
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

  if (loading) {
    return (
      <div className="flex-1 flex flex-col p-4 space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (conversations.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-muted/30">
        <div className="rounded-full bg-muted p-6 mb-6">
          <MessageSquare className="h-12 w-12 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-semibold mb-2">No messages yet</h2>
        <p className="text-muted-foreground max-w-sm mb-6">
          Start a conversation with property owners by visiting a listing and clicking "Contact Owner"
        </p>
        <Button onClick={() => router.push('/search')}>
          Browse Listings
        </Button>
      </div>
    )
  }

  return (
    <ScrollArea className="flex-1">
      <div className="p-4 space-y-2">
        {conversations.map((conversation) => (
          <button
            key={conversation.id}
            onClick={() => router.push(`/messages/${conversation.other_user_id}`)}
            className="w-full flex items-start space-x-4 p-4 rounded-lg hover:bg-muted/50 transition-colors text-left"
          >
            <Avatar className="h-12 w-12 flex-shrink-0">
              <AvatarFallback className="bg-primary text-primary-foreground">
                {getInitials(conversation.other_user_name)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold text-sm truncate">
                  {conversation.other_user_name}
                </h3>
                {conversation.last_message_time && (
                  <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                    {formatTime(conversation.last_message_time)}
                  </span>
                )}
              </div>
              
              {conversation.listing_title && (
                <p className="text-xs text-muted-foreground mb-1 truncate">
                  Re: {conversation.listing_title}
                </p>
              )}
              
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground truncate flex-1">
                  {conversation.last_message}
                </p>
                {conversation.unread_count > 0 && (
                  <Badge variant="default" className="ml-2 h-5 min-w-[20px] flex items-center justify-center px-1">
                    {conversation.unread_count}
                  </Badge>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </ScrollArea>
  )
}
