import twilio from 'twilio';

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_FROM_NUMBER = process.env.TWILIO_FROM_NUMBER;

let twilioClient: twilio.Twilio | null = null;

// Initialize Twilio client only if credentials are available
function getTwilioClient(): twilio.Twilio | null {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
    console.warn('[SMS] Twilio credentials not configured. SMS reminders will be disabled.');
    return null;
  }
  
  if (!twilioClient) {
    twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
  }
  
  return twilioClient;
}

export interface AppointmentReminderSMSData {
  toPhone: string;
  customerName: string;
  serviceType: string;
  appointmentDate: Date;
  appointmentTime?: string;
  address: string;
  reminderType: '24h' | 'same_day';
}

export async function sendAppointmentReminderSMS(data: AppointmentReminderSMSData): Promise<boolean> {
  const client = getTwilioClient();
  
  if (!client) {
    console.log(`[SMS] Skipping SMS - Twilio not configured`);
    return false;
  }

  if (!TWILIO_FROM_NUMBER) {
    console.error('[SMS] TWILIO_FROM_NUMBER not configured');
    return false;
  }

  // Format the date for display (Eastern Time)
  const formattedDate = data.appointmentDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'America/New_York',
  });

  const timeDisplay = data.appointmentTime || 'TBD';
  const reminderText = data.reminderType === '24h' 
    ? 'reminder: your appointment is tomorrow' 
    : 'reminder: your appointment is today';

  const message = `Absolute Pest Services ${reminderText}: ${data.serviceType} on ${formattedDate} at ${timeDisplay}. Address: ${data.address}. To reschedule, call (484) 643-2225. Reply STOP to unsubscribe.`;

  try {
    console.log(`[SMS] Sending to ${data.toPhone} | Type: ${data.reminderType}`);
    await client.messages.create({
      body: message,
      from: TWILIO_FROM_NUMBER,
      to: data.toPhone,
    });
    console.log(`[SMS] Successfully sent to ${data.toPhone}`);
    return true;
  } catch (error: any) {
    console.error(`[SMS] Failed to send to ${data.toPhone}:`, error?.message || error);
    return false;
  }
}

export function isSMSConfigured(): boolean {
  return !!(TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_FROM_NUMBER);
}

// ============================================================
// Business Lead Notifications (Contact Form & Inspection)
// ============================================================

// Recipients for new lead SMS alerts
const LEAD_SMS_RECIPIENTS = [
  '+14846432225',  // Office
  '+14849052263',  // Personal cell
];

export async function sendContactFormSMS(data: {
  firstName: string;
  lastName: string;
  email: string;
  serviceType: string;
  message: string;
}): Promise<void> {
  const client = getTwilioClient();
  if (!client || !TWILIO_FROM_NUMBER) return;

  const name = `${data.firstName} ${data.lastName}`;
  // Truncate message to keep SMS concise
  const msg = data.message.length > 100 ? data.message.slice(0, 100) + '…' : data.message;
  const body = `New contact form submission from ${name} at ${data.email} - ${msg}`;

  for (const toPhone of LEAD_SMS_RECIPIENTS) {
    try {
      await client.messages.create({
        body,
        from: TWILIO_FROM_NUMBER,
        to: toPhone,
      });
      console.log(`[SMS] Contact form alert sent to ${toPhone}`);
    } catch (err: any) {
      console.error(`[SMS] Failed to send contact form alert to ${toPhone}:`, err?.message || err);
    }
  }
}

export async function sendInspectionRequestSMS(data: {
  firstName: string;
  lastName: string;
  phone: string;
  serviceType: string;
  address: string;
}): Promise<void> {
  const client = getTwilioClient();
  if (!client || !TWILIO_FROM_NUMBER) return;

  const name = `${data.firstName} ${data.lastName}`;
  const body = `New inspection request from ${name} at ${data.phone} for ${data.serviceType} at ${data.address}`;

  for (const toPhone of LEAD_SMS_RECIPIENTS) {
    try {
      await client.messages.create({
        body,
        from: TWILIO_FROM_NUMBER,
        to: toPhone,
      });
      console.log(`[SMS] Inspection request alert sent to ${toPhone}`);
    } catch (err: any) {
      console.error(`[SMS] Failed to send inspection request alert to ${toPhone}:`, err?.message || err);
    }
  }
}
