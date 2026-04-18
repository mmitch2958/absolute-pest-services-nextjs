import { MailService } from '@sendgrid/mail';

if (!process.env.SENDGRID_API_KEY) {
  throw new Error("SENDGRID_API_KEY environment variable must be set");
}

const mailService = new MailService();
mailService.setApiKey(process.env.SENDGRID_API_KEY);

const FROM_EMAIL = 'rob@absolutepestservices.com';
const TO_EMAIL = 'rob@absolutepestservices.com';
const ADDITIONAL_EMAIL = 'mike@steelcity-ai.com';
const THIRD_EMAIL = 'rmitch21@gmail.com';

// Helper function to send notifications to all business emails
async function sendBusinessNotifications(subject: string, html: string, text: string): Promise<boolean> {
  const businessEmailSent = await sendEmail({
    to: TO_EMAIL,
    from: FROM_EMAIL,
    subject,
    html,
    text
  });

  const additionalEmailSent = await sendEmail({
    to: ADDITIONAL_EMAIL,
    from: FROM_EMAIL,
    subject,
    html,
    text
  });

  const thirdEmailSent = await sendEmail({
    to: THIRD_EMAIL,
    from: FROM_EMAIL,
    subject,
    html,
    text
  });

  return businessEmailSent && additionalEmailSent && thirdEmailSent;
}

interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
  attachments?: Array<{ content: string; filename: string; type: string; disposition: string }>;
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  try {
    console.log(`[Email] Sending to ${params.to} | Subject: ${params.subject}`);
    const msg: any = {
      to: params.to,
      from: params.from,
      subject: params.subject,
      text: params.text || '',
      html: params.html || '',
    };
    if (params.attachments && params.attachments.length > 0) {
      msg.attachments = params.attachments;
    }
    await mailService.send(msg);
    console.log(`[Email] Successfully sent to ${params.to}`);
    return true;
  } catch (error: any) {
    console.error(`[Email] Failed to send to ${params.to}:`, error?.response?.body || error?.message || error);
    return false;
  }
}

// Contact form email
export async function sendContactFormEmail(data: {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  city: string;
  serviceType: string;
  message: string;
}) {
  // Send notification to business
  const businessSubject = `Contact Form Submission - ${data.serviceType}`;
  const businessHtml = `
    <h2>New Contact Form Submission</h2>
    <p><strong>Name:</strong> ${data.firstName} ${data.lastName}</p>
    <p><strong>Phone:</strong> ${data.phone}</p>
    <p><strong>Email:</strong> ${data.email}</p>
    <p><strong>City:</strong> ${data.city}</p>
    <p><strong>Service Type:</strong> ${data.serviceType}</p>
    <p><strong>Message:</strong></p>
    <p>${data.message}</p>
  `;
  
  const businessText = `
    New Contact Form Submission
    Name: ${data.firstName} ${data.lastName}
    Phone: ${data.phone}
    Email: ${data.email}
    City: ${data.city}
    Service Type: ${data.serviceType}
    Message: ${data.message}
  `;

  // Send customer confirmation email
  const customerSubject = `Thank you for contacting Absolute Pest Services`;
  const customerHtml = `
    <h2>Thank you for contacting us!</h2>
    <p>Dear ${data.firstName} ${data.lastName},</p>
    <p>We have received your inquiry about <strong>${data.serviceType}</strong> and will respond within 24 hours.</p>
    <p><strong>Your submitted information:</strong></p>
    <p><strong>Service Type:</strong> ${data.serviceType}</p>
    <p><strong>Message:</strong> ${data.message}</p>
    <p>In the meantime, if you have any urgent questions, please call us at <strong>(484) 643-2225</strong>.</p>
    <p>Thank you for choosing Absolute Pest Services!</p>
    <p>Best regards,<br>The Absolute Pest Services Team</p>
  `;

  const customerText = `
    Thank you for contacting us!
    
    Dear ${data.firstName} ${data.lastName},
    
    We have received your inquiry about ${data.serviceType} and will respond within 24 hours.
    
    Your submitted information:
    Service Type: ${data.serviceType}
    Message: ${data.message}
    
    In the meantime, if you have any urgent questions, please call us at (484) 643-2225.
    
    Thank you for choosing Absolute Pest Services!
    
    Best regards,
    The Absolute Pest Services Team
  `;

  // Send business notification emails
  const businessEmailsSent = await sendBusinessNotifications(businessSubject, businessHtml, businessText);

  const customerEmailSent = await sendEmail({
    to: data.email,
    from: FROM_EMAIL,
    subject: customerSubject,
    html: customerHtml,
    text: customerText
  });

  return businessEmailsSent && customerEmailSent;
}

