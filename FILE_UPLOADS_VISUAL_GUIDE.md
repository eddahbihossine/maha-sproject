# File Uploads - Visual Guide

## 🎬 User Experience - Create Listing with Images

```
┌─────────────────────────────────────────────────────────────┐
│ ADD LISTING                                                  │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ Title *                      [_______________________]        │
│ Description *                [_____________________]         │
│ Property Type                [▼ Apartment         ]          │
│ Address *                    [_______________________]        │
│ City *                       [_______________________]        │
│ Postal Code                  [_______________________]        │
│                                                               │
│ Surface (m²)  Bedrooms  Bathrooms                            │
│ [_______]     [___]      [___]                              │
│                                                               │
│ Rent (monthly) *  [_______]                                 │
│ Charges           [_______]  ☐ Included                     │
│ Deposit           [_______]                                 │
│                                                               │
│ Available From    [________]                                 │
│ Min Stay (months) [___]                                     │
│ Amenities         [_______________________]                  │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│ IMAGES                                                        │
│                                                               │
│ No images selected yet                                        │
│                                                               │
│  ┌──────────────────────────────┐                           │
│  │  [📁 Select Images]          │                           │
│  └──────────────────────────────┘                           │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ [Create Listing]                                             │
│                                                               │
└─────────────────────────────────────────────────────────────┘

↓ User clicks "Select Images"

┌─ File Picker ────────────────────────────────────────────────┐
│ Choose image files...                                         │
│                                                               │
│  📁 Documents                                                │
│  📁 Downloads                                                │
│     └─ bedroom.jpg                    ☑                     │
│     └─ kitchen.jpg                    ☑                     │
│     └─ livingroom.jpg                 ☑                     │
│     └─ bathroom.jpg                   ☑                     │
│                                                               │
│                          [Cancel]  [Open]                   │
└───────────────────────────────────────────────────────────────┘

↓ User selects 4 images

┌─────────────────────────────────────────────────────────────┐
│ IMAGES                                                        │
│                                                               │
│ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐                            │
│ │ 🖼️  │ │ 🖼️  │ │ 🖼️  │ │ 🖼️  │                            │
│ │Pri  │ │     │ │     │ │     │                            │
│ └──●──┘ └──●──┘ └──●──┘ └──●──┘    ← Hover to remove X    │
│                                                               │
│  ┌──────────────────────────────┐                           │
│  │  [📁 Select Images]          │  ← Add more              │
│  └──────────────────────────────┘                           │
│                                                               │
└─────────────────────────────────────────────────────────────┘

↓ User clicks "Create Listing"

┌─────────────────────────────────────────────────────────────┐
│ IMAGES                                                        │
│                                                               │
│ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐                            │
│ │ 🖼️  │ │ 🖼️  │ │ 🖼️  │ │ 🖼️  │                            │
│ │ 25% │ │  0% │ │  -  │ │  -  │    ← Upload progress       │
│ └─────┘ └─────┘ └─────┘ └─────┘                            │
│                                                               │
│ Creating listing and uploading 4 images...                   │
│                                                               │
└─────────────────────────────────────────────────────────────┘

↓ Upload complete

✓ Listing created successfully!
✓ 4 images uploaded to Supabase Storage
✓ Redirecting to My Listings...
```

---

## 🎬 User Experience - Edit Listing with Images

```
┌─────────────────────────────────────────────────────────────┐
│ EDIT LISTING - Apartment in Montreal                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ Title *                      [Cozy Downtown Apartment]        │
│ Description *                [Beautiful 2BR apartment...]    │
│ ...                                                           │
│ Amenities         [WiFi, Parking, Laundry]                 │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│ IMAGES                                                        │
│                                                               │
│ ┌─────┐ ┌─────┐ ┌─────┐                                    │
│ │ 🖼️  │ │ 🖼️  │ │ 🖼️  │        ← Existing images        │
│ │Pri  │ │     │ │     │                                    │
│ └──●──┘ └──●──┘ └──●──┘                                    │
│                                                               │
│  ┌──────────────────────────────┐                           │
│  │  [📁 Add Images]             │  ← Add more               │
│  └──────────────────────────────┘                           │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ [Save Changes]                                               │
│                                                               │
└─────────────────────────────────────────────────────────────┘

↓ User clicks "Add Images" and selects 2 new photos

┌─────────────────────────────────────────────────────────────┐
│ IMAGES                                                        │
│                                                               │
│ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐                  │
│ │ 🖼️  │ │ 🖼️  │ │ 🖼️  │ │ 🖼️  │ │ 🖼️  │  ← 5 total     │
│ │Pri  │ │     │ │     │ │(new)│ │(new)│                  │
│ └──●──┘ └──●──┘ └──●──┘ └──●──┘ └──●──┘                  │
│                                                               │
│ User can remove any by hovering and clicking X               │
│                                                               │
└─────────────────────────────────────────────────────────────┘

↓ User clicks "Save Changes"

┌─────────────────────────────────────────────────────────────┐
│ Updating listing...                                           │
│ Deleting old images...                                        │
│ Uploading new images...                                       │
│                                                               │
│ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐                  │
│ │ ✓   │ │ ✓   │ │ ✓   │ │ 45% │ │  0% │  ← Progress     │
│ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘                  │
│                                                               │
└─────────────────────────────────────────────────────────────┘

↓ Complete

✓ Listing updated!
✓ Old images deleted from storage
✓ New images uploaded to Supabase Storage
✓ Redirecting to My Listings...
```

