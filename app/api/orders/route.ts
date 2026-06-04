import { NextRequest, NextResponse } from 'next/server'
import { getAdmin } from '@/lib/supabase-admin'

function generateTrackingCode() {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const numbers = '0123456789'
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  
  let code = 'TRK-'
  // Generate 8 random characters (mix of letters and numbers)
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { product_name, sender_name, receiver_name, receiver_email, origin, destination, estimated_delivery, description, packages, price, currency } = body

  if (!product_name || !sender_name || !receiver_name || !receiver_email || !origin || !destination) {
    return NextResponse.json({ error: 'All fields required' }, { status: 400 })
  }

  const tracking_code = generateTrackingCode()
  const supabase = getAdmin() as any

  // Prepare order data
  const orderData: any = {
    tracking_code,
    product_name,
    sender_name,
    receiver_name,
    receiver_email,
    origin,
    destination,
    estimated_delivery,
    description,
    current_status: 'Pending',
  }

  // Add price fields if provided
  if (price && parseFloat(price) > 0) {
    orderData.price = parseFloat(price)
    orderData.currency = currency || 'USD'
    orderData.payment_status = 'unpaid'
  }

  const { data, error } = await (supabase
    .from('orders')
    .insert(orderData)
    .select()
    .single() as any)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const order = data as any

  // Insert packages with their images
  if (packages?.length) {
    const packageRows = packages.map((p: any) => ({
      order_id: order.id,
      package_name: p.package_name || null,
      weight: p.weight || null,
      dimensions: p.dimensions || null,
      description: p.description || null,
      image_urls: p.image_urls || []
    }))
    
    const { error: pkgError } = await (supabase.from('packages').insert(packageRows) as any)
    if (pkgError) {
      console.error('Failed to insert packages:', pkgError)
    }
  }

  // Send welcome email to receiver with tracking code and link
  try {
    const brevoKey = process.env.BREVO_SMTP_KEY
    const fromEmail = process.env.FROM_EMAIL || 'shipshipixa@gmail.com'

    if (!brevoKey) {
      console.error('[Orders API] BREVO_SMTP_KEY not configured')
    } else {
      const trackingUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/track/${tracking_code}?email=${encodeURIComponent(receiver_email)}`

      const emailResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': brevoKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sender: { name: 'Shipixa', email: fromEmail },
          to: [{ email: receiver_email, name: receiver_name }],
          subject: `Your Shipment is Ready - Tracking Code: ${tracking_code}`,
          htmlContent: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #f97316;">Your Shipment Has Been Created!</h2>
              <p>Hello <strong>${receiver_name}</strong>,</p>
              <p>Your shipment <strong>${product_name}</strong> has been created and is ready for tracking.</p>
              <div style="background: #fff7ed; border-left: 4px solid #f97316; padding: 15px; margin: 20px 0;">
                <p style="margin: 0; font-size: 14px; color: #666;">Tracking Code</p>
                <p style="margin: 5px 0 0; font-size: 24px; font-weight: bold; color: #1f2937; font-family: monospace;">${tracking_code}</p>
              </div>
              ${price && parseFloat(price) > 0 ? `
              <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0;">
                <p style="margin: 0; font-size: 14px; color: #666;">Payment Required</p>
                <p style="margin: 5px 0 0; font-size: 20px; font-weight: bold; color: #1f2937;">${currency} ${parseFloat(price).toFixed(2)}</p>
              </div>` : ''}
              <p><strong>Shipment Details:</strong></p>
              <ul style="color: #666;">
                <li>From: ${origin}</li>
                <li>To: ${destination}</li>
                ${estimated_delivery ? `<li>Estimated Delivery: ${new Date(estimated_delivery).toLocaleDateString()}</li>` : ''}
              </ul>
              <a href="${trackingUrl}" style="display:inline-block;background:#f97316;color:white;padding:12px 30px;text-decoration:none;border-radius:8px;font-weight:bold;margin:20px 0;">Track Your Shipment →</a>
              <p style="color:#999;font-size:12px;margin-top:30px;">This is an automated message from Shipixa.</p>
            </div>
          `
        })
      })

      if (!emailResponse.ok) {
        const errorText = await emailResponse.text()
        console.error('[Orders API] Brevo email error:', errorText)
      } else {
        const result = await emailResponse.json()
        console.log('[Orders API] Email sent to:', receiver_email, 'Message ID:', result.messageId)
      }
    }
  } catch (emailError) {
    console.error('[Orders API] Failed to send email:', emailError)
  }

  return NextResponse.json(order, { status: 201 })
}

export async function GET() {
  const supabase = getAdmin() as any
  const { data, error } = await supabase
    .from('orders')
    .select('*, packages(*)')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
