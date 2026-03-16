/**
 * Messages and Bookings API - Django Backend
 */

import { apiRequest } from './client';

export interface Message {
  id: number;
  sender: number;
  sender_name: string;
  sender_avatar?: string;
  recipient: number;
  recipient_name: string;
  recipient_avatar?: string;
  listing?: number;
  listing_title?: string;
  booking?: number;
  content: string;
  is_read: boolean;
  read_at?: string;
  created_at: string;
}

export interface Conversation {
  user_id: number;
  user_name: string;
  user_avatar: string;
  user_role: 'student' | 'owner';
  listing_id?: number;
  listing_title?: string;
  last_message: string;
  last_message_date: string;
  unread_count: number;
}

export interface Booking {
  id: number;
  listing: number;
  listing_title: string;
  listing_address: string;
  listing_city: string;
  student: number;
  student_name: string;
  student_email: string;
  owner_id: number;
  owner_name: string;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'completed';
  check_in_date: string;
  check_out_date: string;
  num_guests: number;
  monthly_rent: number;
  total_months: number;
  total_amount: number;
  deposit_paid: boolean;
  student_message?: string;
  owner_response?: string;
  created_at: string;
  updated_at: string;
  accepted_at?: string;
  rejected_at?: string;
  cancelled_at?: string;
}

export const messagesApi = {
  /**
   * Get all messages, optionally filtered by user or listing
   */
  getMessages: async (filters?: { user_id?: number; listing_id?: number }) => {
    const params = new URLSearchParams();
    if (filters?.user_id) params.append('user_id', String(filters.user_id));
    if (filters?.listing_id) params.append('listing_id', String(filters.listing_id));
    
    const endpoint = `/bookings/messages/${params.toString() ? `?${params.toString()}` : ''}`;
    return apiRequest<Message[]>(endpoint);
  },

  /**
   * Get all conversation threads
   */
  getConversations: async () => {
    return apiRequest<Conversation[]>('/bookings/messages/conversations/');
  },

  /**
   * Send a new message
   */
  sendMessage: async (data: {
    recipient: number;
    content: string;
    listing?: number;
    booking?: number;
  }) => {
    return apiRequest<Message>('/bookings/messages/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Mark a message as read
   */
  markAsRead: async (messageId: number) => {
    return apiRequest<Message>(`/bookings/messages/${messageId}/mark_as_read/`, {
      method: 'POST',
    });
  },

  /**
   * Mark all messages in a conversation as read
   */
  markConversationAsRead: async (userId: number) => {
    return apiRequest<{ marked_as_read: number }>('/bookings/messages/mark_conversation_as_read/', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId }),
    });
  },

  /**
   * Get unread message count
   */
  getUnreadCount: async () => {
    return apiRequest<{ unread_count: number }>('/bookings/messages/unread_count/');
  },
};

export const bookingsApi = {
  /**
   * Get all bookings (filtered by role)
   */
  getBookings: async (filters?: { status?: string }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    
    const endpoint = `/bookings/bookings/${params.toString() ? `?${params.toString()}` : ''}`;
    return apiRequest<Booking[]>(endpoint);
  },

  /**
   * Get a single booking by ID
   */
  getBooking: async (id: number) => {
    return apiRequest<Booking>(`/bookings/bookings/${id}/`);
  },

  /**
   * Create a new booking (students only)
   */
  createBooking: async (data: {
    listing: number;
    check_in_date: string;
    check_out_date: string;
    num_guests: number;
    monthly_rent: number;
    total_months: number;
    student_message?: string;
  }) => {
    return apiRequest<Booking>('/bookings/bookings/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Accept a booking (owners only)
   */
  acceptBooking: async (id: number) => {
    return apiRequest<Booking>(`/bookings/bookings/${id}/accept/`, {
      method: 'POST',
    });
  },

  /**
   * Reject a booking (owners only)
   */
  rejectBooking: async (id: number, message?: string) => {
    return apiRequest<Booking>(`/bookings/bookings/${id}/reject/`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  },

  /**
   * Cancel a booking (students only)
   */
  cancelBooking: async (id: number) => {
    return apiRequest<Booking>(`/bookings/bookings/${id}/cancel/`, {
      method: 'POST',
    });
  },
};
