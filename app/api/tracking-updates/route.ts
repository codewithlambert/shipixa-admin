import { NextRequest, NextResponse } from 'next/server'
import { getAdmin } from '@/lib/supabase-admin'

const VALID_STATUSES = ['Pending', 'Picked Up', 'In Transit', 'Arrived at Facility', 'Out for Delivery', 'Delivered']

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { order_id, status, event_label, location, description, expected_time, is_expected } = body

  if (!order_id || !status) {
    return NextResponse.json({ error: 'order_id and status are required' }, { status: 400 })
  }

  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  const supabase = getAdmin()
  const { data, error } = await supabase
    .from('tracking_updates')
    .insert({
      order_id,
      status,
      event_label: event_label || status,
      location: location || '',
      description,
      expected_time,
      is_expected: is_expected ?? false,
    } as any)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (!is_expected) {
    await (supabase.from('orders') as any).update({ current_status: status }).eq('id', order_id)
  }

  // Send email notification
  try {
    await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/send-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order_id })
    })
  } catch {}

  return NextResponse.json(data, { status: 201 })
}
