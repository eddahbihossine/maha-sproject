# Student Accommodation Platform - Complete Setup Guide

## 🎉 Your platform is ready! Follow these steps to get started:

## Architecture Overview

**Frontend (Next.js)**: 
- Login/Register pages created
- Supabase authentication integrated
- Protected routes with middleware

**Backend (Django REST API)**:
- User, Listing, and Booking models
- SQLite database (easy to switch to PostgreSQL/Supabase)
- Ready for REST API endpoints

**Authentication**: Supabase Auth (can work with or without Django API)

## Quick Start

### 1. Set Up Supabase (5 minutes)

1. Go to [supabase.com](https://supabase.com) and create a free project
2. Once created, go to Project Settings → API
3. Copy your `Project URL` and `anon public` key
4. Update both `.env.local` files:

**Frontend (.env.local)**:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

**Backend (backend/.env)**:
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key-here
SECRET_KEY=django-secret-key-change-in-production
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

### 2. Enable Email Auth in Supabase

1. In Supabase Dashboard → Authentication → Providers
2. Enable "Email" provider
3. (Optional) Configure email templates
4. (Optional) Enable Google OAuth for social login

### 3. Start the Servers

**Terminal 1 - Next.js Frontend**:
```bash
cd /Users/macair/Downloads/student-accommodation-platform
pnpm dev
```

**Terminal 2 - Django Backend** (optional for now):
```bash
cd /Users/macair/Downloads/student-accommodation-platform/backend
source venv/bin/activate
python manage.py runserver
```

### 4. Test the Application

1. Open http://localhost:3000
2. Click "Sign up" to create an account
3. Register as either a Student or Property Owner
4. Check your email for confirmation (if email confirmation is enabled)
5. Log in with your credentials
6. You should see the homepage with your user session

## Current Features ✅

### Authentication
- ✅ User registration (student/owner roles)
- ✅ Email/password login
- ✅ Google OAuth ready (needs Supabase config)
- ✅ Protected routes (/owner, /admin, /messages)
- ✅ Session management
- ✅ Auto-redirect after login

### Frontend Pages
- ✅ Homepage with search
- ✅ Login page
- ✅ Registration page
- ✅ Listings pages
- ✅ Owner dashboard structure
- ✅ Messages structure
- ✅ Admin panel structure

### Backend (Django)
- ✅ Custom User model
- ✅ Listings model with images and reviews
- ✅ Bookings model
- ✅ Messages model
- ✅ Database migrations applied
- ✅ REST Framework configured
- ✅ CORS configured for frontend

## Next Steps 🚀

### Immediate (To make it fully functional):

1. **Update Header Component** with real authentication:
   - Show logged-in user info
   - Add logout functionality
   - Role-based navigation

2. **Create API Endpoints** in Django:
   - Listings CRUD
   - User profile
   - Bookings management

3. **Connect Frontend to Backend**:
   - Replace mock data with API calls
   - Implement listing creation/editing
   - Add booking functionality

### Soon:

4. **Image Upload**:
   - Supabase Storage for listing images
   - Profile avatar uploads

5. **Real-time Features**:
   - Supabase Realtime for messaging
   - Booking notifications

6. **Payment Integration**:
   - Stripe for deposits/rent
   - Booking confirmation flow

## File Structure

```
student-accommodation-platform/
├── app/                          # Next.js pages
│   ├── login/page.tsx           # ✅ Login page
│   ├── register/page.tsx        # ✅ Register page
│   ├── auth/callback/           # ✅ OAuth callback
│   ├── listings/                # Listings pages
│   ├── owner/                   # Owner dashboard
│   └── messages/                # Messaging
├── lib/
│   ├── supabase/                # ✅ Supabase clients
│   │   ├── client.ts           # Browser client
│   │   ├── server.ts           # Server client
│   │   └── middleware.ts       # Auth middleware
│   └── auth/
│       └── AuthProvider.tsx     # ✅ Auth context
├── middleware.ts                # ✅ Route protection
├── backend/                     # Django backend
│   ├── users/                   # ✅ User models
│   ├── listings/                # ✅ Listing models
│   ├── bookings/                # ✅ Booking models
│   ├── config/                  # ✅ Django settings
│   └── manage.py                # Django management
└── .env.local                   # ✅ Environment variables
```

## Troubleshooting

### "Invalid login credentials" error
- Make sure you've confirmed your email
- Check that Supabase email provider is enabled
- Verify your credentials are correct

### "CORS error" when calling API
- Make sure Django backend is running
- Check CORS_ALLOWED_ORIGINS in backend/.env
- Verify NEXT_PUBLIC_API_URL in frontend .env.local

### Can't see user after login
- Check browser console for errors
- Verify Supabase configuration
- Check middleware.ts is working (console.log the user)

## Resources

- [Supabase Docs](https://supabase.com/docs)
- [Next.js Auth Docs](https://nextjs.org/docs/authentication)
- [Django REST Framework](https://www.django-rest-framework.org/)

## Support

Need help? Check:
1. Browser console for frontend errors
2. Django terminal for backend errors
3. Supabase Dashboard → Logs for auth issues

---

**You're all set! 🎊** 

Start by setting up your Supabase credentials and test the login flow!
