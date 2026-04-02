'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/AuthProvider'
import { apiFetchJson } from '@/lib/api/http'
import { getListingImagesBucketName, uploadListingImage } from '@/lib/supabase/storage'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import { X, Upload } from 'lucide-react'

export default function EditListingPage() {
  const { user } = useAuth()
  const params = useParams()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const listingId = params.id as string
  const bucketName = getListingImagesBucketName()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<Record<number, number>>({})
  const [images, setImages] = useState<
    { url: string; isExisting: boolean; file?: File; preview: string }[]
  >([])
  const [form, setForm] = useState({
    title: '',
    description: '',
    property_type: 'apartment',
    address: '',
    city: '',
    postal_code: '',
    surface_area: 0,
    num_bedrooms: 1,
    num_bathrooms: 1,
    furnished: true,
    rent_monthly: 0,
    charges_amount: 0,
    charges_included: false,
    deposit_amount: 0,
    available_from: '',
    minimum_stay_months: 3,
    amenities: '',
    status: 'draft',
  })

  useEffect(() => {
    if (!user?.id || !listingId) return

    const loadListing = async () => {
      setLoading(true)
      try {
        const res = await apiFetchJson<{ listing: any }>(`/api/owner/listings/${listingId}`)
        const data = res?.listing

        const loadedImages = (data?.listing_images || [])
          .sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
          .map((img: any) => ({
            url: img.image_url,
            isExisting: true,
            preview: img.image_url,
          }))

        setImages(loadedImages.length ? loadedImages : [])
        setForm({
          title: data?.title || '',
          description: data?.description || '',
          property_type: data?.property_type || 'apartment',
          address: data?.address || '',
          city: data?.city || '',
          postal_code: data?.postal_code || '',
          surface_area: data?.surface_area || 0,
          num_bedrooms: data?.num_bedrooms || 1,
          num_bathrooms: data?.num_bathrooms || 1,
          furnished: data?.furnished ?? true,
          rent_monthly: data?.rent_monthly || 0,
          charges_amount: data?.charges_amount || 0,
          charges_included: data?.charges_included ?? false,
          deposit_amount: data?.deposit_amount || 0,
          available_from: data?.available_from || '',
          minimum_stay_months: data?.minimum_stay_months || 3,
          amenities: Array.isArray(data?.amenities) ? data.amenities.join(', ') : '',
          status: data?.status || 'draft',
        })
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        console.error('Failed to load listing:', message)
        alert(`Failed to load listing: ${message}`)
      }
      setLoading(false)
    }

    loadListing()
  }, [user, listingId])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    files.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (event) => {
        setImages((prev) => [
          ...prev,
          {
            url: '',
            isExisting: false,
            file,
            preview: event.target?.result as string,
          },
        ])
      }
      reader.readAsDataURL(file)
    })
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (!user?.id) return
    setSaving(true)

    try {
      const payload: any = {
        title: form.title,
        description: form.description,
        property_type: form.property_type,
        address: form.address,
        city: form.city,
        postal_code: form.postal_code,
        surface_area: Number(form.surface_area),
        num_bedrooms: Number(form.num_bedrooms),
        num_bathrooms: Number(form.num_bathrooms),
        furnished: form.furnished,
        rent_monthly: Number(form.rent_monthly),
        charges_amount: Number(form.charges_amount),
        charges_included: form.charges_included,
        deposit_amount: Number(form.deposit_amount),
        minimum_stay_months: Number(form.minimum_stay_months),
        amenities: form.amenities
          .split(',')
          .map((a) => a.trim())
          .filter(Boolean),
        status: form.status,
      }

      // Only include available_from if it has a value
      if (form.available_from) {
        payload.available_from = form.available_from
      }

      await apiFetchJson(`/api/owner/listings/${listingId}`, {
        method: 'PATCH',
        body: JSON.stringify({ listing: payload }),
      })

      // Upload new images and rebuild list (non-blocking)
      const imageRows = []
      let bucketNotFound = false
      
      for (let i = 0; i < images.length; i++) {
        const image = images[i]
        let imageUrl = image.url

        // Upload new files
        if (image.file) {
          try {
            setUploading(true)
            setUploadProgress((prev) => ({ ...prev, [i]: 50 }))
            imageUrl = await uploadListingImage(image.file, listingId)
            setUploadProgress((prev) => ({ ...prev, [i]: 100 }))
          } catch (err) {
            const errMsg = err instanceof Error ? err.message : String(err)
            if (errMsg.includes('Bucket not found')) {
              bucketNotFound = true
              console.warn('Storage bucket not found - images cannot be uploaded')
            } else if (errMsg.includes('RLS policies')) {
              console.warn('Storage bucket RLS policies block uploads - please configure permissions')
              alert(`Storage bucket needs permission setup. Go to Supabase → Storage → ${bucketName} → Policies and allow authenticated uploads.`)
            } else {
              console.error(`Failed to upload image ${i}:`, err)
            }
            continue
          }
        }

        // Skip images without URL
        if (!imageUrl) continue

        imageRows.push({
          image_url: imageUrl,
          sort_order: i,
          is_primary: i === 0,
        })
      }

      await apiFetchJson(`/api/owner/listings/${listingId}`, {
        method: 'PATCH',
        body: JSON.stringify({ images: imageRows }),
      })
      
      setUploading(false)
      
      if (bucketNotFound) {
        alert(
          `Listing updated! Image uploads failed because the Supabase Storage bucket "${bucketName}" was not found. Create that bucket in Supabase → Storage, or set NEXT_PUBLIC_LISTING_IMAGES_BUCKET to an existing bucket name, then restart.`
        )
      }

      router.push('/owner/listings')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.error('Submit error:', errorMessage)
      alert(`Error updating listing: ${errorMessage}`)
      setUploading(false)
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-8 w-48" />
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Edit Listing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Property Type</Label>
              <Select value={form.property_type} onValueChange={(value) => setForm({ ...form, property_type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="studio">Studio</SelectItem>
                  <SelectItem value="apartment">Apartment</SelectItem>
                  <SelectItem value="room">Room</SelectItem>
                  <SelectItem value="shared">Shared</SelectItem>
                  <SelectItem value="residence">Residence</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="postal_code">Postal Code</Label>
              <Input id="postal_code" value={form.postal_code} onChange={(e) => setForm({ ...form, postal_code: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="surface_area">Surface (m²)</Label>
              <Input id="surface_area" type="number" value={form.surface_area} onChange={(e) => setForm({ ...form, surface_area: Number(e.target.value) })} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="num_bedrooms">Bedrooms</Label>
              <Input id="num_bedrooms" type="number" value={form.num_bedrooms} onChange={(e) => setForm({ ...form, num_bedrooms: Number(e.target.value) })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="num_bathrooms">Bathrooms</Label>
              <Input id="num_bathrooms" type="number" value={form.num_bathrooms} onChange={(e) => setForm({ ...form, num_bathrooms: Number(e.target.value) })} />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <Checkbox checked={form.furnished} onCheckedChange={(v) => setForm({ ...form, furnished: Boolean(v) })} />
              <Label>Furnished</Label>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="rent_monthly">Rent (monthly)</Label>
              <Input id="rent_monthly" type="number" value={form.rent_monthly} onChange={(e) => setForm({ ...form, rent_monthly: Number(e.target.value) })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="charges_amount">Charges</Label>
              <Input id="charges_amount" type="number" value={form.charges_amount} onChange={(e) => setForm({ ...form, charges_amount: Number(e.target.value) })} />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <Checkbox checked={form.charges_included} onCheckedChange={(v) => setForm({ ...form, charges_included: Boolean(v) })} />
              <Label>Charges Included</Label>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="deposit_amount">Deposit</Label>
              <Input id="deposit_amount" type="number" value={form.deposit_amount} onChange={(e) => setForm({ ...form, deposit_amount: Number(e.target.value) })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="available_from">Available From</Label>
              <Input id="available_from" type="date" value={form.available_from} onChange={(e) => setForm({ ...form, available_from: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="minimum_stay_months">Min Stay (months)</Label>
              <Input id="minimum_stay_months" type="number" value={form.minimum_stay_months} onChange={(e) => setForm({ ...form, minimum_stay_months: Number(e.target.value) })} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="amenities">Amenities (comma separated)</Label>
            <Input id="amenities" value={form.amenities} onChange={(e) => setForm({ ...form, amenities: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Images</Label>
            <div className="space-y-3">
              {/* Image Preview Grid */}
              {images.length > 0 && (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative group rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={image.preview}
                        alt={`Preview ${index}`}
                        className="w-full h-24 object-cover"
                      />
                      {uploadProgress[index] !== undefined && uploadProgress[index] < 100 && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            {uploadProgress[index]}%
                          </span>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      {index === 0 && (
                        <div className="absolute top-1 left-1 px-2 py-1 bg-blue-500 text-white text-xs rounded font-medium">
                          Primary
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Upload Button */}
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={uploading}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="w-full"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {uploading ? 'Uploading...' : 'Add Images'}
                </Button>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={form.status} onValueChange={(value) => setForm({ ...form, status: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="rented">Rented</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
