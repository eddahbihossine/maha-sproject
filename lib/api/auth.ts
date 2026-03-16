/**
 * Authentication API
 */

import { apiRequest, setAuthTokens, clearAuthTokens, getAuthToken } from './client';

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  password2: string;
  first_name: string;
  last_name: string;
  role: 'student' | 'owner';
  phone_number?: string;
  university?: string;
  study_program?: string;
  company_name?: string;
}

export interface LoginData {
  username: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
    verification_status: string;
    avatar_url?: string;
  };
  tokens: {
    access: string;
    refresh: string;
  };
  message: string;
}

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  role: 'student' | 'owner' | 'admin';
  verification_status: string;
  avatar_url?: string;
  phone_number?: string;
  preferred_language: string;
  university?: string;
  study_program?: string;
  study_start_date?: string;
  study_end_date?: string;
  budget_min?: number;
  budget_max?: number;
  company_name?: string;
  total_listings?: number;
  avg_rating?: number;
  response_rate?: number;
  response_time_hours?: number;
  created_at?: string;
}

export const authApi = {
  /**
   * Register a new user
   */
  register: async (data: RegisterData) => {
    const response = await apiRequest<AuthResponse>('/users/auth/register/', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (response.data) {
      setAuthTokens(response.data.tokens.access, response.data.tokens.refresh);
    }

    return response;
  },

  /**
   * Login user
   */
  login: async (data: LoginData) => {
    const response = await apiRequest<AuthResponse>('/users/auth/login/', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (response.data) {
      setAuthTokens(response.data.tokens.access, response.data.tokens.refresh);
    }

    return response;
  },

  /**
   * Logout user
   */
  logout: async () => {
    const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null;
    
    if (refreshToken) {
      await apiRequest('/users/auth/logout/', {
        method: 'POST',
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
    }

    clearAuthTokens();
  },

  /**
   * Get current user profile
   */
  getCurrentUser: async () => {
    return apiRequest<UserProfile>('/users/users/me/');
  },

  /**
   * Update user profile
   */
  updateProfile: async (data: Partial<UserProfile>) => {
    return apiRequest<UserProfile>('/users/users/update_profile/', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  /**
   * Change password
   */
  changePassword: async (oldPassword: string, newPassword: string, newPassword2: string) => {
    return apiRequest('/users/users/change_password/', {
      method: 'POST',
      body: JSON.stringify({
        old_password: oldPassword,
        new_password: newPassword,
        new_password2: newPassword2,
      }),
    });
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: () => {
    return !!getAuthToken();
  },
};
