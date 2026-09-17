'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import AdminLayout from '@/components/AdminLayout'
import { HugeiconsIcon } from '@hugeicons/react'
import { CreditCardIcon } from '@hugeicons/core-free-icons'

const STATUSES = ['Pending', 'Picked Up', 'In Transit', 'Arrived at Facility', 'Out for Delivery', 'Delivered']

// Comprehensive currency list
const CURRENCIES = [
  // Americas
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'MXN', name: 'Mexican Peso', symbol: 'Mex$' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
  { code: 'ARS', name: 'Argentine Peso', symbol: '$' },
  { code: 'CLP', name: 'Chilean Peso', symbol: '$' },
  { code: 'COP', name: 'Colombian Peso', symbol: '$' },
  { code: 'PEN', name: 'Peruvian Sol', symbol: 'S/' },
  
  // Europe
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr' },
  { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr' },
  { code: 'DKK', name: 'Danish Krone', symbol: 'kr' },
  { code: 'PLN', name: 'Polish Zloty', symbol: 'zł' },
  { code: 'CZK', name: 'Czech Koruna', symbol: 'Kč' },
  { code: 'HUF', name: 'Hungarian Forint', symbol: 'Ft' },
  { code: 'RON', name: 'Romanian Leu', symbol: 'lei' },
  { code: 'RUB', name: 'Russian Ruble', symbol: '₽' },
  { code: 'TRY', name: 'Turkish Lira', symbol: '₺' },
  
  // Africa
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
  { code: 'EGP', name: 'Egyptian Pound', symbol: 'E£' },
  { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh' },
  { code: 'GHS', name: 'Ghanaian Cedi', symbol: '₵' },
  { code: 'TZS', name: 'Tanzanian Shilling', symbol: 'TSh' },
  { code: 'UGX', name: 'Ugandan Shilling', symbol: 'USh' },
  { code: 'MAD', name: 'Moroccan Dirham', symbol: 'DH' },
  { code: 'ETB', name: 'Ethiopian Birr', symbol: 'Br' },
  
  // Asia
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$' },
  { code: 'THB', name: 'Thai Baht', symbol: '฿' },
  { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM' },
  { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp' },
  { code: 'PHP', name: 'Philippine Peso', symbol: '₱' },
  { code: 'VND', name: 'Vietnamese Dong', symbol: '₫' },
  { code: 'PKR', name: 'Pakistani Rupee', symbol: '₨' },
  { code: 'BDT', name: 'Bangladeshi Taka', symbol: '৳' },
  
  // Middle East
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' },
  { code: 'SAR', name: 'Saudi Riyal', symbol: '﷼' },
  { code: 'QAR', name: 'Qatari Riyal', symbol: '﷼' },
  { code: 'ILS', name: 'Israeli Shekel', symbol: '₪' },
  
  // Oceania
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$' },
]

export default function UpdateOrderPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [order, setOrder] = useState<any>(null)

  const [formData, setFormData] = useState({
    status: 'In Transit',
    event_label: '',
    location: '',
    description: '',
    expected_time: '',
    is_expected: false,
    price: '',
    currency: 'USD',
  })

  useEffect(() => {
    fetch(`/api/orders/${id}`)
      .then(res => res.json())
      .then(data => {
        setOrder(data)
        // Pre-fill price and currency if they exist
        if (data.price) {
          setFormData(prev => ({
            ...prev,
            price: data.price.toString(),
            currency: data.currency || 'USD'
          }))
        }
      })
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      // First, add the tracking update
      const res = await fetch('/api/tracking-updates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: id,
          status: formData.status,
          event_label: formData.event_label,
          location: formData.location,
          description: formData.description,
          expected_time: formData.expected_time || null,
          is_expected: formData.is_expected,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to add update')
        setLoading(false)
        return
      }

      // Then, update the order price if provided
      if (formData.price && parseFloat(formData.price) > 0) {
        await fetch(`/api/orders/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            price: parseFloat(formData.price),
            currency: formData.currency,
            payment_status: 'unpaid'
          }),
        })
      }

      setSuccess(true)
      setLoading(false)
      setTimeout(() => router.push(`/orders/${id}`), 1000)
    } catch (err) {
      setError('Something went wrong')
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  if (!order) {
    return (
      <AdminLayout>
        <div className="p-10 text-center">
          <p className="text-white/40">Loading...</p>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="p-6 md:p-10 max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-white">Add Tracking Update</h1>
          <p className="text-white/40 text-sm mt-0.5">
            {order.product_name} • {order.tracking_code}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#141418] rounded-2xl border border-white/10 p-6 space-y-6">
          {/* Status */}
          <div>
            <label className="block text-sm font-bold text-white mb-2">Status *</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
              className="w-full bg-[#1c1c1f] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 text-white placeholder:text-white/25"
            >
              {STATUSES.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Event Label */}
          <div>
            <label className="block text-sm font-bold text-white mb-2">Event Label</label>
            <input
              type="text"
              name="event_label"
              value={formData.event_label}
              onChange={handleChange}
              placeholder="e.g., Package arrived at sorting facility"
              className="w-full bg-[#1c1c1f] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 text-white placeholder:text-white/25"
            />
            <p className="text-xs text-white/40 mt-1">Leave blank to use status as label</p>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-bold text-white mb-2">Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g., Newark, NJ"
              className="w-full bg-[#1c1c1f] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 text-white placeholder:text-white/25"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-bold text-white mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="Additional details about this update..."
              className="w-full bg-[#1c1c1f] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 text-white placeholder:text-white/25 resize-none"
            />
          </div>

          {/* Price & Currency */}
          <div className="border-t border-white/10 pt-6">
            <h3 className="flex items-center gap-2 text-sm font-bold text-white mb-4">
              <HugeiconsIcon icon={CreditCardIcon} size={16} color="currentColor" />
              Update Shipment Price (Optional)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-white mb-2">Price</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className="w-full bg-[#1c1c1f] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 text-white placeholder:text-white/25"
                />
                <p className="text-xs text-white/40 mt-1">Update or set shipment price</p>
              </div>
              <div>
                <label className="block text-sm font-bold text-white mb-2">Currency</label>
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  className="w-full bg-[#1c1c1f] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 text-white placeholder:text-white/25"
                >
                  {CURRENCIES.map(curr => (
                    <option key={curr.code} value={curr.code}>
                      {curr.code} ({curr.symbol})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Is Expected */}
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              name="is_expected"
              checked={formData.is_expected}
              onChange={handleChange}
              className="mt-1 w-4 h-4 text-orange-500 border-white/20 bg-[#1c1c1f] rounded focus:ring-orange-400"
            />
            <div>
              <label className="block text-sm font-bold text-white">Expected Update</label>
              <p className="text-xs text-white/40 mt-0.5">
                Mark this as a future/expected update (won't change current status)
              </p>
            </div>
          </div>

          {/* Expected Time (only if is_expected) */}
          {formData.is_expected && (
            <div>
              <label className="block text-sm font-bold text-white mb-2">Expected Time</label>
              <input
                type="datetime-local"
                name="expected_time"
                value={formData.expected_time}
                onChange={handleChange}
                className="w-full bg-[#1c1c1f] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 text-white placeholder:text-white/25"
              />
            </div>
          )}

          {/* Error/Success Messages */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 flex items-center gap-2">
              <span className="text-red-400 text-xs">⚠</span>
              <p className="text-red-400 text-xs font-medium">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3 flex items-center gap-2">
              <span className="text-emerald-400 text-xs">✓</span>
              <p className="text-emerald-400 text-xs font-medium">Update added successfully!</p>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 border border-white/10 text-white/60 hover:bg-[#1c1c1f] py-3 rounded-xl font-bold text-sm transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-[#f2662d] hover:brightness-105 text-black py-3 rounded-xl font-bold text-sm transition disabled:opacity-50 "
            >
              {loading ? 'Adding...' : 'Add Update'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  )
}
