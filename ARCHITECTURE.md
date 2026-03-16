# 🏗️ Student Accommodation Platform - Complete System Architecture

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Technology Stack](#technology-stack)
3. [Architecture Diagram](#architecture-diagram)
4. [Database Schema](#database-schema)
5. [Feature Specifications](#feature-specifications)
6. [API Endpoints](#api-endpoints)
7. [Real-Time Chat System](#real-time-chat-system)
8. [Security & Best Practices](#security--best-practices)
9. [Admin Dashboard](#admin-dashboard)
10. [Development Roadmap](#development-roadmap)
11. [UI/UX Guidelines](#uiux-guidelines)

---

## System Overview

### Platform Purpose
A web platform connecting international students with verified property owners in Morocco, featuring real-time messaging, secure bookings, and comprehensive property management.

### Core Functionality
- **Students**: Browse listings, contact owners, book properties, manage favorites
- **Owners**: List properties, manage bookings, communicate with students
- **Admins**: Moderate listings, manage users, view analytics

### User Roles
1. **Student** - Primary end-user seeking accommodation
2. **Owner** - Property owners/landlords listing accommodations
3. **Admin** - Platform administrators with full access

---

## Technology Stack

### Frontend Stack

#### Next.js 15+ (App Router)
**Why Next.js:**
- ✅ **Server Components**: Improved performance and SEO
- ✅ **File-based Routing**: Intuitive and scalable
- ✅ **API Routes**: Built-in backend capabilities
- ✅ **Image Optimization**: Automatic image handling
- ✅ **TypeScript Support**: Type safety out of the box
- ✅ **Edge Runtime**: Fast global deployment

**Alternatives Considered:**
- React SPA: ❌ Worse SEO, no SSR
- Vue.js/Nuxt: ❌ Smaller ecosystem
- Remix: ❌ Less mature, smaller community

#### UI Framework: shadcn/ui + Tailwind CSS
**Why shadcn/ui:**
- ✅ **Copy-paste components**: No package bloat
- ✅ **Radix UI primitives**: Accessible by default
- ✅ **Customizable**: Full control over styling
- ✅ **TypeScript**: Native type support

**Why Tailwind:**
- ✅ **Utility-first**: Faster development
- ✅ **Consistent design**: Built-in design system
- ✅ **Small bundle**: Purges unused CSS
- ✅ **Dark mode**: Built-in support

#### State Management
- **React Context API**: Auth state, theme
- **Server State**: Next.js Server Components
- **Form State**: React Hook Form + Zod validation

### Backend Stack

#### Option 1: Supabase (Current - Recommended for MVP)
**Why Supabase:**
- ✅ **PostgreSQL**: Industry-standard relational DB
- ✅ **Built-in Auth**: OAuth, email/password, magic links
- ✅ **Real-time**: WebSocket subscriptions included
- ✅ **Storage**: Image/file hosting built-in
- ✅ **Row Level Security**: Database-level authorization
- ✅ **Auto-generated APIs**: REST + GraphQL
- ✅ **Edge Functions**: Serverless compute
- ✅ **Free tier**: Generous limits for MVP

**Use Cases:**
- MVP and early stage
- Teams wanting rapid development
- Projects with standard CRUD operations

#### Option 2: Django REST Framework (Available - For Complex Logic)
**Why Django:**
- ✅ **Mature ecosystem**: Battle-tested framework
- ✅ **ORM**: Powerful query capabilities
- ✅ **Admin panel**: Built-in CMS
- ✅ **Security**: CSRF, XSS protection built-in
- ✅ **Async support**: Django 5+ channels for WebSockets

**Use Cases:**
- Complex business logic
- Custom admin workflows
- Advanced data processing
- Third-party integrations (payment gateways, etc.)

**Current Setup:**
- Django 5.0.1 configured in `backend/`
- Models created for User, Listing, Booking, Message
- REST Framework + JWT ready

#### Option 3: Node.js + NestJS (Alternative)
**Why NestJS:**
- ✅ **TypeScript-first**: End-to-end type safety
- ✅ **Modular**: Clean architecture patterns
- ✅ **Microservices**: Easy to scale
- ✅ **GraphQL**: Built-in support

**When to use:**
- Team already knows TypeScript
- Need microservices architecture
- GraphQL preferred over REST

### Database

#### PostgreSQL (via Supabase)
**Why PostgreSQL:**
- ✅ **ACID compliance**: Data integrity guaranteed
- ✅ **JSON support**: Flexible data structures
- ✅ **Full-text search**: Built-in search capabilities
- ✅ **Geospatial**: PostGIS for location features
- ✅ **Performance**: Excellent for read-heavy workloads
- ✅ **Mature**: 30+ years of development

**Alternatives:**
- MySQL: ❌ Less feature-rich
- MongoDB: ❌ Not ideal for relational data
- SQLite: ❌ Not suitable for production

#### Redis (Optional - For Caching)
**When to add Redis:**
- Caching frequently accessed data
- Session storage
- Real-time leaderboards
- Rate limiting

### Real-Time Communication

#### Supabase Realtime (Current)
**Features:**
- WebSocket-based
- Automatic reconnection
- Presence tracking
- Broadcast messages

#### Alternative: Socket.io
**When to use:**
- Custom event handling needed
- Complex room logic
- Video/audio chat features

### File Storage

#### Supabase Storage (Current)
**Features:**
- S3-compatible API
- Image transformations
- CDN included
- RLS policies

#### Alternative: Cloudinary
**When to use:**
- Advanced image processing
- Video hosting
- AI-based tagging

### Hosting & Deployment

#### Frontend: Vercel (Recommended)
- ✅ Next.js optimized
- ✅ Edge network
- ✅ Automatic previews
- ✅ Zero-config deployment

#### Backend: Railway/Fly.io (For Django)
- ✅ PostgreSQL included
- ✅ Easy scaling
- ✅ GitHub integration

#### Database: Supabase Cloud
- ✅ Managed PostgreSQL
- ✅ Daily backups
- ✅ Point-in-time recovery

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Browser    │  │    Mobile    │  │   Tablet     │          │
│  │   (Desktop)  │  │    (PWA)     │  │   (iPad)     │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                  │                  │                   │
│         └──────────────────┼──────────────────┘                   │
│                            │                                       │
└────────────────────────────┼───────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    NEXT.JS APP (Frontend)                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                  App Router Pages                        │   │
│  │  /               (Homepage - Student facing)             │   │
│  │  /search         (Property search & filters)             │   │
│  │  /listings/[id]  (Property details + contact)            │   │
│  │  /messages       (Chat interface)                        │   │
│  │  /owner/*        (Owner dashboard & management)          │   │
│  │  /admin          (Admin panel)                           │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                 Client Components                        │   │
│  │  - AuthProvider (Global auth state)                     │   │
│  │  - Header (Role-based navigation)                       │   │
│  │  - ListingCard (Property display)                       │   │
│  │  - ChatInterface (Real-time messaging)                  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                 API Routes (Optional)                    │   │
│  │  /api/webhooks   (Payment, email notifications)         │   │
│  │  /api/upload     (Image processing)                     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
└────────────────────────────┬─────────────────────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Supabase   │    │   Django     │    │  External    │
│   (Primary)  │    │  (Optional)  │    │  Services    │
└──────┬───────┘    └──────┬───────┘    └──────┬───────┘
       │                   │                    │
       │                   │                    │
┌──────▼─────────────────────────────────────────▼───────────────┐
│                    BACKEND SERVICES LAYER                       │
├────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐   │
│  │              SUPABASE SERVICES                          │   │
│  │                                                          │   │
│  │  ┌──────────────────────────────────────────────────┐  │   │
│  │  │  Authentication Service                           │  │   │
│  │  │  - Email/Password, OAuth (Google, GitHub)        │  │   │
│  │  │  - JWT tokens, Session management                │  │   │
│  │  │  - Row Level Security (RLS) policies             │  │   │
│  │  └──────────────────────────────────────────────────┘  │   │
│  │                                                          │   │
│  │  ┌──────────────────────────────────────────────────┐  │   │
│  │  │  PostgreSQL Database                              │  │   │
│  │  │  - user_profiles, listings, bookings             │  │   │
│  │  │  - messages, reviews, favorites                  │  │   │
│  │  │  - Full-text search, Indexes                     │  │   │
│  │  └──────────────────────────────────────────────────┘  │   │
│  │                                                          │   │
│  │  ┌──────────────────────────────────────────────────┐  │   │
│  │  │  Realtime Service (WebSockets)                    │  │   │
│  │  │  - Live message delivery                          │  │   │
│  │  │  - Presence tracking (online/offline)            │  │   │
│  │  │  - Broadcast events                              │  │   │
│  │  └──────────────────────────────────────────────────┘  │   │
│  │                                                          │   │
│  │  ┌──────────────────────────────────────────────────┐  │   │
│  │  │  Storage Service                                  │  │   │
│  │  │  - Property images, avatars                      │  │   │
│  │  │  - CDN delivery                                  │  │   │
│  │  │  - Image transformations                         │  │   │
│  │  └──────────────────────────────────────────────────┘  │   │
│  │                                                          │   │
│  │  ┌──────────────────────────────────────────────────┐  │   │
│  │  │  Edge Functions (Serverless)                      │  │   │
│  │  │  - Email notifications                            │  │   │
│  │  │  - Payment processing                             │  │   │
│  │  │  - Image optimization                             │  │   │
│  │  └──────────────────────────────────────────────────┘  │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐   │
│  │         DJANGO API (Optional for Complex Logic)         │   │
│  │                                                          │   │
│  │  ┌──────────────────────────────────────────────────┐  │   │
│  │  │  REST API Endpoints                               │  │   │
│  │  │  - /api/listings/ (Advanced filtering)           │  │   │
│  │  │  - /api/bookings/ (Complex workflows)            │  │   │
│  │  │  - /api/payments/ (Stripe integration)           │  │   │
│  │  └──────────────────────────────────────────────────┘  │   │
│  │                                                          │   │
│  │  ┌──────────────────────────────────────────────────┐  │   │
│  │  │  Background Tasks (Celery)                        │  │   │
│  │  │  - Email campaigns                                │  │   │
│  │  │  - Report generation                              │  │   │
│  │  │  - Data cleanup                                   │  │   │
│  │  └──────────────────────────────────────────────────┘  │   │
│  │                                                          │   │
│  │  ┌──────────────────────────────────────────────────┐  │   │
│  │  │  Admin Interface                                  │  │   │
│  │  │  - User management                                │  │   │
│  │  │  - Listing moderation                             │  │   │
│  │  │  - Analytics dashboard                            │  │   │
│  │  └──────────────────────────────────────────────────┘  │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Stripe     │  │   SendGrid   │  │  Cloudinary  │          │
│  │  (Payments)  │  │   (Email)    │  │   (Media)    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Twilio     │  │  Google Maps │  │   Sentry     │          │
│  │    (SMS)     │  │  (Location)  │  │   (Errors)   │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘

                    DATA FLOW EXAMPLES

┌─────────────────────────────────────────────────────────────┐
│  1. Student Searches for Accommodation                       │
│                                                               │
│  Student → Next.js Page → Supabase Query → PostgreSQL       │
│  ↓                                                            │
│  Results with RLS filtering → Cached → Displayed            │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  2. Student Contacts Owner                                   │
│                                                               │
│  Student → Click "Contact" → Dialog Opens                   │
│  ↓                                                            │
│  Send Message → Supabase Insert → messages table            │
│  ↓                                                            │
│  Realtime broadcast → Owner receives notification            │
│  ↓                                                            │
│  Edge Function → Send email to owner                         │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  3. Real-time Chat                                           │
│                                                               │
│  User types message → WebSocket → Supabase Realtime         │
│  ↓                                                            │
│  Store in PostgreSQL → Broadcast to recipient                │
│  ↓                                                            │
│  Recipient's browser receives → Update UI instantly          │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  4. Payment Processing (Future)                              │
│                                                               │
│  Student → Book Property → Next.js API Route                │
│  ↓                                                            │
│  Create Stripe Session → Redirect to Stripe                 │
│  ↓                                                            │
│  Payment Complete → Webhook → Update booking status         │
│  ↓                                                            │
│  Send confirmation emails → Update both parties              │
└─────────────────────────────────────────────────────────────┘
```

---

## Database Schema

### Complete PostgreSQL Schema

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- USER PROFILES TABLE
-- =====================================================
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'owner', 'admin')),
  avatar_url TEXT,
  phone VARCHAR(20),
  verified BOOLEAN DEFAULT FALSE,
  
  -- Student-specific fields
  university VARCHAR(200),
  student_id VARCHAR(50),
  date_of_birth DATE,
  nationality VARCHAR(100),
  budget_min INTEGER,
  budget_max INTEGER,
  preferred_locations TEXT[],
  
  -- Owner-specific fields
  company_name VARCHAR(200),
  company_id VARCHAR(50),
  total_listings INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0.00,
  total_reviews INTEGER DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_seen TIMESTAMP WITH TIME ZONE,
  
  -- Indexes
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

CREATE INDEX idx_user_profiles_role ON user_profiles(role);
CREATE INDEX idx_user_profiles_email ON user_profiles(email);
CREATE INDEX idx_user_profiles_verified ON user_profiles(verified);

-- =====================================================
-- LISTINGS TABLE
-- =====================================================
CREATE TABLE listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  
  -- Basic Information
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  property_type VARCHAR(50) NOT NULL CHECK (
    property_type IN ('studio', 'apartment', 'room', 'shared', 'residence')
  ),
  
  -- Location
  address_line1 VARCHAR(255) NOT NULL,
  address_line2 VARCHAR(255),
  city VARCHAR(100) NOT NULL,
  postal_code VARCHAR(20) NOT NULL,
  country VARCHAR(100) DEFAULT 'Morocco',
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Property Details
  num_bedrooms INTEGER NOT NULL CHECK (num_bedrooms >= 0),
  num_bathrooms INTEGER NOT NULL CHECK (num_bathrooms >= 1),
  surface_area INTEGER NOT NULL CHECK (surface_area > 0),
  floor_number INTEGER,
  total_floors INTEGER,
  furnished BOOLEAN DEFAULT TRUE,
  
  -- Pricing
  rent_monthly INTEGER NOT NULL CHECK (rent_monthly > 0),
  charges_amount INTEGER DEFAULT 0,
  charges_included BOOLEAN DEFAULT FALSE,
  deposit_amount INTEGER NOT NULL,
  
  -- Availability
  available_from DATE NOT NULL,
  available_until DATE,
  minimum_stay_months INTEGER DEFAULT 1,
  maximum_stay_months INTEGER,
  
  -- Amenities (JSON array)
  amenities JSONB DEFAULT '[]'::jsonb,
  
  -- Rules
  rules JSONB DEFAULT '{
    "smoking": false,
    "pets": false,
    "couples": true,
    "parties": false
  }'::jsonb,
  
  -- Transport & Proximity
  nearest_university VARCHAR(200),
  distance_to_university_km DECIMAL(5,2),
  public_transport JSONB DEFAULT '[]'::jsonb,
  
  -- Status
  status VARCHAR(20) DEFAULT 'draft' CHECK (
    status IN ('draft', 'active', 'pending', 'inactive', 'deleted')
  ),
  verified BOOLEAN DEFAULT FALSE,
  featured BOOLEAN DEFAULT FALSE,
  
  -- Metrics
  views_count INTEGER DEFAULT 0,
  favorites_count INTEGER DEFAULT 0,
  inquiries_count INTEGER DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for performance
CREATE INDEX idx_listings_owner ON listings(owner_id);
CREATE INDEX idx_listings_city_status ON listings(city, status);
CREATE INDEX idx_listings_status ON listings(status);
CREATE INDEX idx_listings_rent ON listings(rent_monthly);
CREATE INDEX idx_listings_available_from ON listings(available_from);
CREATE INDEX idx_listings_property_type ON listings(property_type);
CREATE INDEX idx_listings_location ON listings USING GIST(
  ll_to_earth(latitude, longitude)
);

-- Full-text search index
CREATE INDEX idx_listings_search ON listings USING GIN(
  to_tsvector('english', title || ' ' || description || ' ' || city)
);

-- =====================================================
-- LISTING IMAGES TABLE
-- =====================================================
CREATE TABLE listing_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  caption TEXT,
  display_order INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_listing_images_listing ON listing_images(listing_id);
CREATE INDEX idx_listing_images_primary ON listing_images(listing_id, is_primary);

-- =====================================================
-- BOOKINGS TABLE
-- =====================================================
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  
  -- Booking Details
  move_in_date DATE NOT NULL,
  move_out_date DATE NOT NULL,
  num_occupants INTEGER DEFAULT 1 CHECK (num_occupants >= 1),
  
  -- Pricing
  monthly_rent INTEGER NOT NULL,
  total_months INTEGER NOT NULL,
  total_amount INTEGER NOT NULL,
  deposit_paid INTEGER DEFAULT 0,
  
  -- Status
  status VARCHAR(20) DEFAULT 'pending' CHECK (
    status IN (
      'pending',      -- Waiting for owner approval
      'approved',     -- Owner approved
      'rejected',     -- Owner rejected
      'paid',         -- Payment completed
      'active',       -- Currently active
      'completed',    -- Stay completed
      'cancelled'     -- Cancelled by either party
    )
  ),
  
  -- Additional Info
  special_requests TEXT,
  owner_notes TEXT,
  
  -- Payment tracking
  payment_id VARCHAR(255),
  payment_status VARCHAR(50),
  payment_date TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  cancellation_reason TEXT
);

CREATE INDEX idx_bookings_student ON bookings(student_id);
CREATE INDEX idx_bookings_listing ON bookings(listing_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_dates ON bookings(move_in_date, move_out_date);

-- =====================================================
-- MESSAGES TABLE
-- =====================================================
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES listings(id) ON DELETE SET NULL,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  
  -- Message Content
  content TEXT NOT NULL CHECK (LENGTH(content) > 0),
  message_type VARCHAR(20) DEFAULT 'text' CHECK (
    message_type IN ('text', 'image', 'file', 'system')
  ),
  
  -- Attachments
  attachments JSONB DEFAULT '[]'::jsonb,
  
  -- Status
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  deleted_by_sender BOOLEAN DEFAULT FALSE,
  deleted_by_recipient BOOLEAN DEFAULT FALSE,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for fast queries
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_recipient ON messages(recipient_id);
CREATE INDEX idx_messages_conversation ON messages(sender_id, recipient_id);
CREATE INDEX idx_messages_unread ON messages(recipient_id, is_read) 
  WHERE is_read = FALSE;
CREATE INDEX idx_messages_created ON messages(created_at DESC);

-- =====================================================
-- REVIEWS TABLE
-- =====================================================
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  
  -- Ratings (1-5 scale)
  overall_rating INTEGER NOT NULL CHECK (overall_rating BETWEEN 1 AND 5),
  cleanliness_rating INTEGER CHECK (cleanliness_rating BETWEEN 1 AND 5),
  location_rating INTEGER CHECK (location_rating BETWEEN 1 AND 5),
  value_rating INTEGER CHECK (value_rating BETWEEN 1 AND 5),
  communication_rating INTEGER CHECK (communication_rating BETWEEN 1 AND 5),
  
  -- Review Content
  title VARCHAR(200),
  content TEXT NOT NULL,
  pros TEXT[],
  cons TEXT[],
  
  -- Owner Response
  owner_response TEXT,
  owner_response_date TIMESTAMP WITH TIME ZONE,
  
  -- Verification
  verified_stay BOOLEAN DEFAULT FALSE,
  
  -- Moderation
  is_flagged BOOLEAN DEFAULT FALSE,
  is_approved BOOLEAN DEFAULT TRUE,
  moderation_notes TEXT,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraint: One review per booking
  CONSTRAINT unique_booking_review UNIQUE (booking_id)
);

CREATE INDEX idx_reviews_listing ON reviews(listing_id);
CREATE INDEX idx_reviews_student ON reviews(student_id);
CREATE INDEX idx_reviews_created ON reviews(created_at DESC);

-- =====================================================
-- FAVORITES TABLE
-- =====================================================
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraint: One favorite per user per listing
  CONSTRAINT unique_user_listing UNIQUE (user_id, listing_id)
);

CREATE INDEX idx_favorites_user ON favorites(user_id);
CREATE INDEX idx_favorites_listing ON favorites(listing_id);

-- =====================================================
-- NOTIFICATIONS TABLE
-- =====================================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  
  -- Notification Details
  type VARCHAR(50) NOT NULL CHECK (
    type IN (
      'new_message',
      'booking_request',
      'booking_approved',
      'booking_rejected',
      'payment_received',
      'review_received',
      'listing_verified',
      'system_announcement'
    )
  ),
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  
  -- Related entities
  related_listing_id UUID REFERENCES listings(id) ON DELETE SET NULL,
  related_booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  related_message_id UUID REFERENCES messages(id) ON DELETE SET NULL,
  
  -- Actions
  action_url TEXT,
  action_text VARCHAR(100),
  
  -- Status
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) 
  WHERE is_read = FALSE;
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);

-- =====================================================
-- ANALYTICS TABLE (Admin Dashboard)
-- =====================================================
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type VARCHAR(50) NOT NULL,
  user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  listing_id UUID REFERENCES listings(id) ON DELETE SET NULL,
  
  -- Event data
  event_data JSONB DEFAULT '{}'::jsonb,
  session_id VARCHAR(255),
  ip_address INET,
  user_agent TEXT,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_analytics_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_user ON analytics_events(user_id);
CREATE INDEX idx_analytics_created ON analytics_events(created_at DESC);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- User Profiles Policies
CREATE POLICY "Public profiles viewable by everyone"
  ON user_profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- Listings Policies
CREATE POLICY "Active listings viewable by everyone"
  ON listings FOR SELECT
  USING (status = 'active' OR owner_id = auth.uid());

CREATE POLICY "Owners can create listings"
  ON listings FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update own listings"
  ON listings FOR UPDATE
  USING (auth.uid() = owner_id);

-- Messages Policies
CREATE POLICY "Users can view own messages"
  ON messages FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- Bookings Policies
CREATE POLICY "Students/owners can view own bookings"
  ON bookings FOR SELECT
  USING (auth.uid() = student_id OR auth.uid() = owner_id);

CREATE POLICY "Students can create bookings"
  ON bookings FOR INSERT
  WITH CHECK (auth.uid() = student_id);

-- Favorites Policies
CREATE POLICY "Users can view own favorites"
  ON favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own favorites"
  ON favorites FOR ALL
  USING (auth.uid() = user_id);

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to tables
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_listings_updated_at
  BEFORE UPDATE ON listings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update listing metrics
CREATE OR REPLACE FUNCTION update_listing_metrics()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE listings
    SET favorites_count = favorites_count + 1
    WHERE id = NEW.listing_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE listings
    SET favorites_count = favorites_count - 1
    WHERE id = OLD.listing_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_listing_favorites
  AFTER INSERT OR DELETE ON favorites
  FOR EACH ROW EXECUTE FUNCTION update_listing_metrics();

-- Create notification on new message
CREATE OR REPLACE FUNCTION notify_new_message()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (
    user_id,
    type,
    title,
    content,
    related_message_id,
    action_url
  ) VALUES (
    NEW.recipient_id,
    'new_message',
    'New message',
    'You have a new message',
    NEW.id,
    '/messages/' || NEW.sender_id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notify_message
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION notify_new_message();

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- Active listings with owner info
CREATE VIEW active_listings_view AS
SELECT 
  l.*,
  up.first_name || ' ' || up.last_name AS owner_name,
  up.avatar_url AS owner_avatar,
  up.verified AS owner_verified,
  up.average_rating AS owner_rating,
  COALESCE(array_agg(DISTINCT li.url) FILTER (WHERE li.url IS NOT NULL), ARRAY[]::TEXT[]) AS images
FROM listings l
JOIN user_profiles up ON l.owner_id = up.id
LEFT JOIN listing_images li ON l.id = li.listing_id
WHERE l.status = 'active'
GROUP BY l.id, up.id;

-- User statistics
CREATE VIEW user_statistics AS
SELECT 
  up.id,
  up.role,
  COUNT(DISTINCT CASE WHEN up.role = 'owner' THEN l.id END) AS total_listings,
  COUNT(DISTINCT CASE WHEN up.role = 'student' THEN b.id END) AS total_bookings,
  COUNT(DISTINCT f.id) AS total_favorites,
  COUNT(DISTINCT r.id) AS total_reviews
FROM user_profiles up
LEFT JOIN listings l ON up.id = l.owner_id AND up.role = 'owner'
LEFT JOIN bookings b ON up.id = b.student_id AND up.role = 'student'
LEFT JOIN favorites f ON up.id = f.user_id
LEFT JOIN reviews r ON up.id = r.student_id
GROUP BY up.id;
```

### Database Relationships Diagram

```
user_profiles (Central hub)
    │
    ├─────────────┬─────────────┬────────────────┬───────────┐
    │             │             │                │           │
    ▼             ▼             ▼                ▼           ▼
listings    bookings      messages         favorites    reviews
    │           │             │                │           │
    ├───────────┤             └────────────────┘           │
    │           │                                           │
    ▼           ▼                                           ▼
listing_images  └───────────────────────────────────────> notifications
```

---

## Feature Specifications

### For Students

#### 1. Authentication & Profile
- ✅ **Register**: Email, password, first name, last name, role selection
- ✅ **Login**: Email/password, OAuth (Google)
- ✅ **Profile Management**: 
  - Edit personal information
  - Upload avatar
  - Set budget preferences
  - List preferred locations
  - Add university information
  - Verify student status

#### 2. Property Search & Discovery
- ✅ **Search Interface**:
  - Location-based search (city, university)
  - Price range filters
  - Property type filters (studio, apartment, room, etc.)
  - Availability date filtering
  - Number of bedrooms/bathrooms
  - Amenities filter
- ⏳ **Map View**: Interactive map showing properties
- ⏳ **Advanced Filters**:
  - Distance from university
  - Furnished/unfurnished
  - Pet-friendly
  - Utilities included
- ✅ **Sorting Options**: Price, date, popularity, distance

#### 3. Property Details
- ✅ **View Listing**:
  - Photo gallery with zoom
  - Full property description
  - Location on map
  - Amenities list
  - House rules
  - Transport information
  - Owner information
  - Reviews from previous tenants
- ✅ **Contact Owner**: Direct messaging
- ⏳ **Virtual Tour**: 360° property tours
- ✅ **Save to Favorites**: Bookmark properties
- ⏳ **Share Listing**: Share via link, social media

#### 4. Messaging System
- ✅ **Real-Time Chat**:
  - Text messages
  - Read receipts
  - Typing indicators
  - Message history
  - Conversation list with unread count
- ⏳ **Attachments**: Send images, documents
- ⏳ **Quick Replies**: Pre-written templates
- ⏳ **Schedule Viewing**: Request property viewing

#### 5. Booking & Payments
- ⏳ **Booking Request**:
  - Select move-in/move-out dates
  - Number of occupants
  - Special requests
  - Calculate total cost
- ⏳ **Payment Processing**:
  - Secure payment via Stripe
  - Deposit handling
  - Monthly rent payments
  - Payment history
- ⏳ **Booking Management**:
  - View booking status
  - Cancel bookings
  - Modify dates (if allowed)

#### 6. Reviews & Ratings
- ⏳ **Write Reviews**:
  - Overall rating (1-5 stars)
  - Category ratings (cleanliness, location, value, communication)
  - Written review
  - Pros and cons
  - Photo uploads
- ✅ **View Reviews**: Read reviews from other students

#### 7. Favorites & Lists
- ✅ **Save Listings**: Add to favorites
- ⏳ **Create Lists**: Organize favorites into custom lists
- ⏳ **Compare Properties**: Side-by-side comparison
- ⏳ **Share Lists**: Share with friends/family

#### 8. Notifications
- ⏳ **In-App Notifications**:
  - New messages
  - Booking status updates
  - Price drops on favorites
  - New listings matching preferences
- ⏳ **Email Notifications**: Digest emails, important updates
- ⏳ **Push Notifications**: Mobile alerts

### For Owners

#### 1. Dashboard
- ⏳ **Overview**:
  - Total listings (active/inactive)
  - Total bookings
  - Revenue statistics
  - Occupancy rate
  - Recent inquiries
  - Upcoming check-ins/check-outs
- ⏳ **Analytics**:
  - View counts per listing
  - Inquiry conversion rate
  - Revenue graphs
  - Popular properties

#### 2. Property Management
- ⏳ **Create Listing**:
  - Step-by-step form
  - Upload multiple images (drag & drop)
  - Set pricing and availability
  - Add amenities
  - Set house rules
  - Define location
- ⏳ **Edit Listings**: Update information, photos, pricing
- ⏳ **Manage Availability**: Block dates, set available periods
- ⏳ **Bulk Operations**: Update multiple listings at once
- ⏳ **Archive/Delete**: Remove old listings

#### 3. Booking Management
- ⏳ **View Bookings**:
  - All bookings (upcoming, current, past)
  - Booking requests (pending approval)
  - Calendar view
- ⏳ **Approve/Reject**: Review and respond to requests
- ⏳ **Manage Active Bookings**:
  - Communication with tenants
  - Issue management
  - Early termination handling

#### 4. Messaging
- ✅ **Inbox**: All conversations with students
- ✅ **Real-Time Chat**: Instant messaging
- ⏳ **Templates**: Quick response templates
- ⏳ **Auto-Replies**: Set availability messages

#### 5. Reviews & Reputation
- ⏳ **View Reviews**: See all reviews across properties
- ⏳ **Respond to Reviews**: Reply to student reviews
- ⏳ **Rating Dashboard**: Track overall rating trends

#### 6. Financial Management
- ⏳ **Payment Tracking**:
  - Incoming payments
  - Payment history
  - Outstanding payments
- ⏳ **Invoicing**: Generate invoices for tenants
- ⏳ **Payout Management**: Withdrawal to bank account
- ⏳ **Tax Documents**: Generate tax reports

#### 7. Property Insights
- ⏳ **Performance Metrics**:
  - Views per listing
  - Inquiry-to-booking ratio
  - Average response time
  - Guest satisfaction score
- ⏳ **Market Insights**:
  - Pricing recommendations
  - Competitor analysis
  - Demand forecasting

### For Admins

#### 1. User Management
- ⏳ **View All Users**:
  - List of students, owners, admins
  - User statistics
  - Activity logs
- ⏳ **User Actions**:
  - Suspend/ban users
  - Verify accounts
  - Reset passwords
  - View user details
  - Merge duplicate accounts

#### 2. Listing Moderation
- ⏳ **Review Listings**:
  - Pending listings queue
  - Flag inappropriate content
  - Verify property details
- ⏳ **Listing Actions**:
  - Approve/reject listings
  - Request corrections
  - Feature listings
  - Remove listings

#### 3. Content Moderation
- ⏳ **Review Reports**:
  - Flagged listings
  - Reported users
  - Inappropriate messages
  - Fake reviews
- ⏳ **Moderation Actions**:
  - Investigate reports
  - Take action on violations
  - Issue warnings
  - Ban accounts

#### 4. Analytics Dashboard
- ⏳ **Platform Metrics**:
  - Total users (by role)
  - Total listings
  - Total bookings
  - Revenue (platform fees)
  - User growth rate
  - Listing growth rate
- ⏳ **Engagement Metrics**:
  - Daily/monthly active users
  - Average session duration
  - Conversion rates
  - Most popular properties
  - Most active cities
- ⏳ **Financial Reports**:
  - Revenue breakdown
  - Payment success rate
  - Refunds issued
  - Outstanding payments

#### 5. System Configuration
- ⏳ **Settings**:
  - Platform fees
  - Email templates
  - Terms of service
  - Privacy policy
  - Feature flags
- ⏳ **Announcements**: Send platform-wide announcements

#### 6. Support Tools
- ⏳ **User Impersonation**: View platform as specific user
- ⏳ **Query Tools**: Run database queries
- ⏳ **Logs Viewer**: View system logs, errors
- ⏳ **Audit Trail**: Track admin actions

---

## API Endpoints

### Authentication Endpoints

```typescript
// Supabase handles these automatically via client SDK
POST   /auth/v1/signup              // Register new user
POST   /auth/v1/token               // Login
POST   /auth/v1/token?grant_type=refresh_token  // Refresh token
POST   /auth/v1/logout              // Logout
POST   /auth/v1/recover             // Password reset
POST   /auth/v1/user                // Update user
GET    /auth/v1/user                // Get current user
```

### User Profile Endpoints

```typescript
// Supabase auto-generated REST API
GET    /rest/v1/user_profiles                    // List profiles (admin)
GET    /rest/v1/user_profiles?id=eq.{id}         // Get profile by ID
PATCH  /rest/v1/user_profiles?id=eq.{id}         // Update profile
DELETE /rest/v1/user_profiles?id=eq.{id}         // Delete profile (soft)

// Custom endpoints (Next.js API routes or Django)
GET    /api/users/me                             // Get current user profile
PATCH  /api/users/me                             // Update current user
POST   /api/users/me/avatar                      // Upload avatar
GET    /api/users/{id}/statistics                // Get user statistics
```

### Listings Endpoints

```typescript
// Supabase REST API
GET    /rest/v1/listings                         // List all active listings
GET    /rest/v1/listings?id=eq.{id}              // Get single listing
POST   /rest/v1/listings                         // Create listing (owner)
PATCH  /rest/v1/listings?id=eq.{id}              // Update listing (owner)
DELETE /rest/v1/listings?id=eq.{id}              // Delete listing (owner)

// Advanced search (Custom API)
GET    /api/listings/search
  ?city=Paris
  &minPrice=500
  &maxPrice=1000
  &propertyType=apartment
  &bedrooms=2
  &amenities=wifi,parking
  &availableFrom=2024-03-01
  &sortBy=price
  &order=asc
  &page=1
  &limit=20

GET    /api/listings/{id}                        // Get listing with relations
POST   /api/listings                             // Create with images
PUT    /api/listings/{id}                        // Update with validations
DELETE /api/listings/{id}                        // Soft delete
POST   /api/listings/{id}/publish                // Publish draft listing
POST   /api/listings/{id}/unpublish              // Unpublish listing
GET    /api/listings/{id}/availability           // Get availability calendar
POST   /api/listings/{id}/view                   // Track view (analytics)
```

### Listing Images Endpoints

```typescript
GET    /rest/v1/listing_images?listing_id=eq.{id}  // Get images for listing
POST   /api/listings/{id}/images                    // Upload images
DELETE /api/listings/{id}/images/{imageId}          // Delete image
PATCH  /api/listings/{id}/images/{imageId}          // Update image order
POST   /api/listings/{id}/images/reorder            // Batch reorder images
```

### Bookings Endpoints

```typescript
GET    /rest/v1/bookings?student_id=eq.{id}      // Student's bookings
GET    /rest/v1/bookings?owner_id=eq.{id}        // Owner's bookings
POST   /rest/v1/bookings                         // Create booking request
PATCH  /rest/v1/bookings?id=eq.{id}              // Update booking

// Custom endpoints
POST   /api/bookings                             // Create with validations
GET    /api/bookings/{id}                        // Get booking details
PATCH  /api/bookings/{id}                        // Update booking
POST   /api/bookings/{id}/approve                // Owner approves
POST   /api/bookings/{id}/reject                 // Owner rejects
POST   /api/bookings/{id}/cancel                 // Cancel booking
POST   /api/bookings/{id}/complete               // Mark as completed
GET    /api/bookings/my-bookings                 // Get user's bookings
GET    /api/bookings/calendar                    // Calendar view
```

### Messages Endpoints

```typescript
// Real-time via Supabase Realtime
// REST API for history
GET    /rest/v1/messages
  ?or=(sender_id.eq.{userId},recipient_id.eq.{userId})
  &order=created_at.desc
  &limit=50

POST   /rest/v1/messages                         // Send message

// Custom endpoints
GET    /api/messages/conversations                // List conversations
GET    /api/messages/conversations/{userId}       // Get conversation with user
POST   /api/messages                              // Send message
PATCH  /api/messages/{id}/read                    // Mark as read
DELETE /api/messages/{id}                         // Delete message
GET    /api/messages/unread-count                 // Get unread count
```

### Reviews Endpoints

```typescript
GET    /rest/v1/reviews?listing_id=eq.{id}       // Get listing reviews
POST   /rest/v1/reviews                          // Create review
PATCH  /rest/v1/reviews?id=eq.{id}               // Update review

// Custom endpoints
POST   /api/reviews                              // Create with validation
GET    /api/reviews/{id}                         // Get review
PATCH  /api/reviews/{id}                         // Update review
DELETE /api/reviews/{id}                         // Delete review
POST   /api/reviews/{id}/response                // Owner responds
POST   /api/reviews/{id}/flag                    // Flag review
GET    /api/reviews/my-reviews                   // User's reviews
```

### Favorites Endpoints

```typescript
GET    /rest/v1/favorites?user_id=eq.{id}        // Get user favorites
POST   /rest/v1/favorites                        // Add favorite
DELETE /rest/v1/favorites?id=eq.{id}             // Remove favorite

// Custom endpoints
GET    /api/favorites                            // Get with listing details
POST   /api/favorites/{listingId}                // Toggle favorite
DELETE /api/favorites/{listingId}                // Remove favorite
GET    /api/favorites/check/{listingId}          // Check if favorited
```

### Notifications Endpoints

```typescript
GET    /rest/v1/notifications
  ?user_id=eq.{id}
  &order=created_at.desc
  &limit=20

PATCH  /rest/v1/notifications?id=eq.{id}         // Mark as read

// Custom endpoints
GET    /api/notifications                        // Get notifications
GET    /api/notifications/unread                 // Get unread notifications
PATCH  /api/notifications/{id}/read              // Mark as read
PATCH  /api/notifications/read-all               // Mark all as read
DELETE /api/notifications/{id}                   // Delete notification
```

### Admin Endpoints

```typescript
// User management
GET    /api/admin/users                          // List all users
GET    /api/admin/users/{id}                     // Get user details
PATCH  /api/admin/users/{id}                     // Update user
POST   /api/admin/users/{id}/suspend             // Suspend user
POST   /api/admin/users/{id}/verify              // Verify user
DELETE /api/admin/users/{id}                     // Delete user

// Listing moderation
GET    /api/admin/listings/pending               // Pending listings
POST   /api/admin/listings/{id}/approve          // Approve listing
POST   /api/admin/listings/{id}/reject           // Reject listing
POST   /api/admin/listings/{id}/feature          // Feature listing

// Content moderation
GET    /api/admin/reports                        // Get all reports
GET    /api/admin/reports/{id}                   // Get report details
POST   /api/admin/reports/{id}/resolve           // Resolve report

// Analytics
GET    /api/admin/analytics/overview             // Platform overview
GET    /api/admin/analytics/users                // User analytics
GET    /api/admin/analytics/listings             // Listing analytics
GET    /api/admin/analytics/revenue              // Revenue analytics
```

### Search & Filter Endpoints

```typescript
// Elasticsearch-style search (if using)
POST   /api/search/listings
{
  "query": "apartment paris",
  "filters": {
    "price": { "min": 500, "max": 1500 },
    "bedrooms": { "min": 2 },
    "amenities": ["wifi", "parking"]
  },
  "sort": { "price": "asc" },
  "page": 1,
  "size": 20
}

// Autocomplete
GET    /api/search/autocomplete?q=par            // Location autocomplete
GET    /api/search/suggestions?q=apartment       // Search suggestions
```

### File Upload Endpoints

```typescript
// Supabase Storage
POST   /storage/v1/object/{bucket}/{path}        // Upload file
GET    /storage/v1/object/public/{bucket}/{path} // Get public file
DELETE /storage/v1/object/{bucket}/{path}        // Delete file

// Custom endpoints
POST   /api/upload/avatar                        // Upload avatar
POST   /api/upload/listing-images                // Upload listing images
POST   /api/upload/documents                     // Upload documents
```

---

## Real-Time Chat System

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   REAL-TIME CHAT FLOW                    │
└─────────────────────────────────────────────────────────┘

User A (Browser)                                User B (Browser)
      │                                                │
      │ 1. Connect WebSocket                           │
      ├─────────────────────────────────────────────┐  │
      │                                              │  │
      │                  Supabase                    │  │
      │              Realtime Server                 │  │
      │                                              │  │
      │◄─────────────────────────────────────────────┤  │
      │                                                 │
      │ 2. Subscribe to channel                         │
      ├─────────────────►                              │
      │             "messages:user-{userId}"           │
      │                                                 │
      │                                                 │ 3. Connect
      │                                                 ├────────►
      │                                                 │
      │                                                 │ 4. Subscribe
      │                                                 ├────────►
      │                                                 │
      │ 5. Send message                                 │
      ├─────────────────►                              │
      │                                                 │
      │ 6. INSERT into messages table                  │
      │         (PostgreSQL)                            │
      │                                                 │
      │ 7. Broadcast event                             │
      │         ├──────────────────────────────────────►│
      │         │                                       │
      │         │ 8. Receive event                      │
      │         │                                       │
      │         │ 9. Update UI                          │
      │         │                                       │
```

### Implementation

#### 1. Subscribe to Messages (Frontend)

```typescript
// lib/api/messages.ts
import { createClient } from '@/lib/supabase/client'
import type { ChatMessage } from '@/lib/types/messages'

export function subscribeToMessages(
  userId: string,
  otherUserId: string,
  onNewMessage: (message: ChatMessage) => void
) {
  const supabase = createClient()

  // Subscribe to new messages where this user is the recipient
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

  // Return unsubscribe function
  return () => {
    supabase.removeChannel(channel)
  }
}
```

#### 2. Send Message

```typescript
// lib/api/messages.ts
export async function sendMessage(
  senderId: string,
  recipientId: string,
  content: string,
  listingId?: string
): Promise<ChatMessage | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('messages')
    .insert({
      sender_id: senderId,
      recipient_id: recipientId,
      content: content.trim(),
      listing_id: listingId,
      is_read: false,
    })
    .select()
    .single()

  if (error) {
    console.error('Error sending message:', error)
    return null
  }

  return {
    id: data.id,
    sender_id: data.sender_id,
    recipient_id: data.recipient_id,
    content: data.content,
    is_read: data.is_read,
    created_at: new Date(data.created_at),
    listing_id: data.listing_id,
  }
}
```

#### 3. Chat Component

```typescript
// app/messages/[conversationId]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth/AuthProvider'
import { getMessages, sendMessage, subscribeToMessages } from '@/lib/api/messages'

export default function ConversationPage({ params }) {
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const otherUserId = params.conversationId

  useEffect(() => {
    // Load initial messages
    const loadMessages = async () => {
      const msgs = await getMessages(user.id, otherUserId)
      setMessages(msgs)
    }
    loadMessages()

    // Subscribe to new messages
    const unsubscribe = subscribeToMessages(user.id, otherUserId, (message) => {
      setMessages(prev => [...prev, message])
    })

    return () => unsubscribe()
  }, [user.id, otherUserId])

  const handleSend = async () => {
    const message = await sendMessage(user.id, otherUserId, newMessage)
    if (message) {
      setMessages(prev => [...prev, message])
      setNewMessage('')
    }
  }

  return (
    <div>
      {/* Message list */}
      {/* Input */}
    </div>
  )
}
```

### Real-Time Features

#### 1. Typing Indicators

```typescript
// Send typing status
const sendTypingStatus = (userId: string, isTyping: boolean) => {
  const channel = supabase.channel('chat-room')
  channel.send({
    type: 'broadcast',
    event: 'typing',
    payload: { userId, isTyping }
  })
}

// Receive typing status
channel.on('broadcast', { event: 'typing' }, (payload) => {
  if (payload.userId === otherUserId) {
    setIsTyping(payload.isTyping)
  }
})
```

#### 2. Online Presence

```typescript
// Track user presence
const channel = supabase.channel('online-users', {
  config: {
    presence: {
      key: user.id,
    },
  },
})

channel.on('presence', { event: 'sync' }, () => {
  const state = channel.presenceState()
  const onlineUsers = Object.keys(state)
  setOnlineUsers(onlineUsers)
})

channel.subscribe(async (status) => {
  if (status === 'SUBSCRIBED') {
    await channel.track({ online_at: new Date().toISOString() })
  }
})
```

#### 3. Read Receipts

```typescript
// Mark messages as read
useEffect(() => {
  const markAsRead = async () => {
    const unreadMessages = messages.filter(
      m => m.recipient_id === user.id && !m.is_read
    )
    
    if (unreadMessages.length > 0) {
      await supabase
        .from('messages')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .in('id', unreadMessages.map(m => m.id))
    }
  }
  
  markAsRead()
}, [messages])
```

---

## Security & Best Practices

### Authentication Security

#### 1. Password Requirements
```typescript
// Enforce strong passwords
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/

// Minimum 8 characters
// At least one uppercase letter
// At least one lowercase letter
// At least one number
// At least one special character
```

#### 2. JWT Token Management
```typescript
// Store tokens securely
// - HttpOnly cookies (preferred)
// - Secure flag enabled
// - SameSite=Strict
// - Short expiration (15 mins for access token)
// - Refresh token rotation

// Supabase handles this automatically
```

#### 3. OAuth Security
```typescript
// PKCE (Proof Key for Code Exchange) enabled
// State parameter for CSRF protection
// Verify redirect URLs
// Limit OAuth scopes
```

### Data Protection

#### 1. Row Level Security (RLS)
```sql
-- Users can only view their own sensitive data
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

-- Students can only book for themselves
CREATE POLICY "Students can create own bookings"
  ON bookings FOR INSERT
  WITH CHECK (auth.uid() = student_id);

-- Owners can only manage own listings
CREATE POLICY "Owners can update own listings"
  ON listings FOR UPDATE
  USING (auth.uid() = owner_id);
```

#### 2. Input Validation
```typescript
// Use Zod for type-safe validation
import { z } from 'zod'

const listingSchema = z.object({
  title: z.string().min(10).max(200),
  description: z.string().min(50).max(5000),
  rent_monthly: z.number().min(0).max(100000),
  email: z.string().email(),
  // ... more fields
})

// Validate before inserting
const validated = listingSchema.parse(data)
```

#### 3. XSS Protection
```typescript
// React automatically escapes content
// For HTML content, use DOMPurify
import DOMPurify from 'dompurify'

const cleanHTML = DOMPurify.sanitize(dirtyHTML)
```

#### 4. CSRF Protection
```typescript
// Next.js API routes automatically include CSRF protection
// For external APIs, use CSRF tokens

// Django has built-in CSRF protection
// Ensure CSRF_COOKIE_SECURE = True in production
```

### File Upload Security

#### 1. File Type Validation
```typescript
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

function validateFile(file: File) {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error('Invalid file type')
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File too large')
  }
}
```

#### 2. Filename Sanitization
```typescript
import { nanoid } from 'nanoid'

// Generate unique filename
const uploadFile = (file: File) => {
  const extension = file.name.split('.').pop()
  const filename = `${nanoid()}.${extension}`
  // Upload with sanitized filename
}
```

#### 3. Storage Bucket Policies
```typescript
// Supabase Storage RLS
CREATE POLICY "Users can upload own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Anyone can view avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');
```

### Payment Security

#### 1. Stripe Integration
```typescript
// Never store card details
// Use Stripe.js for PCI compliance
// Handle payments server-side only

// Server-side payment intent
export async function POST(req: Request) {
  const { amount, bookingId } = await req.json()
  
  // Verify booking exists and user owns it
  const booking = await verifyBooking(bookingId)
  
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount * 100, // cents
    currency: 'mad',
    metadata: { booking_id: bookingId },
  })
  
  return Response.json({ clientSecret: paymentIntent.client_secret })
}
```

#### 2. Webhook Validation
```typescript
// Verify webhook signatures
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

export async function POST(req: Request) {
  const sig = req.headers.get('stripe-signature')
  const body = await req.text()
  
  try {
    const event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    )
    
    // Handle event
    if (event.type === 'payment_intent.succeeded') {
      // Update booking status
    }
  } catch (err) {
    return new Response('Webhook signature verification failed', { status: 400 })
  }
}
```

### Rate Limiting

```typescript
// Use Vercel rate limiting or Upstash Redis
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'), // 10 requests per 10 seconds
})

export async function middleware(request: NextRequest) {
  const ip = request.ip ?? '127.0.0.1'
  const { success } = await ratelimit.limit(ip)
  
  if (!success) {
    return new Response('Too Many Requests', { status: 429 })
  }
  
  return NextResponse.next()
}
```

### Environment Variables

```bash
# .env.example
# Never commit actual .env files

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe (if using)
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email (SendGrid)
SENDGRID_API_KEY=SG...

# Other
JWT_SECRET=random_secret_key
NODE_ENV=production
```

### Monitoring & Logging

```typescript
// Use Sentry for error tracking
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
})

