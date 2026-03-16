import type { Conversation, ChatMessage } from '@/lib/types/messages'
import { apiFetchJson } from '@/lib/api/http'

/**
 * Get all conversations for the current user
 */
export async function getConversations(userId: string): Promise<Conversation[]> {
  // `userId` is kept for backward compatibility but is not used client-side anymore.
  // The server derives the user from auth cookies.
  void userId

  try {
    const data = await apiFetchJson<{ conversations: any[] }>('/api/messages/conversations')
    return (data.conversations || []).map((c) => ({
      ...c,
      last_message_time: c.last_message_time ? new Date(c.last_message_time) : undefined,
      created_at: c.created_at ? new Date(c.created_at) : undefined,
    })) as Conversation[]
  } catch (err) {
    console.error('Error fetching conversations:', err)
    return []
  }
}

/**
 * Get messages for a specific conversation
 */
export async function getMessages(
  userId: string,
  otherUserId: string
): Promise<ChatMessage[]> {
  void userId
  try {
    const data = await apiFetchJson<{ messages: any[] }>(
      `/api/messages/threads/${encodeURIComponent(otherUserId)}`
    )
    return (data.messages || []).map((m) => ({
      id: m.id,
      sender_id: m.sender_id,
      recipient_id: m.recipient_id,
      content: m.content,
      is_read: m.is_read,
      created_at: new Date(m.created_at),
      listing_id: m.listing_id,
    }))
  } catch (err) {
    console.error('Error fetching messages:', err)
    return []
  }
}

/**
 * Send a new message
 */
export async function sendMessage(
  senderId: string,
  recipientId: string,
  content: string,
  listingId?: string
): Promise<ChatMessage | null> {
  // `senderId` is kept for backward compatibility. The server derives sender from auth cookies.
  void senderId
  try {
    const data = await apiFetchJson<{ message: any }>(
      `/api/messages/threads/${encodeURIComponent(recipientId)}`,
      {
        method: 'POST',
        body: JSON.stringify({ content, listingId }),
      }
    )

    const m = data.message
    if (!m) return null

    return {
      id: m.id,
      sender_id: m.sender_id,
      recipient_id: m.recipient_id,
      content: m.content,
      is_read: m.is_read,
      created_at: new Date(m.created_at),
      listing_id: m.listing_id,
    }
  } catch (err) {
    console.error('Error sending message:', err)
    return null
  }
}

/**
 * Subscribe to new messages in real-time
 */
export function subscribeToMessages(
  userId: string,
  otherUserId: string,
  onNewMessage: (message: ChatMessage) => void
) {
  // Realtime subscription still uses Supabase client in the browser.
  // Reads/writes are now proxied through /api/messages/*.
  const { createClient } = require('@/lib/supabase/client') as typeof import('@/lib/supabase/client')
  const supabase = createClient()

  const channel = supabase
    .channel('messages')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `sender_id=eq.${otherUserId},recipient_id=eq.${userId}`,
      },
      (payload) => {
        const message: ChatMessage = {
          id: payload.new.id,
          sender_id: payload.new.sender_id,
          recipient_id: payload.new.recipient_id,
          content: payload.new.content,
          is_read: payload.new.is_read,
          created_at: new Date(payload.new.created_at),
          listing_id: payload.new.listing_id,
        }
        onNewMessage(message)
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}

/**
 * Get unread message count for current user
 */
export async function getUnreadCount(userId: string): Promise<number> {
  void userId
  try {
    const data = await apiFetchJson<{ count: number }>('/api/messages/unread-count')
    return data.count || 0
  } catch (err) {
    console.error('Error fetching unread count:', err)
    return 0
  }
}

/**
 * Start a new conversation (or get existing one)
 */
export async function startConversation(
  userId: string,
  ownerId: string,
  listingId: string,
  initialMessage: string
): Promise<string | null> {
  const message = await sendMessage(userId, ownerId, initialMessage, listingId)
  return message ? ownerId : null
}
