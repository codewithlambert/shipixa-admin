'use client'
import StatusBadge from './StatusBadge'

interface Update {
  id: string
  status: string
  event_label?: string
  location: string
  description?: string
  expected_time?: string
  is_expected?: boolean
  created_at: string
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(mins / 60)
  const days = Math.floor(hours / 24)
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`
  if (mins > 0) return `${mins} min${mins > 1 ? 's' : ''} ago`
  return 'Just now'
}

const statusIcon: Record<string, string> = {
  'Pending':             '⏳',
  'Picked Up':           '📬',
  'In Transit':          '🚚',
  'Arrived at Facility': '🏭',
  'Out for Delivery':    '🛵',
  'Delivered':           '✅',
}

export default function TrackingTimeline({ updates }: { updates: Update[] }) {
  if (!updates.length) return (
    <div className="text-center py-10">
      <p className="text-4xl mb-3">📭</p>
      <p className="text-gray-400 text-sm font-medium">No updates yet. Check back soon.</p>
    </div>
  )

  return (
    <div className="space-y-0">
      {updates.map((u, i) => {
        const isCurrent = i === 0 && !u.is_expected
        const isExpected = u.is_expected

        return (
          <div key={u.id} className="flex gap-4">
            {/* Icon + line */}
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0 z-10 ${
                isExpected ? 'bg-gray-100' :
                isCurrent  ? 'bg-orange-500 shadow-lg shadow-orange-200' : 'bg-gray-100'
              }`}>
                <span className={isExpected ? 'opacity-30' : ''}>
                  {statusIcon[u.status] ?? '📦'}
                </span>
              </div>
              {i < updates.length - 1 && (
                <div className={`w-0.5 flex-1 my-1 ${isCurrent ? 'bg-orange-200' : 'bg-gray-100'}`} />
              )}
            </div>

            {/* Content */}
            <div className={`pb-8 flex-1 ${i < updates.length - 1 ? '' : 'pb-0'}`}>
              <div className={`rounded-2xl p-4 ${
                isExpected ? 'bg-gray-50 opacity-50' :
                isCurrent  ? 'bg-orange-50 border border-orange-100' : 'bg-gray-50'
              }`}>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <StatusBadge status={u.status} />
                  <span className="text-xs text-gray-400 shrink-0">
                    {isExpected
                      ? (u.expected_time || 'Expected')
                      : timeAgo(u.created_at)}
                  </span>
                </div>

                {/* Event label — the headline */}
                <p className={`text-sm font-bold mb-1 ${isExpected ? 'text-gray-400' : 'text-gray-900'}`}>
                  {u.event_label || u.status}
                </p>

                {u.location && (
                  <p className={`text-sm flex items-center gap-1 ${isExpected ? 'text-gray-400' : 'text-gray-600'}`}>
                    📍 {u.location}
                  </p>
                )}

                {u.description && (
                  <p className={`text-xs mt-1 ${isExpected ? 'text-gray-300' : 'text-gray-500'}`}>
                    {u.description}
                  </p>
                )}

                {!isExpected && (
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(u.created_at).toLocaleString('en-US', {
                      weekday: 'short', month: 'short', day: 'numeric',
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </p>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