// Log important events
Sentry.captureMessage('User completed booking', 'info')

// Capture errors
try {
  // risky operation
} catch (error) {
  Sentry.captureException(error)
}
```

---

## Admin Dashboard

### Dashboard Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Admin Dashboard                                    [User▾] │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Total   │  │  Active  │  │  Total   │  │ Revenue  │   │
│  │  Users   │  │ Listings │  │ Bookings │  │ (Month)  │   │
│  │  10,234  │  │   1,456  │  │   3,892  │  │ MAD 45.2K│   │
│  │  +12%    │  │   +8%    │  │   +15%   │  │   +23%   │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │            User Growth (Last 30 Days)                │   │
│  │  [Line Chart]                                        │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌────────────────────────┐  ┌─────────────────────────┐   │
│  │  Pending Approvals     │  │  Recent Activity        │   │
│  │  - 12 Listings         │  │  - User X registered    │   │
│  │  - 5 Reports           │  │  - Listing Y published  │   │
│  │  - 3 Verifications     │  │  - Booking Z completed  │   │
│  └────────────────────────┘  └─────────────────────────┘   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Pages

#### 1. Overview Dashboard
- Key metrics cards
- User growth chart
- Revenue chart
- Recent activity feed
- Quick actions (approve listings, view reports)

#### 2. User Management
- Searchable user table
- Filters: role, verified status, registration date
- Bulk actions: suspend, verify, delete
- User detail modal with activity history

#### 3. Listing Moderation
- Pending listings queue
- Listing details with images
- Approve/reject with notes
- Flag inappropriate content

#### 4. Content Moderation
- Reports queue (listings, users, messages)
- Investigation tools
- Action history
- Ban/warn users

#### 5. Analytics
- Platform-wide statistics
- User engagement metrics
- Listing performance
- Revenue analytics
- Conversion funnels

#### 6. System Settings
- Platform configuration
- Email templates
- Feature flags
- Terms & policies

---

## Development Roadmap

### Phase 1: MVP (Weeks 1-8) ✅ CURRENT

**Week 1-2: Setup & Authentication**
- ✅ Next.js project setup
- ✅ Supabase integration
- ✅ Authentication (email/password, OAuth)
- ✅ User profiles with roles
- ✅ Protected routes & middleware

**Week 3-4: Core Features**
- ✅ Listing creation (basic)
- ✅ Listing display
- ✅ Search & filters (basic)
- ⏳ Image upload
- ⏳ Listing management (owner)

**Week 5-6: Messaging & Bookings**
- ✅ Real-time chat interface
- ✅ Message history
- ✅ Conversation list
- ⏳ Booking requests
- ⏳ Booking approval flow

**Week 7-8: Polish & Deploy**
- ⏳ Responsive design
- ⏳ Error handling
- ⏳ Loading states
- ⏳ Basic admin panel
- ⏳ Deploy to Vercel

**MVP Deliverables:**
- Students can register and search properties
- Owners can list properties
- Basic messaging between students and owners
- Simple booking request system
- Admin can moderate listings

### Phase 2: Enhanced Features (Weeks 9-16)

**Week 9-10: Advanced Search**
- Map-based search
- Advanced filters
- Saved searches
- Email alerts for new listings
- Comparison feature

**Week 11-12: Payments Integration**
- Stripe integration
- Secure payment flow
- Deposit handling
- Refund system
- Invoice generation

**Week 13-14: Reviews & Ratings**
- Review submission
- Rating system (multiple categories)
- Owner responses
- Review moderation
- Trust badges

**Week 15-16: Mobile Optimization**
- PWA setup
- Mobile-optimized UI
- Touch gestures
- Offline support
- Push notifications

### Phase 3: Growth & Scale (Weeks 17-24)

**Week 17-18: Analytics & Insights**
- Owner analytics dashboard
- Property performance metrics
- Pricing recommendations
- Market insights

**Week 19-20: Advanced Admin**
- Comprehensive admin panel
- User analytics
- Fraud detection
- Automated moderation

**Week 21-22: Internationalization**
- Multi-language support
- Multiple currencies
- Regional settings
- Localized content

**Week 23-24: Performance & Scale**
- Caching strategy
- Image optimization
- Database optimization
- Load testing
- CDN setup

### Phase 4: Advanced Features (Weeks 25-32)

**Week 25-26: AI Features**
- AI-powered search
- Smart recommendations
- Automatic categorization
- Chatbot support

**Week 27-28: Community Features**
- Student forums
- University pages
- City guides
- Blog/articles

**Week 29-30: Video Features**
- Video tours
- Video calls for viewings
- Owner video profiles

**Week 31-32: Advanced Integrations**
- Calendar sync (Google/Outlook)
- Social media integration
- Third-party property sources
- University partnerships

### Ongoing Tasks

**Every Sprint:**
- Bug fixes
- User feedback implementation
- Performance monitoring
- Security updates
- Content moderation

**Monthly:**
- Feature prioritization
- User testing
- A/B testing
- Analytics review
- SEO optimization

---

## UI/UX Guidelines

### Design Principles

#### 1. Clarity
- Clear visual hierarchy
- Obvious call-to-action buttons
- Consistent terminology
- Progressive disclosure

#### 2. Simplicity
- Minimal cognitive load
- One primary action per screen
- Clean, uncluttered layouts
- Familiar patterns

#### 3. Trust
- Professional appearance
- Transparent pricing
- Clear policies
- Verified badges
- Secure checkout

#### 4. Responsiveness
- Fast page loads
- Instant feedback
- Optimistic UI updates
- Skeleton loaders

### Color Palette

```css
/* Primary Colors */
--primary: #2563eb;        /* Blue - Primary actions */
--primary-hover: #1d4ed8;  /* Darker blue for hover */

