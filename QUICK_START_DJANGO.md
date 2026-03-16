# Quick Start - Django Backend & Frontend Integration

## 🚀 Start Everything

### Terminal 1: Start Backend
```bash
cd backend
python manage.py runserver 8000
```
✅ Backend ready at: `http://localhost:8000/api`

### Terminal 2: Start Frontend
```bash
pnpm dev
```
✅ Frontend ready at: `http://localhost:3000`

## 🔧 Setup Before First Run

### 1. Backend Setup (One-time)
```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser  # Optional: for admin access
```

### 2. Frontend Setup (One-time)
```bash
# Create .env.local in project root
echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api" > .env.local
```

## 📱 Test the Integration

### 1. Register a User
```typescript
import { authApi } from '@/lib/api';

const result = await authApi.register({
  username: 'student1',
  email: 'student@example.com',
  password: 'TestPass123!',
  password2: 'TestPass123!',
  first_name: 'John',
  last_name: 'Doe',
  role: 'student',
  university: 'University of Paris'
});

if (result.data) {
  console.log('✅ Registration successful!');
  console.log('Token:', result.data.tokens.access);
}
```

### 2. Get Listings
```typescript
import { listingsApi } from '@/lib/api';

const result = await listingsApi.getListings({
  city: 'Paris',
  min_price: 500,
  max_price: 1500
});

if (result.data) {
  console.log('✅ Listings loaded:', result.data.results.length);
}
```

### 3. Send a Message
```typescript
import { messagesApi } from '@/lib/api';

const result = await messagesApi.sendMessage({
  recipient: 2,  // Owner user ID
  content: 'Hi, I\'m interested in your listing!',
  listing: 1     // Listing ID (optional)
});

if (result.data) {
  console.log('✅ Message sent!');
}
```

### 4. Get Conversations
```typescript
import { messagesApi } from '@/lib/api';

const result = await messagesApi.getConversations();

if (result.data) {
  console.log('✅ Conversations:', result.data);
}
```

## 🎯 Key Endpoints

| Feature | Endpoint | Method |
|---------|----------|--------|
| Register | `/users/auth/register/` | POST |
| Login | `/users/auth/login/` | POST |
| Get Listings | `/listings/listings/` | GET |
| Get Listing Detail | `/listings/listings/{id}/` | GET |
| Send Message | `/bookings/messages/` | POST |
| Get Conversations | `/bookings/messages/conversations/` | GET |
| Create Booking | `/bookings/bookings/` | POST |
| Accept Booking | `/bookings/bookings/{id}/accept/` | POST |

## 💾 Database Admin

Access Django Admin Panel:
- URL: `http://localhost:8000/admin/`
- Username: (from `createsuperuser`)
- Password: (from `createsuperuser`)

## 🧪 Test with cURL

```bash
# 1. Login
curl -X POST http://localhost:8000/api/users/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "student1",
    "password": "TestPass123!"
  }'

# Save the access token from response

# 2. Get listings (no auth needed)
curl http://localhost:8000/api/listings/listings/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# 3. Send message (requires auth)
curl -X POST http://localhost:8000/api/bookings/messages/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "recipient": 2,
    "content": "Hi there!",
    "listing": 1
  }'
```

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check if port 8000 is in use
lsof -i :8000

# If in use, kill the process
kill -9 <PID>

# Try again
python manage.py runserver 8000
```

### Frontend can't reach backend
- Check `.env.local` has correct API URL
- Verify backend is running on port 8000
- Check CORS is enabled in settings.py

### Database errors
```bash
# Reset migrations
python manage.py migrate zero
python manage.py migrate

# Or fresh start
rm db.sqlite3
python manage.py migrate
```

### Token expired
- Refresh token automatically in API client
- Or re-login to get new tokens

## 📚 Full Documentation

- **Backend Setup**: See `BACKEND_SETUP.md`
- **Implementation Details**: See `IMPLEMENTATION_CHECKLIST.md`
- **API Endpoints**: See `BACKEND_SETUP.md#api-endpoints`
- **Frontend Clients**: See `lib/api/`

## ✨ What's Working

### Students Can
- ✅ View all active listings without login
- ✅ Register and login
- ✅ Search and filter listings
- ✅ View listing details
- ✅ Send messages to owners
- ✅ View conversations
- ✅ Create booking requests

### Owners Can
- ✅ Register and login
- ✅ Create listings
- ✅ Edit/delete their listings
- ✅ Receive messages from students
- ✅ Accept/reject booking requests
- ✅ Respond with messages

## 🎓 Integration Example

```typescript
// In a Next.js page or component
'use client';
import { useEffect, useState } from 'react';
import { listingsApi } from '@/lib/api';

export default function ListingsPage() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchListings = async () => {
      const result = await listingsApi.getListings({
        city: 'Paris',
        min_price: 500,
        max_price: 2000
      });

      if (result.data) {
        setListings(result.data.results);
      }
      setLoading(false);
    };

    fetchListings();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Listings</h1>
      {listings.map(listing => (
        <div key={listing.id}>
          <h2>{listing.title}</h2>
          <p>{listing.address}, {listing.city}</p>
          <p>MAD {listing.rent_monthly}/month</p>
        </div>
      ))}
    </div>
  );
}
```

## 🔄 Authentication Flow

```
1. User visits login page
   ↓
2. Enters credentials
   ↓
3. Call authApi.login()
   ↓
4. Backend validates and returns JWT tokens
   ↓
5. Tokens stored in localStorage
   ↓
6. All subsequent requests include token in header
   ↓
7. API client handles token refresh automatically
   ↓
8. User can now access protected endpoints
```

## 📊 Project Structure

```
backend/
├── config/          # Django project settings
├── users/           # User management
├── listings/        # Listings management
├── bookings/        # Messages and bookings
└── manage.py        # Django management

lib/
├── api/
│   ├── client.ts    # Base API client
│   ├── auth.ts      # Authentication
│   ├── listings.ts  # Listings API
│   ├── bookings.ts  # Messages & Bookings
│   └── index.ts     # Exports
└── types.ts         # TypeScript types
```

## 🎉 You're Ready!

Everything is set up and ready to use:
1. Start backend (`python manage.py runserver 8000`)
2. Start frontend (`pnpm dev`)
3. Visit `http://localhost:3000`
4. Register as a student
5. View listings and chat with owners!

---
**Status**: ✅ Complete and ready for use
**Last Updated**: February 2, 2026
