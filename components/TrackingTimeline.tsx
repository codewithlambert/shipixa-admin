'use client'
import StatusBadge from './StatusBadge'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Clock01Icon,
  PackageReceiveIcon,
  TruckIcon,
  MapsLocation01Icon,
  DeliveryTruck01Icon,
  CheckmarkCircle02Icon,
  PackageIcon,
  InboxIcon,
  PinLocation01Icon,
} from '@hugeicons/core-free-icons'

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

const statusIcon: Record<string, any> = {
  'Pending':             Clock01Icon,
  'Picked Up':           PackageReceiveIcon,
  'In Transit':          TruckIcon,
  'Arrived at Facility': MapsLocation01Icon,
  'Out for Delivery':    DeliveryTruck01Icon,
  'Delivered':           CheckmarkCircle02Icon,
}

export default function TrackingTimeline({ updates }: { updates: Update[] }) {
  if (!updates.length) return (
    <div className="text-center py-10">
      <HugeiconsIcon icon={InboxIcon} size={30} color="white" className="mx-auto mb-3 opacity-40" />
      <p className="text-white/40 text-sm font-medium">No updates yet. Check back soon.</p>
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
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10 ${
                isExpected ? 'bg-white/10' :
                isCurrent  ? 'bg-[#f2662d]' : 'bg-white/10'
              }`}>
                <HugeiconsIcon
                  icon={statusIcon[u.status] ?? PackageIcon}
                  size={18}
                  color={isCurrent && !isExpected ? 'black' : 'white'}
                  className={isExpected ? 'opacity-30' : ''}
                />
              </div>
              {i < updates.length - 1 && (
                <div className={`w-0.5 flex-1 my-1 ${isCurrent ? 'bg-[#f2662d]/30' : 'bg-white/10'}`} />
              )}
            </div>

            {/* Content */}
            <div className={`pb-8 flex-1 ${i < updates.length - 1 ? '' : 'pb-0'}`}>
              <div className={`rounded-2xl p-4 ${
                isExpected ? 'bg-[#1c1c1f] opacity-50' :
                isCurrent  ? 'bg-[#f2662d]/10 border border-[#f2662d]/30' : 'bg-[#1c1c1f]'
              }`}>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <StatusBadge status={u.status} />
                  <span className="text-xs text-white/40 shrink-0">
                    {isExpected
                      ? (u.expected_time || 'Expected')
                      : timeAgo(u.created_at)}
                  </span>
                </div>

                {/* Event label — the headline */}
                <p className={`text-sm font-bold mb-1 ${isExpected ? 'text-white/40' : 'text-white'}`}>
                  {u.event_label || u.status}
                </p>

                {u.location && (
                  <p className={`text-sm flex items-center gap-1.5 ${isExpected ? 'text-white/40' : 'text-white/60'}`}>
                    <HugeiconsIcon icon={PinLocation01Icon} size={13} color="currentColor" />
                    {u.location}
                  </p>
                )}

                {u.description && (
                  <p className={`text-xs mt-1 ${isExpected ? 'text-white/25' : 'text-white/50'}`}>
                    {u.description}
                  </p>
                )}

                {!isExpected && (
                  <p className="text-xs text-white/40 mt-2">
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
