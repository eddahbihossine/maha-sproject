# 🧪 Authentication Testing Guide

## Quick Setup (5 Minutes)

### 1. Update Environment Variables

Replace the placeholder values in `.env.local`:

```bash
# Before (current)
NEXT_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=placeholder-anon-key

# After (your real values from Supabase dashboard)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key
```

### 2. Set Up Supabase Database

1. Go to your Supabase project → SQL Editor
2. Copy the contents of `supabase-schema.sql`
3. Paste and run in SQL Editor
4. Wait for "Success" message

### 3. Configure Auth Settings

1. Go to Authentication → Settings
2. **Disable email confirmation** (for faster testing):
   - Scroll to "Email Confirmations"
   - Uncheck "Enable email confirmations"
3. Save changes

### 4. Restart Dev Server

```bash
# Stop the server (Ctrl+C if running)
# Start again
pnpm dev
```

## 🎯 Test Scenarios

### Test 1: Register New Student

1. **Navigate** to http://localhost:3000/register
2. **Fill in**:
   - First Name: John
   - Last Name: Doe
   - Email: john@student.com
   - Password: password123
   - Role: **Student** ←
3. **Click** "Sign up"
4. **Expected Result**:
   - ✅ Redirected to homepage (/)
   - ✅ See user avatar in header (initials "JD")
   - ✅ Click avatar → see "John Doe" and email
   - ✅ See "Favorites", "Messages", "My Bookings" in menu

### Test 2: Register New Owner

1. **Navigate** to http://localhost:3000/register
2. **Fill in**:
   - First Name: Jane
   - Last Name: Smith
   - Email: jane@owner.com
   - Password: password123
   - Role: **Owner** ←
3. **Click** "Sign up"
4. **Expected Result**:
   - ✅ Redirected to `/owner/dashboard`
   - ✅ See user avatar in header (initials "JS")
   - ✅ Click avatar → see "Jane Smith" and email
   - ✅ See "Dashboard", "My Listings", "Add Listing" in menu

### Test 3: Login Existing User

1. **Logout** if currently logged in (click avatar → Log out)
2. **Navigate** to http://localhost:3000/login
3. **Fill in**:
   - Email: john@student.com
   - Password: password123
4. **Click** "Sign in"
5. **Expected Result**:
   - ✅ Redirected to homepage (student) or dashboard (owner)
   - ✅ See logged-in state in header

### Test 4: Protected Routes

**Test 4a: Messages (any authenticated user)**
1. **Logout** if logged in
2. **Navigate** to http://localhost:3000/messages
3. **Expected Result**:
   - ✅ Redirected to `/login?redirectTo=/messages`
4. **Login** with any user
5. **Expected Result**:
   - ✅ Redirected back to `/messages`

**Test 4b: Owner Dashboard (owner only)**
1. **Login as student** (john@student.com)
2. **Navigate** to http://localhost:3000/owner/dashboard
3. **Expected Result**:
   - ✅ Redirected to homepage (/)
4. **Logout** and **login as owner** (jane@owner.com)
5. **Navigate** to http://localhost:3000/owner/dashboard
6. **Expected Result**:
   - ✅ Can access dashboard

### Test 5: Logout

1. **Login** with any user
2. **Click** avatar in header
3. **Click** "Log out"
4. **Expected Result**:
   - ✅ Avatar disappears
   - ✅ Header shows "Log in" and "Sign up" buttons
   - ✅ Redirected to homepage
   - ✅ Cannot access protected routes anymore

### Test 6: Role-Based Menu Items

**As Student:**
- ✅ Should see: Search, Favorites, Messages, My Bookings
- ❌ Should NOT see: Dashboard, Add Listing, Admin Panel

**As Owner:**
- ✅ Should see: Search, Messages, Dashboard, Add Listing, My Listings
- ❌ Should NOT see: Favorites, My Bookings, Admin Panel

**As Admin (requires manual setup):**
- ✅ Should see: Admin Panel, all other features

## 🐛 Common Issues

### Issue: "Invalid supabaseUrl" Error

**Cause**: Environment variables not set correctly

**Fix**:
1. Check `.env.local` has real values (not placeholders)
2. Restart dev server with `pnpm dev`

### Issue: User Not Logged In After Registration

**Cause**: Email confirmation is enabled

**Fix**:
1. Go to Supabase → Authentication → Settings
2. Disable "Enable email confirmations"
3. Try registering again

### Issue: Can't See User Name in Header

**Cause**: User metadata not saved during registration

**Fix**:
1. Check Supabase → Authentication → Users
2. Click on user → View user metadata
3. Should see: `first_name`, `last_name`, `role`

### Issue: Role-Based Redirect Not Working

**Cause**: Role not saved in user metadata

**Fix**:
1. Delete the user in Supabase dashboard
2. Register again (make sure role is selected)
3. Verify metadata includes role field

### Issue: Middleware Redirect Loop

**Cause**: Protected path configuration

**Fix**:
1. Open `lib/supabase/middleware.ts`
2. Verify `/login` and `/register` are NOT in `protectedPaths`
3. Restart server

## ✅ Success Checklist

After testing, you should be able to:

- [ ] Register a new student user
- [ ] Register a new owner user
- [ ] Login with email and password
- [ ] See correct user name in header
- [ ] See role-appropriate menu items
- [ ] Access protected routes when logged in
- [ ] Get redirected from protected routes when logged out
- [ ] Get redirected from owner/admin routes with wrong role
- [ ] Logout successfully
- [ ] Re-login and session persists

## 🎓 Creating Admin User

Admins cannot register through the UI. To create an admin:

**Option 1: SQL (Recommended)**
```sql
-- In Supabase SQL Editor
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  raw_user_meta_data,
  '{role}',
  '"admin"'
)
WHERE email = 'admin@example.com';
```

**Option 2: Manual Update**
1. Register a new user
2. Go to Supabase → Authentication → Users
3. Click on the user
4. Edit user metadata
5. Add: `"role": "admin"`
6. Save
7. Logout and login again

## 📊 Test Results Template

Copy this and fill in as you test:

```
Date: _______________
Tester: _______________

✅ = Pass | ❌ = Fail | ⏭️ = Skip

[ ] Test 1: Register Student
[ ] Test 2: Register Owner
[ ] Test 3: Login
[ ] Test 4a: Protected Routes (Messages)
[ ] Test 4b: Owner Dashboard Access Control
[ ] Test 5: Logout
[ ] Test 6: Role-Based Menu (Student)
[ ] Test 6: Role-Based Menu (Owner)

Notes:
_______________________________________
_______________________________________
_______________________________________
```

## 🚀 Next: Test Backend Integration

Once auth is working:

1. Start Django backend: `cd backend && python manage.py runserver`
2. Create API endpoints for listings, bookings
3. Call Django API from Next.js pages
4. Pass Supabase JWT in Authorization header

---

**All tests passing?** 🎉 Your authentication system is working perfectly!

Need help? Check `AUTHENTICATION_GUIDE.md` for detailed documentation.
