'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import AdminLayout from '@/components/AdminLayout'

// Comprehensive currency list
const CURRENCIES = [
  // Americas
  { code: 'USD', name: 'US Dollar', symbol: '$', countries: ['US', 'EC', 'SV', 'PA', 'TL'] },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', countries: ['CA'] },
  { code: 'MXN', name: 'Mexican Peso', symbol: 'Mex$', countries: ['MX'] },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', countries: ['BR'] },
  { code: 'ARS', name: 'Argentine Peso', symbol: '$', countries: ['AR'] },
  { code: 'CLP', name: 'Chilean Peso', symbol: '$', countries: ['CL'] },
  { code: 'COP', name: 'Colombian Peso', symbol: '$', countries: ['CO'] },
  { code: 'PEN', name: 'Peruvian Sol', symbol: 'S/', countries: ['PE'] },
  
  // Europe
  { code: 'EUR', name: 'Euro', symbol: '€', countries: ['DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'AT', 'PT', 'IE', 'GR', 'FI'] },
  { code: 'GBP', name: 'British Pound', symbol: '£', countries: ['GB'] },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', countries: ['CH'] },
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr', countries: ['SE'] },
  { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr', countries: ['NO'] },
  { code: 'DKK', name: 'Danish Krone', symbol: 'kr', countries: ['DK'] },
  { code: 'PLN', name: 'Polish Zloty', symbol: 'zł', countries: ['PL'] },
  { code: 'CZK', name: 'Czech Koruna', symbol: 'Kč', countries: ['CZ'] },
  { code: 'HUF', name: 'Hungarian Forint', symbol: 'Ft', countries: ['HU'] },
  { code: 'RON', name: 'Romanian Leu', symbol: 'lei', countries: ['RO'] },
  { code: 'BGN', name: 'Bulgarian Lev', symbol: 'лв', countries: ['BG'] },
  { code: 'HRK', name: 'Croatian Kuna', symbol: 'kn', countries: ['HR'] },
  { code: 'RUB', name: 'Russian Ruble', symbol: '₽', countries: ['RU'] },
  { code: 'UAH', name: 'Ukrainian Hryvnia', symbol: '₴', countries: ['UA'] },
  { code: 'TRY', name: 'Turkish Lira', symbol: '₺', countries: ['TR'] },
  
  // Africa
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', countries: ['NG'] },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R', countries: ['ZA'] },
  { code: 'EGP', name: 'Egyptian Pound', symbol: 'E£', countries: ['EG'] },
  { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh', countries: ['KE'] },
  { code: 'GHS', name: 'Ghanaian Cedi', symbol: '₵', countries: ['GH'] },
  { code: 'TZS', name: 'Tanzanian Shilling', symbol: 'TSh', countries: ['TZ'] },
  { code: 'UGX', name: 'Ugandan Shilling', symbol: 'USh', countries: ['UG'] },
  { code: 'MAD', name: 'Moroccan Dirham', symbol: 'DH', countries: ['MA'] },
  { code: 'ETB', name: 'Ethiopian Birr', symbol: 'Br', countries: ['ET'] },
  { code: 'XOF', name: 'West African CFA Franc', symbol: 'CFA', countries: ['SN', 'CI', 'BJ', 'BF', 'ML', 'NE', 'TG'] },
  { code: 'XAF', name: 'Central African CFA Franc', symbol: 'FCFA', countries: ['CM', 'CF', 'TD', 'CG', 'GQ', 'GA'] },
  
  // Asia
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', countries: ['CN'] },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', countries: ['JP'] },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', countries: ['IN'] },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩', countries: ['KR'] },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', countries: ['SG'] },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$', countries: ['HK'] },
  { code: 'TWD', name: 'Taiwan Dollar', symbol: 'NT$', countries: ['TW'] },
  { code: 'THB', name: 'Thai Baht', symbol: '฿', countries: ['TH'] },
  { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM', countries: ['MY'] },
  { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp', countries: ['ID'] },
  { code: 'PHP', name: 'Philippine Peso', symbol: '₱', countries: ['PH'] },
  { code: 'VND', name: 'Vietnamese Dong', symbol: '₫', countries: ['VN'] },
  { code: 'PKR', name: 'Pakistani Rupee', symbol: '₨', countries: ['PK'] },
  { code: 'BDT', name: 'Bangladeshi Taka', symbol: '৳', countries: ['BD'] },
  { code: 'LKR', name: 'Sri Lankan Rupee', symbol: 'Rs', countries: ['LK'] },
  { code: 'NPR', name: 'Nepalese Rupee', symbol: 'Rs', countries: ['NP'] },
  { code: 'MMK', name: 'Myanmar Kyat', symbol: 'K', countries: ['MM'] },
  { code: 'KHR', name: 'Cambodian Riel', symbol: '៛', countries: ['KH'] },
  { code: 'LAK', name: 'Lao Kip', symbol: '₭', countries: ['LA'] },
  
  // Middle East
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', countries: ['AE'] },
  { code: 'SAR', name: 'Saudi Riyal', symbol: '﷼', countries: ['SA'] },
  { code: 'QAR', name: 'Qatari Riyal', symbol: '﷼', countries: ['QA'] },
  { code: 'KWD', name: 'Kuwaiti Dinar', symbol: 'د.ك', countries: ['KW'] },
  { code: 'BHD', name: 'Bahraini Dinar', symbol: '.د.ب', countries: ['BH'] },
  { code: 'OMR', name: 'Omani Rial', symbol: '﷼', countries: ['OM'] },
  { code: 'JOD', name: 'Jordanian Dinar', symbol: 'د.ا', countries: ['JO'] },
  { code: 'ILS', name: 'Israeli Shekel', symbol: '₪', countries: ['IL'] },
  { code: 'LBP', name: 'Lebanese Pound', symbol: '£', countries: ['LB'] },
  
  // Oceania
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', countries: ['AU'] },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$', countries: ['NZ'] },
  { code: 'FJD', name: 'Fijian Dollar', symbol: 'FJ$', countries: ['FJ'] },
]

export default function EditOrderPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [loading, setLoading] = useState(false)
  const [fetchingOrder, setFetchingOrder] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [formData, setFormData] = useState({
    product_name: '',
    sender_name: '',
    receiver_name: '',
    receiver_email: '',
    origin: '',
    destination: '',
    estimated_delivery: '',
    description: '',
    price: '',
    currency: 'USD',
  })

  // Fetch existing order data
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/orders/${id}`)
        const data = await res.json()
        
        if (res.ok) {
          // Format datetime-local value
          const estimatedDelivery = data.estimated_delivery 
            ? new Date(data.estimated_delivery).toISOString().slice(0, 16)
            : ''

          setFormData({
            product_name: data.product_name || '',
            sender_name: data.sender_name || '',
            receiver_name: data.receiver_name || '',
            receiver_email: data.receiver_email || '',
            origin: data.origin || '',
            destination: data.destination || '',
            estimated_delivery: estimatedDelivery,
            description: data.description || '',
            price: data.price ? data.price.toString() : '',
            currency: data.currency || 'USD',
          })
        }
      } catch (err) {
        setError('Failed to load order')
      } finally {
        setFetchingOrder(false)
      }
    }

    fetchOrder()
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const updateData: any = {
        product_name: formData.product_name,
        sender_name: formData.sender_name,
        receiver_name: formData.receiver_name,
        receiver_email: formData.receiver_email,
        origin: formData.origin,
        destination: formData.destination,
        estimated_delivery: formData.estimated_delivery || null,
        description: formData.description,
      }

      // Add price fields if provided
      if (formData.price && parseFloat(formData.price) > 0) {
        updateData.price = parseFloat(formData.price)
        updateData.currency = formData.currency
        updateData.payment_status = 'unpaid' // Reset to unpaid if price changes
      } else {
        updateData.price = null
        updateData.currency = null
        updateData.payment_status = null
      }

      const res = await fetch(`/api/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to update order')
        setLoading(false)
        return
      }

      // Send email notification to receiver
      try {
        await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order_id: id, type: 'created' }),
        })
      } catch {}

      setSuccess('Order updated successfully!')
      setTimeout(() => router.push(`/orders/${id}`), 1500)
    } catch (err) {
      setError('Something went wrong')
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  if (fetchingOrder) {
    return (
      <AdminLayout>
        <div className="p-10 text-center">
          <p className="text-white/40">Loading order...</p>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="p-6 md:p-10 max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-white">Edit Order</h1>
          <p className="text-white/40 text-sm mt-0.5">Update order details and pricing</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#141418] rounded-2xl border border-white/10 p-6 space-y-6">
          {/* Product Name */}
          <div>
            <label className="block text-sm font-bold text-white mb-2">Product Name *</label>
            <input
              type="text"
              name="product_name"
              value={formData.product_name}
              onChange={handleChange}
              required
              placeholder="e.g., Electronics Package"
              className="w-full bg-[#1c1c1f] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 text-white placeholder:text-white/25"
            />
          </div>

          {/* Sender & Receiver */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-white mb-2">Sender Name *</label>
              <input
                type="text"
                name="sender_name"
                value={formData.sender_name}
                onChange={handleChange}
                required
                placeholder="John Doe"
                className="w-full bg-[#1c1c1f] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 text-white placeholder:text-white/25"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-white mb-2">Receiver Name *</label>
              <input
                type="text"
                name="receiver_name"
                value={formData.receiver_name}
                onChange={handleChange}
                required
                placeholder="Jane Smith"
                className="w-full bg-[#1c1c1f] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 text-white placeholder:text-white/25"
              />
            </div>
          </div>

          {/* Receiver Email */}
          <div>
            <label className="block text-sm font-bold text-white mb-2">Receiver Email *</label>
            <input
              type="email"
              name="receiver_email"
              value={formData.receiver_email}
              onChange={handleChange}
              required
              placeholder="jane@example.com"
              className="w-full bg-[#1c1c1f] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 text-white placeholder:text-white/25"
            />
          </div>

          {/* Origin & Destination */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-white mb-2">Origin *</label>
              <input
                type="text"
                name="origin"
                value={formData.origin}
                onChange={handleChange}
                required
                placeholder="New York, NY"
                className="w-full bg-[#1c1c1f] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 text-white placeholder:text-white/25"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-white mb-2">Destination *</label>
              <input
                type="text"
                name="destination"
                value={formData.destination}
                onChange={handleChange}
                required
                placeholder="Los Angeles, CA"
                className="w-full bg-[#1c1c1f] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 text-white placeholder:text-white/25"
              />
            </div>
          </div>

          {/* Estimated Delivery */}
          <div>
            <label className="block text-sm font-bold text-white mb-2">Estimated Delivery</label>
            <input
              type="datetime-local"
              name="estimated_delivery"
              value={formData.estimated_delivery}
              onChange={handleChange}
              className="w-full bg-[#1c1c1f] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 text-white placeholder:text-white/25"
            />
          </div>

          {/* Price & Currency */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-white mb-2">Shipment Price</label>
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
              <p className="text-xs text-white/40 mt-1">Leave blank to remove payment requirement</p>
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
                    {curr.code} ({curr.symbol}) - {curr.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-bold text-white mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="Additional notes about the shipment..."
              className="w-full bg-[#1c1c1f] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 text-white placeholder:text-white/25 resize-none"
            />
          </div>

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
              <p className="text-emerald-400 text-xs font-medium">{success}</p>
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
              {loading ? 'Updating...' : 'Update Order'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  )
}
