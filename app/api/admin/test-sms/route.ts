import { NextResponse } from 'next/server';
import { sendContactFormSMS } from '@/lib/sms';

export async function GET() {
  try {
    await sendContactFormSMS({
      name: 'TEST — Absolute Pest Services',
      phone: '484-643-2225',
      service: 'SMS Test',
      zip: '19380',
    });
    return NextResponse.json({ ok: true, message: 'Test SMS sent — check both phones.' });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
