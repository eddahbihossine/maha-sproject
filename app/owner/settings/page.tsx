'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth/AuthProvider'
import { apiFetchJson } from '@/lib/api/http'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'

export default function OwnerSettingsPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    company_name: '',
    phone_number: '',
    preferred_language: 'en',
  })

  useEffect(() => {
    if (!user?.id) return

    const loadProfile = async () => {
      setLoading(true)
      const result = await apiFetchJson<{ profile: any }>('/api/profile').catch(() => null)
      const data = result?.profile

      if (data) {
        setForm({
          company_name: data.company_name || '',
          phone_number: data.phone_number || '',
          preferred_language: data.preferred_language || 'en',
        })
      }
      setLoading(false)
    }

    loadProfile()
  }, [user])

  const handleSave = async () => {
    if (!user?.id) return
    setSaving(true)
    await apiFetchJson<{ ok: boolean }>('/api/profile', {
      method: 'PATCH',
      body: JSON.stringify({
        company_name: form.company_name || null,
        phone_number: form.phone_number || null,
        preferred_language: form.preferred_language || 'en',
      }),
    }).catch(() => null)
    setSaving(false)
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
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your profile information</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="company_name">Company Name</Label>
            <Input
              id="company_name"
              value={form.company_name}
              onChange={(e) => setForm({ ...form, company_name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone_number">Phone Number</Label>
            <Input
              id="phone_number"
              value={form.phone_number}
              onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="preferred_language">Preferred Language</Label>
            <Input
              id="preferred_language"
              value={form.preferred_language}
              onChange={(e) => setForm({ ...form, preferred_language: e.target.value })}
            />
          </div>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
