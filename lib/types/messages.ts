// Conversation and Message types for the messaging system
export interface Conversation {
  id: string
  listing_id?: string
  listing_title?: string
  listing_image?: string
  other_user_id: string
  other_user_name: string
  other_user_role: 'student' | 'owner'
  last_message?: string
  last_message_time?: Date
  unread_count: number
  created_at: Date
}

export interface ChatMessage {
  id: string
  sender_id: string
  recipient_id: string
  content: string
  is_read: boolean
  created_at: Date
  listing_id?: string
  sender_name?: string
}
