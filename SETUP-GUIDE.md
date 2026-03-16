# 🚀 Setup Guide - Student Accommodation Platform

## Issues Fixed

### ✅ 1. Owner Redirect Fixed
**Problem:** Owners were seeing the same homepage as students  
**Solution:** Updated `app/page.tsx` to redirect both owners AND admins to their respective dashboards:
- **Owners** → `/owner/dashboard`
- **Admins** → `/admin`
- **Students** → Stay on homepage

### ✅ 2. Mock Data Removed
**Problem:** All pages were using hardcoded mock data  
**Solution:** 
- Created `lib/api/listings.ts` with 10+ functions to fetch real data from Supabase
- Updated `app/page.tsx` to load featured listings from database
- Updated `app/search/page.tsx` to load all listings from database
- Updated `components/listings/listing-card.tsx` to work with new API format
- Added loading skeletons and empty states

### ✅ 3. Real-Time Chat Ready
**Solution:** Chat system was already implemented correctly with Supabase Realtime. It will work once you have the database tables created.

---

## 🔥 IMPORTANT: Database Setup Required

**Your chat and listings won't work until you run the SQL schema!**

### Step 1: Open Supabase Dashboard
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project: `seclzlldxpfpfrjvkzip`

### Step 2: Run the Schema
1. Click "SQL Editor" in the left sidebar
2. Click "+ New Query"
3. Open the file `supabase-schema.sql` from your project folder
4. Copy ALL the contents and paste into the Supabase SQL Editor
5. Click "Run" or press Cmd/Ctrl + Enter
6. Wait for "Success. No rows returned" message

### Step 3: Verify Tables Created
1. Go to "Table Editor" in Supabase dashboard
2. You should see these tables:
   - ✅ user_profiles
   - ✅ listings
   - ✅ listing_images
   - ✅ bookings
   - ✅ messages
   - ✅ reviews
   - ✅ favorites
   - ✅ notifications

---

## 📝 Adding Sample Listings (Optional)

### Option 1: Using SQL (Quick)
1. First, register an owner account in your app:
   - Go to `/register`
   - Fill form with role="owner"
   - Submit

2. Get your user ID:
   - In Supabase SQL Editor, run:
   ```sql
   SELECT id, email, user_metadata->>'role' as role 
   FROM auth.users;
   ```
   - Copy the ID of your owner account

3. Open `sample-listings.sql`
4. Replace ALL instances of `YOUR_OWNER_USER_ID_HERE` with your actual owner user ID
5. Copy and paste the modified SQL into Supabase SQL Editor
6. Run it

### Option 2: Using the UI (Manual)
1. Log in as an owner account
2. Go to `/owner/listings` (when page is created)
3. Click "Create New Listing"
4. Fill in the form manually

---

## 🐛 Chat Not Working? Troubleshooting

### Check 1: Is the database set up?
```sql
-- Run in Supabase SQL Editor
SELECT COUNT(*) FROM messages;
```
If you get an error "relation 'messages' does not exist" → Database not set up, see above.

### Check 2: Do you have conversations?
1. Register two accounts (one student, one owner)
2. As student, go to a listing
3. Click "Contact Owner"
4. Send a message
5. Log out and log in as the owner
6. Go to `/messages`
7. You should see the conversation

### Check 3: Check browser console
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for errors like:
   - `relation 'messages' does not exist` → Database not set up
   - `permission denied` → RLS policies issue (should be auto-created by schema)
   - `Failed to fetch` → Check `.env.local` has correct Supabase credentials

---

## 🔐 API Credentials Check

Your `.env.local` should have:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://seclzlldxpfpfrjvkzip.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_o6AdPH4qGCg5duPJKN4qbw_OxaHOM9Z
```

✅ These look correct!

---

## 📊 New API Functions Available

### Listings API (`lib/api/listings.ts`)

```typescript
import { getListings, getListing, getFeaturedListings } from '@/lib/api/listings'

// Get all active listings (with filters)
const listings = await getListings({
  city: 'Paris',
  minPrice: 500,
  maxPrice: 1000,
  propertyType: 'apartment',
  bedrooms: 2,
  furnished: true,
  limit: 20,
  offset: 0
})

// Get single listing by ID
const listing = await getListing('listing-id')

// Get featured listings for homepage
const featured = await getFeaturedListings(4)

// Get owner's listings
const ownerListings = await getOwnerListings(userId)

// Search listings
const results = await searchListings('Paris studio', { limit: 10 })

// Create listing
const newListing = await createListing({
  title: 'My Apartment',
  // ... other fields
})

// Update listing
const updated = await updateListing('listing-id', {
  rent_monthly: 800
})

// Delete listing
const deleted = await deleteListing('listing-id')
```

### Messages API (`lib/api/messages.ts`)

```typescript
import { 
  getConversations, 
  getMessages, 
  sendMessage, 
  subscribeToMessages 
} from '@/lib/api/messages'

// Get all conversations for current user
const conversations = await getConversations(userId)

// Get messages with specific user
const messages = await getMessages(userId, otherUserId)

// Send message
const message = await sendMessage(
  senderId, 
  recipientId, 
  'Hello!', 
  listingId // optional
)