// Inspection scheduling email
export async function sendInspectionScheduleEmail(data: {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  serviceType: string;
  preferredDate: Date;
  preferredTime: string;
  urgency: string;
  message?: string;
}) {
  const formattedDate = data.preferredDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Send notification to business
  const businessSubject = `Inspection Schedule Request - ${data.serviceType}`;
  const businessHtml = `
    <h2>New Inspection Request</h2>
    <p><strong>Name:</strong> ${data.firstName} ${data.lastName}</p>
    <p><strong>Phone:</strong> ${data.phone}</p>
    <p><strong>Email:</strong> ${data.email}</p>
    <p><strong>Address:</strong> ${data.address}</p>
    <p><strong>City:</strong> ${data.city}</p>
    <p><strong>Service Type:</strong> ${data.serviceType}</p>
    <p><strong>Preferred Date:</strong> ${formattedDate}</p>
    <p><strong>Preferred Time:</strong> ${data.preferredTime}</p>
    <p><strong>Urgency:</strong> ${data.urgency}</p>
    ${data.message ? `<p><strong>Additional Message:</strong></p><p>${data.message}</p>` : ''}
  `;
  
  const businessText = `
    New Inspection Request
    Name: ${data.firstName} ${data.lastName}
    Phone: ${data.phone}
    Email: ${data.email}
    Address: ${data.address}
    City: ${data.city}
    Service Type: ${data.serviceType}
    Preferred Date: ${formattedDate}
    Preferred Time: ${data.preferredTime}
    Urgency: ${data.urgency}
    ${data.message ? `Additional Message: ${data.message}` : ''}
  `;

  // Send customer confirmation email
  const customerSubject = `Inspection Request Confirmation - Absolute Pest Services`;
  const customerHtml = `
    <h2>Inspection Request Confirmed!</h2>
    <p>Dear ${data.firstName} ${data.lastName},</p>
    <p>Thank you for scheduling an inspection with Absolute Pest Services. We have received your request for <strong>${data.serviceType}</strong> inspection.</p>
    <p><strong>Inspection Details:</strong></p>
    <p><strong>Address:</strong> ${data.address}</p>
    <p><strong>City:</strong> ${data.city}</p>
    <p><strong>Service Type:</strong> ${data.serviceType}</p>
    <p><strong>Preferred Date:</strong> ${formattedDate}</p>
    <p><strong>Preferred Time:</strong> ${data.preferredTime}</p>
    <p><strong>Urgency:</strong> ${data.urgency}</p>
    ${data.message ? `<p><strong>Additional Notes:</strong> ${data.message}</p>` : ''}
    <p>We will contact you within 24 hours to confirm the inspection appointment. If you have any questions or need to make changes, please call us at <strong>(484)643-2225</strong>.</p>
    <p>Thank you for choosing Absolute Pest Services!</p>
    <p>Best regards,<br>The Absolute Pest Services Team</p>
  `;

  const customerText = `
    Inspection Request Confirmed!
    
    Dear ${data.firstName} ${data.lastName},
    
    Thank you for scheduling an inspection with Absolute Pest Services. We have received your request for ${data.serviceType} inspection.
    
    Inspection Details:
    Address: ${data.address}
    City: ${data.city}
    Service Type: ${data.serviceType}
    Preferred Date: ${formattedDate}
    Preferred Time: ${data.preferredTime}
    Urgency: ${data.urgency}
    ${data.message ? `Additional Notes: ${data.message}` : ''}
    
    We will contact you within 24 hours to confirm the inspection appointment. If you have any questions or need to make changes, please call us at (484)643-2225.
    
    Thank you for choosing Absolute Pest Services!
    
    Best regards,
    The Absolute Pest Services Team
  `;

  // Send business notification emails
  const businessEmailsSent = await sendBusinessNotifications(businessSubject, businessHtml, businessText);

  const customerEmailSent = await sendEmail({
    to: data.email,
    from: FROM_EMAIL,
    subject: customerSubject,
    html: customerHtml,
    text: customerText
  });

  return businessEmailsSent && customerEmailSent;
}

// Service request email
export async function sendServiceRequestEmail(data: {
  firstName: string;
  lastName: string;
  serviceType: string;
  description: string;
  address: string;
  city: string;
  priority: string;
  customerEmail: string;
  customerPhone?: string;
}) {
  const customerName = `${data.firstName} ${data.lastName}`;
  
  // Send notification to business
  const businessSubject = `Service Request - ${data.serviceType}`;
  const businessHtml = `
    <h2>New Service Request</h2>
    <p><strong>Customer:</strong> ${customerName}</p>
    <p><strong>Email:</strong> ${data.customerEmail}</p>
    ${data.customerPhone ? `<p><strong>Phone:</strong> ${data.customerPhone}</p>` : ''}
    <p><strong>Service Type:</strong> ${data.serviceType}</p>
    <p><strong>Address:</strong> ${data.address}</p>
    <p><strong>City:</strong> ${data.city}</p>
    <p><strong>Priority:</strong> ${data.priority}</p>
    <p><strong>Description:</strong></p>
    <p>${data.description}</p>
  `;
  
  const businessText = `
    New Service Request
    Customer: ${customerName}
    Email: ${data.customerEmail}
    ${data.customerPhone ? `Phone: ${data.customerPhone}` : ''}
    Service Type: ${data.serviceType}
    Address: ${data.address}
    City: ${data.city}
    Priority: ${data.priority}
    Description: ${data.description}
  `;

  // Send customer confirmation email
  const customerSubject = `Service Request Confirmation - Absolute Pest Services`;
  const customerHtml = `
    <h2>Service Request Confirmed!</h2>
    <p>Dear ${customerName},</p>
    <p>Thank you for submitting a service request. We have received your request for <strong>${data.serviceType}</strong> service.</p>
    <p><strong>Service Details:</strong></p>
    <p><strong>Service Type:</strong> ${data.serviceType}</p>
    <p><strong>Address:</strong> ${data.address}</p>
    <p><strong>City:</strong> ${data.city}</p>
    <p><strong>Priority:</strong> ${data.priority}</p>
    <p><strong>Description:</strong> ${data.description}</p>
    <p>Our team will review your request and contact you within 24 hours to schedule service. For urgent matters, please call us at <strong>(484)643-2225</strong>.</p>
    <p>You can track the status of your request by logging into your customer portal on our website.</p>
    <p>Thank you for choosing Absolute Pest Services!</p>
    <p>Best regards,<br>The Absolute Pest Services Team</p>
  `;

  const customerText = `
    Service Request Confirmed!
    
    Dear ${customerName},
    
    Thank you for submitting a service request. We have received your request for ${data.serviceType} service.
    
    Service Details:
    Service Type: ${data.serviceType}
    Address: ${data.address}
    City: ${data.city}
    Priority: ${data.priority}
    Description: ${data.description}
    
    Our team will review your request and contact you within 24 hours to schedule service. For urgent matters, please call us at (484)643-2225.
    
    You can track the status of your request by logging into your customer portal on our website.
    
    Thank you for choosing Absolute Pest Services!
    
    Best regards,
    The Absolute Pest Services Team
  `;

  // Send business notification emails
  const businessEmailsSent = await sendBusinessNotifications(businessSubject, businessHtml, businessText);

  const customerEmailSent = await sendEmail({
    to: data.customerEmail,
    from: FROM_EMAIL,
    subject: customerSubject,
    html: customerHtml,
    text: customerText
  });

  return businessEmailsSent && customerEmailSent;
}