/* Semantic Colors */
--success: #10b981;        /* Green - Success states */
--warning: #f59e0b;        /* Orange - Warnings */
--error: #ef4444;          /* Red - Errors */
--info: #3b82f6;           /* Light blue - Info */

/* Neutral Colors */
--background: #ffffff;     /* White */
--foreground: #0f172a;     /* Almost black */
--muted: #f1f5f9;          /* Light gray */
--muted-foreground: #64748b; /* Gray text */
--border: #e2e8f0;         /* Gray borders */

/* Dark Mode */
--dark-background: #0f172a;
--dark-foreground: #f1f5f9;
```

### Typography

```css
/* Font Family */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Font Sizes */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */

/* Font Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### Spacing System

```css
/* Based on 4px units */
--space-1: 0.25rem;  /* 4px */
--space-2: 0.5rem;   /* 8px */
--space-3: 0.75rem;  /* 12px */
--space-4: 1rem;     /* 16px */
--space-6: 1.5rem;   /* 24px */
--space-8: 2rem;     /* 32px */
--space-12: 3rem;    /* 48px */
--space-16: 4rem;    /* 64px */
```

### Component Examples

#### Button Variants

```tsx
// Primary button
<Button variant="default">Book Now</Button>

// Secondary button
<Button variant="outline">Save to Favorites</Button>

