import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    const brevoKey = process.env.BREVO_SMTP_KEY
    const fromEmail = process.env.FROM_EMAIL || 'shipshipixa@gmail.com'

    if (!brevoKey) {
      return NextResponse.json({ error: 'BREVO_SMTP_KEY not configured' }, { status: 500 })
    }

    if (!email) {
      return NextResponse.json({ error: 'Email address required' }, { status: 400 })
    }

    console.log('[Test Email] Sending test email to:', email, 'from:', fromEmail)

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 
        'api-key': brevoKey, 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({
        sender: { name: 'Shipixa', email: fromEmail },
        to: [{ email: email }],
        subject: '✅ Test Email from Shipixa',
        htmlContent: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:40px 20px;">
            <div style="background:linear-gradient(135deg,#0a2540,#1c4f8a);padding:32px;text-align:center;border-radius:16px 16px 0 0;">
              <span style="font-size:24px;font-weight:900;color:#fff;">Ship<span style="color:#f97316;">ixa</span></span>
            </div>
            <div style="background:#fff;padding:32px;border-radius:0 0 16px 16px;border:1px solid #e2e8f0;">
              <h2 style="color:#0a2540;">✅ Email Configuration Working!</h2>
              <p style="color:#64748b;">This is a test email from your Shipixa application.</p>
              <p style="color:#64748b;">If you're seeing this, your Brevo email integration is working correctly.</p>
              <div style="background:#f0fdf4;border-left:4px solid #22c55e;padding:16px;margin:20px 0;border-radius:8px;">
                <p style="margin:0;color:#15803d;font-weight:600;">✓ Brevo API Connected</p>
                <p style="margin:4px 0 0;color:#15803d;">✓ FROM_EMAIL: ${fromEmail}</p>
                <p style="margin:4px 0 0;color:#15803d;">✓ TO_EMAIL: ${email}</p>
              </div>
              <p style="color:#94a3b8;font-size:12px;text-align:center;margin-top:32px;">
                © ${new Date().getFullYear()} Shipixa. All rights reserved.
              </p>
            </div>
          </div>
        `,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[Test Email] Brevo API error:', errorText)
      return NextResponse.json({ 
        error: 'Failed to send test email', 
        details: errorText,
        status: response.status 
      }, { status: 500 })
    }

    const result = await response.json()
    console.log('[Test Email] Success:', result)

    return NextResponse.json({ 
      success: true, 
      messageId: result.messageId,
      message: `Test email sent to ${email}. Check your inbox (and spam folder)!` 
    })
  } catch (error) {
    console.error('[Test Email] Error:', error)
    return NextResponse.json({ 
      error: 'Failed to send test email', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
