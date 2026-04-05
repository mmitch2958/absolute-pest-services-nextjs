'use server'

import { z } from 'zod'
import { sql } from '@/lib/db'
import { sendContactFormNotification } from '@/lib/email'
import { insertContactSchema } from '../../../shared/schema'

const formSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number').max(20),
  service: z.string().min(1, 'Please select a service'),
  zip: z.string().min(5, 'Please enter your ZIP code').max(10),
  message: z.string().max(1000).optional(),
  turnstileToken: z.string().min(1, 'Please complete the human verification'),
})

export type FormState = {
  success: boolean
  error?: string
  fieldErrors?: Record<string, string>
} | null

async function verifyTurnstile(token: string, ip?: string): Promise<boolean> {
  const secret = process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY || process.env.TURNSTILE_SECRET_KEY
  if (!secret) {
    // No secret configured — skip verification in dev
    console.warn('[Turnstile] TURNSTILE_SECRET_KEY not set — skipping verification')
    return true
  }

  try {
    const body = new URLSearchParams({
      secret,
      response: token,
      ...(ip ? { remoteip: ip } : {}),
    })

    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    })

    const data = await res.json() as { success: boolean; 'error-codes'?: string[] }
    
    if (!data.success) {
      console.warn('[Turnstile] Verification failed:', data['error-codes'])
    }
    
    return data.success
  } catch (err) {
    console.error('[Turnstile] Verification error:', err)
    return false
  }
}

export async function submitServiceRequest(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const raw = {
    name: formData.get('name'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    service: formData.get('service'),
    zip: formData.get('zip'),
    message: formData.get('message'),
    // Turnstile widget posts as 'cf-turnstile-response'
    turnstileToken: formData.get('cf-turnstile-response'),
  }

  const result = formSchema.safeParse(raw)

  if (!result.success) {
    const fieldErrors: Record<string, string> = {}
    result.error.issues.forEach((e) => {
      if (e.path[0]) fieldErrors[e.path[0] as string] = e.message
    })
    return { success: false, error: 'Please correct the errors below.', fieldErrors }
  }

  // Verify Turnstile token with Cloudflare
  const isHuman = await verifyTurnstile(result.data.turnstileToken)
  if (!isHuman) {
    return {
      success: false,
      error: 'Human verification failed. Please try again.',
      fieldErrors: { turnstileToken: 'Verification failed — please try again.' },
    }
  }

  try {
    // Parse name into first/last
    const nameParts = result.data.name.trim().split(/\s+/)
    const firstName = nameParts[0] ?? ''
    const lastName = nameParts.slice(1).join(' ') || ''

    // Persist to Neon DB — contact_submissions table
    const city = result.data.zip // zip is the closest proxy available on this form
    await sql`
      INSERT INTO contact_submissions (
        first_name, last_name, phone, email, city, service_type, message
      ) VALUES (
        ${firstName},
        ${lastName},
        ${result.data.phone},
        ${result.data.email},
        ${city},
        ${result.data.service},
        ${result.data.message ?? null}
      )
    `
    console.log('[Service Request] DB insert succeeded.')

    // Fire-and-forget email via SendGrid
    sendContactFormNotification({
      name: result.data.name,
      email: result.data.email,
      phone: result.data.phone,
      service: result.data.service,
      zip: result.data.zip,
      message: result.data.message ?? null,
    }).catch((e) => console.error('[Service Request] Email notification failed:', e))

    return { success: true }
  } catch (err) {
    console.error('[Service Request Error]', err)
    return {
      success: false,
      error: 'Something went wrong. Please call us directly at 484-643-2225.',
    }
  }
}