// Destructive button
<Button variant="destructive">Delete Listing</Button>

// Ghost button
<Button variant="ghost">Cancel</Button>
```

#### Card Layout

```tsx
<Card>
  <CardHeader>
    <CardTitle>Property Title</CardTitle>
    <CardDescription>2-bed apartment in Paris</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
  <CardFooter>
    <Button>View Details</Button>
  </CardFooter>
</Card>
```

#### Form Design

```tsx
<Form>
  <FormField
    control={form.control}
    name="title"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Listing Title</FormLabel>
        <FormControl>
          <Input placeholder="Beautiful apartment..." {...field} />
        </FormControl>
        <FormDescription>
          Choose a catchy title for your property
        </FormDescription>
        <FormMessage />
      </FormItem>
    )}
  />
</Form>
```

### Responsive Breakpoints

```css
/* Tailwind breakpoints */
sm: 640px   /* Small devices (phones) */
md: 768px   /* Medium devices (tablets) */
lg: 1024px  /* Large devices (laptops) */
xl: 1280px  /* Extra large (desktops) */
2xl: 1536px /* 2X large (large desktops) */
```

### Accessibility Guidelines

#### 1. Keyboard Navigation
- All interactive elements must be keyboard accessible
- Logical tab order
- Visible focus indicators
- Skip links for main content

#### 2. Screen Readers
- Semantic HTML elements
- ARIA labels where needed
- Alt text for images
- Descriptive link text

#### 3. Color Contrast
- Minimum 4.5:1 for normal text
- Minimum 3:1 for large text
- Don't rely on color alone

#### 4. Forms
- Clear labels for all inputs
- Error messages associated with fields
- Success feedback
- Validation hints

### Loading States

```tsx
// Skeleton loader
<Skeleton className="h-4 w-full" />

