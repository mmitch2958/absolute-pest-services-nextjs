import { MailService } from '@sendgrid/mail';

if (!process.env.SENDGRID_API_KEY) {
  throw new Error("SENDGRID_API_KEY environment variable must be set");
}

const mailService = new MailService();
mailService.setApiKey(process.env.SENDGRID_API_KEY);

const FROM_EMAIL = 'noreply@absolutepestservices.com';
const TO_EMAIL = 'rmitch21@gmail.com';
const ADDITIONAL_EMAIL = 'letshiremikemitchell@gmail.com';

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
      text: params.text,
      html: params.html,
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
    <p>In the meantime, if you have any urgent questions, please call us at <strong>(555) 123-4567</strong>.</p>
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
    
    In the meantime, if you have any urgent questions, please call us at (555) 123-4567.
    
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
    <p>We will contact you within 24 hours to confirm the inspection appointment. If you have any questions or need to make changes, please call us at <strong>(555) 123-4567</strong>.</p>
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
    
    We will contact you within 24 hours to confirm the inspection appointment. If you have any questions or need to make changes, please call us at (555) 123-4567.
    
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
    <p>Our team will review your request and contact you within 24 hours to schedule service. For urgent matters, please call us at <strong>(555) 123-4567</strong>.</p>
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
    
    Our team will review your request and contact you within 24 hours to schedule service. For urgent matters, please call us at (555) 123-4567.
    
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