import Link from 'next/link'
import { getAdmin } from '@/lib/supabase-admin'
import AdminLayout from '@/components/AdminLayout'
import StatusBadge from '@/components/StatusBadge'

export default async function AdminOrders() {
  const db = getAdmin()
  const { data } = await db
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })

  const orders = data || []

  const stats = [
    { label: 'Total Shipments', value: orders.length, color: 'bg-gray-900', text: 'text-white', sub: 'text-gray-400' },
    { label: 'Pending', value: orders.filter((o: any) => o.current_status === 'Pending').length, color: 'bg-white', text: 'text-gray-900', sub: 'text-gray-400' },
    { label: 'In Transit', value: orders.filter((o: any) => ['In Transit', 'Picked Up', 'Arrived at Facility', 'Out for Delivery'].includes(o.current_status)).length, color: 'bg-orange-500', text: 'text-white', sub: 'text-orange-100' },
    { label: 'Delivered', value: orders.filter((o: any) => o.current_status === 'Delivered').length, color: 'bg-white', text: 'text-gray-900', sub: 'text-gray-400' },
  ]

  return (
    <AdminLayout>
      <div className="p-6 md:p-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Dashboard</h1>
            <p className="text-gray-400 text-sm mt-0.5">Overview of all shipments</p>
          </div>
          <Link href="/orders/create">
            <button className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition shadow-lg shadow-orange-100">
              + New Shipment
            </button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {stats.map(s => (
            <div key={s.label} className={`${s.color} rounded-2xl p-5 border border-gray-100 shadow-sm`}>
              <p className={`text-3xl font-extrabold ${s.text}`}>{s.value}</p>
              <p className={`text-sm mt-1 font-medium ${s.sub}`}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
            <h2 className="font-extrabold text-gray-900">All Shipments</h2>
            <span className="text-xs text-gray-400 bg-gray-50 px-3 py-1 rounded-full">{orders.length} total</span>
          </div>

          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Tracking Code', 'Product', 'Route', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left px-6 py-4 text-gray-400 font-semibold text-xs uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.map((order: any) => (
                  <tr key={order.id} className="hover:bg-orange-50/30 transition cursor-pointer">
                    <td className="px-6 py-4 font-mono text-xs text-gray-500">{order.tracking_code}</td>
                    <td className="px-6 py-4 font-semibold text-gray-900">{order.product_name}</td>
                    <td className="px-6 py-4 text-gray-500 text-xs">{order.origin} → {order.destination}</td>
                    <td className="px-6 py-4"><StatusBadge status={order.current_status} /></td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link href={`/orders/${order.id}`}>
                          <button className="text-xs font-bold text-orange-500 hover:text-orange-600 bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-lg transition">
                            View
                          </button>
                        </Link>
                        <Link href={`/orders/${order.id}/update`}>
                          <button className="text-xs font-bold text-gray-500 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-lg transition">
                            Update
                          </button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center text-gray-400">
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
          <div className="md:hidden divide-y divide-gray-50">
            {orders.map((order: any) => (
              <div key={order.id} className="p-4 hover:bg-orange-50/30 transition">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{order.product_name}</p>
                    <p className="font-mono text-xs text-gray-400 mt-0.5">{order.tracking_code}</p>
                  </div>
                  <StatusBadge status={order.current_status} />
                </div>
                <p className="text-xs text-gray-500 mb-3">{order.origin} → {order.destination}</p>
                <div className="flex gap-2">
                  <Link href={`/orders/${order.id}`} className="flex-1">
                    <button className="w-full text-xs font-bold text-orange-500 bg-orange-50 py-2 rounded-lg">View</button>
                  </Link>
                  <Link href={`/orders/${order.id}/update`} className="flex-1">
                    <button className="w-full text-xs font-bold text-gray-500 bg-gray-50 py-2 rounded-lg">Update</button>
                  </Link>
                </div>
              </div>
            ))}
            {orders.length === 0 && (
              <div className="p-10 text-center text-gray-400">
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
