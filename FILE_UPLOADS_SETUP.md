# File Uploads Setup Guide

## Overview

The listing image upload system now uses **Supabase Storage** for file management. This replaces the previous URL-based approach with actual file uploads.

## Features

✅ **Multi-file uploads** - Select multiple images at once  
✅ **Preview display** - See images before saving  
✅ **Upload progress** - Visual feedback during upload  
✅ **Auto-deletion** - Old images removed when updating listings  
✅ **Primary image** - First image marked as primary  
✅ **Organized storage** - Files grouped by listing ID  

## Setup Steps

### 1. Create Storage Bucket in Supabase

1. Go to your Supabase project dashboard
2. Navigate to **Storage** → **Buckets**
3. Click **Create a new bucket**
4. Set name to: `listing-images`
5. Select **Public** (so images are publicly accessible)
6. Click **Create bucket**

### 2. Configure Bucket Policies

1. Click the bucket name `listing-images`
2. Go to the **Policies** tab
3. Click **New policy** → **For authenticated users**
4. Set the policy as follows:

```sql
-- Allow authenticated users to upload
CREATE POLICY "Allow authenticated uploads"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'listing-images');

-- Allow public read
CREATE POLICY "Allow public read"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'listing-images');

-- Allow authenticated users to delete their own files
CREATE POLICY "Allow delete own files"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'listing-images' AND auth.uid() = owner);
```

Or use the Supabase UI to add these policies:

**Policy 1 - Upload:**
- Target roles: `authenticated`
- Permissions: `INSERT`
- Other condition: `bucket_id = 'listing-images'`

**Policy 2 - Public Read:**
- Target roles: `public`
- Permissions: `SELECT`
- Other condition: `bucket_id = 'listing-images'`

**Policy 3 - Delete:**
- Target roles: `authenticated`
- Permissions: `DELETE`
- Other condition: `bucket_id = 'listing-images'`

### 3. Verify Configuration

Test upload by:
1. Going to `/owner/listings/new`
2. Clicking "Select Images"
3. Choosing image files
4. Seeing previews render
5. Clicking "Create Listing"
6. Checking Supabase Storage bucket for uploaded files

## How It Works

### Upload Flow

1. User selects image files via file input
2. Files are shown as previews immediately
3. On form submit:
   - Listing is created first
   - Each image file is uploaded to Supabase Storage under `listing-images/{listingId}/`
   - Public URL is retrieved from Supabase
   - URL is saved to `listing_images` database table
   - Upload progress is displayed to user

### Edit Flow

1. Existing images load from database
2. New files can be selected and added
3. On save:
   - Listing details are updated
   - All old images are deleted from database
   - New image files are uploaded
   - All URLs (existing + new) are saved to database

### File Organization

Files are stored at: `listing-images/{listingId}/{timestamp}-{randomId}.{extension}`

Example: `listing-images/abc123/1706603200000-x7k9p2m.jpg`

## API Functions

### `uploadListingImage(file: File, listingId: string)`

Uploads a single image file to Supabase Storage.

```typescript
const url = await uploadListingImage(file, listingId)
// Returns: https://supabase.../storage/v1/object/public/listing-images/...
```

### `deleteListingImage(publicUrl: string)`

Deletes a single image from Supabase Storage by public URL.

```typescript
await deleteListingImage(publicUrl)
```

### `deleteListingImages(listingId: string)`

Deletes all images for a listing.

```typescript
await deleteListingImages(listingId)
```

## Supported Image Formats

- JPEG (.jpg, .jpeg)
- PNG (.png)
- WebP (.webp)
- GIF (.gif)
- SVG (.svg)
- AVIF (.avif)

## File Size Limits

Default Supabase limit: **50 MB per file**

To change, update in `lib/supabase/storage.ts`:

```typescript
const { data, error } = await supabase.storage
  .from(BUCKET_NAME)
  .upload(fileName, file, {
    cacheControl: '3600',
    upsert: false,
    // Add client-side check:
    // if (file.size > 50 * 1024 * 1024) throw Error('File too large')
  })
```

## Troubleshooting

### Images not uploading
- Check Supabase Storage bucket exists with name `listing-images`
- Verify bucket is set to **Public**
- Check browser console for errors
- Ensure user is authenticated (has `auth_token`)

### "Policy violation" error
- Verify bucket policies are correctly configured
- Check that policies include `authenticated` users for INSERT
- Make sure public READ policy is set

### 404 - Image not found
- Verify image URL in `listing_images` table matches file in Storage
- Check if bucket name is correct (`listing-images`)
- Confirm image hasn't been deleted from Storage

### Large upload times
- Check network speed
- Consider compressing images before upload
- For many images, add client-side optimization

## Production Considerations

1. **Image optimization** - Consider adding image compression before upload
2. **Virus scanning** - Implement virus scan for uploaded files
3. **Rate limiting** - Add upload rate limits to prevent abuse
4. **CDN caching** - Enable caching headers (already set to 3600s)
5. **Monitoring** - Track Storage usage and costs

## Rollback to URL-based

If needed to revert to URL inputs instead of file uploads:

1. Update form state back to `useState<string[]>([''])`
2. Replace file input with text inputs
3. Remove upload functions
4. Save URLs directly to `listing_images.image_url`

## References

- [Supabase Storage Docs](https://supabase.com/docs/guides/storage)
- [Supabase Storage Security](https://supabase.com/docs/guides/storage/security)
- [Supabase RLS Policies](https://supabase.com/docs/guides/auth/row-level-security)
