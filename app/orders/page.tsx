import Link from 'next/link'
import { getAdmin } from '@/lib/supabase-admin'
import AdminLayout from '@/components/AdminLayout'
import StatusBadge from '@/components/StatusBadge'
import { HugeiconsIcon } from '@hugeicons/react'
import { PackageIcon } from '@hugeicons/core-free-icons'

export default async function AdminOrders() {
  const db = getAdmin() as any
  const { data } = await db
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })

  const orders = data || []

  const stats = [
    { label: 'Total Shipments', value: orders.length, color: 'bg-[#141418]', text: 'text-white', sub: 'text-white/40' },
    { label: 'Pending', value: orders.filter((o: any) => o.current_status === 'Pending').length, color: 'bg-[#141418]', text: 'text-white', sub: 'text-white/40' },
    { label: 'In Transit', value: orders.filter((o: any) => ['In Transit', 'Picked Up', 'Arrived at Facility', 'Out for Delivery'].includes(o.current_status)).length, color: 'bg-[#f2662d]', text: 'text-black', sub: 'text-black/60' },
    { label: 'Delivered', value: orders.filter((o: any) => o.current_status === 'Delivered').length, color: 'bg-[#141418]', text: 'text-white', sub: 'text-white/40' },
  ]

  return (
    <AdminLayout>
      <div className="p-6 md:p-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-white">Dashboard</h1>
            <p className="text-white/40 text-sm mt-0.5">Overview of all shipments</p>
          </div>
          <Link href="/orders/create">
            <button className="bg-[#f2662d] hover:brightness-105 text-black px-5 py-2.5 rounded-xl text-sm font-bold transition ">
              + New Shipment
            </button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {stats.map(s => (
            <div key={s.label} className={`${s.color} rounded-2xl p-5 border border-white/10`}>
              <p className={`text-3xl font-extrabold ${s.text}`}>{s.value}</p>
              <p className={`text-sm mt-1 font-medium ${s.sub}`}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-[#141418] rounded-2xl border border-white/10 overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
            <h2 className="font-extrabold text-white">All Shipments</h2>
            <span className="text-xs text-white/40 bg-[#1c1c1f] px-3 py-1 rounded-full">{orders.length} total</span>
          </div>

          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#1c1c1f] border-b border-white/10">
                <tr>
                  {['Tracking Code', 'Product', 'Route', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left px-6 py-4 text-white/40 font-semibold text-xs uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {orders.map((order: any) => (
                  <tr key={order.id} className="hover:bg-white/5 transition cursor-pointer">
                    <td className="px-6 py-4 font-mono text-xs text-white/50">{order.tracking_code}</td>
                    <td className="px-6 py-4 font-semibold text-white">{order.product_name}</td>
                    <td className="px-6 py-4 text-white/50 text-xs">{order.origin} → {order.destination}</td>
                    <td className="px-6 py-4"><StatusBadge status={order.current_status} /></td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link href={`/orders/${order.id}`}>
                          <button className="text-xs font-bold text-orange-500 hover:text-orange-600 bg-[#f2662d]/10 hover:bg-[#f2662d]/20 px-3 py-1.5 rounded-lg transition">
                            View
                          </button>
                        </Link>
                        <Link href={`/orders/${order.id}/update`}>
                          <button className="text-xs font-bold text-white/50 hover:text-white/70 bg-[#1c1c1f] hover:bg-white/10 px-3 py-1.5 rounded-lg transition">
                            Update
                          </button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center text-white/40">
                      <p className="text-4xl mb-3">📦</p>
                      <p className="font-semibold">No shipments yet</p>
                      <p className="text-xs mt-1">Create your first shipment to get started</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden divide-y divide-white/5">
            {orders.map((order: any) => (
              <div key={order.id} className="p-4 hover:bg-white/5 transition">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-bold text-white text-sm">{order.product_name}</p>
                    <p className="font-mono text-xs text-white/40 mt-0.5">{order.tracking_code}</p>
                  </div>
                  <StatusBadge status={order.current_status} />
                </div>
                <p className="text-xs text-white/50 mb-3">{order.origin} → {order.destination}</p>
                <div className="flex gap-2">
                  <Link href={`/orders/${order.id}`} className="flex-1">
                    <button className="w-full text-xs font-bold text-orange-500 bg-[#f2662d]/10 py-2 rounded-lg">View</button>
                  </Link>
                  <Link href={`/orders/${order.id}/update`} className="flex-1">
                    <button className="w-full text-xs font-bold text-white/50 bg-[#1c1c1f] py-2 rounded-lg">Update</button>
                  </Link>
                </div>
              </div>
            ))}
            {orders.length === 0 && (
              <div className="p-10 text-center text-white/40">
                <p className="text-4xl mb-2">📦</p>
                <p className="text-sm">No shipments yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
