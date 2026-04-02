import { createClient } from './client'

export const LISTING_IMAGES_BUCKET =
  (process.env.NEXT_PUBLIC_LISTING_IMAGES_BUCKET || '').trim() || 'listing-images'

export function getListingImagesBucketName(): string {
  return LISTING_IMAGES_BUCKET
}

function extractBucketAndPathFromUrl(publicUrl: string): { bucket: string; path: string } | null {
  // Common Supabase public/signed URL formats
  const patterns: RegExp[] = [
    /\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/,
    /\/storage\/v1\/object\/sign\/([^/]+)\/(.+)$/,
    /\/storage\/v1\/s3\/([^/]+)\/(.+)$/,
  ]

  for (const pattern of patterns) {
    const match = publicUrl.match(pattern)
    if (match?.[1] && match?.[2]) {
      return { bucket: match[1], path: match[2] }
    }
  }

  return null
}

/**
 * Upload a file to Supabase Storage
 * @param file - The file to upload
 * @param listingId - The listing ID (used for organizing files)
 * @returns The public URL of the uploaded file
 */
export async function uploadListingImage(file: File, listingId: string): Promise<string> {
  const supabase = createClient()
  
  // Generate a unique file name
  const timestamp = Date.now()
  const randomId = Math.random().toString(36).substring(2, 9)
  const fileExtension = file.name.split('.').pop()
  const fileName = `${listingId}/${timestamp}-${randomId}.${fileExtension}`

  // Upload file
  const { data, error } = await supabase.storage
    .from(LISTING_IMAGES_BUCKET)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) {
    let errorMsg = error.message
    if (errorMsg.includes('row-level security')) {
      errorMsg = 'Storage bucket exists but RLS policies are blocking uploads. Please configure the bucket permissions.'
    }
    throw new Error(`Failed to upload file: ${errorMsg}`)
  }

  // Get public URL
  const { data: publicUrlData } = supabase.storage
    .from(LISTING_IMAGES_BUCKET)
    .getPublicUrl(data.path)

  return publicUrlData.publicUrl
}

/**
 * Delete a file from Supabase Storage
 * @param publicUrl - The public URL of the file to delete
 */
export async function deleteListingImage(publicUrl: string): Promise<void> {
  const supabase = createClient()

  const extracted = extractBucketAndPathFromUrl(publicUrl)
  const bucket = extracted?.bucket || LISTING_IMAGES_BUCKET
  const filePath = extracted?.path

  if (!filePath) {
    console.error('Failed to delete file: could not parse storage path from URL')
    return
  }

  const { error } = await supabase.storage.from(bucket).remove([filePath])

  if (error) {
    console.error(`Failed to delete file: ${error.message}`)
  }
}

/**
 * Delete all images for a listing
 * @param listingId - The listing ID
 */
export async function deleteListingImages(listingId: string): Promise<void> {
  const supabase = createClient()
  
  const { data, error: listError } = await supabase.storage
    .from(LISTING_IMAGES_BUCKET)
    .list(listingId)

  if (listError) {
    console.error(`Failed to list files: ${listError.message}`)
    return
  }

  if (data && data.length > 0) {
    const filePaths = data.map((file) => `${listingId}/${file.name}`)
    
    const { error: deleteError } = await supabase.storage
      .from(LISTING_IMAGES_BUCKET)
      .remove(filePaths)

    if (deleteError) {
      console.error(`Failed to delete files: ${deleteError.message}`)
    }
  }
}