---

## 🏗️ Technical Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    BROWSER (Next.js)                     │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  /app/owner/listings/new/page.tsx                       │
│  /app/owner/listings/[id]/edit/page.tsx                │
│                                                           │
│  State: { images: File[], uploading: bool, progress }  │
│  Handlers: handleFileSelect(), removeImage(), submit   │
│                                                           │
│         ↓ (on form submit)                              │
│         ↓ Create listing in database                    │
│         ↓ Call uploadListingImage() for each file       │
│         ↓                                                │
└─────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────┐
│            lib/supabase/storage.ts (SDK)                │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  uploadListingImage(file, listingId)                    │
│  - Generate unique filename                             │
│  - Upload to Supabase Storage                           │
│  - Return public URL                                     │
│                                                           │
│         ↓ HTTP/2 (fast upload)                           │
└─────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────┐
│         SUPABASE (PostgreSQL + Storage)                 │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  Storage Bucket: listing-images/                        │
│  └─ listing-123/                                         │
│     ├─ 1706603200000-x7k9p2m.jpg                        │
│     ├─ 1706603201000-k2m5x9z.jpg                        │
│     └─ 1706603202000-n3p8q1r.jpg                        │
│                                                           │
│  Database: listing_images table                         │
│  ├─ image_url: https://...bucket.supabase.co/...       │
│  ├─ listing_id: "123"                                   │
│  ├─ sort_order: 0                                       │
│  └─ is_primary: true                                    │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

---

## 📊 Data Flow

### Create Listing with Image

```
User selects image
  ↓
FileReader reads file as data URL
  ↓
Preview displayed in grid
  ↓ User submits form
  ↓
Listing created in database
  ↓
uploadListingImage() called
  ↓
File uploaded to Supabase Storage
  ├─ Path: listing-images/{listingId}/{timestamp-random}.jpg
  ├─ Public URL returned
  └─ Stored in memory
  ↓
Progress updated (0% → 100%)
  ↓
Public URL saved to listing_images table
  ├─ image_url: [URL from Supabase]
  ├─ listing_id: [from listing]
  ├─ sort_order: 0 (first)
  └─ is_primary: true
  ↓
User redirected to /owner/listings
  ↓
Image displays in listing card
  └─ Loaded from Supabase CDN
```

### Edit Listing with New Image

```
Owner loads edit page
  ↓
Existing images loaded from database
  ├─ Query: SELECT image_url, sort_order FROM listing_images
  ├─ Display as previews
  └─ Marked isExisting: true
  ↓
Owner selects new image file
  ↓
New image displayed as preview
  ├─ Marked isExisting: false
  └─ File stored in state
  ↓ Owner submits form
  ↓
Listing details updated in database
  ↓
Delete all old images from database
  ├─ DELETE FROM listing_images WHERE listing_id = X
  └─ (Storage files not deleted yet)
  ↓
Upload new file to Supabase Storage
  ├─ uploadListingImage(newFile, listingId)
  ├─ Returns public URL
  └─ Progress shown
  ↓
Rebuild image rows (old + new URLs)
  ├─ Re-add old images that were kept
  ├─ Add new images with new URLs
  └─ All with correct sort_order
  ↓
Insert all image rows to database
  ├─ INSERT INTO listing_images (...)
  └─ (multiple rows)
  ↓
User redirected to /owner/listings
```

---

## 🔄 Request/Response Flow

### File Upload Request

```
POST https://supabase-project.supabase.co/storage/v1/object/listing-images/listing-123/1706603200000-x7k9p2m.jpg

Headers:
- Authorization: Bearer [JWT token]
- Content-Type: image/jpeg

Body: [binary file data]

Response:
{
  "id": "...",
  "name": "1706603200000-x7k9p2m.jpg",
  "owner": "user-uuid",
  "owner_id": "user-uuid",
  "created_at": "2024-01-30T12:00:00Z",
  "updated_at": "2024-01-30T12:00:00Z",
  "last_accessed_at": "2024-01-30T12:00:00Z",
  "metadata": { "mimetype": "image/jpeg", "size": 245623 }
}

Public URL returned:
https://supabase-project.supabase.co/storage/v1/object/public/listing-images/listing-123/1706603200000-x7k9p2m.jpg
```

