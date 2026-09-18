import { NextRequest, NextResponse } from 'next/server'
import { getAdmin } from '@/lib/supabase-admin'
import { requireAdmin } from '@/lib/auth'

export async function POST(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin()) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  const { id } = await params
  const supabase = getAdmin() as any
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single()

  if (orderError || !order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  if (order.payment_status === 'paid') {
    return NextResponse.json({ error: 'Payment has already been confirmed' }, { status: 409 })
  }

  const { data: updatedOrder, error: updateError } = await supabase
    .from('orders')
    .update({
      payment_status: 'paid',
      payment_method: 'crypto',
      payment_verified_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (updateError) {
    return NextResponse.json({ error: 'Could not confirm payment' }, { status: 500 })
  }

  try {
    const brevoKey = process.env.BREVO_SMTP_KEY
    const fromEmail = process.env.FROM_EMAIL || 'shipshipixa@gmail.com'
    const siteUrl = process.env.NEXT_PUBLIC_MAIN_SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://shipixa.vercel.app'

    if (brevoKey && updatedOrder.receiver_email) {
      await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: { 'api-key': brevoKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: { name: 'Shipixa', email: fromEmail },
          to: [{ email: updatedOrder.receiver_email, name: updatedOrder.receiver_name || 'Customer' }],
          subject: `Payment Confirmed — ${updatedOrder.tracking_code}`,
          htmlContent: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:32px;background:#f8fafc;">
              <div style="background:#111113;color:#fff;padding:28px;border-radius:16px 16px 0 0;text-align:center;font-size:24px;font-weight:800;">Ship<span style="color:#f2662d">ixa</span></div>
              <div style="background:#fff;padding:32px;border-radius:0 0 16px 16px;">
                <h2 style="margin:0 0 12px;color:#16a34a;">Payment Confirmed</h2>
                <p>Hello ${updatedOrder.receiver_name || 'Customer'},</p>
                <p>Your crypto payment for <strong>${updatedOrder.product_name}</strong> has been confirmed. Your shipment can now proceed.</p>
                <p style="margin:24px 0;padding:16px;background:#fff7ed;border-radius:10px;"><strong>Tracking code:</strong> ${updatedOrder.tracking_code}</p>
                <a href="${siteUrl}/track/${updatedOrder.tracking_code}" style="display:inline-block;background:#f2662d;color:#111113;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700;">Track shipment</a>
              </div>
            </div>`,
        }),
      })
    }
  } catch (emailError) {
    console.error('Payment confirmation email failed:', emailError)
  }

  return NextResponse.json({ success: true, order: updatedOrder })
}