export async function sendServiceRequestStatusUpdate(data: {
  customerName: string;
  customerEmail: string;
  serviceType: string;
  oldStatus: string;
  newStatus: string;
  address: string;
  scheduledDate?: Date;
  technicianNotes?: string;
}) {
  const statusMessages: Record<string, {title: string; message: string}> = {
    scheduled: {
      title: 'Service Scheduled',
      message: `Your ${data.serviceType} service has been scheduled${data.scheduledDate ? ` for ${data.scheduledDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}` : ''}.`
    },
    'in-progress': {
      title: 'Service In Progress',
      message: `Our technician is currently working on your ${data.serviceType} service at ${data.address}.`
    },
    completed: {
      title: 'Service Completed',
      message: `Your ${data.serviceType} service has been completed successfully! We hope you're satisfied with our work.`
    },
    cancelled: {
      title: 'Service Cancelled',
      message: `Your ${data.serviceType} service request has been cancelled.`
    }
  };

  const statusInfo = statusMessages[data.newStatus] || {
    title: 'Service Status Update',
    message: `Your service request status has been updated to: ${data.newStatus}`
  };

  const subject = `${statusInfo.title} - Absolute Pest Services`;
  const html = `
    <h2>${statusInfo.title}</h2>
    <p>Dear ${data.customerName},</p>
    <p>${statusInfo.message}</p>
    <p><strong>Service Details:</strong></p>
    <p><strong>Service Type:</strong> ${data.serviceType}</p>
    <p><strong>Address:</strong> ${data.address}</p>
    <p><strong>Previous Status:</strong> ${data.oldStatus}</p>
    <p><strong>Current Status:</strong> ${data.newStatus}</p>
    ${data.technicianNotes ? `<p><strong>Technician Notes:</strong></p><p>${data.technicianNotes}</p>` : ''}
    ${data.newStatus === 'completed' ? `
      <p>We'd love to hear about your experience! Please consider leaving us a review on <a href="https://g.page/r/CXh2r5bK1ZCXEBM/review">Google</a>.</p>
      <p>If you have any questions or concerns about the service, please don't hesitate to contact us at <strong>(484)643-2225</strong>.</p>
    ` : `<p>You can track your request status by logging into your customer portal on our website.</p>`}
    <p>Thank you for choosing Absolute Pest Services!</p>
    <p>Best regards,<br>The Absolute Pest Services Team</p>
  `;

  const text = `
    ${statusInfo.title}
    
    Dear ${data.customerName},
    
    ${statusInfo.message}
    
    Service Details:
    Service Type: ${data.serviceType}
    Address: ${data.address}
    Previous Status: ${data.oldStatus}
    Current Status: ${data.newStatus}
    ${data.technicianNotes ? `Technician Notes: ${data.technicianNotes}` : ''}
    
    ${data.newStatus === 'completed' ? `We'd love to hear about your experience! Please consider leaving us a review on Google at: https://g.page/r/CXh2r5bK1ZCXEBM/review
    
If you have any questions or concerns about the service, please don't hesitate to contact us at (484)643-2225.` : 'You can track your request status by logging into your customer portal on our website.'}
    
    Thank you for choosing Absolute Pest Services!
    
    Best regards,
    The Absolute Pest Services Team
  `;

  return await sendEmail({
    to: data.customerEmail,
    from: FROM_EMAIL,
    subject,
    html,
    text
  });
}

export async function sendJobLogNotification(data: {
  employeeName: string;
  customerName: string;
  siteLocation: string;
  servicedArea: string;
  workPerformed: string;
  jobDate: string;
}) {
  const formattedDate = new Date(data.jobDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const subject = `Field Job Log - ${data.customerName} - ${formattedDate}`;
  const html = `
    <h2>New Field Job Log Entry</h2>
    <p><strong>Technician:</strong> ${data.employeeName}</p>
    <p><strong>Customer:</strong> ${data.customerName}</p>
    <p><strong>Site Location:</strong> ${data.siteLocation}</p>
    <p><strong>Serviced Area:</strong> ${data.servicedArea}</p>
    <p><strong>Job Date:</strong> ${formattedDate}</p>
    <p><strong>Work Performed:</strong></p>
    <p>${data.workPerformed}</p>
    <hr>
    <p style="color: #666; font-size: 12px;">This is an automated notification from the Absolute Pest Services field logging system.</p>
  `;

  const text = `
New Field Job Log Entry

Technician: ${data.employeeName}
Customer: ${data.customerName}
Site Location: ${data.siteLocation}
Serviced Area: ${data.servicedArea}
Job Date: ${formattedDate}
Work Performed: ${data.workPerformed}
  `;

  const robSent = await sendEmail({
    to: TO_EMAIL,
    from: FROM_EMAIL,
    subject,
    html,
    text
  });

  const mikeSent = await sendEmail({
    to: ADDITIONAL_EMAIL,
    from: FROM_EMAIL,
    subject,
    html,
    text
  });

  const rmitchSent = await sendEmail({
    to: THIRD_EMAIL,
    from: FROM_EMAIL,
    subject,
    html,
    text
  });

  return robSent && mikeSent && rmitchSent;
}

export async function sendNewsletterEmail(data: {
  recipientEmail: string;
  subject: string;
  posts: Array<{
    title: string;
    excerpt: string;
    slug: string;
    featuredImage?: string | null;
    category: string;
  }>;
}) {
  const baseUrl = process.env.REPLIT_DEV_DOMAIN 
    ? `https://${process.env.REPLIT_DEV_DOMAIN}` 
    : 'http://localhost:5000';

  const postsHtml = data.posts.map(post => `
    <div style="margin-bottom: 30px; border-bottom: 1px solid #e5e7eb; padding-bottom: 20px;">
      ${post.featuredImage ? `
        <img src="${post.featuredImage}" alt="${post.title}" style="width: 100%; max-width: 600px; height: auto; border-radius: 8px; margin-bottom: 15px;" />
      ` : ''}
      <h3 style="color: #1f2937; margin: 0 0 10px 0; font-size: 20px;">
        <a href="${baseUrl}/blog/${post.slug}" style="color: #1f2937; text-decoration: none;">${post.title}</a>
      </h3>
      <p style="color: #6b7280; margin: 0 0 10px 0; font-size: 14px;">
        <span style="background-color: #f3f4f6; padding: 4px 12px; border-radius: 4px;">${post.category}</span>
      </p>
      <p style="color: #4b5563; margin: 0 0 15px 0; line-height: 1.6;">${post.excerpt}</p>
      <a href="${baseUrl}/blog/${post.slug}" style="display: inline-block; background-color: #eab308; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: 500;">Read More</a>
    </div>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${data.subject}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);">
        <div style="background: linear-gradient(135deg, #eab308 0%, #ca8a04 100%); padding: 40px 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">Absolute Pest Services</h1>
          <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px;">${data.subject}</p>
        </div>
        <div style="padding: 40px 30px;">
          <p style="color: #4b5563; margin: 0 0 30px 0; font-size: 16px; line-height: 1.6;">
            Hello! We've curated some helpful pest control tips and updates just for you.
          </p>
          ${postsHtml}
          <div style="margin-top: 40px; padding-top: 30px; border-top: 2px solid #e5e7eb; text-align: center;">
            <p style="color: #6b7280; margin: 0 0 15px 0; font-size: 14px;">
              Need pest control services? We're here to help!
            </p>
            <a href="${baseUrl}/#contact" style="display: inline-block; background-color: #1f2937; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 500; margin-bottom: 20px;">Contact Us</a>
            <p style="color: #9ca3af; margin: 0; font-size: 12px;">
              Absolute Pest Services<br>
              Phone: (484) 643-2225<br>
              <a href="${baseUrl}" style="color: #eab308; text-decoration: none;">Visit Our Website</a>
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const postsText = data.posts.map(post => `
${post.title}
Category: ${post.category}
${post.excerpt}
Read more: ${baseUrl}/blog/${post.slug}
---
  `).join('\n');

  const text = `
${data.subject}

Hello! We've curated some helpful pest control tips and updates just for you.

${postsText}

Need pest control services? We're here to help!
Contact us at: ${baseUrl}/#contact

Absolute Pest Services
Phone: (484) 643-2225
Website: ${baseUrl}
  `;

  return await sendEmail({
    to: data.recipientEmail,
    from: FROM_EMAIL,
    subject: data.subject,
    html,
    text
  });
}

// ============================================
// Invoice Emails (SC-INV-001)
// ============================================

export async function sendInvoiceEmail(data: {
  clientEmail: string;
  clientName: string;
  invoiceNumber: string;
  invoiceDate: Date;
  dueDate: Date;
  total: string;
  viewToken: string;
  pdfUrl?: string;
  baseUrl?: string;
  pdfBuffer?: Buffer;
  subject?: string;    // Custom subject override
  message?: string;    // Custom personal message appended to email body
  email?: string;     // Recipient email override (for admin custom send)
}): Promise<boolean> {
  const resolvedBase = data.baseUrl
    || process.env.APP_BASE_URL
    || (process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : 'http://localhost:5000');

  const recipientEmail = data.email || data.clientEmail;
  const viewUrl = `${resolvedBase}/invoice/${data.viewToken}`;
  const formattedInvoiceDate = data.invoiceDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const formattedDueDate = data.dueDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const subject = data.subject || `Invoice #${data.invoiceNumber} from Absolute Pest Services`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);">
        <div style="background: linear-gradient(135deg, #eab308 0%, #ca8a04 100%); padding: 40px 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">INVOICE</h1>
          <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 18px;">#${data.invoiceNumber}</p>
        </div>
        <div style="padding: 40px 30px;">
          <p style="color: #4b5563; margin: 0 0 20px 0; font-size: 16px;">
            Dear <strong>${data.clientName}</strong>,
          </p>
          <p style="color: #4b5563; margin: 0 0 20px 0; font-size: 16px;">
            Thank you for choosing Absolute Pest Services! Please find your invoice details below.
          </p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 30px 0;">
            <tr>
              <td style="padding: 12px 0; color: #6b7280; border-bottom: 1px solid #e5e7eb;">Invoice Number</td>
              <td style="padding: 12px 0; color: #1f2937; font-weight: 600; text-align: right; border-bottom: 1px solid #e5e7eb;">${data.invoiceNumber}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; color: #6b7280; border-bottom: 1px solid #e5e7eb;">Invoice Date</td>
              <td style="padding: 12px 0; color: #1f2937; text-align: right; border-bottom: 1px solid #e5e7eb;">${formattedInvoiceDate}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; color: #6b7280; border-bottom: 1px solid #e5e7eb;">Due Date</td>
              <td style="padding: 12px 0; color: #1f2937; text-align: right; border-bottom: 1px solid #e5e7eb;">${formattedDueDate}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; color: #6b7280;">Total Amount</td>
              <td style="padding: 12px 0; color: #1f2937; font-weight: bold; font-size: 18px; text-align: right;">$${data.total}</td>
            </tr>
          </table>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${viewUrl}" style="display: inline-block; background-color: #eab308; color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">View Invoice</a>
          </div>

          ${data.pdfBuffer ? `
          <p style="color: #6b7280; margin: 20px 0; font-size: 14px; text-align: center;">
            A PDF copy is also attached to this email.
          </p>
          ` : ''}


          ${data.message ? `
          <div style="margin-top: 30px; padding: 16px; background-color: #f9fafb; border-left: 4px solid #eab308; border-radius: 4px;">
            <p style="color: #4b5563; margin: 0; font-size: 14px;"><strong>Personal Note:</strong><br>${data.message}</p>
          </div>
          ` : ''}

          <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #e5e7eb;">
            <p style="color: #6b7280; margin: 0 0 10px 0; font-size: 14px;">
              <strong>Payment Instructions:</strong><br>
              Payment is due by ${formattedDueDate}. You can pay via cash, check, or credit card.
            </p>
            <p style="color: #9ca3af; margin: 0; font-size: 12px;">
              If you have any questions, please contact us at <strong>(484) 643-2225</strong>.
            </p>
          </div>

          <div style="margin-top: 30px; text-align: center;">
            <p style="color: #9ca3af; margin: 0; font-size: 12px;">
              Absolute Pest Services<br>
              <a href="${resolvedBase}" style="color: #eab308; text-decoration: none;">Visit Our Website</a>
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Invoice #${data.invoiceNumber} from Absolute Pest Services

Dear ${data.clientName},

Thank you for choosing Absolute Pest Services! Please find your invoice details below:

Invoice Number: ${data.invoiceNumber}
Invoice Date: ${formattedInvoiceDate}
Due Date: ${formattedDueDate}
Total Amount: $${data.total}

View your invoice online: ${viewUrl}

Payment Instructions:
Payment is due by ${formattedDueDate}. You can pay via cash, check, or credit card.

If you have any questions, please contact us at (484) 643-2225.

Absolute Pest Services
  `;

  const attachments: any[] = [];
  if (data.pdfBuffer) {
    attachments.push({
      content: data.pdfBuffer.toString("base64"),
      filename: `Invoice-${data.invoiceNumber}.pdf`,
      type: "application/pdf",
      disposition: "attachment",
    });
  }

  // Send to customer
  const customerSent = await sendEmail({
    to: recipientEmail,
    from: FROM_EMAIL,
    subject,
    html,
    text,
    attachments: attachments.length > 0 ? attachments : undefined,
  });

  // Send CC to business
  const businessSent = await sendEmail({
    to: TO_EMAIL,
    from: FROM_EMAIL,
    subject: `[INVOICE SENT] ${subject}`,
    html: `<p>Invoice #${data.invoiceNumber} sent to ${recipientEmail} (${data.clientName})</p>`,
    text: `Invoice #${data.invoiceNumber} sent to ${recipientEmail} (${data.clientName})`,
  });

  return customerSent && businessSent;
}

