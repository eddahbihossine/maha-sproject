# Student Accommodation Platform - Backend Setup Guide

## Overview
This Django REST API backend integrates with Supabase for authentication and data storage, providing endpoints for the Next.js frontend.

## Setup Instructions

### 1. Environment Setup
Copy `.env` and configure your Supabase credentials:
```bash
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
```

### 2. Database Migrations
```bash
cd backend
source venv/bin/activate
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
```

### 3. Run Development Server
```bash
python manage.py runserver
```

API will be available at `http://localhost:8000/api/`

## API Endpoints

### Authentication
- `POST /api/auth/register/` - Register new user
- `POST /api/auth/login/` - Login (get JWT tokens)
- `POST /api/auth/refresh/` - Refresh JWT token
- `POST /api/auth/logout/` - Logout

### Listings
- `GET /api/listings/` - List all listings (paginated, filterable)
- `POST /api/listings/` - Create listing (owner only)
- `GET /api/listings/{id}/` - Get listing details
- `PUT/PATCH /api/listings/{id}/` - Update listing (owner only)
- `DELETE /api/listings/{id}/` - Delete listing (owner only)

### Users
- `GET /api/users/me/` - Get current user profile
- `PATCH /api/users/me/` - Update current user profile
- `GET /api/users/{id}/` - Get user profile (public)

### Bookings
- `GET /api/bookings/` - List user's bookings
- `POST /api/bookings/` - Create booking
- `GET /api/bookings/{id}/` - Get booking details
- `PATCH /api/bookings/{id}/` - Update booking status

## Frontend Integration

### Update Next.js Environment
Add to `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### API Client Example
```typescript
// lib/api/client.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL

export async function fetchListings() {
  const response = await fetch(`${API_URL}/listings/`)
  return response.json()
}
```

## Supabase Schema

### Tables Required
1. **auth.users** - Managed by Supabase Auth
2. **public.user_profiles** - Extended user information
3. **public.listings** - Property listings
4. **public.bookings** - Booking records
5. **public.messages** - Messaging system

See `SUPABASE_SCHEMA.sql` for complete schema.

## Development Workflow

1. **Frontend (Next.js)**: Handles UI, authentication via Supabase client
2. **Backend (Django)**: Validates Supabase JWT, manages business logic, provides API
3. **Supabase**: Authentication, PostgreSQL database, real-time subscriptions

## Next Steps

1. Configure Supabase project and copy credentials to `.env` files
2. Run migrations in Django backend
3. Start both Next.js and Django servers
4. Test registration and login flow
5. Create test listings and bookings
