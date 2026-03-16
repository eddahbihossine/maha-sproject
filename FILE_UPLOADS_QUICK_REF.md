# File Uploads - Quick Reference

## 📦 What You Get

- **Multi-file uploads** to Supabase Storage for listing images
- **Live previews** before saving
- **Upload progress** indicator (0-100%)
- **Automatic file management** (delete old, upload new)
- **Organized storage** (files grouped by listing ID)

## 🚀 Getting Started

### 1-Minute Setup

1. Go to Supabase dashboard → Storage
2. Create bucket named: `listing-images` (set to Public)
3. Done! Your app can now upload files

### 5-Minute Setup (Optional - Better Security)

1. Go to bucket "listing-images" → Policies
2. Add 3 RLS policies (see `FILE_UPLOADS_SETUP.md` for exact SQL)
3. This restricts uploads to authenticated users only

## 📍 Where to Use

### Create New Listing
**URL:** `/owner/listings/new`

1. Fill form fields
2. Click "Select Images" button at bottom
3. Choose image files (supports: JPG, PNG, WebP, GIF, SVG, AVIF)
4. See previews appear
5. Click "Create Listing"
6. Images upload automatically

### Edit Existing Listing
**URL:** `/owner/listings/{id}/edit`

1. Fill form fields
2. Existing images shown as previews
3. Click "Add Images" to add more
4. Click X to remove any image
5. Click "Save Changes"
6. Old images deleted, new ones uploaded

## 🎯 Key Features

| Feature | Before | After |
|---------|--------|-------|
| Image Input | URL text fields | File picker + previews |
| Multiple Images | Manual entry | Select multiple at once |
| Preview | No preview | Live grid preview |
| Upload Status | N/A | Progress 0-100% |
| Storage | External URLs | Supabase Storage |
| File Management | Manual | Automatic |

## 🛠️ Technical Details

### Storage Location

Files saved to: `listing-images/{listingId}/{timestamp}-{randomId}.{ext}`

Example: `listing-images/abc123/1706603200000-x7k9p2m.jpg`

### Image Data Structure

```typescript
{
  image_url: "https://...public/listing-images/...",  // Supabase URL
  listing_id: "abc123",
  sort_order: 0,              // 0 = first/primary
  is_primary: true            // First image is primary
}
```

### API Functions Available

```typescript
// Upload single file
await uploadListingImage(file, listingId)
// Returns: "https://..."

// Delete single file
await deleteListingImage(publicUrl)

// Delete all files for a listing
await deleteListingImages(listingId)
```

## 📋 Supported Formats

- ✅ JPEG (.jpg, .jpeg)
- ✅ PNG (.png)
- ✅ WebP (.webp)
- ✅ GIF (.gif)
- ✅ SVG (.svg)
- ✅ AVIF (.avif)

## 📊 File Size Limits

- **Default:** 50 MB per file
- **Recommendation:** Keep under 10 MB for fast uploads
- Consider compressing images beforehand

## ⚠️ Troubleshooting

### Upload fails with "Policy violation"
→ Check Supabase bucket policies (see setup guide)

### Images don't appear
→ Verify `listing-images` bucket exists and is Public

### 404 Error on image URLs
→ Check URLs are correct in `listing_images` table

### Slow uploads
→ Large images or slow network - compress files first

See `FILE_UPLOADS_SETUP.md` for detailed troubleshooting.

## 🔄 Flow Comparison

### Before (URL-based)
```
Owner enters URL → Validate URL → Save to database
(URLs could be broken, slow to load)
```

### After (File uploads)
```
Owner selects file → Preview → Upload to Storage
→ Get public URL → Save to database
(Files verified, fast CDN delivery)
```

## 📝 Database Schema

**No changes needed!** Uses existing tables:

- `listings` - Property details (unchanged)
- `listing_images` - Image metadata
  - `image_url` - Now Supabase Storage URL
  - `sort_order` - Position (0=first)
  - `is_primary` - Primary image flag

## 🎨 UI Changes

### New Listing Form
```
Title field
...
Description field
...
Amenities field
────────────────────────────
[Images section - NEW]
┌─────────────────────────┐
│ ┌────┐ ┌────┐ ┌────┐   │
│ │ 📷 │ │ 📷 │ │ 📷 │   │  ← Image previews
│ │Pri │ │    │ │    │   │
│ └────┘ └────┘ └────┘   │
│ [📁 Select Images]      │  ← File picker
└─────────────────────────┘
[Create Listing]          ← Submit
```

### Edit Listing Form
```
[Same layout as new]
Can hover X on images to delete
Click "Add Images" to upload more
```

## 💡 Pro Tips

1. **Optimize images** - Compress before upload for faster processing
2. **Order matters** - First image is primary/thumbnail
3. **Batch upload** - Select multiple files at once
4. **Edit anytime** - Update images without recreating listing
5. **No file uploads** - You can still create listing, add images later

## 📚 Full Documentation

- Setup guide: `FILE_UPLOADS_SETUP.md`
- Implementation details: `FILE_UPLOADS_IMPLEMENTATION.md`
- API reference: See comments in `lib/supabase/storage.ts`

## ✅ Ready to Use?

1. ✅ Code is updated and tested
2. ⚠️ Needs 1-minute Supabase setup (create bucket)
3. ✅ Then users can upload images immediately

**Next:** Follow setup steps in `FILE_UPLOADS_SETUP.md`
