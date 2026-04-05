import sgMail from '@sendgrid/mail';

if (!process.env.SENDGRID_API_KEY) {
  console.warn('[email] SENDGRID_API_KEY is not set — emails will be skipped');
} else {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

const FROM_EMAIL = 'rob@absolutepestservices.com';
const NOTIFY_EMAILS = [
  'rob@absolutepestservices.com',
  'mike@steelcity-ai.com',
  'rmitch21@gmail.com',
];

interface EmailParams {
  to: string;
  subject: string;
  html: string;
  text: string;
}

async function sendOne(params: EmailParams): Promise<boolean> {
  if (!process.env.SENDGRID_API_KEY) return false;
  try {
    await sgMail.send({ from: FROM_EMAIL, ...params });
    return true;
  } catch (err: any) {
    console.error(`[email] Failed to send to ${params.to}:`, err?.response?.body ?? err?.message ?? err);
    return false;
  }
}

export async function sendJobLogNotification(data: {
  employeeName: string;
  customerName: string;
  siteLocation: string;
  siteAddress?: string | null;
  servicedArea: string;
  workPerformed: string;
  jobDate: string;
  amount?: string | null;
}): Promise<void> {
  const formattedDate = new Date(data.jobDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'America/New_York',
  });

  const subject = `Field Job Log — ${data.customerName} — ${formattedDate}`;

  const html = `
    <h2 style="color:#1f2937;">New Field Job Log Entry</h2>
    <table style="border-collapse:collapse;width:100%;font-family:sans-serif;font-size:14px;">
      <tr><td style="padding:6px 12px;font-weight:bold;width:160px;">Technician</td><td style="padding:6px 12px;">${data.employeeName}</td></tr>
      <tr style="background:#f9fafb;"><td style="padding:6px 12px;font-weight:bold;">Customer</td><td style="padding:6px 12px;">${data.customerName}</td></tr>
      <tr><td style="padding:6px 12px;font-weight:bold;">Site Location</td><td style="padding:6px 12px;">${data.siteLocation}</td></tr>
      ${data.siteAddress ? `<tr style="background:#f9fafb;"><td style="padding:6px 12px;font-weight:bold;">Address</td><td style="padding:6px 12px;">${data.siteAddress}</td></tr>` : ''}
      <tr><td style="padding:6px 12px;font-weight:bold;">Serviced Area</td><td style="padding:6px 12px;">${data.servicedArea}</td></tr>
      <tr style="background:#f9fafb;"><td style="padding:6px 12px;font-weight:bold;">Job Date</td><td style="padding:6px 12px;">${formattedDate}</td></tr>
      ${data.amount ? `<tr><td style="padding:6px 12px;font-weight:bold;">Amount</td><td style="padding:6px 12px;">$${data.amount}</td></tr>` : ''}
    </table>
    <h3 style="margin-top:20px;color:#1f2937;">Work Performed</h3>
    <p style="font-family:sans-serif;font-size:14px;line-height:1.6;white-space:pre-wrap;">${data.workPerformed}</p>
    <hr style="margin-top:24px;border:none;border-top:1px solid #e5e7eb;">
    <p style="color:#9ca3af;font-size:11px;">Automated notification from the Absolute Pest Services field logging system.</p>
  `;

  const text = `New Field Job Log Entry
Technician: ${data.employeeName}
Customer: ${data.customerName}
Site Location: ${data.siteLocation}
${data.siteAddress ? `Address: ${data.siteAddress}\n` : ''}Serviced Area: ${data.servicedArea}
Job Date: ${formattedDate}
${data.amount ? `Amount: $${data.amount}\n` : ''}
Work Performed:
${data.workPerformed}`;

  await Promise.all(
    NOTIFY_EMAILS.map((to) => sendOne({ to, subject, html, text }))
  );
}
