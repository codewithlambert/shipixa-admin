import { NextRequest, NextResponse } from 'next/server'
import { getAdmin } from '@/lib/supabase-admin'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const brevoKey = process.env.BREVO_SMTP_KEY
    const fromEmail = process.env.FROM_EMAIL || 'shipshipixa@gmail.com'
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://shipixa.vercel.app'

    console.log('[Email API] Request received:', { 
      hasOrderId: !!body.order_id, 
      hasDirect: !!(body.to && body.subject), 
      fromEmail 
    })

    if (!brevoKey) {
      console.error('[Email API] Missing BREVO_SMTP_KEY')
      return NextResponse.json({ error: 'Email service not configured' }, { status: 500 })
    }

    // Handle order_id based emails
    if (body.order_id) {
      const db = getAdmin() as any
      const { data: order } = await db
        .from('orders')
        .select('*')
        .eq('id', body.order_id)
        .single()

      if (!order) {
        console.error('[Email API] Order not found:', body.order_id)
        return NextResponse.json({ error: 'Order not found' }, { status: 404 })
      }
      if (!order.receiver_email) {
        console.error('[Email API] No receiver email for order:', body.order_id)
        return NextResponse.json({ error: 'No receiver email' }, { status: 400 })
      }

      const trackingUrl = `${siteUrl}/track/${order.tracking_code}?email=${encodeURIComponent(order.receiver_email)}`
      const type = body.type || 'created'

      console.log('[Email API] Sending email:', {
        to: order.receiver_email,
        trackingCode: order.tracking_code,
        type,
        from: fromEmail
      })

      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: { 'api-key': brevoKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: { name: 'Shipixa', email: fromEmail },
          to: [{ email: order.receiver_email, name: order.receiver_name }],
          subject: type === 'created'
            ? `📦 Your Shipment Has Been Created — ${order.tracking_code}`
            : `🚚 Shipment Update: ${order.current_status} — ${order.tracking_code}`,
          htmlContent: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
              <div style="background:linear-gradient(135deg,#0a2540,#1c4f8a);padding:32px;text-align:center;border-radius:16px 16px 0 0;">
                <span style="font-size:24px;font-weight:900;color:#fff;">Ship<span style="color:#f97316;">ixa</span></span>
              </div>
              <div style="background:#fff;padding:32px;border-radius:0 0 16px 16px;border:1px solid #e2e8f0;">
                <h2 style="color:#0a2540;">Hi ${order.receiver_name},</h2>
                <p style="color:#64748b;">${type === 'created' ? 'Your shipment has been created and is ready for tracking.' : 'Your shipment details have been updated.'}</p>
                <div style="background:#fff7ed;border-left:4px solid #f97316;padding:16px;margin:20px 0;border-radius:8px;">
                  <p style="margin:0;color:#666;font-size:12px;">Tracking Code</p>
                  <p style="margin:4px 0 0;font-size:22px;font-weight:bold;color:#1f2937;font-family:monospace;">${order.tracking_code}</p>
                </div>
                <table style="width:100%;border-collapse:collapse;margin:20px 0;">
                  <tr><td style="padding:8px 0;border-bottom:1px solid #f1f5f9;color:#94a3b8;font-size:13px;">Product</td><td style="padding:8px 0;border-bottom:1px solid #f1f5f9;font-weight:600;text-align:right;">${order.product_name}</td></tr>
                  <tr><td style="padding:8px 0;border-bottom:1px solid #f1f5f9;color:#94a3b8;font-size:13px;">From</td><td style="padding:8px 0;border-bottom:1px solid #f1f5f9;font-weight:600;text-align:right;">${order.origin}</td></tr>
                  <tr><td style="padding:8px 0;border-bottom:1px solid #f1f5f9;color:#94a3b8;font-size:13px;">To</td><td style="padding:8px 0;border-bottom:1px solid #f1f5f9;font-weight:600;text-align:right;">${order.destination}</td></tr>
                  <tr><td style="padding:8px 0;color:#94a3b8;font-size:13px;">Status</td><td style="padding:8px 0;font-weight:600;text-align:right;">${order.current_status}</td></tr>
                  ${order.price ? `<tr><td style="padding:8px 0;border-top:1px solid #f1f5f9;color:#94a3b8;font-size:13px;">Amount Due</td><td style="padding:8px 0;border-top:1px solid #f1f5f9;font-weight:700;color:#f97316;text-align:right;">${order.currency} ${Number(order.price).toFixed(2)}</td></tr>` : ''}
                </table>
                <div style="text-align:center;margin:28px 0;">
                  <a href="${trackingUrl}" style="display:inline-block;background:#f97316;color:#fff;padding:14px 36px;border-radius:50px;font-weight:700;text-decoration:none;font-size:15px;">📦 Track Your Shipment</a>
                </div>
                <p style="color:#94a3b8;font-size:12px;text-align:center;">© ${new Date().getFullYear()} Shipixa. All rights reserved.</p>
              </div>
            </div>
          `,
        }),
      })

      if (!response.ok) {
        const err = await response.text()
        console.error('[Email API] Brevo error:', err)
        return NextResponse.json({ error: 'Failed to send email', details: err }, { status: 500 })
      }

      const result = await response.json()
      console.log('[Email API] Email sent successfully:', result)
      return NextResponse.json({ success: true, messageId: result.messageId })
    }

    // Handle direct to/subject/html emails
    const { to, subject, html } = body
    if (!to || !subject || !html) {
      console.error('[Email API] Missing fields:', { hasTo: !!to, hasSubject: !!subject, hasHtml: !!html })
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    console.log('[Email API] Sending direct email:', { to, subject, from: fromEmail })

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'api-key': brevoKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sender: { name: 'Shipixa', email: fromEmail },
        to: [{ email: to }],
        subject,
        htmlContent: html,
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('[Email API] Brevo error:', err)
      return NextResponse.json({ error: 'Failed to send email', details: err }, { status: 500 })
    }

    const result = await response.json()
    console.log('[Email API] Email sent successfully:', result)
    return NextResponse.json({ success: true, messageId: result.messageId })
  } catch (error) {
    console.error('[Email API] Send email error:', error)
    return NextResponse.json({ error: 'Failed to send email', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}
