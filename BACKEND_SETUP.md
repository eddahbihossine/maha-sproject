# Backend Setup Guide - Django

## Overview
The student accommodation platform now uses a Django REST Framework backend that all students can access to view listings and chat with owners.

## Features
- ✅ All students can view active listings
- ✅ Students can send messages to owners
- ✅ Owners can manage their listings and respond to students
- ✅ JWT authentication with token refresh
- ✅ Full CRUD operations on bookings and messages
- ✅ Role-based access control

## Quick Start

### 1. Install Backend Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. Run Migrations
```bash
python manage.py migrate
```

### 3. Create Admin User (Optional)
```bash
python manage.py createsuperuser
```

### 4. Start Development Server
```bash
python manage.py runserver 8000
```

The API will be available at `http://localhost:8000/api`

## API Endpoints

### Authentication (`/api/users/auth/`)
- `POST /register/` - Register new user
- `POST /login/` - Login user
- `POST /logout/` - Logout user
- `POST /token/` - Get JWT tokens
- `POST /token/refresh/` - Refresh access token

### Users (`/api/users/users/`)
- `GET /me/` - Get current user profile
- `PATCH /update_profile/` - Update user profile
- `POST /change_password/` - Change password
- `GET /` - List users (owners only for students)

### Listings (`/api/listings/listings/`)
- `GET /` - List all active listings (with filtering & search)
- `GET /{id}/` - Get listing details
- `POST /` - Create new listing (owners only)
- `PATCH /{id}/` - Update listing (owner only)
- `DELETE /{id}/` - Delete listing (owner only)
- `GET /featured/` - Get featured listings
- `GET /my_listings/` - Get current user's listings (owners only)
- `POST /{id}/increment_views/` - Increment view count

### Messages (`/api/bookings/messages/`)
- `GET /` - Get messages (filtered by user or listing)
- `POST /` - Send new message
- `GET /conversations/` - Get all conversation threads
- `GET /unread_count/` - Get unread message count
- `POST /{id}/mark_as_read/` - Mark message as read
- `POST /mark_conversation_as_read/` - Mark all messages in conversation as read

### Bookings (`/api/bookings/bookings/`)
- `GET /` - Get all bookings (filtered by role)
- `GET /{id}/` - Get booking details
- `POST /` - Create new booking (students only)
- `POST /{id}/accept/` - Accept booking (owners only)
- `POST /{id}/reject/` - Reject booking (owners only)
- `POST /{id}/cancel/` - Cancel booking (students only)

## Frontend Integration

### Environment Setup
Create `.env.local` in the Next.js root:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### Using the API Client
```typescript
import { authApi, listingsApi, messagesApi, bookingsApi } from '@/lib/api';

// Register
await authApi.register({
  username: 'student1',
  email: 'student@example.com',
  password: 'securepass',
  password2: 'securepass',
  first_name: 'John',
  last_name: 'Doe',
  role: 'student',
  university: 'University Name'
});

// Get listings
const { data: listings } = await listingsApi.getListings({
  city: 'Paris',
  min_price: 500,
  max_price: 1500
});

// Send message
await messagesApi.sendMessage({
  recipient: ownerUserId,
  content: 'Hi, interested in this listing',
  listing: listingId
});

// Get conversations
const { data: conversations } = await messagesApi.getConversations();
```

## Database Models

### User Model
Extends Django AbstractUser with:
- `role`: student | owner | admin
- `verification_status`: pending | verified | rejected
- `avatar_url`: Optional profile picture
- Student fields: `university`, `study_program`, `budget_min/max`
- Owner fields: `company_name`, `total_listings`, `avg_rating`

### Listing Model
- Property details: type, bedrooms, bathrooms, surface area
- Pricing: rent, charges, deposit, agency fees
- Location: address, city, postal code, coordinates
- Features: amenities, transport, universities
- Rules: smoking, pets, couples, parties allowed
- Metrics: views, favorites, ratings

### Message Model
- Bidirectional messaging between users
- Associated with listing or booking (optional)
- Read status tracking with timestamps

### Booking Model
- Student request to rent a property
- Status tracking: pending → accepted/rejected/cancelled → completed
- Pricing details and deposit tracking
- Student messages and owner responses

## Authentication Flow

1. **Register** → Get JWT tokens
2. **Login** → Get JWT tokens (access + refresh)
3. **API Requests** → Include token in Authorization header
4. **Token Refresh** → When access token expires, use refresh token
5. **Logout** → Token is blacklisted

## Permissions & Access Control

| Action | Student | Owner | Admin |
|--------|---------|-------|-------|
| View active listings | ✅ | ✅ | ✅ |
| Create listing | ❌ | ✅ | ✅ |
| Edit own listing | ❌ | ✅ | ✅ |
| Create booking | ✅ | ❌ | ✅ |
| Accept/reject booking | ❌ | ✅ | ✅ |
| Send message | ✅ | ✅ | ✅ |
| View own messages | ✅ | ✅ | ✅ |

## Filtering & Searching

### List Listings with Filters
```
GET /api/listings/listings/?city=Paris&min_price=500&max_price=1500&bedrooms=2&furnished=true&property_type=apartment
```

Query Parameters:
- `city`: Filter by city
- `property_type`: studio | apartment | room | shared | residence
- `furnished`: true | false
- `min_price`, `max_price`: Price range
- `bedrooms`: Minimum bedrooms
- `min_surface`, `max_surface`: Surface area range
- `search`: Full-text search
- `ordering`: -created_at | rent_monthly | surface_area
- `page`: Page number (default: 1)

## Error Handling

All API responses follow this format:
```typescript
{
  status: number;
  data?: T;
  error?: {
    error: string;
    details?: Record<string, string[]>;
  };
}
```

Common Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad request (validation errors)
- `401` - Unauthorized
- `403` - Forbidden (permission denied)
- `404` - Not found
- `500` - Server error

## Development Tips

### Test Endpoints with cURL
```bash
# Login
curl -X POST http://localhost:8000/api/users/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"student1","password":"pass"}'

# List listings
curl http://localhost:8000/api/listings/listings/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Django Admin Panel
Access at `http://localhost:8000/admin/` with superuser credentials.

### View API Documentation
```bash
# Install drf-spectacular (optional)
pip install drf-spectacular
```

## Production Deployment

1. Update `settings.py`:
   - Set `DEBUG = False`
   - Update `ALLOWED_HOSTS`
   - Set `SECRET_KEY` from environment

2. Update CORS settings in `settings.py`:
   ```python
   CORS_ALLOWED_ORIGINS = ['https://yourdomain.com']
   ```

3. Run migrations on production database

4. Collect static files:
   ```bash
   python manage.py collectstatic
   ```

5. Use production WSGI server (Gunicorn, uWSGI, etc.)

## Troubleshooting

### Port already in use
```bash
lsof -i :8000
kill -9 <PID>
```

### Database errors
```bash
python manage.py migrate --fake-initial
python manage.py migrate
```

### Permission denied errors
Check user role and ensure endpoints match permissions.

## Support

For issues or questions, check the logs:
```bash
python manage.py runserver 8000 --verbosity 2
```
