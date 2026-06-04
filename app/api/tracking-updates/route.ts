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
    // Fetch the order with all tracking updates
    const { data: order } = await (supabase as any)
      .from('orders')
      .select('*, tracking_updates(*)')
      .eq('id', order_id)
      .single()

    if (!order) {
      console.error('[Tracking Updates API] Order not found:', order_id)
    } else if (!order.receiver_email) {
      console.error('[Tracking Updates API] No receiver email for order:', order_id)
    } else {
      const brevoKey = process.env.BREVO_SMTP_KEY
      const fromEmail = process.env.FROM_EMAIL || 'shipshipixa@gmail.com'

      if (!brevoKey) {
        console.error('[Tracking Updates API] BREVO_SMTP_KEY not configured')
      } else {
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_MAIN_SITE_URL || 'https://shipixa.vercel.app'
        const trackingLink = `${siteUrl}/track/${order.tracking_code}?email=${encodeURIComponent(order.receiver_email)}`

        // Sort updates chronologically
        const sortedUpdates = (order.tracking_updates ?? []).sort((a: any, b: any) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        )

        // Format updates for email
        const updates = sortedUpdates.map((u: any, i: number) => ({
          label: u.event_label || u.status,
          time: u.is_expected
            ? (u.expected_time || 'Expected')
            : new Date(u.created_at).toLocaleString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
              }),
          location: u.location,
          description: u.description,
          done: !u.is_expected && i < sortedUpdates.length - 1,
          active: !u.is_expected && i === sortedUpdates.length - 1,
        }))

        // Build timeline HTML
        let timelineHtml = ''
        updates.forEach((update: any) => {
          const statusEmojis: any = {
            'Pending': '📦',
            'Picked Up': '📬',
            'In Transit': '🚚',
            'Arrived at Facility': '🏭',
            'Out for Delivery': '🛵',
            'Delivered': '✅'
          }
          const emoji = statusEmojis[update.label] || '📍'
          const circleColor = update.active ? '#f97316' : update.done ? '#22c55e' : '#e5e7eb'
          const lineColor = update.done ? '#22c55e' : '#e5e7eb'

          timelineHtml += `
            <div style="display: flex; margin-bottom: 24px;">
              <div style="text-align: center; width: 60px; flex-shrink: 0;">
                <div style="width: 40px; height: 40px; background: ${circleColor}; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px; margin: 0 auto;">${emoji}</div>
                ${!update.active ? `<div style="width: 3px; height: 40px; background: ${lineColor}; margin: 0 auto;"></div>` : ''}
              </div>
              <div style="flex: 1; padding-left: 20px;">
                <p style="margin: 0; font-weight: bold; color: #1f2937;">${update.label}</p>
                <p style="margin: 4px 0 0; font-size: 13px; color: #64748b;">${update.time}</p>
                ${update.location ? `<p style="margin: 4px 0 0; font-size: 13px; color: #64748b;">📍 ${update.location}</p>` : ''}
                ${update.description ? `<p style="margin: 4px 0 0; font-size: 13px; color: #475569;">${update.description}</p>` : ''}
              </div>
            </div>
          `
        })

        const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #0a2540, #1c4f8a); padding: 32px; text-align: center; border-radius: 16px 16px 0 0;">
              <p style="margin: 0; font-size: 24px; font-weight: 900; color: white;">Ship<span style="color: #f97316;">ixa</span></p>
            </div>
            <div style="background: #fff; padding: 32px; border-radius: 0 0 16px 16px; border: 1px solid #e2e8f0;">
              <h2 style="color: #0a2540; margin: 0 0 8px 0;">🚚 Shipment Update: ${order.current_status}</h2>
              <p style="color: #64748b; margin: 0 0 24px 0;">Tracking Code: <strong style="font-family: monospace;">${order.tracking_code}</strong></p>
              
              <div style="background: #f8fafc; border-left: 4px solid #f97316; padding: 16px; margin-bottom: 24px; border-radius: 8px;">
                <p style="margin: 0; font-size: 14px; font-weight: bold; color: #1f2937;">${order.product_name}</p>
                <p style="margin: 8px 0 0; font-size: 13px; color: #64748b;">From ${order.origin} → ${order.destination}</p>
              </div>

              <h3 style="color: #1f2937; font-size: 16px; margin: 24px 0 16px 0;">📋 Timeline</h3>
              ${timelineHtml}

              <a href="${trackingLink}" style="display: inline-block; background: #f97316; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 24px;">View Full Details →</a>
              
              <p style="color: #94a3b8; font-size: 12px; margin-top: 32px; border-top: 1px solid #e2e8f0; padding-top: 16px;">
                © ${new Date().getFullYear()} Shipixa. This is an automated message.
              </p>
            </div>
          </div>
        `

        try {
          const emailResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
              'api-key': brevoKey,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              sender: { name: 'Shipixa', email: fromEmail },
              to: [{ email: order.receiver_email, name: order.receiver_name }],
              subject: `🚚 Shipment Update: ${order.current_status} — ${order.tracking_code}`,
              htmlContent: emailHtml,
            }),
          })

          if (!emailResponse.ok) {
            const errorText = await emailResponse.text()
            console.error('[Tracking Updates API] Brevo email error:', errorText)
          } else {
            const result = await emailResponse.json()
            console.log('[Tracking Updates API] Email sent to:', order.receiver_email, 'Message ID:', result.messageId)
          }
        } catch (fetchError) {
          console.error('[Tracking Updates API] Failed to send email:', fetchError)
        }
      }
    }
  } catch (error) {
    console.error('[Tracking Updates API] Error in email notification:', error)
  }

  return NextResponse.json(data, { status: 201 })
}
