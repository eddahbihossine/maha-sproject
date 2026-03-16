# Django Backend Setup Guide

This guide will help you get the Django REST API backend running alongside your Next.js frontend.

## Quick Start

### 1. Choose Your Backend

You can use either:
- **Supabase** (default) - Cloud PostgreSQL with built-in auth
- **Django REST API** - Self-hosted with more control

To switch to Django, add to `.env.local`:
```bash
NEXT_PUBLIC_USE_DJANGO_BACKEND=true
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### 2. Set Up Django Database

```bash
cd backend

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser (admin)
python manage.py createsuperuser
```

### 3. Create Sample Data

```bash
# Option 1: Django Admin (Recommended)
python manage.py runserver
# Visit http://localhost:8000/admin
# Login with superuser credentials
# Add listings, users, etc.

# Option 2: Django Shell
python manage.py shell
```

In the shell:
```python
from users.models import User
from listings.models import Listing, ListingImage

# Create owner
owner = User.objects.create_user(
    email='owner@example.com',
    password='password123',
    first_name='John',
    last_name='Doe',
    role='owner'
)

# Create listing
listing = Listing.objects.create(
    owner=owner,
    title='Modern Studio near University',
    description='Beautiful studio apartment',
    address='123 Main St',
    city='Brussels',
    postal_code='1000',
    property_type='studio',
    rent_monthly=800,
    deposit=1600,
    num_bedrooms=1,
    num_bathrooms=1,
    surface_area=45,
    furnished=True,
    utilities_included=True,
    status='active',
    featured=True
)

# Add images
ListingImage.objects.create(
    listing=listing,
    image_url='https://placehold.co/600x400',
    is_primary=True,
    order=0
)
```

### 4. Start Django Server

```bash
cd backend
python manage.py runserver
```

The API will be available at: http://localhost:8000/api/

### 5. Start Next.js Frontend

```bash
# In root directory
pnpm install
pnpm dev
```

Visit: http://localhost:3000

## API Endpoints

### Listings
- `GET /api/listings/` - List all listings (with filters)
- `GET /api/listings/{id}/` - Get single listing
- `POST /api/listings/` - Create listing (requires auth)
- `PATCH /api/listings/{id}/` - Update listing (requires auth)
- `DELETE /api/listings/{id}/` - Delete listing (requires auth)
- `GET /api/listings/featured/` - Get featured listings
- `GET /api/listings/my_listings/` - Get current user's listings (requires auth)
- `POST /api/listings/{id}/increment_views/` - Increment view count

### Query Parameters (Filtering)
- `city` - Filter by city
- `property_type` - studio, apartment, house, etc.
- `min_price` / `max_price` - Price range
- `bedrooms` - Minimum bedrooms
- `min_surface` / `max_surface` - Surface area range
- `furnished` - true/false
- `search` - Search in title, description, city, address

### Examples
```bash
# Get all listings
curl http://localhost:8000/api/listings/

# Get listings in Brussels
curl http://localhost:8000/api/listings/?city=Brussels

# Get studios under 900 MAD
curl http://localhost:8000/api/listings/?property_type=studio&max_price=900

# Search for "university"
curl http://localhost:8000/api/listings/?search=university

# Get featured listings
curl http://localhost:8000/api/listings/featured/
```

## Authentication

Django uses JWT tokens for authentication. To create and use tokens:

```bash
# Get access token
curl -X POST http://localhost:8000/api/token/ \
  -H "Content-Type: application/json" \
  -d '{"email":"owner@example.com","password":"password123"}'

# Use token in requests
curl http://localhost:8000/api/listings/my_listings/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Database Configuration

Django is configured to use PostgreSQL by default. Update `backend/.env`:

```env
# Django
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# Database (PostgreSQL)
DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# Or use SQLite for development
# (Django will use SQLite if DATABASE_URL is not set)
```

## Troubleshooting

### CORS Errors
Make sure Django is running and CORS is configured in `backend/config/settings.py`:
```python
CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
]
```

### Module Not Found
Install missing dependencies:
```bash
cd backend
pip install -r requirements.txt
```

### Database Errors
```bash
# Reset database
cd backend
rm db.sqlite3  # if using SQLite
python manage.py migrate
python manage.py createsuperuser
```

### Frontend Not Connecting
1. Check `.env.local` has correct settings
2. Verify Django server is running on port 8000
3. Check browser console for errors
4. Verify NEXT_PUBLIC_USE_DJANGO_BACKEND=true

## Switching Between Backends

### Use Supabase
In `.env.local`:
```bash
# Remove or comment out Django settings
# NEXT_PUBLIC_USE_DJANGO_BACKEND=true

# Keep Supabase settings
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Use Django
In `.env.local`:
```bash
# Add Django settings
NEXT_PUBLIC_USE_DJANGO_BACKEND=true
NEXT_PUBLIC_API_URL=http://localhost:8000/api

# Keep Supabase settings (for auth)
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Production Deployment

### Django
1. Set `DEBUG=False` in production
2. Configure proper `SECRET_KEY`
3. Set `ALLOWED_HOSTS` to your domain
4. Use production database (PostgreSQL)
5. Collect static files: `python manage.py collectstatic`
6. Use gunicorn or similar WSGI server

### Next.js
1. Update `NEXT_PUBLIC_API_URL` to production Django URL
2. Keep `NEXT_PUBLIC_USE_DJANGO_BACKEND=true`
3. Build: `pnpm build`
4. Deploy to Vercel, Railway, or similar

## Benefits of Each Backend

### Supabase
✅ Built-in authentication
✅ Real-time subscriptions
✅ Automatic REST API
✅ Easy to set up
✅ Great for rapid prototyping

### Django
✅ Full control over API
✅ Custom business logic
✅ Better for complex operations
✅ Self-hosted option
✅ Powerful admin interface
✅ Better for large teams

## Need Help?

Check the logs:
- Django: Terminal where `python manage.py runserver` is running
- Next.js: Terminal where `pnpm dev` is running
- Browser: Open DevTools Console (F12)

Common issues are usually:
1. Server not running
2. Wrong port numbers
3. CORS configuration
4. Missing environment variables
5. Database not migrated