export async function sendInvoiceOverdueEmail(data: {
  clientEmail: string;
  clientName: string;
  invoiceNumber: string;
  dueDate: Date;
  total: string;
  viewToken: string;
  baseUrl?: string;
}): Promise<boolean> {
  const resolvedBase = data.baseUrl
    || process.env.APP_BASE_URL
    || (process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : 'http://localhost:5000');

  const viewUrl = `${resolvedBase}/invoice/${data.viewToken}`;
  const formattedDueDate = data.dueDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const subject = `OVERDUE: Invoice #${data.invoiceNumber} — Action Required`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);">
        <div style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); padding: 30px 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">OVERDUE NOTICE</h1>
          <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 18px;">Invoice #${data.invoiceNumber}</p>
        </div>
        <div style="padding: 40px 30px;">
          <p style="color: #4b5563; margin: 0 0 20px 0; font-size: 16px;">
            Dear <strong>${data.clientName}</strong>,
          </p>
          <p style="color: #4b5563; margin: 0 0 20px 0; font-size: 16px;">
            This is a reminder that your invoice is past due. Please take action to avoid service interruption.
          </p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 30px 0; background-color: #fef2f2; border-radius: 8px;">
            <tr>
              <td style="padding: 15px; color: #991b1b; border-bottom: 1px solid #fecaca;">Original Due Date</td>
              <td style="padding: 15px; color: #1f2937; font-weight: 600; text-align: right; border-bottom: 1px solid #fecaca;">${formattedDueDate}</td>
            </tr>
            <tr>
              <td style="padding: 15px; color: #991b1b;">Outstanding Amount</td>
              <td style="padding: 15px; color: #1f2937; font-weight: bold; font-size: 20px; text-align: right;">$${data.total}</td>
            </tr>
          </table>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${viewUrl}" style="display: inline-block; background-color: #dc2626; color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">View & Pay Invoice</a>
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #e5e7eb;">
            <p style="color: #6b7280; margin: 0 0 10px 0; font-size: 14px;">
              If you have already sent payment, please ignore this notice. Otherwise, please contact us at <strong>(484) 643-2225</strong> to discuss payment options.
            </p>
          </div>

          <div style="margin-top: 30px; text-align: center;">
            <p style="color: #9ca3af; margin: 0; font-size: 12px;">
              Absolute Pest Services<br>
              <a href="${resolvedBase}" style="color: #eab308; text-decoration: none;">Visit Our Website</a>
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
OVERDUE NOTICE: Invoice #${data.invoiceNumber}

