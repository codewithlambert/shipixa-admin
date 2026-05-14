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
