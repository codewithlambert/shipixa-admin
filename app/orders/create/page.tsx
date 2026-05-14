'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '@/components/AdminLayout'

// Comprehensive currency list with country codes
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

interface Package {
  id: string
  package_name: string
  weight: string
  dimensions: string
  description: string
  selectedFiles: File[]
  previewUrls: string[]
}

export default function CreateOrderPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [detectedCountry, setDetectedCountry] = useState<string>('')
  const [uploadingImages, setUploadingImages] = useState(false)

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

  const [packages, setPackages] = useState<Package[]>([
    {
      id: '1',
      package_name: 'Package 1',
      weight: '',
      dimensions: '',
      description: '',
      selectedFiles: [],
      previewUrls: []
    }
  ])

  // Auto-detect user's country and set default currency
  useEffect(() => {
    const detectLocation = async () => {
      try {
        // Use ipapi.co for free geolocation
        const response = await fetch('https://ipapi.co/json/')
        const data = await response.json()
        const countryCode = data.country_code
        
        setDetectedCountry(countryCode)
        
        // Find currency for detected country
        const currency = CURRENCIES.find(c => c.countries.includes(countryCode))
        if (currency) {
          setFormData(prev => ({ ...prev, currency: currency.code }))
        }
      } catch (error) {
        console.log('Could not detect location, using USD as default')
      }
    }

    detectLocation()
  }, [])

  const addPackage = () => {
    const newId = (packages.length + 1).toString()
    setPackages(prev => [...prev, {
      id: newId,
      package_name: `Package ${newId}`,
      weight: '',
      dimensions: '',
      description: '',
      selectedFiles: [],
      previewUrls: []
    }])
  }

  const removePackage = (id: string) => {
    if (packages.length === 1) {
      setError('At least one package is required')
      return
    }
    setPackages(prev => prev.filter(pkg => pkg.id !== id))
  }

  const updatePackage = (id: string, field: keyof Package, value: any) => {
    setPackages(prev => prev.map(pkg => 
      pkg.id === id ? { ...pkg, [field]: value } : pkg
    ))
  }

  const handlePackageFileChange = (packageId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    const pkg = packages.find(p => p.id === packageId)
    if (!pkg) return

    // Limit to 10 images per package
    if (pkg.selectedFiles.length + files.length > 10) {
      setError('Maximum 10 images per package')
      return
    }

    // Validate file types and sizes
    const validFiles = files.filter(file => {
      const isImage = file.type.startsWith('image/')
      const isUnder5MB = file.size <= 5 * 1024 * 1024
      if (!isImage) setError('Only image files are allowed')
      if (!isUnder5MB) setError('Each image must be under 5MB')
      return isImage && isUnder5MB
    })

    // Update package with new files
    const newFiles = [...pkg.selectedFiles, ...validFiles]
    updatePackage(packageId, 'selectedFiles', newFiles)

    // Create preview URLs
    const newPreviews = [...pkg.previewUrls]
    validFiles.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        newPreviews.push(reader.result as string)
        updatePackage(packageId, 'previewUrls', newPreviews)
      }
      reader.readAsDataURL(file)
    })
  }

  const removePackageImage = (packageId: string, index: number) => {
    const pkg = packages.find(p => p.id === packageId)
    if (!pkg) return

    const newFiles = pkg.selectedFiles.filter((_, i) => i !== index)
    const newPreviews = pkg.previewUrls.filter((_, i) => i !== index)
    
    updatePackage(packageId, 'selectedFiles', newFiles)
    updatePackage(packageId, 'previewUrls', newPreviews)
  }

  const uploadPackageImages = async (packageId: string, files: File[]) => {
    if (files.length === 0) return []

    const uploadedUrls: string[] = []

    try {
      const { createClient } = await import('@supabase/supabase-js')
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      for (const file of files) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
        const filePath = `packages/${packageId}/${fileName}`

        const { data, error } = await supabase.storage
          .from('shipixa')
          .upload(filePath, file)

        if (error) throw error

        const { data: { publicUrl } } = supabase.storage
          .from('shipixa')
          .getPublicUrl(filePath)

        uploadedUrls.push(publicUrl)
      }

      return uploadedUrls
    } catch (err) {
      console.error('Image upload error:', err)
      throw new Error('Failed to upload images')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      setUploadingImages(true)

      // Upload images for each package
      const packagesWithImages = await Promise.all(
        packages.map(async (pkg) => {
          const imageUrls = await uploadPackageImages(pkg.id, pkg.selectedFiles)
          return {
            package_name: pkg.package_name,
            weight: pkg.weight ? parseFloat(pkg.weight) : null,
            dimensions: pkg.dimensions || null,
            description: pkg.description || null,
            image_urls: imageUrls
          }
        })
      )

      setUploadingImages(false)

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          packages: packagesWithImages,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to create shipment')
        setLoading(false)
        return
      }

      setSuccess(`Shipment created! Tracking code: ${data.tracking_code}`)
      setTimeout(() => router.push(`/orders/${data.id}`), 1500)
    } catch (err) {
      setError('Something went wrong')
      setLoading(false)
      setUploadingImages(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  return (
    <AdminLayout>
      <div className="p-6 md:p-10 max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-gray-900">Create New Shipment</h1>
          <p className="text-gray-400 text-sm mt-0.5">Fill in the shipment details below</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
          {/* Product Name */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Product Name *</label>
            <input
              type="text"
              name="product_name"
              value={formData.product_name}
              onChange={handleChange}
              required
              placeholder="e.g., Electronics Package"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          {/* Sender & Receiver */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Sender Name *</label>
              <input
                type="text"
                name="sender_name"
                value={formData.sender_name}
                onChange={handleChange}
                required
                placeholder="John Doe"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Receiver Name *</label>
              <input
                type="text"
                name="receiver_name"
                value={formData.receiver_name}
                onChange={handleChange}
                required
                placeholder="Jane Smith"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
          </div>

          {/* Receiver Email */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Receiver Email *</label>
            <input
              type="email"
              name="receiver_email"
              value={formData.receiver_email}
              onChange={handleChange}
              required
              placeholder="jane@example.com"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          {/* Origin & Destination */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Origin *</label>
              <input
                type="text"
                name="origin"
                value={formData.origin}
                onChange={handleChange}
                required
                placeholder="New York, NY"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Destination *</label>
              <input
                type="text"
                name="destination"
                value={formData.destination}
                onChange={handleChange}
                required
                placeholder="Los Angeles, CA"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
          </div>

          {/* Estimated Delivery */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Estimated Delivery</label>
            <input
              type="datetime-local"
              name="estimated_delivery"
              value={formData.estimated_delivery}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          {/* Price & Currency */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-900 mb-2">Shipment Price</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                step="0.01"
                min="0"
                placeholder="0.00"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
              <p className="text-xs text-gray-400 mt-1">Leave blank if no payment required</p>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Currency</label>
              <select
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              >
                {CURRENCIES.map(curr => (
                  <option key={curr.code} value={curr.code}>
                    {curr.code} ({curr.symbol}) - {curr.name}
                  </option>
                ))}
              </select>
              {detectedCountry && (
                <p className="text-xs text-gray-400 mt-1">
                  Auto-detected from your location: {detectedCountry}
                </p>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="Additional notes about the shipment..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
            />
          </div>

          {/* Packages Section */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-extrabold text-gray-900">📦 Packages</h3>
                <p className="text-xs text-gray-400 mt-0.5">{packages.length} package(s) in this shipment</p>
              </div>
              <button
                type="button"
                onClick={addPackage}
                className="text-sm font-bold text-orange-500 hover:text-orange-600 bg-orange-50 hover:bg-orange-100 px-4 py-2 rounded-xl transition"
              >
                + Add Package
              </button>
            </div>

            <div className="space-y-6">
              {packages.map((pkg, pkgIndex) => (
                <div key={pkg.id} className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-gray-900">Package {pkgIndex + 1}</h4>
                    {packages.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePackage(pkg.id)}
                        className="text-xs font-bold text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="space-y-4">
                    {/* Package Name */}
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Package Name</label>
                      <input
                        type="text"
                        value={pkg.package_name}
                        onChange={(e) => updatePackage(pkg.id, 'package_name', e.target.value)}
                        placeholder="e.g., Box 1, Laptop Package"
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                      />
                    </div>

                    {/* Weight & Dimensions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Weight (kg)</label>
                        <input
                          type="number"
                          value={pkg.weight}
                          onChange={(e) => updatePackage(pkg.id, 'weight', e.target.value)}
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Dimensions</label>
                        <input
                          type="text"
                          value={pkg.dimensions}
                          onChange={(e) => updatePackage(pkg.id, 'dimensions', e.target.value)}
                          placeholder="e.g., 30x20x10 cm"
                          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                        />
                      </div>
                    </div>

                    {/* Package Description */}
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Package Description</label>
                      <textarea
                        value={pkg.description}
                        onChange={(e) => updatePackage(pkg.id, 'description', e.target.value)}
                        rows={2}
                        placeholder="Contents of this package..."
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
                      />
                    </div>

                    {/* Package Images */}
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Package Images</label>
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-orange-300 transition">
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={(e) => handlePackageFileChange(pkg.id, e)}
                          className="hidden"
                          id={`package-image-${pkg.id}`}
                          disabled={pkg.selectedFiles.length >= 10}
                        />
                        <label
                          htmlFor={`package-image-${pkg.id}`}
                          className={`cursor-pointer ${pkg.selectedFiles.length >= 10 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <div className="flex flex-col items-center gap-1.5">
                            <span className="text-2xl">📸</span>
                            <p className="text-xs font-bold text-gray-600">
                              {pkg.selectedFiles.length >= 10 ? 'Maximum 10 images reached' : 'Click to upload images'}
                            </p>
                            <p className="text-xs text-gray-400">PNG, JPG, GIF up to 5MB each (max 10 per package)</p>
                          </div>
                        </label>
                      </div>

                      {/* Package Image Previews */}
                      {pkg.previewUrls.length > 0 && (
                        <div className="grid grid-cols-3 md:grid-cols-5 gap-2 mt-3">
                          {pkg.previewUrls.map((url, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={url}
                                alt={`Package ${pkgIndex + 1} - Image ${index + 1}`}
                                className="w-full h-20 object-cover rounded-lg border border-gray-200"
                              />
                              <button
                                type="button"
                                onClick={() => removePackageImage(pkg.id, index)}
                                className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 flex items-center gap-2">
              <span className="text-red-500 text-xs">⚠</span>
              <p className="text-red-500 text-xs font-medium">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-100 rounded-xl px-4 py-3 flex items-center gap-2">
              <span className="text-green-500 text-xs">✓</span>
              <p className="text-green-500 text-xs font-medium">{success}</p>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 border border-gray-200 text-gray-600 hover:bg-gray-50 py-3 rounded-xl font-bold text-sm transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || uploadingImages}
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-bold text-sm transition disabled:opacity-50 shadow-lg shadow-orange-100"
            >
              {uploadingImages ? 'Uploading Images...' : loading ? 'Creating...' : 'Create Shipment'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  )
}
