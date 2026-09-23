import { NextResponse } from 'next/server';
import { sendContactFormSMS } from '@/lib/sms';

export async function GET() {
  try {
    await sendContactFormSMS({
      name: 'TEST — Absolute Pest Services',
      phone: '484-643-2225',
      service: 'SMS Test',
      address: 'West Grove, PA 19390',
    });
    return NextResponse.json({ ok: true, message: 'Test SMS sent — check both phones.' });
  } catch (err: unknown) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : 'SMS test failed' },
      { status: 500 }
    );
  }
}
