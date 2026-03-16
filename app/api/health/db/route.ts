import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()

  const { error } = await supabase.from('listings').select('id', { head: true, count: 'exact' }).limit(1)

  if (error && (error as any).code === '42P01') {
    return NextResponse.json({ setup: false }, { status: 200 })
  }

  return NextResponse.json({ setup: true }, { status: 200 })
}
