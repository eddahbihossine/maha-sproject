import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('user_profiles')
    .select('budget_min, budget_max')
    .eq('id', user.id)
    .maybeSingle()

  if (error) {
    return NextResponse.json({ budgetMin: null, budgetMax: null }, { status: 200 })
  }

  return NextResponse.json(
    {
      budgetMin: data?.budget_min ?? null,
      budgetMax: data?.budget_max ?? null,
    },
    { status: 200 }
  )
}
