# 🚀 Quick Reference Card

## Essential Commands

### Start Development
```bash
# Frontend only (Supabase Auth)
pnpm dev

# With Django Backend
Terminal 1: pnpm dev
Terminal 2: cd backend && source venv/bin/activate && python manage.py runserver
```

### Access Points
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/api
- **Django Admin**: http://localhost:8000/admin

## Key Files to Configure

### 1. `.env.local` (Frontend)
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI...
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### 2. `backend/.env` (Backend - Optional)
```env
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI...
SECRET_KEY=your-secret-key
DEBUG=True
```

## Supabase Setup Steps

1. **Create Project**: [supabase.com/dashboard](https://supabase.com/dashboard)
2. **Get Credentials**: Settings → API
3. **Enable Auth**: Authentication → Providers → Enable Email
4. **Optional**: Enable Google OAuth

## Test the Login Flow

1. Start: `pnpm dev`
2. Go to: http://localhost:3000
3. Click: "Sign up"
4. Register: Choose role (student/owner)
5. Confirm email (check inbox)
6. Login: Use credentials
7. Success: See homepage logged in

## File Structure (Simplified)

```
📁 app/
  ├── login/page.tsx          ← Login page
  ├── register/page.tsx       ← Register page
  └── auth/callback/route.ts  ← OAuth callback

📁 lib/
  ├── supabase/
  │   ├── client.ts           ← Browser client
  │   ├── server.ts           ← Server client
  │   └── middleware.ts       ← Auth logic
  └── auth/
      └── AuthProvider.tsx    ← Auth context

📄 middleware.ts              ← Protects routes

📁 backend/
  ├── users/models.py         ← User model
  ├── listings/models.py      ← Listings model
  └── bookings/models.py      ← Bookings model
```

## Common Issues & Fixes

### "Invalid login credentials"
- ✅ Check Supabase email provider is enabled
- ✅ Confirm email if required
- ✅ Verify credentials are correct

### "CORS Error"
- ✅ Check backend is running
- ✅ Verify CORS_ALLOWED_ORIGINS in backend/.env
- ✅ Restart both servers

### "Supabase client error"
- ✅ Check .env.local has correct values
- ✅ Restart Next.js dev server
- ✅ Clear browser cache

### Can't access /owner or /admin pages
- ✅ Make sure you're logged in
- ✅ Check user role in Supabase dashboard
- ✅ Verify middleware.ts is working

## Next Development Steps

### Phase 1: Basic Functionality
- [ ] Update Header to show user info
- [ ] Add logout functionality
- [ ] Test protected routes

### Phase 2: Listings
- [ ] Create API endpoints in Django
- [ ] Connect frontend to API
- [ ] Implement listing creation

### Phase 3: Bookings
- [ ] Booking request flow
- [ ] Owner approval system
- [ ] Status updates

### Phase 4: Advanced
- [ ] Real-time messaging
- [ ] File uploads (Supabase Storage)
- [ ] Payment integration

## Useful URLs

- **Supabase Dashboard**: https://supabase.com/dashboard
- **Next.js Docs**: https://nextjs.org/docs
- **Django REST Docs**: https://www.django-rest-framework.org/
- **shadcn/ui Components**: https://ui.shadcn.com/

## Support Commands

```bash
# Check setup
./check-setup.sh

# Reset database (Django)
cd backend
rm db.sqlite3
python manage.py migrate

# Clear Next.js cache
rm -rf .next
pnpm dev

# Reinstall dependencies
rm -rf node_modules
pnpm install
```

## Environment Checklist

- [x] Node.js 18+ installed
- [x] pnpm installed
- [x] Python 3.9+ installed
- [ ] Supabase project created
- [ ] .env.local configured
- [ ] Email confirmed in Supabase
- [ ] pnpm dev running

---

**Pro Tip**: Keep this file open while developing! 📌
