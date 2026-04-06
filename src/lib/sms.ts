import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

const officeRaw = process.env.SMS_RECIPIENT_OFFICE ?? '';
const personalRaw = process.env.SMS_RECIPIENT_PERSONAL ?? '';

// Normalise to E.164 — strips non-digits and prepends +1 if 10 digits
function toE164(raw: string): string | null {
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
  return null;
}

const RECIPIENTS = [toE164(officeRaw), toE164(personalRaw)].filter(Boolean) as string[];

function getClient() {
  if (!accountSid || !authToken) return null;
  return twilio(accountSid, authToken);
}

async function sendOne(to: string, body: string): Promise<void> {
  const client = getClient();
  if (!client || !fromNumber) {
    console.warn('[sms] Twilio not configured — skipping SMS to', to);
    return;
  }
  try {
    await client.messages.create({ from: fromNumber, to, body });
    console.log('[sms] Sent to', to);
  } catch (err: any) {
    console.error('[sms] Failed to send to', to, err?.message ?? err);
  }
}

async function sendToAll(body: string): Promise<void> {
  if (RECIPIENTS.length === 0) {
    console.warn('[sms] No valid SMS recipients configured');
    return;
  }
  await Promise.all(RECIPIENTS.map((to) => sendOne(to, body)));
}

export async function sendContactFormSMS(data: {
  name: string;
  phone: string;
  service: string;
  zip: string;
}): Promise<void> {
  const body =
    `🐛 New APS Lead\n` +
    `Name: ${data.name}\n` +
    `Phone: ${data.phone}\n` +
    `Service: ${data.service}\n` +
    `ZIP: ${data.zip}`;
  await sendToAll(body);
}

export async function sendJobLogSMS(data: {
  employeeName: string;
  customerName: string;
  siteLocation: string;
  jobDate: string;
}): Promise<void> {
  const formatted = new Date(data.jobDate).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    timeZone: 'America/New_York',
  });
  const body =
    `📋 Job Log Submitted\n` +
    `Tech: ${data.employeeName}\n` +
    `Customer: ${data.customerName}\n` +
    `Site: ${data.siteLocation}\n` +
    `Date: ${formatted}`;
  await sendToAll(body);
}
