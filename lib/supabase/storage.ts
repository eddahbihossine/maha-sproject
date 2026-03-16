import { createClient } from './client'

const BUCKET_NAME = 'listing-images'

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
    .from(BUCKET_NAME)
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
    .from(BUCKET_NAME)
    .getPublicUrl(data.path)

  return publicUrlData.publicUrl
}

/**
 * Delete a file from Supabase Storage
 * @param publicUrl - The public URL of the file to delete
 */
export async function deleteListingImage(publicUrl: string): Promise<void> {
  const supabase = createClient()
  
  // Extract file path from public URL
  const urlParts = publicUrl.split('/')
  const filePath = urlParts.slice(urlParts.indexOf(BUCKET_NAME) + 1).join('/')

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([filePath])

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
    .from(BUCKET_NAME)
    .list(listingId)

  if (listError) {
    console.error(`Failed to list files: ${listError.message}`)
    return
  }

  if (data && data.length > 0) {
    const filePaths = data.map((file) => `${listingId}/${file.name}`)
    
    const { error: deleteError } = await supabase.storage
      .from(BUCKET_NAME)
      .remove(filePaths)

    if (deleteError) {
      console.error(`Failed to delete files: ${deleteError.message}`)
    }
  }
}
