import { NextRequest, NextResponse } from 'next/server'
import { getAdmin } from '@/lib/supabase-admin'

export async function POST(req: NextRequest) {
  try {
    const { user_id } = await req.json()

    if (!user_id) {
      return NextResponse.json({ isAdmin: false }, { status: 400 })
    }

    const supabase = getAdmin()

    // Check if user has admin role using service role (bypasses RLS)
    const { data, error } = await (supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user_id)
      .single() as any)

    console.log('Check role result:', { user_id, data, error })

    if (error || !data || (data as any).role !== 'admin') {
      return NextResponse.json({ isAdmin: false })
    }

    return NextResponse.json({ isAdmin: true })
  } catch (error) {
    console.error('Check role error:', error)
    return NextResponse.json({ isAdmin: false }, { status: 500 })
  }
}
