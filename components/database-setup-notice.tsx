'use client'

import { useState, useEffect } from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { AlertTriangle, ExternalLink, X } from 'lucide-react'
import { apiFetchJson } from '@/lib/api/http'

export function DatabaseSetupNotice() {
  const [isSetup, setIsSetup] = useState<boolean | null>(null)
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    const checkDatabase = async () => {
      const result = await apiFetchJson<{ setup: boolean }>('/api/health/db').catch(() => null)
      setIsSetup(result?.setup ?? true)
    }

    checkDatabase()
  }, [])

  // Don't show anything while checking or if already set up or dismissed
  if (isSetup === null || isSetup === true || isDismissed) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md animate-in slide-in-from-bottom-5">
      <Alert variant="destructive" className="relative pr-12">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Database Not Set Up</AlertTitle>
        <AlertDescription className="mt-2 space-y-2">
          <p className="text-sm">
            Your Supabase database tables haven't been created yet. The app won't work
            without them.
          </p>
          <div className="flex flex-col gap-2">
            <Button
              size="sm"
              variant="outline"
              className="w-full"
              asChild
            >
              <a
                href="https://supabase.com/dashboard/project/seclzlldxpfpfrjvkzip/sql"
                target="_blank"
                rel="noopener noreferrer"
              >
                Open Supabase SQL Editor
                <ExternalLink className="ml-2 h-3 w-3" />
              </a>
            </Button>
            <p className="text-xs text-muted-foreground">
              Then run the <code className="bg-muted px-1 py-0.5 rounded">supabase-schema.sql</code> file
            </p>
          </div>
        </AlertDescription>
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 h-6 w-6"
          onClick={() => setIsDismissed(true)}
        >
          <X className="h-4 w-4" />
        </Button>
      </Alert>
    </div>
  )
}