Dear ${data.clientName},

This is a reminder that your invoice is past due. Please take action to avoid service interruption.

Original Due Date: ${formattedDueDate}
Outstanding Amount: $${data.total}

View and pay your invoice: ${viewUrl}

If you have already sent payment, please ignore this notice. Otherwise, please contact us at (484) 643-2225.

Absolute Pest Services
  `;

  return await sendEmail({
    to: data.clientEmail,
    from: FROM_EMAIL,
    subject,
    html,
    text,
  });
}

export async function sendPaymentConfirmationEmail(data: {
  clientEmail: string;
  clientName: string;
  invoiceNumber: string;
  amountPaid: string;
  paidAt: Date;
  paymentMethod: string;
}): Promise<boolean> {
  const formattedPaidAt = data.paidAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const subject = `Payment Received — Invoice #${data.invoiceNumber}`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);">
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">PAYMENT RECEIVED</h1>
          <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 18px;">Thank you!</p>
        </div>
        <div style="padding: 40px 30px;">
          <p style="color: #4b5563; margin: 0 0 20px 0; font-size: 16px;">
            Dear <strong>${data.clientName}</strong>,
          </p>
          <p style="color: #4b5563; margin: 0 0 20px 0; font-size: 16px;">
            We have received your payment. Thank you for your business!
          </p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 30px 0; background-color: #ecfdf5; border-radius: 8px;">
            <tr>
              <td style="padding: 15px; color: #065f46; border-bottom: 1px solid #a7f3d0;">Invoice Number</td>
              <td style="padding: 15px; color: #1f2937; font-weight: 600; text-align: right; border-bottom: 1px solid #a7f3d0;">${data.invoiceNumber}</td>
            </tr>
            <tr>
              <td style="padding: 15px; color: #065f46; border-bottom: 1px solid #a7f3d0;">Amount Paid</td>
              <td style="padding: 15px; color: #1f2937; font-weight: bold; font-size: 20px; text-align: right; border-bottom: 1px solid #a7f3d0;">$${data.amountPaid}</td>
            </tr>
            <tr>
              <td style="padding: 15px; color: #065f46; border-bottom: 1px solid #a7f3d0;">Payment Method</td>
              <td style="padding: 15px; color: #1f2937; text-align: right; border-bottom: 1px solid #a7f3d0;">${data.paymentMethod}</td>
            </tr>
            <tr>
              <td style="padding: 15px; color: #065f46;">Payment Date</td>
              <td style="padding: 15px; color: #1f2937; text-align: right;">${formattedPaidAt}</td>
            </tr>
          </table>

          <p style="color: #6b7280; margin: 30px 0 20px 0; font-size: 14px;">
            If you have any questions about this payment, please contact us at <strong>(484) 643-2225</strong>.
          </p>

          <div style="margin-top: 30px; text-align: center;">
            <p style="color: #9ca3af; margin: 0; font-size: 12px;">
              Absolute Pest Services<br>
              <a href="http://absolutepestservices.com" style="color: #eab308; text-decoration: none;">Visit Our Website</a>
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Payment Received — Invoice #${data.invoiceNumber}