// Spinner
<Loader2 className="h-4 w-4 animate-spin" />

// Progress bar
<Progress value={progress} />
```

### Empty States

```tsx
<div className="text-center py-12">
  <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
  <h3 className="text-lg font-semibold mb-2">No messages yet</h3>
  <p className="text-muted-foreground mb-4">
    Start a conversation with a property owner
  </p>
  <Button>Browse Listings</Button>
</div>
```

---

## Deployment Checklist

### Pre-Deploy

- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] All tests passing
- [ ] Security audit completed
- [ ] Performance testing done
- [ ] SEO metadata added
- [ ] Analytics integrated
- [ ] Error tracking setup (Sentry)
- [ ] Backup strategy in place

### Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Environment variables
# Set in Vercel dashboard or CLI
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
```

### Post-Deploy

- [ ] Test all critical user flows
- [ ] Verify payment processing
- [ ] Check email delivery
- [ ] Monitor error rates
- [ ] Review performance metrics
- [ ] Test on multiple devices/browsers
- [ ] Verify SEO indexing

---

## Success Metrics (KPIs)

### User Metrics
- Daily/Monthly Active Users (DAU/MAU)
- User retention rate
- User acquisition cost
- Time to first booking

### Platform Metrics
- Total listings
- Active listings percentage
- Booking conversion rate
- Average booking value
- Message response time

### Financial Metrics
- Monthly Recurring Revenue (MRR)
- Average revenue per user (ARPU)
- Platform fee revenue
- Cost per acquisition (CPA)

### Engagement Metrics
- Search-to-contact rate
- Contact-to-booking rate
- Average session duration
- Pages per session

---

## Conclusion

This architecture provides:
- ✅ **Scalable**: Can handle thousands of users
- ✅ **Secure**: Industry-standard security practices
- ✅ **Fast**: Optimized for performance
- ✅ **Maintainable**: Clean, documented code
- ✅ **Flexible**: Easy to add new features
- ✅ **Cost-effective**: Efficient use of resources

**Current Status:**
- **Frontend**: 80% complete (Next.js + Supabase)
- **Backend**: 30% complete (Supabase ready, Django optional)
- **Database**: 100% complete (Schema implemented)
- **Auth**: 100% complete (Role-based)
- **Messaging**: 80% complete (Real-time working)
- **Payments**: 0% (Next phase)

**Next Steps:**
1. Complete image upload functionality
2. Implement booking request flow
3. Add payment integration (Stripe)
4. Build admin moderation panel
5. Deploy MVP to production

---

**Document Version:** 1.0  
**Last Updated:** December 2024  
**Maintained By:** Development Team
