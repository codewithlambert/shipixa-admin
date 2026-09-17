import Link from 'next/link'
import { getAdmin } from '@/lib/supabase-admin'
import AdminLayout from '@/components/AdminLayout'
import StatusBadge from '@/components/StatusBadge'
import TrackingTimeline from '@/components/TrackingTimeline'
import CopyButton from '@/components/CopyButton'
import { HugeiconsIcon } from '@hugeicons/react'
import { InboxIcon, ArrowLeft01Icon, Edit02Icon, PinLocation01Icon } from '@hugeicons/core-free-icons'

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = getAdmin() as any
  
  const { data: order } = await supabase
    .from('orders')
    .select('*, tracking_updates(*), packages(*)')
    .eq('id', id)
    .single()

  if (!order) {
    return (
      <AdminLayout>
        <div className="p-10 text-center">
          <HugeiconsIcon icon={InboxIcon} size={36} color="white" className="mx-auto mb-3 opacity-40" />
          <p className="text-white/40">Order not found.</p>
        </div>
      </AdminLayout>
    )
  }

  const updates = (order.tracking_updates || []).sort((a: any, b: any) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  return (
    <AdminLayout>
      <div className="p-6 md:p-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-extrabold text-white">{order.product_name}</h1>
              <StatusBadge status={order.current_status} />
            </div>
            <div className="flex items-center gap-2">
              <p className="font-mono text-sm text-white/40">{order.tracking_code}</p>
              <CopyButton text={order.tracking_code} />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/orders" className="flex items-center gap-1.5 text-sm text-white/40 hover:text-orange-400 transition">
              <HugeiconsIcon icon={ArrowLeft01Icon} size={15} color="currentColor" />
              Back
            </Link>
            <Link href={`/orders/${order.id}/edit`}>
              <button className="flex items-center gap-1.5 border border-white/10 text-white/60 hover:bg-[#1c1c1f] px-5 py-2.5 rounded-xl text-sm font-bold transition">
                <HugeiconsIcon icon={Edit02Icon} size={15} color="currentColor" />
                Edit Order
              </button>
            </Link>
            <Link href={`/orders/${order.id}/update`}>
              <button className="bg-[#f2662d] hover:brightness-105 text-black px-5 py-2.5 rounded-xl text-sm font-bold transition ">
                + Add Update
              </button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Details */}
          <div className="lg:col-span-1 space-y-6">
            {/* Shipment Info */}
            <div className="bg-[#141418] rounded-2xl border border-white/10 p-6">
              <h2 className="font-extrabold text-white mb-4">Shipment Info</h2>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-white/40 text-xs mb-1">Sender</p>
                  <p className="font-semibold text-white">{order.sender_name}</p>
                </div>
                <div>
                  <p className="text-white/40 text-xs mb-1">Receiver</p>
                  <p className="font-semibold text-white">{order.receiver_name}</p>
                  <p className="text-white/50 text-xs">{order.receiver_email}</p>
                </div>
                <div>
                  <p className="text-white/40 text-xs mb-1">Route</p>
                  <p className="text-white flex items-center gap-1.5"><HugeiconsIcon icon={PinLocation01Icon} size={13} color="currentColor" />{order.origin}</p>
                  <p className="text-white/40 text-xs my-1">→</p>
                  <p className="text-white flex items-center gap-1.5"><HugeiconsIcon icon={PinLocation01Icon} size={13} color="currentColor" />{order.destination}</p>
                </div>
                {order.estimated_delivery && (
                  <div>
                    <p className="text-white/40 text-xs mb-1">Est. Delivery</p>
                    <p className="text-white">
                      {new Date(order.estimated_delivery).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                )}
                {order.description && (
                  <div>
                    <p className="text-white/40 text-xs mb-1">Description</p>
                    <p className="text-white/60 text-xs">{order.description}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#141418] rounded-2xl border border-white/10 p-5">
                <p className="text-2xl font-extrabold text-white">{order.packages?.length ?? 0}</p>
                <p className="text-xs text-white/40 mt-1 font-medium">Packages</p>
              </div>
              <div className="bg-[#141418] rounded-2xl border border-white/10 p-5">
                <p className="text-2xl font-extrabold text-white">{updates.length}</p>
                <p className="text-xs text-white/40 mt-1 font-medium">Updates</p>
              </div>
            </div>

            {/* Packages */}
            {order.packages && order.packages.length > 0 && (
              <div className="bg-[#141418] rounded-2xl border border-white/10 p-6">
                <h2 className="font-extrabold text-white mb-4">
                  Packages ({order.packages.length})
                </h2>
                <div className="space-y-3">
                  {order.packages.map((pkg: any, i: number) => (
                    <div key={pkg.id} className="border border-white/10 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-[#f2662d] rounded-lg flex items-center justify-center text-black font-extrabold text-sm shrink-0">
                          {i + 1}
                        </div>
                        <div className="flex-1">
                          {pkg.description && (
                            <p className="text-white/60 text-xs">{pkg.description}</p>
                          )}
                          {pkg.weight && (
                            <p className="text-xs text-white/40 mt-1">
                              Weight: <span className="font-semibold text-white/70">{pkg.weight}</span>
                            </p>
                          )}
                          {pkg.dimensions && (
                            <p className="text-xs text-white/40">
                              Dimensions: <span className="font-semibold text-white/70">{pkg.dimensions}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Timeline */}
          <div className="lg:col-span-2">
            <div className="bg-[#141418] rounded-2xl border border-white/10 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-extrabold text-white">Tracking Timeline</h2>
                <Link href={`/orders/${order.id}/update`}>
                  <button className="text-xs font-bold text-orange-500 hover:text-orange-600 bg-[#f2662d]/10 hover:bg-[#f2662d]/20 px-4 py-2 rounded-xl transition">
                    + Add Update
                  </button>
                </Link>
              </div>
              <TrackingTimeline updates={updates} />
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