Dear ${data.clientName},

We have received your payment. Thank you for your business!

Invoice Number: ${data.invoiceNumber}
Amount Paid: $${data.amountPaid}
Payment Method: ${data.paymentMethod}
Payment Date: ${formattedPaidAt}

If you have any questions about this payment, please contact us at (484) 643-2225.

Absolute Pest Services
  `;

  return await sendEmail({
    to: data.clientEmail,
    from: FROM_EMAIL,
    subject,
    html,
    text,
  });
}

// Appointment Reminder Email (SC-REMINDERS-001)
export interface AppointmentReminderEmailData {
  recipientEmail: string;
  customerName: string;
  serviceType: string;
  appointmentDate: Date;
  appointmentTime?: string;
  address: string;
  city: string;
  reminderType: '24h' | 'same_day';
  unsubscribeToken?: string;
}

export async function sendAppointmentReminderEmail(data: AppointmentReminderEmailData): Promise<boolean> {
  const baseUrl = process.env.BASE_URL || 'https://absolutepestservices.com';
  
  // Format the date for display (Eastern Time)
  const formattedDate = data.appointmentDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'America/New_York',
  });

  const timeDisplay = data.appointmentTime || 'TBD';
  const reminderGreeting = data.reminderType === '24h' 
    ? 'This is a reminder that your appointment is tomorrow' 
    : 'This is a reminder that your appointment is today';

  const unsubscribeLink = data.unsubscribeToken 
    ? `${baseUrl}/api/reminders/unsubscribe?token=${data.unsubscribeToken}`
    : null;

  const subject = data.reminderType === '24h'
    ? `Appointment Reminder — ${data.serviceType} Tomorrow`
    : `Today's Appointment — ${data.serviceType}`;

  const html = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <!-- Header -->
        <div style="background-color: #1f2937; padding: 20px; text-align: center;">
          <h1 style="color: #eab308; margin: 0; font-size: 24px;">Absolute Pest Services</h1>
        </div>

        <!-- Content -->
        <div style="padding: 30px 20px;">
          <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 20px;">Appointment Reminder</h2>
          
          <p style="color: #374151; margin: 0 0 20px 0; font-size: 16px;">
            Dear <strong>${data.customerName}</strong>,
          </p>

          <p style="color: #374151; margin: 0 0 20px 0; font-size: 16px;">
            ${reminderGreeting}. Please find your appointment details below:
          </p>

          <!-- Appointment Details -->
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr>
              <td style="padding: 12px 0; color: #6b7280; border-bottom: 1px solid #e5e7eb;">Service Type</td>
              <td style="padding: 12px 0; color: #1f2937; font-weight: 600; text-align: right; border-bottom: 1px solid #e5e7eb;">${data.serviceType}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; color: #6b7280; border-bottom: 1px solid #e5e7eb;">Date</td>
              <td style="padding: 12px 0; color: #1f2937; font-weight: 600; text-align: right; border-bottom: 1px solid #e5e7eb;">${formattedDate}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; color: #6b7280; border-bottom: 1px solid #e5e7eb;">Time</td>
              <td style="padding: 12px 0; color: #1f2937; font-weight: 600; text-align: right; border-bottom: 1px solid #e5e7eb;">${timeDisplay}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; color: #6b7280; border-bottom: 1px solid #e5e7eb;">Address</td>
              <td style="padding: 12px 0; color: #1f2937; font-weight: 600; text-align: right; border-bottom: 1px solid #e5e7eb;">${data.address}, ${data.city}</td>
            </tr>
          </table>

          <p style="color: #374151; margin: 20px 0; font-size: 16px;">
            <strong>Need to reschedule?</strong> Please call us at <strong>(484) 643-2225</strong> and we'll be happy to help you find a more convenient time.
          </p>

          <p style="color: #6b7280; margin: 30px 0 20px 0; font-size: 14px;">
            If you have any questions, please don't hesitate to contact us.
          </p>

          <div style="margin-top: 30px; text-align: center;">
            <p style="color: #9ca3af; margin: 0; font-size: 12px;">
              Absolute Pest Services<br>
              <a href="http://absolutepestservices.com" style="color: #eab308; text-decoration: none;">Visit Our Website</a>
            </p>
          </div>
          
          ${unsubscribeLink ? `
          <div style="margin-top: 20px; text-align: center; font-size: 12px; color: #9ca3af;">
            <a href="${unsubscribeLink}" style="color: #6b7280; text-decoration: underline;">Unsubscribe from appointment reminders</a>
          </div>
          ` : ''}
        </div>
      </div>
    </div>
  </body>
