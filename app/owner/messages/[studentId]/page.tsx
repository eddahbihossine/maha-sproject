'use client'

import { useState, useRef, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/AuthProvider'
import { getMessages, sendMessage, subscribeToMessages } from '@/lib/api/messages'
import { apiFetchJson } from '@/lib/api/http'
import type { ChatMessage } from '@/lib/types/messages'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Send, Loader2, MessageSquare } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'

interface OtherUserProfile {
  id: string
  company_name?: string
  university?: string
  avatar_url?: string
  role: string
}

export default function OwnerConversationPage({
  params,
}: {
  params: Promise<{ studentId: string }>
}) {
  const resolvedParams = use(params)
  const { user } = useAuth()
  const router = useRouter()
  
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [otherUser, setOtherUser] = useState<OtherUserProfile | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const studentId = resolvedParams.studentId

  useEffect(() => {
    if (user?.id && studentId) {
      loadConversation()
    }
  }, [user, studentId])

  useEffect(() => {
    if (!user?.id || !studentId) return

    // Subscribe to new messages
    const unsubscribe = subscribeToMessages(user.id, studentId, (message) => {
      setMessages(prev => [...prev, message])
    })

    return () => {
      unsubscribe()
    }
  }, [user, studentId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadConversation = async () => {
    if (!user?.id) return
    
    setLoading(true)

    // Load student's profile
    try {
      const res = await apiFetchJson<{ profile: OtherUserProfile }>(`/api/profiles/${studentId}`)
      if (res?.profile) setOtherUser(res.profile)
    } catch (error) {
      console.error('Failed to load student profile:', error)
    }

    // Load messages
    const msgs = await getMessages(user.id, studentId)
    setMessages(msgs)
    setLoading(false)
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user?.id || sending) return

    setSending(true)
    const content = newMessage.trim()
    setNewMessage('')

    const message = await sendMessage(user.id, studentId, content)
    
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

  const getDisplayName = (profile?: OtherUserProfile | null) => {
    if (!profile) return 'Student'
    return profile.company_name || profile.university || 'Student'
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase()
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
      <div className="flex flex-col h-[calc(100vh-4rem)]">
        <Card className="m-6 mb-0">
          <div className="p-4 border-b">
            <div className="flex items-center space-x-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          </div>
          <div className="p-4 space-y-4 h-96">
            {[...Array(4)].map((_, i) => (
              <div key={i} className={cn("flex", i % 2 === 0 ? "justify-start" : "justify-end")}>
                <Skeleton className="h-16 w-64 rounded-lg" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    )
  }

  if (!otherUser) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] p-6">
        <p className="text-muted-foreground">Student not found</p>
        <Button onClick={() => router.push('/owner/messages')} className="mt-4">
          Back to Messages
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] p-6">
      <Card className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/owner/messages')}
            className="lg:hidden"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary text-primary-foreground">
              {getInitials(getDisplayName(otherUser))}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <h2 className="font-semibold">
              {getDisplayName(otherUser)}
            </h2>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="secondary" className="text-xs">
                {otherUser?.role || 'student'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="rounded-full bg-muted p-6 mb-4">
                <MessageSquare className="h-12 w-12 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">
                No messages yet. Start the conversation!
              </p>
            </div>
          ) : (
            messages.map((message) => {
              const isOwn = message.sender_id === user?.id
              return (
                <div
                  key={message.id}
                  className={cn('flex', isOwn ? 'justify-end' : 'justify-start')}
                >
                  <div
                    className={cn(
                      'max-w-[70%] rounded-lg p-3 space-y-1',
                      isOwn
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    )}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">
                      {message.content}
                    </p>
                    <p
                      className={cn(
                        'text-xs',
                        isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
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

        {/* Input */}
        <div className="p-4 border-t">
          <div className="flex items-end gap-2">
            <Input
              ref={inputRef}
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
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
      </Card>
    </div>
  )
}