// Subscribe to real-time messages
const unsubscribe = subscribeToMessages(userId, otherUserId, (newMessage) => {
  console.log('New message:', newMessage)
})

// Later: unsubscribe()
```

---

## 🎨 What Changed in Components

### `app/page.tsx` (Homepage)
```diff
- import { mockListings } from '@/lib/mock-data'
- const featuredListings = mockListings.slice(0, 4)
+ import { getFeaturedListings } from '@/lib/api/listings'
+ const [featuredListings, setFeaturedListings] = useState([])
+ useEffect(() => {
+   const load = async () => {
+     const listings = await getFeaturedListings(4)
+     setFeaturedListings(listings)
+   }
+   load()
+ }, [])
```

### `app/search/page.tsx` (Search)
```diff
- import { mockListings } from '@/lib/mock-data'
- const filteredListings = useMemo(() => {
-   let results = [...mockListings]
+ import { getListings } from '@/lib/api/listings'
+ const [allListings, setAllListings] = useState([])
+ useEffect(() => {
+   const load = async () => {
+     const listings = await getListings({ limit: 100 })
+     setAllListings(listings)
+   }
+   load()
+ }, [])
```

### `components/listings/listing-card.tsx`
Now handles both API formats:
- Old: `listing.propertyType`, `listing.rentMonthly`, `listing.numBedrooms`
- New: `listing.property_type`, `listing.rent_monthly`, `listing.num_bedrooms`

---

## 🧪 Testing Your Changes

### Test 1: Homepage
1. Go to `http://localhost:3000`
2. You should see:
   - ✅ Featured Listings section
   - ✅ Loading skeletons while data loads
   - ✅ "No listings yet" message if no listings in DB

### Test 2: Search Page
1. Go to `http://localhost:3000/search`
2. You should see:
   - ✅ All listings from database
   - ✅ Filters working
   - ✅ Loading skeletons

### Test 3: Owner Redirect
1. Register/login as owner
2. Go to homepage
3. You should be redirected to `/owner/dashboard`

### Test 4: Chat (After DB Setup)
1. Register as student (user1) and owner (user2)
2. As student, go to a listing
3. Click "Contact Owner"
4. Send: "Hi, is this available?"
5. Log out, log in as owner
6. Go to `/messages`
7. You should see conversation
8. Reply: "Yes, it's available!"
9. Log out, log in as student
10. Go to `/messages`
11. You should see reply instantly (real-time!)

---

## 📁 Files Created/Modified

### New Files
- ✅ `lib/api/listings.ts` - Real listings API
- ✅ `sample-listings.sql` - Sample data
- ✅ `SETUP-GUIDE.md` - This file
- ✅ `ARCHITECTURE.md` - Full system documentation

### Modified Files
- ✅ `app/page.tsx` - Use real data, fixed redirect
- ✅ `app/search/page.tsx` - Use real data
- ✅ `components/listings/listing-card.tsx` - Support new API format

---

## 🚦 Next Steps

### Immediate (To Make Everything Work)
1. **Run supabase-schema.sql** in Supabase SQL Editor
2. **Register test accounts** (1 owner, 1 student)
3. **Add sample listings** using sample-listings.sql
4. **Test chat** between student and owner

### Short Term (This Week)
1. Create Owner Dashboard (`/owner/dashboard`)
2. Create Owner Listings Management (`/owner/listings`)
3. Add image upload functionality
4. Create Admin Panel (`/admin`)

### Medium Term (Next 2 Weeks)
1. Implement booking system
2. Add payment integration (Stripe)
3. Implement review system
4. Add favorites functionality

### Long Term (Next Month)
1. Email notifications
2. Advanced search (map view)
3. Virtual tours
4. Mobile optimization

---

## 🆘 Common Issues & Solutions

### Issue: "Failed to fetch" errors
**Solution:** Check your `.env.local` has correct Supabase credentials

### Issue: "relation 'listings' does not exist"
**Solution:** Run supabase-schema.sql in Supabase SQL Editor

### Issue: "No listings showing"
**Solution:** Add sample listings using sample-listings.sql OR create manually

### Issue: "Permission denied for table"
**Solution:** RLS policies not created. Re-run supabase-schema.sql

### Issue: "Chat not updating in real-time"
**Solution:** 
1. Check browser console for errors
2. Verify messages table exists
3. Check Supabase Realtime is enabled (Settings → API → Realtime)

### Issue: Owner sees student homepage
**Solution:** Clear browser cache, check user_metadata has role='owner'

---

## 📞 Support

If you're stuck:
1. Check browser console (F12 → Console tab)
2. Check Supabase logs (Dashboard → Logs)
3. Check this guide for solutions
4. Review ARCHITECTURE.md for system design

---

## ✅ Checklist

Before considering the fixes complete, verify:

- [ ] Database schema applied (supabase-schema.sql)
- [ ] At least 1 owner account created
- [ ] At least 1 student account created
- [ ] Sample listings added
- [ ] Homepage shows listings (or "No listings yet")
- [ ] Search page works
- [ ] Owner gets redirected to /owner/dashboard
- [ ] Student stays on homepage
- [ ] Chat messages send successfully
- [ ] Chat updates in real-time
- [ ] No console errors

---

**Last Updated:** January 30, 2026  
**Status:** ✅ All fixes applied, database setup required
