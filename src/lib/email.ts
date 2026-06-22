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

export async function sendContactFormNotification(data: {
  name: string;
  email: string;
  phone: string;
  service: string;
  address: string;
  message?: string | null;
}): Promise<void> {
  const subject = `New Service Request — ${data.service} (${data.address})`;

  const html = `
    <h2 style="color:#1f2937;">New Service Request</h2>
    <table style="border-collapse:collapse;width:100%;font-family:sans-serif;font-size:14px;">
      <tr><td style="padding:6px 12px;font-weight:bold;width:120px;">Name</td><td style="padding:6px 12px;">${data.name}</td></tr>
      <tr style="background:#f9fafb;"><td style="padding:6px 12px;font-weight:bold;">Email</td><td style="padding:6px 12px;"><a href="mailto:${data.email}">${data.email}</a></td></tr>
      <tr><td style="padding:6px 12px;font-weight:bold;">Phone</td><td style="padding:6px 12px;"><a href="tel:${data.phone}">${data.phone}</a></td></tr>
      <tr style="background:#f9fafb;"><td style="padding:6px 12px;font-weight:bold;">Service</td><td style="padding:6px 12px;">${data.service}</td></tr>
      <tr><td style="padding:6px 12px;font-weight:bold;">Address</td><td style="padding:6px 12px;">${data.address}</td></tr>
      ${data.message ? `<tr style="background:#f9fafb;"><td style="padding:6px 12px;font-weight:bold;">Message</td><td style="padding:6px 12px;">${data.message}</td></tr>` : ''}
    </table>
    <hr style="margin-top:24px;border:none;border-top:1px solid #e5e7eb;">
    <p style="color:#9ca3af;font-size:11px;">Submitted via absolutepestservices.com contact form.</p>
  `;

  const text = `New Service Request
Name: ${data.name}
Email: ${data.email}
Phone: ${data.phone}
Service: ${data.service}
ZIP: ${data.zip}
${data.message ? `Message: ${data.message}` : ''}`;

  await Promise.all(
    NOTIFY_EMAILS.map((to) => sendOne({ to, subject, html, text }))
  );
}

export async function sendInvoiceToCustomer(data: {
  to: string;
  ccInternal?: boolean;
  customerName: string;
  invoiceNumber: string;
  total: string;
  dueDate: string;
  invoiceUrl: string;
  personalMessage?: string;
  paymentMethods?: string[];
}): Promise<{ success: boolean; error?: string }> {
  if (!process.env.SENDGRID_API_KEY) {
    return { success: false, error: 'Email service not configured' };
  }

  const formattedDue = new Date(data.dueDate).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    timeZone: 'America/New_York',
  });
  const methods = (data.paymentMethods ?? ['Cash', 'Credit', 'Debit', 'Zelle', 'Cash App', 'PayPal']).join(', ');
  const subject = `Invoice ${data.invoiceNumber} from Absolute Pest Services — $${parseFloat(data.total).toFixed(2)}`;

  const html = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#1f2937;">
      <h2 style="color:#16a34a;margin-bottom:8px;">Thank you, ${data.customerName}!</h2>
      <p style="font-size:14px;line-height:1.6;">
        Your invoice from Absolute Pest Services is ready. You can view and print it at the link below.
      </p>
      ${data.personalMessage ? `
        <div style="background:#f9fafb;border-left:3px solid #16a34a;padding:12px 16px;margin:16px 0;font-size:14px;line-height:1.6;white-space:pre-wrap;">
          ${data.personalMessage}
        </div>` : ''}
      <table style="border-collapse:collapse;width:100%;font-size:14px;margin:20px 0;">
        <tr><td style="padding:8px 0;color:#6b7280;">Invoice #</td><td style="padding:8px 0;font-weight:600;">${data.invoiceNumber}</td></tr>
        <tr><td style="padding:8px 0;color:#6b7280;">Amount Due</td><td style="padding:8px 0;font-weight:600;">$${parseFloat(data.total).toFixed(2)}</td></tr>
        <tr><td style="padding:8px 0;color:#6b7280;">Due Date</td><td style="padding:8px 0;">${formattedDue}</td></tr>
      </table>
      <div style="text-align:center;margin:28px 0;">
        <a href="${data.invoiceUrl}"
           style="display:inline-block;padding:12px 28px;background:#16a34a;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px;">
          View Invoice
        </a>
      </div>
      <p style="font-size:13px;color:#6b7280;line-height:1.6;">
        <strong>Accepted payment methods:</strong> ${methods}
      </p>
      <hr style="margin:24px 0;border:none;border-top:1px solid #e5e7eb;">
      <p style="font-size:12px;color:#9ca3af;line-height:1.6;">
        Questions? Reply to this email or call us. Thank you for choosing Absolute Pest Services.<br>
        <em>absolutepestservices.com</em>
      </p>
    </div>
  `;

  const text = `Thank you, ${data.customerName}!

Your invoice ${data.invoiceNumber} from Absolute Pest Services is ready.

Amount Due: $${parseFloat(data.total).toFixed(2)}
Due Date: ${formattedDue}

View your invoice: ${data.invoiceUrl}

${data.personalMessage ? `\n${data.personalMessage}\n` : ''}
Accepted payment methods: ${methods}

Questions? Reply to this email or call us.
- Absolute Pest Services`;

  try {
    await sgMail.send({ from: FROM_EMAIL, to: data.to, subject, html, text });
    if (data.ccInternal) {
      // Send a copy to office
      await sgMail.send({
        from: FROM_EMAIL,
        to: 'rob@absolutepestservices.com',
        subject: `[Copy] ${subject}`,
        html, text,
      });
    }
    return { success: true };
  } catch (err: any) {
    console.error('[email] sendInvoiceToCustomer failed:', err?.response?.body ?? err?.message ?? err);
    return { success: false, error: err?.message || 'Email send failed' };
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
