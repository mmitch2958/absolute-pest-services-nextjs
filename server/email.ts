import { MailService } from '@sendgrid/mail';

if (!process.env.SENDGRID_API_KEY) {
  throw new Error("SENDGRID_API_KEY environment variable must be set");
}

const mailService = new MailService();
mailService.setApiKey(process.env.SENDGRID_API_KEY);

const FROM_EMAIL = 'noreply@absolutepestservices.com';
const TO_EMAIL = 'rob@absolutepestservices.com';
const ADDITIONAL_EMAIL = 'mike@steelcity-ai.com';

// Helper function to send notifications to both business emails
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

  return businessEmailSent && additionalEmailSent;
}

interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  try {
    await mailService.send({
      to: params.to,
      from: params.from,
      subject: params.subject,
      text: params.text || '',
      html: params.html || '',
    });
    return true;
  } catch (error) {
    console.error('SendGrid email error:', error);
    return false;
  }
}

// Contact form email
export async function sendContactFormEmail(data: {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
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
    <p><strong>Service Type:</strong> ${data.serviceType}</p>
    <p><strong>Message:</strong></p>
    <p>${data.message}</p>
  `;
  
  const businessText = `
    New Contact Form Submission
    Name: ${data.firstName} ${data.lastName}
    Phone: ${data.phone}
    Email: ${data.email}
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
  serviceType: string;
  description: string;
  address: string;
  priority: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
}) {
  // Send notification to business
  const businessSubject = `Service Request - ${data.serviceType}`;
  const businessHtml = `
    <h2>New Service Request</h2>
    <p><strong>Customer:</strong> ${data.customerName}</p>
    <p><strong>Email:</strong> ${data.customerEmail}</p>
    ${data.customerPhone ? `<p><strong>Phone:</strong> ${data.customerPhone}</p>` : ''}
    <p><strong>Service Type:</strong> ${data.serviceType}</p>
    <p><strong>Address:</strong> ${data.address}</p>
    <p><strong>Priority:</strong> ${data.priority}</p>
    <p><strong>Description:</strong></p>
    <p>${data.description}</p>
  `;
  
  const businessText = `
    New Service Request
    Customer: ${data.customerName}
    Email: ${data.customerEmail}
    ${data.customerPhone ? `Phone: ${data.customerPhone}` : ''}
    Service Type: ${data.serviceType}
    Address: ${data.address}
    Priority: ${data.priority}
    Description: ${data.description}
  `;

  // Send customer confirmation email
  const customerSubject = `Service Request Confirmation - Absolute Pest Services`;
  const customerHtml = `
    <h2>Service Request Confirmed!</h2>
    <p>Dear ${data.customerName},</p>
    <p>Thank you for submitting a service request. We have received your request for <strong>${data.serviceType}</strong> service.</p>
    <p><strong>Service Details:</strong></p>
    <p><strong>Service Type:</strong> ${data.serviceType}</p>
    <p><strong>Address:</strong> ${data.address}</p>
    <p><strong>Priority:</strong> ${data.priority}</p>
    <p><strong>Description:</strong> ${data.description}</p>
    <p>Our team will review your request and contact you within 24 hours to schedule service. For urgent matters, please call us at <strong>(484)643-2225</strong>.</p>
    <p>You can track the status of your request by logging into your customer portal on our website.</p>
    <p>Thank you for choosing Absolute Pest Services!</p>
    <p>Best regards,<br>The Absolute Pest Services Team</p>
  `;

  const customerText = `
    Service Request Confirmed!
    
    Dear ${data.customerName},
    
    Thank you for submitting a service request. We have received your request for ${data.serviceType} service.
    
    Service Details:
    Service Type: ${data.serviceType}
    Address: ${data.address}
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