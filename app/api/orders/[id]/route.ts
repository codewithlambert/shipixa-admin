import { NextRequest, NextResponse } from 'next/server'
import { getAdmin } from '@/lib/supabase-admin'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = getAdmin()
  const { data, error } = await (supabase
    .from('orders')
    .select('*, tracking_updates(*), packages(*)')
    .eq('id', id)
    .single() as any)

  if (error) return NextResponse.json({ error: error.message }, { status: 404 })
  return NextResponse.json(data)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const supabase = getAdmin()
  
  // Get the current order to check if receiver_email changed
  const { data: oldOrder } = await (supabase
    .from('orders')
    .select('receiver_email, tracking_code, product_name, origin, destination, estimated_delivery, currency, price')
    .eq('id', id)
    .single() as any)
  
  // Extract only the fields that can be updated
  const {
    product_name,
    sender_name,
    sender_address,
    receiver_name,
    receiver_address,
    receiver_email,
    origin,
    destination,
    estimated_delivery,
    description,
    price,
    currency
  } = body
  
  const updateData: Partial<{
    product_name: string
    sender_name: string
    sender_address: string
    receiver_name: string
    receiver_address: string
    receiver_email: string
    origin: string
    destination: string
    estimated_delivery: string
    description: string
    price: number
    currency: string
  }> = {}
  
  if (product_name !== undefined) updateData.product_name = product_name
  if (sender_name !== undefined) updateData.sender_name = sender_name
  if (sender_address !== undefined) updateData.sender_address = sender_address
  if (receiver_name !== undefined) updateData.receiver_name = receiver_name
  if (receiver_address !== undefined) updateData.receiver_address = receiver_address
  if (receiver_email !== undefined) updateData.receiver_email = receiver_email
  if (origin !== undefined) updateData.origin = origin
  if (destination !== undefined) updateData.destination = destination
  if (estimated_delivery !== undefined) updateData.estimated_delivery = estimated_delivery
  if (description !== undefined) updateData.description = description
  if (price !== undefined) updateData.price = price
  if (currency !== undefined) updateData.currency = currency
  
  const { data, error } = await (supabase
    .from('orders') as any)
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  
  // Send email notification if receiver_email changed
  if (oldOrder && receiver_email !== undefined && receiver_email !== oldOrder.receiver_email && receiver_email) {
    try {
      const brevoKey = process.env.BREVO_SMTP_KEY
      const fromEmail = process.env.FROM_EMAIL || 'shipshipixa@gmail.com'
      
      if (brevoKey) {
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_MAIN_SITE_URL || 'https://shipixa.vercel.app'
        const trackingUrl = `${siteUrl}/track/${oldOrder.tracking_code}?email=${encodeURIComponent(receiver_email)}`
        
        const emailResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'api-key': brevoKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sender: { name: 'Shipixa', email: fromEmail },
            to: [{ email: receiver_email, name: receiver_name || 'Recipient' }],
            subject: `Your Shipment Information — Tracking Code: ${oldOrder.tracking_code}`,
            htmlContent: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #f97316;">Your Shipment Information</h2>
                <p>Hello <strong>${receiver_name || 'Recipient'}</strong>,</p>
                <p>Your shipment <strong>${data.product_name || oldOrder.product_name}</strong> information has been updated. Here are your tracking details:</p>
                <div style="background: #fff7ed; border-left: 4px solid #f97316; padding: 15px; margin: 20px 0;">
                  <p style="margin: 0; font-size: 14px; color: #666;">Tracking Code</p>
                  <p style="margin: 5px 0 0; font-size: 24px; font-weight: bold; color: #1f2937; font-family: monospace;">${oldOrder.tracking_code}</p>
                </div>
                <p><strong>Shipment Details:</strong></p>
                <ul style="color: #666;">
                  <li>From: ${data.origin || oldOrder.origin}</li>
                  <li>To: ${data.destination || oldOrder.destination}</li>
                  ${data.estimated_delivery || oldOrder.estimated_delivery ? `<li>Estimated Delivery: ${new Date(data.estimated_delivery || oldOrder.estimated_delivery).toLocaleDateString()}</li>` : ''}
                </ul>
                ${data.price || oldOrder.price ? `
                <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0;">
                  <p style="margin: 0; font-size: 14px; color: #666;">Payment Required</p>
                  <p style="margin: 5px 0 0; font-size: 20px; font-weight: bold; color: #1f2937;">${data.currency || oldOrder.currency || 'USD'} ${parseFloat(data.price || oldOrder.price).toFixed(2)}</p>
                </div>` : ''}
                <a href="${trackingUrl}" style="display:inline-block;background:#f97316;color:white;padding:12px 30px;text-decoration:none;border-radius:8px;font-weight:bold;margin:20px 0;">Track Your Shipment →</a>
                <p style="color:#999;font-size:12px;margin-top:30px;">This is an automated message from Shipixa.</p>
              </div>
            `
          })
        })
        
        if (!emailResponse.ok) {
          const errorText = await emailResponse.text()
          console.error('[Orders PATCH API] Brevo email error:', errorText)
        } else {
          const result = await emailResponse.json()
          console.log('[Orders PATCH API] Email sent to:', receiver_email, 'Message ID:', result.messageId)
        }
      }
    } catch (emailError) {
      console.error('[Orders PATCH API] Failed to send email notification:', emailError)
    }
  }
  
  return NextResponse.json(data)
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = getAdmin()
  
  // First, get the order and its packages to retrieve image URLs
  const { data: order } = await (supabase
    .from('orders')
    .select('image_urls, packages(image_urls)')
    .eq('id', id)
    .single() as any)

  // Collect all image URLs from order and packages
  const allImageUrls: string[] = []
  
  if (order?.image_urls && Array.isArray(order.image_urls)) {
    allImageUrls.push(...order.image_urls)
  }
  
  if (order?.packages && Array.isArray(order.packages)) {
    order.packages.forEach((pkg: any) => {
      if (pkg.image_urls && Array.isArray(pkg.image_urls)) {
        allImageUrls.push(...pkg.image_urls)
      }
    })
  }

  // Delete all images from storage if they exist
  if (allImageUrls.length > 0) {
    try {
      // Extract file paths from URLs
      const filePaths = allImageUrls.map((url: string) => {
        // URL format: https://{project}.supabase.co/storage/v1/object/public/shipixa/{path}
        const match = url.match(/\/shipixa\/(.+)$/)
        return match ? match[1] : null
      }).filter(Boolean)

      if (filePaths.length > 0) {
        await supabase.storage
          .from('shipixa')
          .remove(filePaths as string[])
      }
    } catch (storageError) {
      console.error('Failed to delete images from storage:', storageError)
      // Continue with order deletion even if image deletion fails
    }
  }

  // Delete the order (packages and tracking_updates will be cascade deleted)
  const { error } = await supabase.from('orders').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  
  return NextResponse.json({ success: true })
}
