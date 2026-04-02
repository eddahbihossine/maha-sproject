'use client'

import { useState, useRef, useEffect, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/AuthProvider'
import { getMessages, sendMessage, subscribeToMessages } from '@/lib/api/messages'
import type { ChatMessage } from '@/lib/types/messages'
import { apiFetchJson } from '@/lib/api/http'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft, Send, Loader2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'
import { useT } from '@/lib/i18n/use-t'

interface OtherUserProfile {
  id: string
  first_name: string
  last_name: string
  role: string
}

export default function ConversationPage({
  params,
}: {
  params: Promise<{ conversationId: string }>
}) {
  const resolvedParams = use(params)
  const { user } = useAuth()
  const router = useRouter()
  const t = useT()
  
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [otherUser, setOtherUser] = useState<OtherUserProfile | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const otherUserId = resolvedParams.conversationId

  useEffect(() => {
    if (user?.id && otherUserId) {
      loadConversation()
    }
  }, [user, otherUserId])

  useEffect(() => {
    if (!user?.id || !otherUserId) return

    // Subscribe to new messages
    const unsubscribe = subscribeToMessages(user.id, otherUserId, (message) => {
      setMessages(prev => [...prev, message])
    })

    return () => {
      unsubscribe()
    }
  }, [user, otherUserId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadConversation = async () => {
    if (!user?.id) return
    
    setLoading(true)

    // Load other user's profile (proxied via API)
    try {
      const data = await apiFetchJson<{ profile: OtherUserProfile }>(
        `/api/profiles/${encodeURIComponent(otherUserId)}`
      )
      if (data.profile) setOtherUser(data.profile)
    } catch {
      setOtherUser(null)
    }

    // Load messages
    const msgs = await getMessages(user.id, otherUserId)
    setMessages(msgs)
    setLoading(false)
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user?.id || sending) return

    setSending(true)
    const content = newMessage.trim()
    setNewMessage('')

    const message = await sendMessage(user.id, otherUserId, content)
    
    if (message) {
      setMessages(prev => [...prev, message])
    }
    
    setSending(false)
    inputRef.current?.focus()
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase()
  }

  const formatTime = (date: Date) => {
    try {
      const now = new Date()
      const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
      
      if (diffInHours < 24) {
        return date.toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        })
      } else {
        return formatDistanceToNow(date, { addSuffix: true })
      }
    } catch {
      return ''
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-4 border-b">
          <div className="flex items-center space-x-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        </div>
        <div className="flex-1 p-4 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className={cn("flex", i % 2 === 0 ? "justify-start" : "justify-end")}>
              <Skeleton className="h-16 w-64 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!otherUser) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">{t('messages.userNotFound')}</p>
          <Button onClick={() => router.push('/messages')}>
            {t('messages.backToMessages')}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <header className="flex items-center gap-4 p-4 border-b bg-card">
        <Button variant="ghost" size="icon" className="md:hidden" asChild>
          <Link href="/messages">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>

        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary text-primary-foreground">
              {getInitials(otherUser.first_name, otherUser.last_name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold leading-none">
              {otherUser.first_name} {otherUser.last_name}
            </h2>
            <p className="text-xs text-muted-foreground mt-1 capitalize">
              {otherUser.role}
            </p>
          </div>
        </div>
      </header>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">
              <p>{t('messages.noMessagesYet')}</p>
            </div>
          ) : (
            messages.map((message) => {
              const isOwnMessage = message.sender_id === user?.id
              return (
                <div
                  key={message.id}
                  className={cn(
                    'flex',
                    isOwnMessage ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div
                    className={cn(
                      'max-w-[70%] rounded-lg px-4 py-2',
                      isOwnMessage
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    )}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">
                      {message.content}
                    </p>
                    <p
                      className={cn(
                        'text-xs mt-1',
                        isOwnMessage
                          ? 'text-primary-foreground/70'
                          : 'text-muted-foreground'
                      )}
                    >
                      {formatTime(message.created_at)}
                    </p>
                  </div>
                </div>
              )
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="p-4 border-t bg-card">
        <div className="flex items-center gap-2">
          <Input
            ref={inputRef}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={t('messages.typeMessage')}
            disabled={sending}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || sending}
            size="icon"
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
