const config: Record<string, { bg: string; text: string; dot: string }> = {
  'Pending':            { bg: 'bg-white/10',       text: 'text-white/60',   dot: 'bg-white/40' },
  'Picked Up':          { bg: 'bg-blue-500/15',    text: 'text-blue-300',   dot: 'bg-blue-400' },
  'In Transit':         { bg: 'bg-blue-500',       text: 'text-white',      dot: 'bg-white' },
  'Arrived at Facility':{ bg: 'bg-sky-500/15',     text: 'text-sky-300',    dot: 'bg-sky-400' },
  'Out for Delivery':   { bg: 'bg-[#f2662d]',      text: 'text-black',      dot: 'bg-black' },
  'Delivered':          { bg: 'bg-emerald-500/20', text: 'text-emerald-300', dot: 'bg-emerald-500' },
}

export default function StatusBadge({ status }: { status: string }) {
  const c = config[status] ?? { bg: 'bg-white/10', text: 'text-white/60', dot: 'bg-white/40' }
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${c.bg} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {status}
    </span>
  )
}
