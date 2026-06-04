'use client'

import { useState } from 'react'

export default function TestEmailPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleTest = async () => {
    if (!email) {
      alert('Please enter an email address')
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()
      setResult({ success: response.ok, data })
    } catch (error) {
      setResult({ 
        success: false, 
        data: { error: 'Network error', details: error instanceof Error ? error.message : 'Unknown' } 
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ 
      maxWidth: '600px', 
      margin: '50px auto', 
      padding: '40px', 
      fontFamily: 'Arial, sans-serif',
      background: '#fff',
      borderRadius: '12px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    }}>
      <h1 style={{ color: '#0a2540', marginBottom: '10px' }}>
        📧 Test Email Configuration
      </h1>
      <p style={{ color: '#64748b', marginBottom: '30px' }}>
        Send a test email to verify your Brevo integration is working correctly.
      </p>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', color: '#0a2540', fontWeight: '600' }}>
          Email Address:
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your-email@example.com"
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            fontSize: '16px',
            boxSizing: 'border-box'
          }}
        />
      </div>

      <button
        onClick={handleTest}
        disabled={loading}
        style={{
          width: '100%',
          padding: '14px',
          background: loading ? '#94a3b8' : '#f97316',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          fontSize: '16px',
          fontWeight: '700',
          cursor: loading ? 'not-allowed' : 'pointer',
          transition: 'background 0.2s'
        }}
      >
        {loading ? 'Sending...' : '🚀 Send Test Email'}
      </button>

      {result && (
        <div style={{
          marginTop: '30px',
          padding: '20px',
          background: result.success ? '#f0fdf4' : '#fef2f2',
          border: `2px solid ${result.success ? '#22c55e' : '#ef4444'}`,
          borderRadius: '8px'
        }}>
          <h3 style={{ 
            margin: '0 0 10px 0', 
            color: result.success ? '#15803d' : '#dc2626' 
          }}>
            {result.success ? '✅ Success!' : '❌ Error'}
          </h3>
          
          {result.success && result.data.message && (
            <p style={{ margin: '0 0 10px 0', color: '#15803d' }}>
              {result.data.message}
            </p>
          )}

          {result.data.messageId && (
            <p style={{ margin: '5px 0', color: '#15803d', fontSize: '14px' }}>
              <strong>Message ID:</strong> {result.data.messageId}
            </p>
          )}

          {result.data.error && (
            <div>
              <p style={{ margin: '0 0 10px 0', color: '#dc2626', fontWeight: '600' }}>
                {result.data.error}
              </p>
              {result.data.details && (
                <pre style={{
                  background: '#fff',
                  padding: '10px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  overflow: 'auto',
                  color: '#dc2626'
                }}>
                  {typeof result.data.details === 'string' 
                    ? result.data.details 
                    : JSON.stringify(result.data.details, null, 2)}
                </pre>
              )}
            </div>
          )}

          {result.success && (
            <div style={{ 
              marginTop: '15px', 
              padding: '10px', 
              background: '#fff', 
              borderRadius: '6px',
              fontSize: '14px',
              color: '#64748b'
            }}>
              <p style={{ margin: '5px 0' }}>✓ Check your inbox</p>
              <p style={{ margin: '5px 0' }}>✓ Check your spam/junk folder</p>
              <p style={{ margin: '5px 0' }}>✓ Check the server console logs for details</p>
            </div>
          )}
        </div>
      )}

      <div style={{
        marginTop: '30px',
        padding: '15px',
        background: '#fff7ed',
        borderLeft: '4px solid #f97316',
        borderRadius: '4px',
        fontSize: '14px',
        color: '#64748b'
      }}>
        <p style={{ margin: '0 0 8px 0', fontWeight: '600', color: '#0a2540' }}>
          💡 Troubleshooting Tips:
        </p>
        <ul style={{ margin: 0, paddingLeft: '20px' }}>
          <li>Make sure your dev server is running</li>
          <li>Check the browser console (F12) for errors</li>
          <li>Check your terminal/server logs for detailed output</li>
          <li>Verify FROM_EMAIL in .env.local is verified in Brevo</li>
          <li>Check your Brevo dashboard → Transactional section</li>
        </ul>
      </div>
    </div>
  )
}
