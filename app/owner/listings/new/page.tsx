'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/AuthProvider'
import { getListingImagesBucketName, uploadListingImage } from '@/lib/supabase/storage'
import { apiFetchJson } from '@/lib/api/http'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { X, Upload } from 'lucide-react'

export default function NewListingPage() {
  const { user } = useAuth()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const bucketName = getListingImagesBucketName()
  const userRole = (user?.user_metadata?.role || 'student').toString()
  const isOwner = userRole === 'owner' || userRole === 'admin'
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<Record<number, number>>({})
  const [images, setImages] = useState<{ file?: File; preview: string }[]>([])
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
  })

  const handleSubmit = async () => {
    if (!user?.id) {
      alert('Please log in first.')
      return
    }

    if (!isOwner) {
      alert('Only owner accounts can create listings.')
      return
    }

    const missing: string[] = []
    if (!form.title.trim()) missing.push('Title')
    if (!form.description.trim()) missing.push('Description')
    if (!form.address.trim()) missing.push('Address')
    if (!form.city.trim()) missing.push('City')
    if (!form.postal_code.trim()) missing.push('Postal code')
    if (!form.available_from.trim()) missing.push('Available from')
    if (!Number.isFinite(Number(form.surface_area)) || Number(form.surface_area) <= 0) missing.push('Surface (m²)')
    if (!Number.isFinite(Number(form.num_bathrooms)) || Number(form.num_bathrooms) < 1) missing.push('Bathrooms')
    if (!Number.isFinite(Number(form.minimum_stay_months)) || Number(form.minimum_stay_months) < 1) {
      missing.push('Min stay (months)')
    }

    if (missing.length > 0) {
      alert(`Please fill in: ${missing.join(', ')}`)
      return
    }

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
        available_from: form.available_from,
        minimum_stay_months: Number(form.minimum_stay_months),
        amenities: form.amenities
          .split(',')
          .map((a) => a.trim())
          .filter(Boolean),
        status: 'active',
      }

      const created = await apiFetchJson<{ listing: any }>('/api/owner/listings', {
        method: 'POST',
        body: JSON.stringify(payload),
      })

      const listingId = created.listing?.id
      if (!listingId) throw new Error('No listing ID returned')

      // Upload images if any (non-blocking - listing creation succeeds even if images fail)
      const imagesToUpload = images.filter((img) => img.file)
      
      if (imagesToUpload.length > 0) {
        setUploading(true)
        const imageRows = []
        let bucketNotFound = false
        
        for (let i = 0; i < imagesToUpload.length; i++) {
          const image = imagesToUpload[i]
          
          try {
            setUploadProgress((prev) => ({ ...prev, [i]: 50 }))
            const url = await uploadListingImage(image.file!, String(listingId))
            setUploadProgress((prev) => ({ ...prev, [i]: 100 }))
            
            imageRows.push({
              image_url: url,
              sort_order: i,
              is_primary: i === 0,
            })
          } catch (err) {
            const errMsg = err instanceof Error ? err.message : String(err)
            if (errMsg.includes('Bucket not found')) {
              bucketNotFound = true
              console.warn('Storage bucket not found - images cannot be uploaded yet')
            } else if (errMsg.includes('RLS policies')) {
              console.warn('Storage bucket RLS policies block uploads - please configure permissions')
              alert(`Storage bucket needs permission setup. Go to Supabase → Storage → ${bucketName} → Policies and allow authenticated uploads.`)
            } else {
              console.error(`Failed to upload image ${i}:`, err)
            }
          }
        }

        if (imageRows.length > 0) {
          try {
            await apiFetchJson(`/api/owner/listings/${listingId}`, {
              method: 'PATCH',
              body: JSON.stringify({ images: imageRows }),
            })
          } catch (err) {
            const msg = err instanceof Error ? err.message : String(err)
            console.error('Image save error:', msg)
            alert(`Listing created, but images failed to save: ${msg}`)
          }
        }
        
        setUploading(false)
        
        if (bucketNotFound) {
          alert(
            `Listing created! Image uploads failed because the Supabase Storage bucket "${bucketName}" was not found. Create that bucket in Supabase → Storage, or set NEXT_PUBLIC_LISTING_IMAGES_BUCKET to an existing bucket name, then restart.`
          )
        }
      }

      router.push('/owner/listings')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.error('Submit error:', errorMessage)
      alert(`Error creating listing: ${errorMessage}`)
      setSaving(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    files.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (event) => {
        setImages((prev) => [
          ...prev,
          {
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

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Add Listing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isOwner && (
            <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm">
              You are currently logged in as <span className="font-semibold">{userRole}</span>. Only
              owner accounts can create listings.
            </div>
          )}

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
                  {uploading ? 'Uploading...' : 'Select Images'}
                </Button>
              </div>
            </div>
          </div>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? 'Saving...' : 'Create Listing'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