</html>
  `;

  const text = `
Appointment Reminder — Absolute Pest Services

Dear ${data.customerName},

${reminderGreeting}. Please find your appointment details below:

Service Type: ${data.serviceType}
Date: ${formattedDate}
Time: ${timeDisplay}
Address: ${data.address}, ${data.city}

Need to reschedule? Please call us at (484) 643-2225 and we'll be happy to help you find a more convenient time.

If you have any questions, please don't hesitate to contact us.

Absolute Pest Services
${unsubscribeLink ? `\n\nTo unsubscribe from appointment reminders, visit: ${unsubscribeLink}` : ''}
  `;

  return await sendEmail({
    to: data.recipientEmail,
    from: FROM_EMAIL,
    subject,
    html,
    text,
  });
}

// ============================================
// Review Request Email (SC-REVIEWS-001)
// ============================================

export interface ReviewRequestEmailData {
  recipientEmail: string;
  customerName: string;
  serviceDescription: string;
  jobDate: Date;
  siteLocation: string;
  googleReviewLink: string;
  customMessage?: string;
}

export async function sendReviewRequestEmail(data: ReviewRequestEmailData): Promise<boolean> {
  const formattedDate = data.jobDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const subject = 'How did we do? Leave us a quick Google review';

  const html = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <!-- Header -->
        <div style="background-color: #1f2937; padding: 20px; text-align: center;">
          <h1 style="color: #eab308; margin: 0; font-size: 24px;">Absolute Pest Services</h1>
        </div>

        <!-- Content -->
        <div style="padding: 30px 20px;">
          <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 20px;">How did we do?</h2>
          
          <p style="color: #374151; margin: 0 0 20px 0; font-size: 16px;">
            Dear <strong>${data.customerName}</strong>,
          </p>

          <p style="color: #374151; margin: 0 0 20px 0; font-size: 16px;">
            Thank you for choosing Absolute Pest Services! We recently completed a service at your property and we'd love to hear about your experience.
          </p>

          <!-- Service Details -->
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0; background-color: #f9fafb; border-radius: 8px;">
            <tr>
              <td style="padding: 12px 15px; color: #6b7280; border-bottom: 1px solid #e5e7eb;">Service Date</td>
              <td style="padding: 12px 15px; color: #1f2937; font-weight: 600; text-align: right; border-bottom: 1px solid #e5e7eb;">${formattedDate}</td>
            </tr>
            <tr>
              <td style="padding: 12px 15px; color: #6b7280; border-bottom: 1px solid #e5e7eb;">Location</td>
              <td style="padding: 12px 15px; color: #1f2937; font-weight: 600; text-align: right; border-bottom: 1px solid #e5e7eb;">${data.siteLocation}</td>
            </tr>
            <tr>
              <td style="padding: 12px 15px; color: #6b7280;">Service</td>
              <td style="padding: 12px 15px; color: #1f2937; font-weight: 600; text-align: right;">${data.serviceDescription}</td>
            </tr>
          </table>

          ${data.customMessage ? `
          <p style="color: #374151; margin: 20px 0; font-size: 16px; font-style: italic;">
            "${data.customMessage}"
          </p>
          ` : ''}

          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.googleReviewLink}" style="display: inline-block; background-color: #eab308; color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
              Leave a Google Review
            </a>
          </div>

          <p style="color: #6b7280; margin: 20px 0 20px 0; font-size: 14px;">
            If you have any questions or concerns about the service, please don't hesitate to contact us at <strong>(484) 643-2225</strong>.
          </p>

          <div style="margin-top: 30px; text-align: center;">
            <p style="color: #9ca3af; margin: 0; font-size: 12px;">
              Absolute Pest Services<br>
              <a href="http://absolutepestservices.com" style="color: #eab308; text-decoration: none;">Visit Our Website</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  </body>
</html>
  `;

  const text = `
How did we do? - Absolute Pest Services

Dear ${data.customerName},

Thank you for choosing Absolute Pest Services! We recently completed a service at your property and we'd love to hear about your experience.

Service Details:
- Date: ${formattedDate}
- Location: ${data.siteLocation}
- Service: ${data.serviceDescription}

${data.customMessage ? `\n"${data.customMessage}"\n` : ''}
Leave a Google review: ${data.googleReviewLink}

If you have any questions or concerns about the service, please don't hesitate to contact us at (484) 643-2225.

Thank you for your business!
Absolute Pest Services
  `;

  return await sendEmail({
    to: data.recipientEmail,
    from: FROM_EMAIL,
    subject,
    html,
    text,
  });
}

