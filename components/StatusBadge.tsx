const config: Record<string, { bg: string; text: string; dot: string }> = {
  'Pending':            { bg: 'bg-gray-100',      text: 'text-gray-600',   dot: 'bg-gray-400' },
  'Picked Up':          { bg: 'bg-blue-100',       text: 'text-blue-700',   dot: 'bg-blue-500' },
  'In Transit':         { bg: 'bg-blue-500',       text: 'text-white',      dot: 'bg-white' },
  'Arrived at Facility':{ bg: 'bg-sky-100',        text: 'text-sky-700',    dot: 'bg-sky-500' },
  'Out for Delivery':   { bg: 'bg-orange-500',     text: 'text-white',      dot: 'bg-white' },
  'Delivered':          { bg: 'bg-green-100',      text: 'text-green-700',  dot: 'bg-green-500' },
}

export default function StatusBadge({ status }: { status: string }) {
  const c = config[status] ?? { bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' }
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${c.bg} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {status}
    </span>
  )
}
