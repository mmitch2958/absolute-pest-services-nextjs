'use server'

import { z } from 'zod'

const formSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number').max(20),
  service: z.string().min(1, 'Please select a service'),
  zip: z.string().min(5, 'Please enter your ZIP code').max(10),
  message: z.string().max(1000).optional(),
})

export type FormState = {
  success: boolean
  error?: string
  fieldErrors?: Record<string, string>
} | null

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
  }

  const result = formSchema.safeParse(raw)

  if (!result.success) {
    const fieldErrors: Record<string, string> = {}
    result.error.issues.forEach((e) => {
      if (e.path[0]) fieldErrors[e.path[0] as string] = e.message
    })
    return { success: false, error: 'Please correct the errors below.', fieldErrors }
  }

  try {
    // TODO: Replace with actual notification (email via Resend, Nodemailer, etc.)
    // For now, log and simulate success
    console.log('[Service Request]', JSON.stringify(result.data, null, 2))

    // In production:
    // await sendEmail({ to: 'info@absolutepestservices.com', ...result.data })
    // Or: await createCRMEntry(result.data)

    return { success: true }
  } catch (err) {
    console.error('[Service Request Error]', err)
    return {
      success: false,
      error: 'Something went wrong. Please call us directly at 484-643-2225.',
    }
  }
}