export async function sendJobStatusNotification(data: {
  customerEmail: string;
  customerName: string;
  oldStatus: string;
  newStatus: string;
  jobDate: string;
  siteLocation: string;
  servicedArea: string;
  workPerformed?: string;
  technicianName?: string;
}) {
  const statusLabels: Record<string, string> = {
    scheduled: "Scheduled",
    in_progress: "In Progress",
    completed: "Completed",
    cancelled: "Cancelled",
    invoiced: "Invoiced",
    paid: "Paid",
  };

  const newLabel = statusLabels[data.newStatus] || data.newStatus;
  const subject = `Job Update: ${newLabel} — Absolute Pest Services`;

  let statusMessage = "";
  switch (data.newStatus) {
    case "scheduled":
      statusMessage = "Your service has been scheduled. Our team will be there as planned.";
      break;
    case "in_progress":
      statusMessage = "Our technician has arrived and your service is now in progress.";
      break;
    case "completed":
      statusMessage = "Great news! Your service has been completed. If you have any questions about the work performed, please don't hesitate to reach out.";
      break;
    case "cancelled":
      statusMessage = "Your scheduled service has been cancelled. If you did not request this or have questions, please contact us.";
      break;
    case "invoiced":
      statusMessage = "An invoice has been generated for your recent service. You will receive the invoice details separately.";
      break;
    default:
      statusMessage = `Your job status has been updated to: ${newLabel}.`;
  }

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #1a365d; padding: 20px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 22px;">Absolute Pest Services</h1>
      </div>
      <div style="padding: 30px; background-color: #ffffff; border: 1px solid #e2e8f0;">
        <h2 style="color: #1a365d; margin-top: 0;">Job Status Update</h2>
        <p>Dear ${data.customerName},</p>
        <p>${statusMessage}</p>
        <div style="background-color: #f7fafc; border-left: 4px solid #1a365d; padding: 15px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: #2b6cb0; font-weight: bold;">${newLabel}</span></p>
          <p style="margin: 5px 0;"><strong>Service Date:</strong> ${data.jobDate}</p>
          <p style="margin: 5px 0;"><strong>Location:</strong> ${data.siteLocation}</p>
          <p style="margin: 5px 0;"><strong>Area:</strong> ${data.servicedArea}</p>
          ${data.technicianName ? `<p style="margin: 5px 0;"><strong>Technician:</strong> ${data.technicianName}</p>` : ""}
          ${data.workPerformed && data.newStatus === "completed" ? `<p style="margin: 5px 0;"><strong>Work Performed:</strong> ${data.workPerformed}</p>` : ""}
        </div>
        <p>If you have any questions, please call us at <strong>(484) 643-2225</strong> or reply to this email.</p>
        <p>Thank you for choosing Absolute Pest Services!</p>
        <p style="color: #718096; font-size: 12px; margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 15px;">
          Absolute Pest Services | (484) 643-2225 | rob@absolutepestservices.com
        </p>
      </div>
    </div>
  `;

  const text = `
Job Status Update — Absolute Pest Services

Dear ${data.customerName},

${statusMessage}

Service Details:
- Status: ${newLabel}
- Service Date: ${data.jobDate}
- Location: ${data.siteLocation}
- Area: ${data.servicedArea}
${data.technicianName ? `- Technician: ${data.technicianName}` : ""}
${data.workPerformed && data.newStatus === "completed" ? `- Work Performed: ${data.workPerformed}` : ""}

Questions? Call us at (484) 643-2225.

Thank you for choosing Absolute Pest Services!
  `;

  const customerSent = await sendEmail({
    to: data.customerEmail,
    from: FROM_EMAIL,
    subject,
    html,
    text,
  });

  await sendBusinessNotifications(
    `[Job ${newLabel}] ${data.customerName} — ${data.siteLocation}`,
    html,
    text
  );

  return customerSent;
}