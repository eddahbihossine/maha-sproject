# 🚀 Quick Start - Get Auth Working in 5 Minutes

## Prerequisites
✅ Dev server should be running (`pnpm dev`)  
✅ You need a Supabase account (free)

---

## Step 1: Create Supabase Project (2 mins)

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **"New Project"**
3. Fill in:
   - **Name**: student-accommodation
   - **Database Password**: [Generate strong password]
   - **Region**: Choose closest to you
4. Click **"Create new project"**
5. ⏳ Wait 2 minutes for database to initialize

---

## Step 2: Get Credentials (1 min)

1. In your Supabase project dashboard
2. Click ⚙️ **Settings** (bottom left)
3. Click **API** in the sidebar
4. Copy these two values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (the long string under "Project API keys")

---

## Step 3: Update Environment Variables (1 min)

1. Open `.env.local` in your project root
2. Replace the placeholder values:

```bash
# Before
NEXT_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=placeholder-anon-key

# After (use YOUR values from Step 2)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

3. **Save the file**

---

## Step 4: Set Up Database (1 min)

1. In Supabase dashboard, click 🔨 **SQL Editor** (left sidebar)
2. Click **"New query"**
3. Open `supabase-schema.sql` from your project
4. Copy ALL the SQL code
5. Paste into Supabase SQL Editor
6. Click **▶️ Run**
7. Wait for "Success. No rows returned" message

---

## Step 5: Configure Auth Settings (30 seconds)

1. In Supabase, click 🔐 **Authentication** (left sidebar)
2. Click **Settings** under Authentication
3. Scroll to **"Email Confirmations"**
4. **Uncheck** ☐ "Enable email confirmations" (for faster testing)
5. Click **Save**

---

## Step 6: Restart Dev Server (30 seconds)

```bash
# In your terminal, press Ctrl+C to stop
# Then restart:
pnpm dev
```

---

## Step 7: Test It! (Let's Go! 🎉)

### Register Your First User

1. Go to http://localhost:3000/register
2. Fill in the form:
   ```
   First Name: John
   Last Name: Doe
   Email: john@example.com
   Password: password123
   Role: Student ← (Select this)
   ```
3. Click **"Sign up"**
4. ✅ You should be redirected to the homepage
5. ✅ See your avatar "JD" in the top right

### Check Your Profile

1. Click the **avatar** (JD) in top right
2. You should see:
   - ✅ Name: "John Doe"
   - ✅ Email: "john@example.com"
   - ✅ Menu items: Favorites, Messages, My Bookings
   - ✅ Logout button

### Test Protected Routes

1. Click **"Messages"** in the header
2. ✅ You should access the page (because you're logged in)

### Test Logout

1. Click your **avatar**
2. Click **"Log out"**
3. ✅ Avatar disappears
4. ✅ See "Log in" and "Sign up" buttons
5. Try clicking **"Messages"** again
6. ✅ You should be redirected to `/login`

### Test Owner Account

1. Click **"Sign up"** in header
2. Register with:
   ```
   First Name: Jane
   Last Name: Smith
   Email: jane@example.com
   Password: password123
   Role: Owner ← (Select this)
   ```
3. ✅ Redirected to `/owner/dashboard`
4. Click avatar
5. ✅ See different menu: Dashboard, My Listings, Add Listing

---

## 🎊 Success!

If all tests passed, your authentication is **100% functional**!

### What You Can Do Now:

- ✅ Register users as Student or Owner
- ✅ Login with email/password
- ✅ Access protected routes
- ✅ See role-based menus
- ✅ Logout completely

---

## 🐛 Troubleshooting

### Problem: "Invalid supabaseUrl" error

**Solution**: 
- Make sure you copied the FULL URL from Supabase
- Restart the dev server: `pnpm dev`
- Check for typos in `.env.local`

### Problem: Can't see my name in header

**Solution**:
- Check Supabase → Authentication → Users
- Click on your user → View metadata
- Should see: `first_name`, `last_name`, `role`
- If missing, delete user and register again

### Problem: Redirected to login when logged in

**Solution**:
- Open browser DevTools → Console
- Look for errors
- Try clearing cookies: DevTools → Application → Cookies → Delete all
- Login again

### Problem: Role-based menus not working

**Solution**:
- Check user metadata in Supabase has `role` field
- Should be "student", "owner", or "admin"
- Logout and login again

---

## 📚 Next Steps

### Learn More
- 📖 Read [AUTHENTICATION_GUIDE.md](./AUTHENTICATION_GUIDE.md) for full docs
- 🧪 See [AUTH_TESTING.md](./AUTH_TESTING.md) for more test scenarios
- 📊 Check [AUTH_FLOW_DIAGRAMS.md](./AUTH_FLOW_DIAGRAMS.md) for visual flows

### Build Features
1. Create profile page (`/profile`)
2. Add real listings from database
3. Implement booking system
4. Add real-time messaging
5. Connect Django backend API

### Deploy
1. Push to GitHub
2. Deploy to Vercel
3. Add production Supabase project
4. Update environment variables

---

## ✅ Verification Checklist

Mark as you complete each step:

- [ ] Created Supabase project
- [ ] Got credentials (URL + anon key)
- [ ] Updated `.env.local`
- [ ] Ran `supabase-schema.sql`
- [ ] Disabled email confirmations
- [ ] Restarted dev server
- [ ] Registered as Student
- [ ] Saw avatar in header
- [ ] Clicked avatar → saw name
- [ ] Accessed Messages page
- [ ] Logged out successfully
- [ ] Registered as Owner
- [ ] Saw different menu items
- [ ] Tested role-based access

---

**🎉 All done? Congratulations! Your auth system is working perfectly!**

Need help? Check the other documentation files or open an issue.

---

**Time to complete**: ~5 minutes  
**Difficulty**: Easy  
**Status**: ✅ Ready to use
