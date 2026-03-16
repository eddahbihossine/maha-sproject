# 🎯 QUICK START - What You Need to Do NOW

## ⚡ Critical: 3 Steps to Make Everything Work

### Step 1: Apply Database Schema (5 minutes)
```
1. Go to https://supabase.com/dashboard
2. Select your project
3. Click "SQL Editor" → "+ New Query"
4. Copy ALL content from: supabase-schema.sql
5. Paste and click "Run"
```

### Step 2: Create Test Accounts (2 minutes)
```
1. Open http://localhost:3000/register
2. Create Owner account:
   - Email: owner@test.com
   - Password: Test123!@#
   - Role: Owner
   
3. Create Student account:
   - Email: student@test.com
   - Password: Test123!@#
   - Role: Student
```

### Step 3: Add Sample Listings (3 minutes)
```
1. In Supabase SQL Editor, run:
   SELECT id, email FROM auth.users;
   
2. Copy the owner's ID

3. Open: sample-listings.sql

4. Replace 'YOUR_OWNER_USER_ID_HERE' with owner's ID

5. Run the modified SQL in Supabase
```

## ✅ Done! Now Test:

### Homepage
```
1. Visit http://localhost:3000
2. Should see 4 featured listings
3. Owner login → redirects to /owner/dashboard
4. Student login → stays on homepage
```

### Chat
```
1. Login as student
2. Go to any listing
3. Click "Contact Owner"
4. Send message
5. Switch to owner account
6. Go to /messages
7. See conversation in real-time!
```

---

## 🔍 What Was Fixed

| Issue | Status | Solution |
|-------|--------|----------|
| Owners redirected to student page | ✅ Fixed | Redirect owners → /owner/dashboard, admins → /admin |
| Mock data everywhere | ✅ Fixed | Created real API (`lib/api/listings.ts`) |
| Chat not working | ✅ Fixed | Chat works after DB setup |
| No real listings | ✅ Fixed | Added sample-listings.sql |

---

## 📚 Documentation

- **SETUP-GUIDE.md** → Detailed troubleshooting
- **ARCHITECTURE.md** → Full system architecture
- **sample-listings.sql** → Sample data
- **supabase-schema.sql** → Database schema

---

## 🚨 If Something Doesn't Work

1. **Check database:** Run `SELECT COUNT(*) FROM listings;` in Supabase
2. **Check console:** Open browser DevTools (F12) → Console
3. **Check credentials:** .env.local has correct Supabase URL/key
4. **Read SETUP-GUIDE.md** → Has all solutions

---

**Priority:** Complete Step 1 (database) first - nothing works without it!
