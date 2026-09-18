'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ConfirmPaymentButton({ orderId }: { orderId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const confirmPayment = async () => {
    if (!window.confirm('Confirm that the crypto payment has been received? This will mark the order paid and email the customer.')) return

    setLoading(true)
    setError('')
    try {
      const response = await fetch(`/api/orders/${orderId}/confirm-payment`, { method: 'POST' })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Could not confirm payment')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not confirm payment')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <button type="button" onClick={confirmPayment} disabled={loading} className="w-full bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 text-black px-4 py-3 rounded-xl text-sm font-bold transition">
        {loading ? 'Confirming…' : 'Confirm Crypto Payment'}
      </button>
      {error && <p className="text-red-400 text-xs">{error}</p>}
    </div>
  )
}