### Save to Database

```
POST /rest/v1/listing_images

Headers:
- Authorization: Bearer [JWT token]
- Content-Type: application/json

Body:
{
  "image_url": "https://supabase-project.supabase.co/storage/v1/object/public/listing-images/listing-123/1706603200000-x7k9p2m.jpg",
  "listing_id": "listing-123",
  "sort_order": 0,
  "is_primary": true
}

Response:
{
  "id": "img-uuid-1",
  "image_url": "[URL from above]",
  "listing_id": "listing-123",
  "sort_order": 0,
  "is_primary": true,
  "created_at": "2024-01-30T12:00:00Z"
}
```

---

## 🎯 Key Decision Points

```
User creates/edits listing
    ↓
Did user select image files?
    ├─ NO → Skip image upload, save listing only
    │        (User can add images later)
    │
    └─ YES → Upload each file
             ├─ Upload succeeds? → Save URL to database
             └─ Upload fails? → Log error, continue to next
                              (User can re-edit to add images)
```

---

## 📈 Performance Timeline

```
User Action          Time         Status
─────────────────────────────────────────────
Select files         < 1s         Instant
Preview render       < 100ms      Per image
Form submit          Immediate    Button changes
Create listing       200-500ms    Database insert
Upload file 1        500-2000ms   Network speed
Upload file 2        500-2000ms   Parallel not used
Upload file 3        500-2000ms   (Sequential)
Save to DB           100-200ms    Per image
Redirect             < 100ms      Page transition
─────────────────────────────────────────────
Total (4 images)     3-10s        Depends on sizes
```

**Optimization opportunity:** Parallel uploads (currently sequential)

---

## 🔐 Security Flow

```
User clicks "Select Images"
    ↓
Browser file picker (client-side only)
    - Only image files (MIME type filter)
    - User controls what's selected
    ↓
FileReader API (browser sandbox)
    - Reads file as data URL
    - No server access yet
    ↓
Submit form
    ↓
Check user authentication
    - useAuth() hook validates JWT
    - Listing ownership verified (owner_id check)
    ↓
Upload to Supabase Storage
    - JWT token sent in Authorization header
    - Supabase validates token
    - RLS policy checks permission
    - File stored in bucket
    ↓
Save to database
    - JWT token sent
    - user_id extracted from JWT
    - Verify user is listing owner
    - Insert rows with user_id constraint
    ↓
✓ Secure and authenticated
```

---

## 📱 Mobile Experience

```
Mobile Browser (same as desktop):

1. User navigates to /owner/listings/new
2. Clicks "Select Images"
3. Native mobile file picker opens
   ├─ Camera option
   ├─ Photo library
   └─ Other apps
4. User selects photo(s) from library or takes new photo
5. Preview displays in grid (responsive: 2-3 columns on mobile)
6. User scrolls down, clicks "Create Listing"
7. Upload progress shown as percentage
8. Redirects to My Listings
9. Image displays in listing thumbnail

✓ Full experience works on mobile
✓ Responsive grid: 2 cols (mobile), 3 cols (tablet), 4 cols (desktop)
✓ Touch-friendly: Large buttons and preview cards
```

---

## 🚀 Deployment Checklist

```
Before going live:

SETUP
[ ] Create Supabase Storage bucket "listing-images"
[ ] Configure bucket as Public
[ ] Add RLS policies for authenticated uploads
[ ] Test bucket policies

CODE
[ ] Deploy storage.ts utility
[ ] Deploy updated new/page.tsx
[ ] Deploy updated [id]/edit/page.tsx
[ ] Test file uploads on staging

DOCUMENTATION
[ ] Share FILE_UPLOADS_SETUP.md with team
[ ] Add to README or deployment docs
[ ] Brief users on new feature

MONITORING
[ ] Watch Storage usage
[ ] Monitor upload error logs
[ ] Check CDN performance
[ ] Track user feedback

LAUNCH
[ ] Enable for all users
[ ] Announce new feature
[ ] Monitor for issues
[ ] Have rollback plan ready
```

---

## 🎓 Learning Resources

- **Supabase Storage Docs:** https://supabase.com/docs/guides/storage
- **File API Reference:** https://developer.mozilla.org/en-US/docs/Web/API/File
- **FileReader API:** https://developer.mozilla.org/en-US/docs/Web/API/FileReader
- **React File Handling:** https://react.dev/reference/react-dom/components/input#type
- **Progressive Enhancement:** Handle uploads gracefully if JavaScript disabled

---

## 📞 Support

See `FILE_UPLOADS_SETUP.md` for troubleshooting guide.

Common issues:
- Upload fails → Check Supabase bucket and policies
- Images not appearing → Verify database URLs match storage
- 404 errors → Check bucket name spelling and public setting
- Slow uploads → Compress images, check network
