var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/email.ts
var email_exports = {};
__export(email_exports, {
  sendAppointmentReminderEmail: () => sendAppointmentReminderEmail,
  sendContactFormEmail: () => sendContactFormEmail,
  sendEmail: () => sendEmail,
  sendInspectionScheduleEmail: () => sendInspectionScheduleEmail,
  sendInvoiceEmail: () => sendInvoiceEmail,
  sendInvoiceOverdueEmail: () => sendInvoiceOverdueEmail,
  sendJobLogNotification: () => sendJobLogNotification,
  sendJobStatusNotification: () => sendJobStatusNotification,
  sendNewsletterEmail: () => sendNewsletterEmail,
  sendPaymentConfirmationEmail: () => sendPaymentConfirmationEmail,
  sendReviewRequestEmail: () => sendReviewRequestEmail,
  sendServiceRequestEmail: () => sendServiceRequestEmail,
  sendServiceRequestStatusUpdate: () => sendServiceRequestStatusUpdate
});
import { MailService } from "@sendgrid/mail";
async function sendBusinessNotifications(subject, html, text2) {
  const businessEmailSent = await sendEmail({
    to: TO_EMAIL,
    from: FROM_EMAIL,
    subject,
    html,
    text: text2
  });
  const additionalEmailSent = await sendEmail({
    to: ADDITIONAL_EMAIL,
    from: FROM_EMAIL,
    subject,
    html,
    text: text2
  });
  const thirdEmailSent = await sendEmail({
    to: THIRD_EMAIL,
    from: FROM_EMAIL,
    subject,
    html,
    text: text2
  });
  return businessEmailSent && additionalEmailSent && thirdEmailSent;
}
async function sendEmail(params) {
  try {
    console.log(`[Email] Sending to ${params.to} | Subject: ${params.subject}`);
    const msg = {
      to: params.to,
      from: params.from,
      subject: params.subject,
      text: params.text || "",
      html: params.html || ""
    };
    if (params.attachments && params.attachments.length > 0) {
      msg.attachments = params.attachments;
    }
    await mailService.send(msg);
    console.log(`[Email] Successfully sent to ${params.to}`);
    return true;
  } catch (error) {
    console.error(`[Email] Failed to send to ${params.to}:`, error?.response?.body || error?.message || error);
    return false;
  }
}
async function sendContactFormEmail(data) {
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
async function sendInspectionScheduleEmail(data) {
  const formattedDate = data.preferredDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });
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
    ${data.message ? `<p><strong>Additional Message:</strong></p><p>${data.message}</p>` : ""}
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
    ${data.message ? `Additional Message: ${data.message}` : ""}
  `;
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
    ${data.message ? `<p><strong>Additional Notes:</strong> ${data.message}</p>` : ""}
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
    ${data.message ? `Additional Notes: ${data.message}` : ""}
    
    We will contact you within 24 hours to confirm the inspection appointment. If you have any questions or need to make changes, please call us at (484)643-2225.
    
    Thank you for choosing Absolute Pest Services!
    
    Best regards,
    The Absolute Pest Services Team
  `;
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
async function sendServiceRequestEmail(data) {
  const customerName = `${data.firstName} ${data.lastName}`;
  const businessSubject = `Service Request - ${data.serviceType}`;
  const businessHtml = `
    <h2>New Service Request</h2>
    <p><strong>Customer:</strong> ${customerName}</p>
    <p><strong>Email:</strong> ${data.customerEmail}</p>
    ${data.customerPhone ? `<p><strong>Phone:</strong> ${data.customerPhone}</p>` : ""}
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
    ${data.customerPhone ? `Phone: ${data.customerPhone}` : ""}
    Service Type: ${data.serviceType}
    Address: ${data.address}
    City: ${data.city}
    Priority: ${data.priority}
    Description: ${data.description}
  `;
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
async function sendServiceRequestStatusUpdate(data) {
  const statusMessages = {
    scheduled: {
      title: "Service Scheduled",
      message: `Your ${data.serviceType} service has been scheduled${data.scheduledDate ? ` for ${data.scheduledDate.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}` : ""}.`
    },
    "in-progress": {
      title: "Service In Progress",
      message: `Our technician is currently working on your ${data.serviceType} service at ${data.address}.`
    },
    completed: {
      title: "Service Completed",
      message: `Your ${data.serviceType} service has been completed successfully! We hope you're satisfied with our work.`
    },
    cancelled: {
      title: "Service Cancelled",
      message: `Your ${data.serviceType} service request has been cancelled.`
    }
  };
  const statusInfo = statusMessages[data.newStatus] || {
    title: "Service Status Update",
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
    ${data.technicianNotes ? `<p><strong>Technician Notes:</strong></p><p>${data.technicianNotes}</p>` : ""}
    ${data.newStatus === "completed" ? `
      <p>We'd love to hear about your experience! Please consider leaving us a review on <a href="https://g.page/r/CXh2r5bK1ZCXEBM/review">Google</a>.</p>
      <p>If you have any questions or concerns about the service, please don't hesitate to contact us at <strong>(484)643-2225</strong>.</p>
    ` : `<p>You can track your request status by logging into your customer portal on our website.</p>`}
    <p>Thank you for choosing Absolute Pest Services!</p>
    <p>Best regards,<br>The Absolute Pest Services Team</p>
  `;
  const text2 = `
    ${statusInfo.title}
    
    Dear ${data.customerName},
    
    ${statusInfo.message}
    
    Service Details:
    Service Type: ${data.serviceType}
    Address: ${data.address}
    Previous Status: ${data.oldStatus}
    Current Status: ${data.newStatus}
    ${data.technicianNotes ? `Technician Notes: ${data.technicianNotes}` : ""}
    
    ${data.newStatus === "completed" ? `We'd love to hear about your experience! Please consider leaving us a review on Google at: https://g.page/r/CXh2r5bK1ZCXEBM/review
    
If you have any questions or concerns about the service, please don't hesitate to contact us at (484)643-2225.` : "You can track your request status by logging into your customer portal on our website."}
    
    Thank you for choosing Absolute Pest Services!
    
    Best regards,
    The Absolute Pest Services Team
  `;
  return await sendEmail({
    to: data.customerEmail,
    from: FROM_EMAIL,
    subject,
    html,
    text: text2
  });
}
async function sendJobLogNotification(data) {
  const formattedDate = new Date(data.jobDate).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
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
  const text2 = `
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
    text: text2
  });
  const mikeSent = await sendEmail({
    to: ADDITIONAL_EMAIL,
    from: FROM_EMAIL,
    subject,
    html,
    text: text2
  });
  const rmitchSent = await sendEmail({
    to: THIRD_EMAIL,
    from: FROM_EMAIL,
    subject,
    html,
    text: text2
  });
  return robSent && mikeSent && rmitchSent;
}
async function sendNewsletterEmail(data) {
  const baseUrl = process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : "http://localhost:5000";
  const postsHtml = data.posts.map((post) => `
    <div style="margin-bottom: 30px; border-bottom: 1px solid #e5e7eb; padding-bottom: 20px;">
      ${post.featuredImage ? `
        <img src="${post.featuredImage}" alt="${post.title}" style="width: 100%; max-width: 600px; height: auto; border-radius: 8px; margin-bottom: 15px;" />
      ` : ""}
      <h3 style="color: #1f2937; margin: 0 0 10px 0; font-size: 20px;">
        <a href="${baseUrl}/blog/${post.slug}" style="color: #1f2937; text-decoration: none;">${post.title}</a>
      </h3>
      <p style="color: #6b7280; margin: 0 0 10px 0; font-size: 14px;">
        <span style="background-color: #f3f4f6; padding: 4px 12px; border-radius: 4px;">${post.category}</span>
      </p>
      <p style="color: #4b5563; margin: 0 0 15px 0; line-height: 1.6;">${post.excerpt}</p>
      <a href="${baseUrl}/blog/${post.slug}" style="display: inline-block; background-color: #eab308; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: 500;">Read More</a>
    </div>
  `).join("");
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
  const postsText = data.posts.map((post) => `
${post.title}
Category: ${post.category}
${post.excerpt}
Read more: ${baseUrl}/blog/${post.slug}
---
  `).join("\n");
  const text2 = `
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
    text: text2
  });
}
async function sendInvoiceEmail(data) {
  const resolvedBase = data.baseUrl || process.env.APP_BASE_URL || (process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : "http://localhost:5000");
  const viewUrl = `${resolvedBase}/invoice/${data.viewToken}`;
  const formattedInvoiceDate = data.invoiceDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
  const formattedDueDate = data.dueDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
  const subject = `Invoice #${data.invoiceNumber} from Absolute Pest Services`;
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
          ` : ""}

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
  const text2 = `
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
  const attachments = [];
  if (data.pdfBuffer) {
    attachments.push({
      content: data.pdfBuffer.toString("base64"),
      filename: `Invoice-${data.invoiceNumber}.pdf`,
      type: "application/pdf",
      disposition: "attachment"
    });
  }
  const customerSent = await sendEmail({
    to: data.clientEmail,
    from: FROM_EMAIL,
    subject,
    html,
    text: text2,
    attachments: attachments.length > 0 ? attachments : void 0
  });
  const businessSent = await sendEmail({
    to: TO_EMAIL,
    from: FROM_EMAIL,
    subject: `[INVOICE SENT] ${subject}`,
    html: `<p>Invoice #${data.invoiceNumber} sent to ${data.clientEmail} (${data.clientName})</p>`,
    text: `Invoice #${data.invoiceNumber} sent to ${data.clientEmail} (${data.clientName})`
  });
  return customerSent && businessSent;
}
async function sendInvoiceOverdueEmail(data) {
  const resolvedBase = data.baseUrl || process.env.APP_BASE_URL || (process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : "http://localhost:5000");
  const viewUrl = `${resolvedBase}/invoice/${data.viewToken}`;
  const formattedDueDate = data.dueDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
  const subject = `OVERDUE: Invoice #${data.invoiceNumber} \u2014 Action Required`;
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
  const text2 = `
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
    text: text2
  });
}
async function sendPaymentConfirmationEmail(data) {
  const formattedPaidAt = data.paidAt.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
  const subject = `Payment Received \u2014 Invoice #${data.invoiceNumber}`;
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
  const text2 = `
Payment Received \u2014 Invoice #${data.invoiceNumber}

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
    text: text2
  });
}
async function sendAppointmentReminderEmail(data) {
  const baseUrl = process.env.BASE_URL || "https://absolutepestservices.com";
  const formattedDate = data.appointmentDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "America/New_York"
  });
  const timeDisplay = data.appointmentTime || "TBD";
  const reminderGreeting = data.reminderType === "24h" ? "This is a reminder that your appointment is tomorrow" : "This is a reminder that your appointment is today";
  const unsubscribeLink = data.unsubscribeToken ? `${baseUrl}/api/reminders/unsubscribe?token=${data.unsubscribeToken}` : null;
  const subject = data.reminderType === "24h" ? `Appointment Reminder \u2014 ${data.serviceType} Tomorrow` : `Today's Appointment \u2014 ${data.serviceType}`;
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
          ` : ""}
        </div>
      </div>
    </div>
  </body>
</html>
  `;
  const text2 = `
Appointment Reminder \u2014 Absolute Pest Services

Dear ${data.customerName},

${reminderGreeting}. Please find your appointment details below:

Service Type: ${data.serviceType}
Date: ${formattedDate}
Time: ${timeDisplay}
Address: ${data.address}, ${data.city}

Need to reschedule? Please call us at (484) 643-2225 and we'll be happy to help you find a more convenient time.

If you have any questions, please don't hesitate to contact us.

Absolute Pest Services
${unsubscribeLink ? `

To unsubscribe from appointment reminders, visit: ${unsubscribeLink}` : ""}
  `;
  return await sendEmail({
    to: data.recipientEmail,
    from: FROM_EMAIL,
    subject,
    html,
    text: text2
  });
}
async function sendReviewRequestEmail(data) {
  const formattedDate = data.jobDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });
  const subject = "How did we do? Leave us a quick Google review";
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
          ` : ""}

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
  const text2 = `
How did we do? - Absolute Pest Services

Dear ${data.customerName},

Thank you for choosing Absolute Pest Services! We recently completed a service at your property and we'd love to hear about your experience.

Service Details:
- Date: ${formattedDate}
- Location: ${data.siteLocation}
- Service: ${data.serviceDescription}

${data.customMessage ? `
"${data.customMessage}"
` : ""}
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
    text: text2
  });
}
async function sendJobStatusNotification(data) {
  const statusLabels = {
    scheduled: "Scheduled",
    in_progress: "In Progress",
    completed: "Completed",
    cancelled: "Cancelled",
    invoiced: "Invoiced",
    paid: "Paid"
  };
  const newLabel = statusLabels[data.newStatus] || data.newStatus;
  const subject = `Job Update: ${newLabel} \u2014 Absolute Pest Services`;
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
  const text2 = `
Job Status Update \u2014 Absolute Pest Services

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
    text: text2
  });
  await sendBusinessNotifications(
    `[Job ${newLabel}] ${data.customerName} \u2014 ${data.siteLocation}`,
    html,
    text2
  );
  return customerSent;
}
var mailService, FROM_EMAIL, TO_EMAIL, ADDITIONAL_EMAIL, THIRD_EMAIL;
var init_email = __esm({
  "server/email.ts"() {
    "use strict";
    if (!process.env.SENDGRID_API_KEY) {
      throw new Error("SENDGRID_API_KEY environment variable must be set");
    }
    mailService = new MailService();
    mailService.setApiKey(process.env.SENDGRID_API_KEY);
    FROM_EMAIL = "rob@absolutepestservices.com";
    TO_EMAIL = "rob@absolutepestservices.com";
    ADDITIONAL_EMAIL = "mike@steelcity-ai.com";
    THIRD_EMAIL = "rmitch21@gmail.com";
  }
});

// server/sms.ts
var sms_exports = {};
__export(sms_exports, {
  isSMSConfigured: () => isSMSConfigured,
  sendAppointmentReminderSMS: () => sendAppointmentReminderSMS
});
import twilio from "twilio";
function getTwilioClient() {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
    console.warn("[SMS] Twilio credentials not configured. SMS reminders will be disabled.");
    return null;
  }
  if (!twilioClient) {
    twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
  }
  return twilioClient;
}
async function sendAppointmentReminderSMS(data) {
  const client = getTwilioClient();
  if (!client) {
    console.log(`[SMS] Skipping SMS - Twilio not configured`);
    return false;
  }
  if (!TWILIO_FROM_NUMBER) {
    console.error("[SMS] TWILIO_FROM_NUMBER not configured");
    return false;
  }
  const formattedDate = data.appointmentDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "America/New_York"
  });
  const timeDisplay = data.appointmentTime || "TBD";
  const reminderText = data.reminderType === "24h" ? "reminder: your appointment is tomorrow" : "reminder: your appointment is today";
  const message = `Absolute Pest Services ${reminderText}: ${data.serviceType} on ${formattedDate} at ${timeDisplay}. Address: ${data.address}. To reschedule, call (484) 643-2225. Reply STOP to unsubscribe.`;
  try {
    console.log(`[SMS] Sending to ${data.toPhone} | Type: ${data.reminderType}`);
    await client.messages.create({
      body: message,
      from: TWILIO_FROM_NUMBER,
      to: data.toPhone
    });
    console.log(`[SMS] Successfully sent to ${data.toPhone}`);
    return true;
  } catch (error) {
    console.error(`[SMS] Failed to send to ${data.toPhone}:`, error?.message || error);
    return false;
  }
}
function isSMSConfigured() {
  return !!(TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_FROM_NUMBER);
}
var TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER, twilioClient;
var init_sms = __esm({
  "server/sms.ts"() {
    "use strict";
    TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
    TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
    TWILIO_FROM_NUMBER = process.env.TWILIO_FROM_NUMBER;
    twilioClient = null;
  }
});

// server/index.ts
import express2 from "express";
import path4 from "path";

// server/routes.ts
import { createServer } from "http";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  DEFAULT_REMINDER_SETTINGS: () => DEFAULT_REMINDER_SETTINGS,
  DEFAULT_REVIEW_SETTINGS: () => DEFAULT_REVIEW_SETTINGS,
  blogPosts: () => blogPosts,
  clients: () => clients,
  contactSubmissions: () => contactSubmissions,
  customerMessages: () => customerMessages,
  dailyRoutes: () => dailyRoutes,
  dashboards: () => dashboards,
  fieldCustomers: () => fieldCustomers,
  fieldEmployees: () => fieldEmployees,
  fieldMaterials: () => fieldMaterials,
  geocache: () => geocache,
  insertBlogPostSchema: () => insertBlogPostSchema,
  insertClientSchema: () => insertClientSchema,
  insertContactSchema: () => insertContactSchema,
  insertCustomerMessageSchema: () => insertCustomerMessageSchema,
  insertDailyRouteSchema: () => insertDailyRouteSchema,
  insertDashboardSchema: () => insertDashboardSchema,
  insertFieldCustomerSchema: () => insertFieldCustomerSchema,
  insertFieldEmployeeSchema: () => insertFieldEmployeeSchema,
  insertFieldMaterialSchema: () => insertFieldMaterialSchema,
  insertGeocacheSchema: () => insertGeocacheSchema,
  insertInspectionSchema: () => insertInspectionSchema,
  insertInvoiceLineItemSchema: () => insertInvoiceLineItemSchema,
  insertInvoiceSchema: () => insertInvoiceSchema,
  insertInvoiceStatusLogSchema: () => insertInvoiceStatusLogSchema,
  insertJobLogCustomFieldSchema: () => insertJobLogCustomFieldSchema,
  insertJobLogPhotoSchema: () => insertJobLogPhotoSchema,
  insertJobLogSchema: () => insertJobLogSchema,
  insertJobScheduleLogSchema: () => insertJobScheduleLogSchema,
  insertMilestoneSchema: () => insertMilestoneSchema,
  insertPaymentSchema: () => insertPaymentSchema,
  insertProjectSchema: () => insertProjectSchema,
  insertReminderLogSchema: () => insertReminderLogSchema,
  insertReminderOptOutSchema: () => insertReminderOptOutSchema,
  insertReviewRequestLogSchema: () => insertReviewRequestLogSchema,
  insertReviewSettingsSchema: () => insertReviewSettingsSchema,
  insertServiceContractSchema: () => insertServiceContractSchema,
  insertServiceRateSchema: () => insertServiceRateSchema,
  insertServiceRequestSchema: () => insertServiceRequestSchema,
  insertServicedAreaSchema: () => insertServicedAreaSchema,
  insertShiftBreakSchema: () => insertShiftBreakSchema,
  insertShiftSchema: () => insertShiftSchema,
  insertShiftTimeBlockSchema: () => insertShiftTimeBlockSchema,
  insertSiteLocationSchema: () => insertSiteLocationSchema,
  insertSystemSettingSchema: () => insertSystemSettingSchema,
  insertTimeEntryAuditLogSchema: () => insertTimeEntryAuditLogSchema,
  insertUserSchema: () => insertUserSchema,
  inspectionSchedules: () => inspectionSchedules,
  invoiceLineItems: () => invoiceLineItems,
  invoiceStatusLogs: () => invoiceStatusLogs,
  invoices: () => invoices,
  jobLogCustomFields: () => jobLogCustomFields,
  jobLogPhotos: () => jobLogPhotos,
  jobLogs: () => jobLogs,
  jobScheduleLogs: () => jobScheduleLogs,
  linkClientToUserSchema: () => linkClientToUserSchema,
  loginSchema: () => loginSchema,
  milestones: () => milestones,
  payments: () => payments,
  projects: () => projects,
  registerSchema: () => registerSchema,
  reminderLogs: () => reminderLogs,
  reminderLogsUniqueConstraint: () => reminderLogsUniqueConstraint,
  reminderOptOuts: () => reminderOptOuts,
  reviewRequestLogs: () => reviewRequestLogs,
  reviewSettings: () => reviewSettings,
  serviceContracts: () => serviceContracts,
  serviceRates: () => serviceRates,
  serviceRequests: () => serviceRequests,
  servicedAreas: () => servicedAreas,
  shiftBreaks: () => shiftBreaks,
  shiftTimeBlocks: () => shiftTimeBlocks,
  shifts: () => shifts,
  siteLocations: () => siteLocations,
  systemSettings: () => systemSettings,
  timeEntryAuditLog: () => timeEntryAuditLog,
  users: () => users
});
import { pgTable, text, serial, integer, boolean, timestamp, decimal, varchar, jsonb, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  phone: text("phone"),
  address: text("address"),
  role: text("role").notNull().default("user"),
  // user, admin
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var contactSubmissions = pgTable("contact_submissions", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  city: text("city").notNull(),
  serviceType: text("service_type").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var inspectionSchedules = pgTable("inspection_schedules", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  clientId: integer("client_id").references(() => clients.id),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  serviceType: text("service_type").notNull(),
  preferredDate: timestamp("preferred_date").notNull(),
  preferredTime: text("preferred_time").notNull(),
  urgency: text("urgency").notNull(),
  message: text("message"),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var serviceRequests = pgTable("service_requests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  clientId: integer("client_id").references(() => clients.id),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  serviceType: text("service_type").notNull(),
  description: text("description").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  priority: text("priority").notNull().default("medium"),
  status: text("status").notNull().default("pending"),
  scheduledDate: timestamp("scheduled_date"),
  completedDate: timestamp("completed_date"),
  estimatedCost: decimal("estimated_cost", { precision: 10, scale: 2 }),
  finalCost: decimal("final_cost", { precision: 10, scale: 2 }),
  technicianNotes: text("technician_notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  serviceRequestId: integer("service_request_id").references(() => serviceRequests.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"),
  paymentMethod: text("payment_method"),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  // userId links a registered portal user (users.id) to this client record.
  // Nullable — not all clients have portal accounts (cash/walk-in customers).
  // Set by admin via PATCH /api/admin/users/:id/client-link.
  userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  contactPerson: text("contact_person"),
  propertyType: text("property_type").default("residential"),
  // residential, commercial
  clientType: text("client_type").notNull().default("prospect"),
  // prospect, client
  status: text("status").notNull().default("active"),
  // active, inactive
  notes: text("notes"),
  reviewOptOut: boolean("review_opt_out").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").notNull().references(() => clients.id),
  name: text("name").notNull(),
  description: text("description"),
  status: text("status").notNull().default("planning"),
  // planning, active, completed, cancelled
  budget: decimal("budget", { precision: 10, scale: 2 }),
  actualCost: decimal("actual_cost", { precision: 10, scale: 2 }),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  completedDate: timestamp("completed_date"),
  priority: text("priority").notNull().default("medium"),
  // low, medium, high, urgent
  assignedTo: integer("assigned_to").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var milestones = pgTable("milestones", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").notNull().default("pending"),
  // pending, in_progress, completed, cancelled
  dueDate: timestamp("due_date"),
  completedDate: timestamp("completed_date"),
  progress: integer("progress").default(0),
  // 0-100 percentage
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var dashboards = pgTable("dashboards", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id),
  title: text("title").notNull(),
  type: text("type").notNull().default("project"),
  // project, client, overview
  config: text("config"),
  // JSON config for dashboard layout and widgets
  isPublic: boolean("is_public").default(false).notNull(),
  createdBy: integer("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var blogPosts = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(),
  author: text("author").notNull(),
  featuredImage: text("featured_image"),
  category: text("category").notNull(),
  tags: text("tags").array(),
  isPublished: boolean("is_published").default(false).notNull(),
  publishedAt: timestamp("published_at"),
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var insertUserSchema = createInsertSchema(users).pick({
  email: true,
  password: true,
  firstName: true,
  lastName: true,
  phone: true,
  address: true,
  role: true
});
var insertContactSchema = createInsertSchema(contactSubmissions).omit({
  id: true,
  createdAt: true
});
var insertInspectionSchema = createInsertSchema(inspectionSchedules).omit({
  id: true,
  createdAt: true,
  status: true
});
var insertServiceRequestSchema = createInsertSchema(serviceRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  status: true
});
var insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
  paidAt: true
});
var insertClientSchema = createInsertSchema(clients).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var linkClientToUserSchema = z.object({
  userId: z.number().int().positive().nullable()
});
var insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  budget: true,
  actualCost: true,
  startDate: true,
  endDate: true,
  completedDate: true
}).extend({
  budget: z.union([z.string(), z.number()]).transform((val) => String(val)).optional().nullable(),
  actualCost: z.union([z.string(), z.number()]).transform((val) => String(val)).optional().nullable(),
  startDate: z.union([z.date(), z.string()]).transform((val) => typeof val === "string" ? new Date(val) : val).optional().nullable(),
  endDate: z.union([z.date(), z.string()]).transform((val) => typeof val === "string" ? new Date(val) : val).optional().nullable(),
  completedDate: z.union([z.date(), z.string()]).transform((val) => typeof val === "string" ? new Date(val) : val).optional().nullable()
});
var insertMilestoneSchema = createInsertSchema(milestones).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  dueDate: true,
  completedDate: true
}).extend({
  dueDate: z.union([z.date(), z.string()]).transform((val) => typeof val === "string" ? new Date(val) : val).optional().nullable(),
  completedDate: z.union([z.date(), z.string()]).transform((val) => typeof val === "string" ? new Date(val) : val).optional().nullable()
});
var insertDashboardSchema = createInsertSchema(dashboards).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertBlogPostSchema = createInsertSchema(blogPosts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  publishedAt: true
});
var fieldEmployees = pgTable("field_employees", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  pin: text("pin").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  canManageEmployees: boolean("can_manage_employees").default(false).notNull(),
  hourlyRate: decimal("hourly_rate", { precision: 10, scale: 2 }),
  externalPayrollId: text("external_payroll_id"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var fieldMaterials = pgTable("field_materials", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  // "product" or "supply"
  isActive: boolean("is_active").default(true).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var serviceRates = pgTable("service_rates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  defaultRate: decimal("default_rate", { precision: 10, scale: 2 }).notNull().default("200.00"),
  isActive: boolean("is_active").default(true).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var jobLogs = pgTable("job_logs", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").references(() => fieldEmployees.id),
  customerName: text("customer_name").notNull(),
  clientId: integer("client_id").references(() => clients.id),
  siteLocation: text("site_location").notNull(),
  siteAddress: text("site_address"),
  servicedArea: text("serviced_area").notNull(),
  workPerformed: text("work_performed").notNull(),
  jobDate: timestamp("job_date").notNull(),
  status: text("status").notNull().default("completed"),
  serviceRateId: integer("service_rate_id").references(() => serviceRates.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).default("200.00"),
  customFields: jsonb("custom_fields"),
  materials: jsonb("materials"),
  // Admin scheduling fields (SC-SCHEDULING-001)
  priority: text("priority").default("medium"),
  // low, medium, high, urgent
  adminNotes: text("admin_notes"),
  // Administrative notes for the job
  scheduledBy: integer("scheduled_by").references(() => users.id),
  // Admin user who scheduled
  scheduledEndTime: timestamp("scheduled_end_time"),
  // Expected end time
  cancelledAt: timestamp("cancelled_at"),
  // When job was cancelled
  cancelledBy: integer("cancelled_by").references(() => users.id),
  // Admin who cancelled
  // Offline sync fields
  localId: text("local_id"),
  // Client-generated UUID for duplicate detection
  clientCreatedAt: timestamp("client_created_at"),
  // Timestamp from client device
  serverReceivedAt: timestamp("server_received_at"),
  // Server clock when received
  needsAdminReview: boolean("needs_admin_review").default(false),
  // Clock skew > 48h
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var jobScheduleLogs = pgTable("job_schedule_logs", {
  id: serial("id").primaryKey(),
  jobLogId: integer("job_log_id").notNull().references(() => jobLogs.id, { onDelete: "cascade" }),
  action: text("action").notNull(),
  // created, assigned, rescheduled, started, completed, cancelled, claimed
  performedBy: integer("performed_by"),
  // Admin user ID or field employee ID (no FK - can be either)
  previousValue: jsonb("previous_value"),
  // JSON of previous values
  newValue: jsonb("new_value"),
  // JSON of new values
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var jobLogCustomFields = pgTable("job_log_custom_fields", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  label: text("label").notNull(),
  fieldType: text("field_type").notNull().default("text"),
  required: boolean("required").default(false).notNull(),
  options: text("options"),
  displayOrder: integer("display_order").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var fieldCustomers = pgTable("field_customers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address"),
  phone: text("phone"),
  email: text("email"),
  propertyType: text("property_type").default("residential"),
  // residential, commercial
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var siteLocations = pgTable("site_locations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  customerId: integer("customer_id").references(() => clients.id),
  customerName: text("customer_name"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var jobLogPhotos = pgTable("job_log_photos", {
  id: serial("id").primaryKey(),
  jobLogId: integer("job_log_id").notNull().references(() => jobLogs.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  caption: text("caption"),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull()
});
var servicedAreas = pgTable("serviced_areas", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  siteLocationId: integer("site_location_id").references(() => siteLocations.id),
  siteLocationName: text("site_location_name"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var serviceContracts = pgTable("service_contracts", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull().references(() => clients.id),
  frequency: text("frequency").notNull().default("monthly"),
  // weekly, monthly, quarterly
  nextScheduledDate: timestamp("next_scheduled_date").notNull(),
  siteLocation: text("site_location").notNull(),
  servicedArea: text("serviced_area").notNull(),
  defaultWorkTemplate: text("default_work_template"),
  lastGeneratedJobDate: timestamp("last_generated_job_date"),
  notes: text("notes"),
  assignedEmployeeId: integer("assigned_employee_id").references(() => fieldEmployees.id),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var customerMessages = pgTable("customer_messages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  direction: text("direction").notNull(),
  // 'customer_to_admin' | 'admin_to_customer'
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  readAt: timestamp("read_at"),
  sentByAdminId: integer("sent_by_admin_id").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var insertCustomerMessageSchema = createInsertSchema(customerMessages).omit({
  id: true,
  createdAt: true,
  readAt: true,
  isRead: true
});
var insertFieldMaterialSchema = createInsertSchema(fieldMaterials).omit({
  id: true,
  createdAt: true
});
var insertServiceRateSchema = createInsertSchema(serviceRates).omit({
  id: true,
  createdAt: true
}).extend({
  defaultRate: z.union([z.string(), z.number()]).transform((val) => String(val))
});
var insertFieldEmployeeSchema = createInsertSchema(fieldEmployees).omit({
  id: true,
  createdAt: true
}).extend({
  hourlyRate: z.union([z.string(), z.number()]).transform((val) => val === void 0 ? void 0 : String(val)).optional()
});
var insertJobLogSchema = createInsertSchema(jobLogs).omit({
  id: true,
  createdAt: true,
  scheduledBy: true,
  cancelledAt: true,
  cancelledBy: true
}).extend({
  scheduledBy: z.number().int().positive().optional().nullable(),
  cancelledBy: z.number().int().positive().optional().nullable(),
  jobDate: z.union([z.date(), z.string()]).transform((val) => typeof val === "string" ? new Date(val) : val),
  scheduledEndTime: z.union([z.date(), z.string(), z.null()]).transform((val) => val === null ? null : typeof val === "string" ? new Date(val) : val).optional().nullable(),
  serviceRateId: z.number().int().positive().optional().nullable(),
  amount: z.union([z.string(), z.number()]).transform((val) => String(val)).optional()
});
var insertJobScheduleLogSchema = createInsertSchema(jobScheduleLogs).omit({
  id: true,
  createdAt: true
});
var insertFieldCustomerSchema = createInsertSchema(fieldCustomers).omit({
  id: true,
  createdAt: true
});
var insertJobLogCustomFieldSchema = createInsertSchema(jobLogCustomFields).omit({
  id: true,
  createdAt: true
});
var insertSiteLocationSchema = createInsertSchema(siteLocations).omit({
  id: true,
  createdAt: true
});
var insertServicedAreaSchema = createInsertSchema(servicedAreas).omit({
  id: true,
  createdAt: true
});
var insertServiceContractSchema = createInsertSchema(serviceContracts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  isActive: true,
  lastGeneratedJobDate: true,
  assignedEmployeeId: true,
  startDate: true,
  endDate: true
}).extend({
  nextScheduledDate: z.union([z.date(), z.string()]).transform((val) => typeof val === "string" ? new Date(val) : val).optional().nullable(),
  lastGeneratedJobDate: z.union([z.date(), z.string()]).transform((val) => typeof val === "string" ? new Date(val) : val).optional().nullable(),
  assignedEmployeeId: z.number().int().optional().nullable(),
  startDate: z.union([z.date(), z.string()]).transform((val) => typeof val === "string" ? new Date(val) : val).optional().nullable(),
  endDate: z.union([z.date(), z.string()]).transform((val) => typeof val === "string" ? new Date(val) : val).optional().nullable()
});
var insertJobLogPhotoSchema = createInsertSchema(jobLogPhotos).omit({
  id: true,
  uploadedAt: true
}).extend({
  url: z.string().url(),
  caption: z.string().max(200).optional().nullable()
});
var loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});
var registerSchema = insertUserSchema.extend({
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});
var invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  invoiceNumber: varchar("invoice_number", { length: 20 }).notNull().unique(),
  clientId: integer("client_id").notNull().references(() => clients.id),
  jobLogId: integer("job_log_id").references(() => jobLogs.id),
  status: text("status").notNull().default("draft"),
  // draft, sent, viewed, paid, overdue, void
  issueDate: timestamp("issue_date").notNull().defaultNow(),
  dueDate: timestamp("due_date").notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  taxTotal: decimal("tax_total", { precision: 10, scale: 2 }).notNull().default("0"),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  notes: text("notes"),
  pdfUrl: text("pdf_url"),
  viewToken: varchar("view_token", { length: 36 }).unique(),
  sentAt: timestamp("sent_at"),
  viewedAt: timestamp("viewed_at"),
  paidAt: timestamp("paid_at"),
  paymentMethod: text("payment_method"),
  // cash, check, card, stripe, other
  paymentAmount: decimal("payment_amount", { precision: 10, scale: 2 }),
  paymentNote: text("payment_note"),
  voidReason: text("void_reason"),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var invoiceLineItems = pgTable("invoice_line_items", {
  id: serial("id").primaryKey(),
  invoiceId: integer("invoice_id").notNull().references(() => invoices.id, { onDelete: "cascade" }),
  description: text("description").notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 3 }).notNull().default("1"),
  unitRate: decimal("unit_rate", { precision: 10, scale: 2 }).notNull(),
  taxRate: decimal("tax_rate", { precision: 5, scale: 2 }).notNull().default("0"),
  lineTotal: decimal("line_total", { precision: 10, scale: 2 }).notNull(),
  lineTax: decimal("line_tax", { precision: 10, scale: 2 }).notNull().default("0"),
  materials: jsonb("materials"),
  sortOrder: integer("sort_order").notNull().default(0),
  serviceDate: text("service_date"),
  technicianName: text("technician_name"),
  serviceType: text("service_type"),
  serviceAddress: text("service_address"),
  servicedArea: text("serviced_area"),
  jobLogId: integer("job_log_id").references(() => jobLogs.id),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var invoiceStatusLogs = pgTable("invoice_status_logs", {
  id: serial("id").primaryKey(),
  invoiceId: integer("invoice_id").notNull().references(() => invoices.id, { onDelete: "cascade" }),
  fromStatus: text("from_status"),
  toStatus: text("to_status").notNull(),
  actor: text("actor").notNull(),
  // admin:{userId}, system, customer
  note: text("note"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var insertInvoiceSchema = createInsertSchema(invoices).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  invoiceNumber: true,
  viewToken: true,
  sentAt: true,
  viewedAt: true,
  paidAt: true
}).extend({
  dueDate: z.union([z.date(), z.string()]).transform((val) => typeof val === "string" ? new Date(val) : val),
  issueDate: z.union([z.date(), z.string()]).transform((val) => typeof val === "string" ? new Date(val) : val).optional(),
  subtotal: z.union([z.string(), z.number()]).transform((val) => String(val)),
  taxTotal: z.union([z.string(), z.number()]).transform((val) => String(val)).optional(),
  total: z.union([z.string(), z.number()]).transform((val) => String(val)),
  clientId: z.number().int().positive(),
  jobLogId: z.number().int().positive().optional().nullable()
});
var insertInvoiceLineItemSchema = createInsertSchema(invoiceLineItems).omit({
  id: true,
  createdAt: true,
  lineTotal: true,
  lineTax: true
}).extend({
  quantity: z.union([z.string(), z.number()]).transform((val) => String(val)).optional(),
  unitRate: z.union([z.string(), z.number()]).transform((val) => String(val)),
  taxRate: z.union([z.string(), z.number()]).transform((val) => String(val)).optional()
});
var insertInvoiceStatusLogSchema = createInsertSchema(invoiceStatusLogs).omit({
  id: true,
  createdAt: true
});
var reminderLogs = pgTable("reminder_logs", {
  id: serial("id").primaryKey(),
  appointmentType: text("appointment_type").notNull(),
  // 'inspection', 'service_request', 'job_log'
  appointmentId: integer("appointment_id").notNull(),
  reminderType: text("reminder_type").notNull(),
  // '24h', 'same_day'
  channel: text("channel").notNull(),
  // 'email', 'sms'
  recipientEmail: text("recipient_email"),
  recipientPhone: text("recipient_phone"),
  sentAt: timestamp("sent_at").defaultNow().notNull(),
  success: boolean("success").notNull().default(true),
  errorMessage: text("error_message")
});
var reminderLogsUniqueConstraint = (table) => {
  return [table.appointmentType, table.appointmentId, table.reminderType, table.channel];
};
var reminderOptOuts = pgTable("reminder_opt_outs", {
  id: serial("id").primaryKey(),
  email: text("email"),
  // indexed; null if SMS-only opt-out
  phone: text("phone"),
  // indexed; null if email-only opt-out
  token: text("token").notNull().unique(),
  // UUID v4 used in unsubscribe URL
  optedOutAt: timestamp("opted_out_at").defaultNow().notNull(),
  optOutType: text("opt_out_type").notNull()
  // 'email', 'sms', 'all'
});
var systemSettings = pgTable("system_settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  updatedBy: integer("updated_by").references(() => users.id)
});
var insertReminderLogSchema = createInsertSchema(reminderLogs).omit({
  id: true,
  sentAt: true
});
var insertReminderOptOutSchema = createInsertSchema(reminderOptOuts).omit({
  id: true,
  optedOutAt: true,
  token: true
});
var insertSystemSettingSchema = createInsertSchema(systemSettings).omit({
  id: true,
  updatedAt: true
});
var DEFAULT_REMINDER_SETTINGS = {
  reminders_enabled: true,
  reminder_time_hour: 16,
  // 4 PM Eastern = 20 UTC (EST) / 21 UTC (EDT)
  reminder_timezone: "America/New_York",
  reminder_24h_enabled: true,
  reminder_same_day_enabled: true,
  reminder_email_enabled: true,
  reminder_sms_enabled: true,
  reminder_inspection_enabled: true,
  reminder_service_request_enabled: true,
  reminder_job_log_enabled: true
};
var reviewSettings = pgTable("review_settings", {
  id: serial("id").primaryKey(),
  // single row, id = 1
  enabled: boolean("enabled").default(true).notNull(),
  delayHours: integer("delay_hours").default(24).notNull(),
  googleReviewLink: text("google_review_link").notNull().default("https://g.page/r/CXh2r5bK1ZCXEBM/review"),
  facebookReviewLink: text("facebook_review_link"),
  cooldownDays: integer("cooldown_days").default(30).notNull(),
  triggerJobCompletion: boolean("trigger_job_completion").default(true).notNull(),
  triggerInvoicePaid: boolean("trigger_invoice_paid").default(false).notNull(),
  customMessage: text("custom_message"),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var reviewRequestLogs = pgTable("review_request_logs", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").references(() => clients.id, { onDelete: "set null" }),
  jobLogId: integer("job_log_id").references(() => jobLogs.id, { onDelete: "set null" }),
  invoiceId: integer("invoice_id").references(() => invoices.id, { onDelete: "set null" }),
  recipientEmail: text("recipient_email").notNull(),
  triggerType: text("trigger_type").notNull(),
  // 'job_completion', 'invoice_paid', 'manual'
  status: text("status").notNull().default("pending"),
  // 'pending', 'sent', 'failed', 'skipped', 'cancelled'
  scheduledSendAt: timestamp("scheduled_send_at").notNull(),
  sentAt: timestamp("sent_at"),
  attemptCount: integer("attempt_count").default(0).notNull(),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var insertReviewSettingsSchema = createInsertSchema(reviewSettings).omit({
  id: true,
  updatedAt: true
});
var insertReviewRequestLogSchema = createInsertSchema(reviewRequestLogs).omit({
  id: true,
  sentAt: true,
  attemptCount: true,
  errorMessage: true,
  createdAt: true
});
var DEFAULT_REVIEW_SETTINGS = {
  enabled: true,
  delayHours: 24,
  googleReviewLink: "https://g.page/r/CXh2r5bK1ZCXEBM/review",
  facebookReviewLink: "",
  cooldownDays: 30,
  triggerJobCompletion: true,
  triggerInvoicePaid: false,
  customMessage: ""
};
var shifts = pgTable("shifts", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").notNull().references(() => fieldEmployees.id),
  clockInAt: timestamp("clock_in_at").notNull(),
  clockOutAt: timestamp("clock_out_at"),
  clockInGps: jsonb("clock_in_gps"),
  // { lat, lng, accuracy, status }
  clockOutGps: jsonb("clock_out_gps"),
  clockInNotes: text("clock_in_notes"),
  clockOutNotes: text("clock_out_notes"),
  totalShiftMinutes: integer("total_shift_minutes"),
  // computed on clock-out
  status: text("status").notNull().default("open"),
  // open, closed, flagged
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var shiftTimeBlocks = pgTable("shift_time_blocks", {
  id: serial("id").primaryKey(),
  shiftId: integer("shift_id").notNull().references(() => shifts.id, { onDelete: "cascade" }),
  employeeId: integer("employee_id").notNull().references(() => fieldEmployees.id),
  blockType: text("block_type").notNull(),
  // job, travel, admin
  jobLogId: integer("job_log_id").references(() => jobLogs.id),
  // required when blockType = job
  startedAt: timestamp("started_at").notNull(),
  endedAt: timestamp("ended_at"),
  durationMinutes: integer("duration_minutes"),
  // computed on end
  arrivalGps: jsonb("arrival_gps"),
  departureGps: jsonb("departure_gps"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var shiftBreaks = pgTable("shift_breaks", {
  id: serial("id").primaryKey(),
  shiftId: integer("shift_id").notNull().references(() => shifts.id, { onDelete: "cascade" }),
  employeeId: integer("employee_id").notNull().references(() => fieldEmployees.id),
  breakType: text("break_type").notNull(),
  // rest, meal
  isPaid: boolean("is_paid").notNull().default(false),
  // derived from break type at creation
  breakStartAt: timestamp("break_start_at").notNull(),
  breakEndAt: timestamp("break_end_at"),
  breakMinutes: integer("break_minutes"),
  // computed on end
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var timeEntryAuditLog = pgTable("time_entry_audit_log", {
  id: serial("id").primaryKey(),
  entityType: text("entity_type").notNull(),
  // shift, shift_time_block, shift_break
  entityId: integer("entity_id").notNull(),
  actorId: integer("actor_id").notNull(),
  // users.id or field_employees.id
  actorType: text("actor_type").notNull(),
  // admin, employee, system
  fieldChanged: text("field_changed").notNull(),
  oldValue: text("old_value"),
  newValue: text("new_value"),
  reason: text("reason"),
  correctedAt: timestamp("corrected_at").defaultNow().notNull()
});
var insertShiftSchema = createInsertSchema(shifts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  totalShiftMinutes: true
}).extend({
  clockInAt: z.union([z.date(), z.string()]).transform((val) => typeof val === "string" ? new Date(val) : val),
  clockOutAt: z.union([z.date(), z.string(), z.null()]).transform((val) => val === null ? null : typeof val === "string" ? new Date(val) : val).optional(),
  clockInGps: z.object({
    lat: z.number(),
    lng: z.number(),
    accuracy: z.number(),
    status: z.enum(["captured", "denied", "timeout"])
  }).optional(),
  clockOutGps: z.object({
    lat: z.number(),
    lng: z.number(),
    accuracy: z.number(),
    status: z.enum(["captured", "denied", "timeout"])
  }).optional()
});
var insertShiftTimeBlockSchema = createInsertSchema(shiftTimeBlocks).omit({
  id: true,
  createdAt: true,
  durationMinutes: true
}).extend({
  startedAt: z.union([z.date(), z.string()]).transform((val) => typeof val === "string" ? new Date(val) : val),
  endedAt: z.union([z.date(), z.string(), z.null()]).transform((val) => val === null ? null : typeof val === "string" ? new Date(val) : val).optional(),
  arrivalGps: z.object({
    lat: z.number(),
    lng: z.number(),
    accuracy: z.number(),
    status: z.enum(["captured", "denied", "timeout"])
  }).optional(),
  departureGps: z.object({
    lat: z.number(),
    lng: z.number(),
    accuracy: z.number(),
    status: z.enum(["captured", "denied", "timeout"])
  }).optional()
});
var insertShiftBreakSchema = createInsertSchema(shiftBreaks).omit({
  id: true,
  createdAt: true,
  breakMinutes: true
}).extend({
  breakStartAt: z.union([z.date(), z.string()]).transform((val) => typeof val === "string" ? new Date(val) : val),
  breakEndAt: z.union([z.date(), z.string(), z.null()]).transform((val) => val === null ? null : typeof val === "string" ? new Date(val) : val).optional(),
  isPaid: z.boolean().optional().default(false)
});
var insertTimeEntryAuditLogSchema = createInsertSchema(timeEntryAuditLog).omit({
  id: true,
  correctedAt: true
});
var geocache = pgTable("geocache", {
  id: serial("id").primaryKey(),
  addressText: text("address_text").notNull().unique(),
  // normalized address
  lat: decimal("lat", { precision: 10, scale: 7 }),
  lng: decimal("lng", { precision: 10, scale: 7 }),
  geocodedAt: timestamp("geocoded_at").defaultNow().notNull(),
  source: text("source").notNull().default("google")
  // 'google', 'manual'
});
var dailyRoutes = pgTable("daily_routes", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").notNull().references(() => fieldEmployees.id),
  routeDate: date("route_date").notNull(),
  startAddress: text("start_address"),
  // depot/starting address
  optimizedStopOrder: jsonb("optimized_stop_order").notNull(),
  // [{jobLogId, sequence, estimatedArrival, driveDurationSeconds, lat, lng, customerName, address}]
  googleMapsUrl: text("google_maps_url"),
  totalDistanceMeters: integer("total_distance_meters"),
  totalDurationSeconds: integer("total_duration_seconds"),
  generatedAt: timestamp("generated_at").defaultNow().notNull(),
  generatedBy: integer("generated_by").references(() => users.id)
});
var insertGeocacheSchema = createInsertSchema(geocache).omit({
  id: true,
  geocodedAt: true
});
var insertDailyRouteSchema = createInsertSchema(dailyRoutes).omit({
  id: true,
  generatedAt: true
});

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
neonConfig.webSocketConstructor = ws;
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool = new Pool({ connectionString: process.env.DATABASE_URL });
var db = drizzle({ client: pool, schema: schema_exports });

// server/storage.ts
init_email();
import { eq, and, or, desc, gte, lte, lt, ilike, sql, sum, isNull } from "drizzle-orm";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
function advanceNextScheduledDate(current, frequency) {
  const next = new Date(current);
  switch (frequency) {
    case "weekly":
      next.setDate(next.getDate() + 7);
      break;
    case "monthly":
      next.setMonth(next.getMonth() + 1);
      break;
    case "quarterly":
      next.setMonth(next.getMonth() + 3);
      break;
    case "bi-annual":
      next.setMonth(next.getMonth() + 6);
      break;
    case "annual":
      next.setFullYear(next.getFullYear() + 1);
      break;
    default:
      next.setMonth(next.getMonth() + 1);
  }
  return next;
}
var DatabaseStorage = class {
  // User operations
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || void 0;
  }
  async getUserByEmail(email) {
    const [user] = await db.select().from(users).where(ilike(users.email, email));
    return user || void 0;
  }
  async createUser(insertUser) {
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const [user] = await db.insert(users).values({
      ...insertUser,
      password: hashedPassword
    }).returning();
    return user;
  }
  async authenticateUser(email, password) {
    const user = await this.getUserByEmail(email);
    if (!user || !user.isActive) {
      return null;
    }
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return null;
    }
    return user;
  }
  async updateUser(id, updates) {
    const [user] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return user;
  }
  // Contact operations
  async createContactSubmission(insertContact) {
    const [contact] = await db.insert(contactSubmissions).values(insertContact).returning();
    return contact;
  }
  async getContactSubmissions() {
    return await db.select().from(contactSubmissions);
  }
  // Inspection operations
  async createInspectionSchedule(insertInspection) {
    const [inspection] = await db.insert(inspectionSchedules).values(insertInspection).returning();
    return inspection;
  }
  async getInspectionSchedules() {
    return await db.select().from(inspectionSchedules);
  }
  async getInspectionSchedulesByUser(userId) {
    return await db.select().from(inspectionSchedules).where(eq(inspectionSchedules.userId, userId));
  }
  async updateInspectionSchedule(id, updates) {
    const [inspection] = await db.update(inspectionSchedules).set(updates).where(eq(inspectionSchedules.id, id)).returning();
    return inspection;
  }
  // Service request operations
  async createServiceRequest(insertServiceRequest) {
    const [serviceRequest] = await db.insert(serviceRequests).values(insertServiceRequest).returning();
    return serviceRequest;
  }
  async getServiceRequests() {
    return await db.select().from(serviceRequests);
  }
  async getServiceRequestsByUser(userId) {
    return await db.select().from(serviceRequests).where(eq(serviceRequests.userId, userId));
  }
  async updateServiceRequest(id, updates) {
    const [serviceRequest] = await db.update(serviceRequests).set({
      ...updates,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(serviceRequests.id, id)).returning();
    return serviceRequest;
  }
  async updateServiceRequestStatus(id, status, updates) {
    const [serviceRequest] = await db.update(serviceRequests).set({
      status,
      updatedAt: /* @__PURE__ */ new Date(),
      ...updates
    }).where(eq(serviceRequests.id, id)).returning();
    return serviceRequest;
  }
  // Payment operations
  async createPayment(insertPayment) {
    const [payment] = await db.insert(payments).values(insertPayment).returning();
    return payment;
  }
  async getPaymentsByUser(userId) {
    return await db.select().from(payments).where(eq(payments.userId, userId));
  }
  async updatePaymentStatus(id, status) {
    const [payment] = await db.update(payments).set({
      status,
      paidAt: status === "completed" ? /* @__PURE__ */ new Date() : null
    }).where(eq(payments.id, id)).returning();
    return payment;
  }
  // Client operations
  async createClient(insertClient) {
    const [client] = await db.insert(clients).values(insertClient).returning();
    return client;
  }
  async getClients() {
    return await db.select().from(clients);
  }
  async getClient(id) {
    const [client] = await db.select().from(clients).where(eq(clients.id, id));
    return client || void 0;
  }
  async updateClient(id, updates) {
    const [client] = await db.update(clients).set({
      ...updates,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(clients.id, id)).returning();
    return client;
  }
  async deleteClient(id) {
    await db.delete(clients).where(eq(clients.id, id));
  }
  async getClientByEmail(email) {
    const [client] = await db.select().from(clients).where(eq(clients.email, email));
    return client || void 0;
  }
  async createOrUpdateProspect(data) {
    const existing = await this.getClientByEmail(data.email);
    if (existing) {
      const updatedNotes = data.notes ? `${existing.notes || ""}

[${(/* @__PURE__ */ new Date()).toLocaleDateString()}] ${data.notes}`.trim() : existing.notes;
      return await this.updateClient(existing.id, {
        phone: data.phone || existing.phone,
        address: data.address || existing.address,
        notes: updatedNotes
      });
    }
    return await this.createClient({
      name: data.name,
      email: data.email,
      phone: data.phone,
      address: data.address,
      clientType: "prospect",
      status: "pending",
      notes: data.notes
    });
  }
  // Project operations
  async createProject(insertProject) {
    const [project] = await db.insert(projects).values(insertProject).returning();
    return project;
  }
  async getProjects() {
    return await db.select().from(projects);
  }
  async getProject(id) {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project || void 0;
  }
  async getProjectsByClient(clientId) {
    return await db.select().from(projects).where(eq(projects.clientId, clientId));
  }
  async updateProject(id, updates) {
    const [project] = await db.update(projects).set({
      ...updates,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(projects.id, id)).returning();
    return project;
  }
  async deleteProject(id) {
    await db.delete(projects).where(eq(projects.id, id));
  }
  // Milestone operations
  async createMilestone(insertMilestone) {
    const [milestone] = await db.insert(milestones).values(insertMilestone).returning();
    return milestone;
  }
  async getMilestones() {
    return await db.select().from(milestones);
  }
  async getMilestone(id) {
    const [milestone] = await db.select().from(milestones).where(eq(milestones.id, id));
    return milestone || void 0;
  }
  async getMilestonesByProject(projectId) {
    return await db.select().from(milestones).where(eq(milestones.projectId, projectId));
  }
  async updateMilestone(id, updates) {
    const [milestone] = await db.update(milestones).set({
      ...updates,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(milestones.id, id)).returning();
    return milestone;
  }
  async deleteMilestone(id) {
    await db.delete(milestones).where(eq(milestones.id, id));
  }
  // Dashboard operations
  async createDashboard(insertDashboard) {
    const [dashboard] = await db.insert(dashboards).values(insertDashboard).returning();
    return dashboard;
  }
  async getDashboards() {
    return await db.select().from(dashboards);
  }
  async getDashboard(id) {
    const [dashboard] = await db.select().from(dashboards).where(eq(dashboards.id, id));
    return dashboard || void 0;
  }
  async getDashboardsByProject(projectId) {
    return await db.select().from(dashboards).where(eq(dashboards.projectId, projectId));
  }
  async updateDashboard(id, updates) {
    const [dashboard] = await db.update(dashboards).set({
      ...updates,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(dashboards.id, id)).returning();
    return dashboard;
  }
  async deleteDashboard(id) {
    await db.delete(dashboards).where(eq(dashboards.id, id));
  }
  // Blog operations
  async createBlogPost(insertBlogPost) {
    const [blogPost] = await db.insert(blogPosts).values(insertBlogPost).returning();
    return blogPost;
  }
  async getBlogPosts() {
    return await db.select().from(blogPosts).orderBy(desc(blogPosts.createdAt));
  }
  async getPublishedBlogPosts() {
    return await db.select().from(blogPosts).where(eq(blogPosts.isPublished, true)).orderBy(desc(blogPosts.createdAt));
  }
  async getBlogPost(id) {
    const [blogPost] = await db.select().from(blogPosts).where(eq(blogPosts.id, id));
    return blogPost || void 0;
  }
  async getBlogPostBySlug(slug) {
    const [blogPost] = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug));
    return blogPost || void 0;
  }
  async updateBlogPost(id, updates) {
    const [blogPost] = await db.update(blogPosts).set({
      ...updates,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(blogPosts.id, id)).returning();
    return blogPost;
  }
  async deleteBlogPost(id) {
    await db.delete(blogPosts).where(eq(blogPosts.id, id));
  }
  // Field Material operations
  async getFieldMaterials(category) {
    if (category) {
      return await db.select().from(fieldMaterials).where(eq(fieldMaterials.category, category)).orderBy(fieldMaterials.sortOrder, fieldMaterials.name);
    }
    return await db.select().from(fieldMaterials).orderBy(fieldMaterials.category, fieldMaterials.sortOrder, fieldMaterials.name);
  }
  async createFieldMaterial(material) {
    const [created] = await db.insert(fieldMaterials).values(material).returning();
    return created;
  }
  async updateFieldMaterial(id, updates) {
    const [updated] = await db.update(fieldMaterials).set(updates).where(eq(fieldMaterials.id, id)).returning();
    return updated;
  }
  async deleteFieldMaterial(id) {
    await db.delete(fieldMaterials).where(eq(fieldMaterials.id, id));
  }
  // Field Employee operations
  async getServiceRates() {
    return await db.select().from(serviceRates).orderBy(serviceRates.sortOrder, serviceRates.name);
  }
  async getActiveServiceRates() {
    return await db.select().from(serviceRates).where(eq(serviceRates.isActive, true)).orderBy(serviceRates.sortOrder, serviceRates.name);
  }
  async createServiceRate(rate) {
    const [created] = await db.insert(serviceRates).values(rate).returning();
    return created;
  }
  async updateServiceRate(id, updates) {
    const [updated] = await db.update(serviceRates).set(updates).where(eq(serviceRates.id, id)).returning();
    return updated;
  }
  async deleteServiceRate(id) {
    await db.delete(serviceRates).where(eq(serviceRates.id, id));
  }
  async createFieldEmployee(insertEmployee) {
    const [employee] = await db.insert(fieldEmployees).values(insertEmployee).returning();
    return employee;
  }
  async getFieldEmployees() {
    return await db.select().from(fieldEmployees).orderBy(fieldEmployees.name);
  }
  async getFieldEmployee(id) {
    const [employee] = await db.select().from(fieldEmployees).where(eq(fieldEmployees.id, id));
    return employee || void 0;
  }
  async getFieldEmployeeByPin(pin) {
    const [employee] = await db.select().from(fieldEmployees).where(and(eq(fieldEmployees.pin, pin), eq(fieldEmployees.isActive, true)));
    return employee || void 0;
  }
  async updateFieldEmployee(id, updates) {
    const [employee] = await db.update(fieldEmployees).set(updates).where(eq(fieldEmployees.id, id)).returning();
    return employee;
  }
  async deleteFieldEmployee(id) {
    await db.delete(fieldEmployees).where(eq(fieldEmployees.id, id));
  }
  // Job Log operations
  async createJobLog(insertJobLog) {
    const [jobLog] = await db.insert(jobLogs).values(insertJobLog).returning();
    return jobLog;
  }
  async getJobLogs(filters) {
    const conditions = [];
    if (filters?.employeeId) conditions.push(eq(jobLogs.employeeId, filters.employeeId));
    if (filters?.customerName) conditions.push(eq(jobLogs.customerName, filters.customerName));
    if (filters?.clientId) conditions.push(eq(jobLogs.clientId, filters.clientId));
    if (filters?.dateFrom) conditions.push(gte(jobLogs.jobDate, filters.dateFrom));
    if (filters?.dateTo) conditions.push(lte(jobLogs.jobDate, filters.dateTo));
    if (filters?.siteLocation) conditions.push(eq(jobLogs.siteLocation, filters.siteLocation));
    if (filters?.siteAddress) conditions.push(eq(jobLogs.siteAddress, filters.siteAddress));
    if (filters?.servicedArea) conditions.push(eq(jobLogs.servicedArea, filters.servicedArea));
    if (filters?.status) conditions.push(eq(jobLogs.status, filters.status));
    if (conditions.length > 0) {
      return await db.select().from(jobLogs).where(and(...conditions)).orderBy(desc(jobLogs.jobDate));
    }
    return await db.select().from(jobLogs).orderBy(desc(jobLogs.jobDate));
  }
  async getJobLog(id) {
    const [jobLog] = await db.select().from(jobLogs).where(eq(jobLogs.id, id));
    return jobLog || void 0;
  }
  async updateJobLog(id, updates) {
    const [jobLog] = await db.update(jobLogs).set(updates).where(eq(jobLogs.id, id)).returning();
    return jobLog;
  }
  async deleteJobLog(id) {
    await db.delete(jobLogs).where(eq(jobLogs.id, id));
  }
  async getJobLogCustomFields() {
    return await db.select().from(jobLogCustomFields).orderBy(jobLogCustomFields.displayOrder);
  }
  async createJobLogCustomField(field) {
    const [f] = await db.insert(jobLogCustomFields).values(field).returning();
    return f;
  }
  async updateJobLogCustomField(id, updates) {
    const [f] = await db.update(jobLogCustomFields).set(updates).where(eq(jobLogCustomFields.id, id)).returning();
    return f;
  }
  async deleteJobLogCustomField(id) {
    await db.delete(jobLogCustomFields).where(eq(jobLogCustomFields.id, id));
  }
  async getFieldCustomers() {
    return await db.select().from(fieldCustomers).orderBy(fieldCustomers.name);
  }
  async createFieldCustomer(customer) {
    const [c] = await db.insert(fieldCustomers).values(customer).returning();
    return c;
  }
  async updateFieldCustomer(id, updates) {
    const [c] = await db.update(fieldCustomers).set(updates).where(eq(fieldCustomers.id, id)).returning();
    return c;
  }
  async deleteFieldCustomer(id) {
    await db.delete(fieldCustomers).where(eq(fieldCustomers.id, id));
  }
  async getSiteLocations() {
    return await db.select().from(siteLocations).orderBy(siteLocations.name);
  }
  async createSiteLocation(location) {
    const [loc] = await db.insert(siteLocations).values(location).returning();
    return loc;
  }
  async updateSiteLocation(id, updates) {
    const [loc] = await db.update(siteLocations).set(updates).where(eq(siteLocations.id, id)).returning();
    return loc;
  }
  async deleteSiteLocation(id) {
    await db.delete(siteLocations).where(eq(siteLocations.id, id));
  }
  async getServicedAreas() {
    return await db.select().from(servicedAreas).orderBy(servicedAreas.name);
  }
  async createServicedArea(area) {
    const [a] = await db.insert(servicedAreas).values(area).returning();
    return a;
  }
  async updateServicedArea(id, updates) {
    const [a] = await db.update(servicedAreas).set(updates).where(eq(servicedAreas.id, id)).returning();
    return a;
  }
  async deleteServicedArea(id) {
    await db.delete(servicedAreas).where(eq(servicedAreas.id, id));
  }
  // Service Contract operations
  async createServiceContract(insertContract) {
    if (!insertContract.nextScheduledDate) {
      throw new Error("nextScheduledDate is required");
    }
    const [contract] = await db.insert(serviceContracts).values(insertContract).returning();
    return contract;
  }
  async getServiceContracts(filters) {
    const conditions = [];
    if (filters?.customerId) conditions.push(eq(serviceContracts.customerId, filters.customerId));
    if (filters?.isActive !== void 0) conditions.push(eq(serviceContracts.isActive, filters.isActive));
    if (filters?.assignedEmployeeId) conditions.push(eq(serviceContracts.assignedEmployeeId, filters.assignedEmployeeId));
    if (conditions.length > 0) {
      return await db.select().from(serviceContracts).where(and(...conditions)).orderBy(serviceContracts.nextScheduledDate);
    }
    return await db.select().from(serviceContracts).orderBy(serviceContracts.nextScheduledDate);
  }
  async getServiceContract(id) {
    const [contract] = await db.select().from(serviceContracts).where(eq(serviceContracts.id, id));
    return contract || void 0;
  }
  async getServiceContractsInDateRange(from, to) {
    const results = await db.select({
      id: serviceContracts.id,
      customerId: serviceContracts.customerId,
      frequency: serviceContracts.frequency,
      nextScheduledDate: serviceContracts.nextScheduledDate,
      siteLocation: serviceContracts.siteLocation,
      servicedArea: serviceContracts.servicedArea,
      defaultWorkTemplate: serviceContracts.defaultWorkTemplate,
      lastGeneratedJobDate: serviceContracts.lastGeneratedJobDate,
      notes: serviceContracts.notes,
      assignedEmployeeId: serviceContracts.assignedEmployeeId,
      startDate: serviceContracts.startDate,
      endDate: serviceContracts.endDate,
      isActive: serviceContracts.isActive,
      createdAt: serviceContracts.createdAt,
      updatedAt: serviceContracts.updatedAt,
      customerName: clients.name
    }).from(serviceContracts).innerJoin(clients, eq(serviceContracts.customerId, clients.id)).where(
      and(
        gte(serviceContracts.nextScheduledDate, from),
        lte(serviceContracts.nextScheduledDate, to)
      )
    ).orderBy(serviceContracts.nextScheduledDate);
    return results;
  }
  async getServiceContractsByDateRange(from, to) {
    const results = await db.select({
      id: serviceContracts.id,
      customerId: serviceContracts.customerId,
      frequency: serviceContracts.frequency,
      nextScheduledDate: serviceContracts.nextScheduledDate,
      siteLocation: serviceContracts.siteLocation,
      servicedArea: serviceContracts.servicedArea,
      defaultWorkTemplate: serviceContracts.defaultWorkTemplate,
      lastGeneratedJobDate: serviceContracts.lastGeneratedJobDate,
      notes: serviceContracts.notes,
      assignedEmployeeId: serviceContracts.assignedEmployeeId,
      startDate: serviceContracts.startDate,
      endDate: serviceContracts.endDate,
      isActive: serviceContracts.isActive,
      createdAt: serviceContracts.createdAt,
      updatedAt: serviceContracts.updatedAt,
      customerName: clients.name
    }).from(serviceContracts).innerJoin(clients, eq(serviceContracts.customerId, clients.id)).where(
      and(
        gte(serviceContracts.startDate, from),
        lte(serviceContracts.endDate, to)
      )
    ).orderBy(serviceContracts.startDate);
    return results;
  }
  async generateJobFromContract(contractId) {
    const [contract] = await db.select().from(serviceContracts).where(eq(serviceContracts.id, contractId));
    if (!contract) {
      throw new Error("Service contract not found");
    }
    const jobLog = await db.insert(jobLogs).values({
      employeeId: contract.assignedEmployeeId,
      customerName: await this.getCustomerName(contract.customerId),
      clientId: contract.customerId,
      siteLocation: contract.siteLocation,
      siteAddress: "",
      servicedArea: contract.servicedArea,
      workPerformed: contract.defaultWorkTemplate || "Scheduled service",
      jobDate: contract.nextScheduledDate,
      status: "scheduled",
      createdAt: /* @__PURE__ */ new Date()
    }).returning();
    const nextDate = advanceNextScheduledDate(contract.nextScheduledDate, contract.frequency);
    const updatedContract = await db.update(serviceContracts).set({
      lastGeneratedJobDate: /* @__PURE__ */ new Date(),
      nextScheduledDate: nextDate,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(serviceContracts.id, contractId)).returning();
    return { jobLog: jobLog[0], updatedContract: updatedContract[0] };
  }
  async getCustomerName(clientId) {
    const client = await this.getClient(clientId);
    return client?.name || "Unknown Customer";
  }
  async updateServiceContract(id, updates) {
    const { nextScheduledDate, ...rest } = updates;
    const setValues = { ...rest, updatedAt: /* @__PURE__ */ new Date() };
    if (nextScheduledDate != null) {
      setValues.nextScheduledDate = nextScheduledDate;
    }
    const [contract] = await db.update(serviceContracts).set(setValues).where(eq(serviceContracts.id, id)).returning();
    return contract;
  }
  async deleteServiceContract(id) {
    await db.delete(serviceContracts).where(eq(serviceContracts.id, id));
  }
  // Job Log Photo operations
  async createJobLogPhoto(data) {
    const existing = await db.select().from(jobLogPhotos).where(eq(jobLogPhotos.jobLogId, data.jobLogId));
    if (existing.length >= 5) {
      throw new Error("MAX_PHOTOS_EXCEEDED");
    }
    const [photo] = await db.insert(jobLogPhotos).values(data).returning();
    return photo;
  }
  async getJobLogPhotos(jobLogId) {
    return db.select().from(jobLogPhotos).where(eq(jobLogPhotos.jobLogId, jobLogId)).orderBy(jobLogPhotos.uploadedAt);
  }
  async deleteJobLogPhoto(id, jobLogId) {
    await db.delete(jobLogPhotos).where(and(eq(jobLogPhotos.id, id), eq(jobLogPhotos.jobLogId, jobLogId)));
  }
  // ============================================
  // Invoice Operations (SC-INV-001)
  // ============================================
  async generateInvoiceNumber() {
    const year = (/* @__PURE__ */ new Date()).getFullYear();
    const yearStart = /* @__PURE__ */ new Date(`${year}-01-01`);
    const yearEnd = /* @__PURE__ */ new Date(`${year + 1}-01-01`);
    const existing = await db.select().from(invoices).where(
      sql`${invoices.createdAt} >= ${yearStart} AND ${invoices.createdAt} < ${yearEnd}`
    );
    const n = String(existing.length + 1).padStart(4, "0");
    return `INV-${year}-${n}`;
  }
  async createInvoice(insertInvoice) {
    const invoiceNumber = await this.generateInvoiceNumber();
    const viewToken = uuidv4();
    const [invoice] = await db.insert(invoices).values({
      ...insertInvoice,
      invoiceNumber,
      viewToken,
      status: "draft",
      subtotal: String(insertInvoice.subtotal),
      taxTotal: String(insertInvoice.taxTotal || "0"),
      total: String(insertInvoice.total)
    }).returning();
    await this.logInvoiceStatusChange({
      invoiceId: invoice.id,
      fromStatus: null,
      toStatus: "draft",
      actor: insertInvoice.createdBy ? `admin:${insertInvoice.createdBy}` : "system",
      note: "Invoice created"
    });
    return invoice;
  }
  async getInvoice(id) {
    const [invoice] = await db.select().from(invoices).where(eq(invoices.id, id));
    return invoice || void 0;
  }
  async getInvoiceByToken(token) {
    const [invoice] = await db.select().from(invoices).where(eq(invoices.viewToken, token));
    return invoice || void 0;
  }
  async getInvoiceByNumber(invoiceNumber) {
    const [invoice] = await db.select().from(invoices).where(eq(invoices.invoiceNumber, invoiceNumber));
    return invoice || void 0;
  }
  async listInvoices(filters) {
    const conditions = [];
    if (filters?.clientId) {
      conditions.push(eq(invoices.clientId, filters.clientId));
    }
    if (filters?.status) {
      conditions.push(eq(invoices.status, filters.status));
    }
    if (filters?.fromDate) {
      conditions.push(gte(invoices.issueDate, filters.fromDate));
    }
    if (filters?.toDate) {
      conditions.push(lte(invoices.issueDate, filters.toDate));
    }
    const page = filters?.page || 1;
    const limit = filters?.limit || 50;
    const offset = (page - 1) * limit;
    let query = db.select().from(invoices);
    if (conditions.length > 0) {
      query = db.select().from(invoices).where(and(...conditions));
    }
    const results = await query.orderBy(desc(invoices.createdAt)).limit(limit).offset(offset);
    const invoicesWithDetails = await Promise.all(
      results.map(async (invoice) => {
        const client = await this.getClient(invoice.clientId);
        const lineItems = await this.getLineItemsByInvoice(invoice.id);
        const statusLogs = await this.getInvoiceStatusLog(invoice.id);
        return {
          ...invoice,
          client,
          lineItems,
          statusLogs
        };
      })
    );
    return invoicesWithDetails;
  }
  async updateInvoice(id, updates) {
    const [invoice] = await db.update(invoices).set({
      ...updates,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(invoices.id, id)).returning();
    return invoice;
  }
  async getInvoiceStats() {
    const now = /* @__PURE__ */ new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const outstandingResult = await db.select({ total: sum(sql`${invoices.total}::numeric`) }).from(invoices).where(and(
      sql`${invoices.status} IN ('draft', 'sent', 'viewed', 'overdue')`
    ));
    const overdueResult = await db.select({ total: sum(sql`${invoices.total}::numeric`) }).from(invoices).where(eq(invoices.status, "overdue"));
    const paidThisMonthResult = await db.select({ total: sum(sql`${invoices.total}::numeric`) }).from(invoices).where(and(
      eq(invoices.status, "paid"),
      gte(invoices.paidAt, startOfMonth)
    ));
    const paidAllTimeResult = await db.select({ total: sum(sql`${invoices.total}::numeric`) }).from(invoices).where(eq(invoices.status, "paid"));
    const statusCounts = await db.select({ status: invoices.status, count: sql`count(*)::int` }).from(invoices).groupBy(invoices.status);
    const countByStatus = {
      draft: 0,
      sent: 0,
      viewed: 0,
      paid: 0,
      overdue: 0,
      void: 0
    };
    for (const row of statusCounts) {
      if (row.status && row.status in countByStatus) {
        countByStatus[row.status] = Number(row.count) || 0;
      }
    }
    return {
      totalOutstanding: outstandingResult[0]?.total?.toString() || "0.00",
      totalOverdue: overdueResult[0]?.total?.toString() || "0.00",
      totalPaidThisMonth: paidThisMonthResult[0]?.total?.toString() || "0.00",
      totalPaidAllTime: paidAllTimeResult[0]?.total?.toString() || "0.00",
      countByStatus
    };
  }
  // Line Item operations
  async createLineItem(data) {
    const quantity = parseFloat(String(data.quantity || 1));
    const unitRate = parseFloat(String(data.unitRate));
    const taxRate = parseFloat(String(data.taxRate || 0));
    const lineTotal = quantity * unitRate;
    const lineTax = lineTotal * (taxRate / 100);
    const [lineItem] = await db.insert(invoiceLineItems).values({
      ...data,
      quantity: String(data.quantity || 1),
      unitRate: String(data.unitRate),
      taxRate: String(data.taxRate || 0),
      lineTotal: lineTotal.toFixed(2),
      lineTax: lineTax.toFixed(2)
    }).returning();
    return lineItem;
  }
  async updateLineItem(id, updates) {
    const [lineItem] = await db.update(invoiceLineItems).set(updates).where(eq(invoiceLineItems.id, id)).returning();
    return lineItem;
  }
  async deleteLineItem(id) {
    await db.delete(invoiceLineItems).where(eq(invoiceLineItems.id, id));
  }
  async getLineItemsByInvoice(invoiceId) {
    return await db.select().from(invoiceLineItems).where(eq(invoiceLineItems.invoiceId, invoiceId)).orderBy(invoiceLineItems.sortOrder);
  }
  // Status Log operations
  async logInvoiceStatusChange(data) {
    const [log2] = await db.insert(invoiceStatusLogs).values(data).returning();
    return log2;
  }
  async getInvoiceStatusLog(invoiceId) {
    return await db.select().from(invoiceStatusLogs).where(eq(invoiceStatusLogs.invoiceId, invoiceId)).orderBy(invoiceStatusLogs.createdAt);
  }
  // Invoice status transitions
  async updateInvoiceStatus(id, toStatus, actor, note) {
    const invoice = await this.getInvoice(id);
    if (!invoice) {
      throw new Error("Invoice not found");
    }
    const fromStatus = invoice.status;
    const updates = {
      status: toStatus,
      updatedAt: /* @__PURE__ */ new Date()
    };
    if (toStatus === "sent" && !invoice.sentAt) {
      updates.sentAt = /* @__PURE__ */ new Date();
    }
    if (toStatus === "viewed" && !invoice.viewedAt) {
      updates.viewedAt = /* @__PURE__ */ new Date();
    }
    if (toStatus === "paid") {
      updates.paidAt = /* @__PURE__ */ new Date();
    }
    const updatedInvoice = await this.updateInvoice(id, updates);
    await this.logInvoiceStatusChange({
      invoiceId: id,
      fromStatus,
      toStatus,
      actor,
      note
    });
    if (invoice.jobLogId) {
      if (toStatus === "sent" || toStatus === "viewed") {
        await this.updateJobLog(invoice.jobLogId, { status: "invoiced" });
      } else if (toStatus === "paid") {
        await this.updateJobLog(invoice.jobLogId, { status: "paid" });
      } else if (toStatus === "void") {
        await this.updateJobLog(invoice.jobLogId, { status: "completed" });
      }
    }
    return updatedInvoice;
  }
  async markInvoicesOverdue() {
    const now = /* @__PURE__ */ new Date();
    const overdueInvoices = await db.select().from(invoices).where(and(
      sql`${invoices.status} IN ('sent', 'viewed')`,
      sql`${invoices.dueDate} < ${now}`
    ));
    let updatedCount = 0;
    for (const invoice of overdueInvoices) {
      await this.updateInvoiceStatus(invoice.id, "overdue", "system", "Auto-marked overdue by cron");
      updatedCount++;
      try {
        const client = await this.getClient(invoice.clientId);
        if (client && client.email) {
          await sendInvoiceOverdueEmail({
            clientEmail: client.email,
            clientName: client.name,
            invoiceNumber: invoice.invoiceNumber,
            dueDate: new Date(invoice.dueDate),
            total: String(invoice.total),
            viewToken: invoice.viewToken
          });
          console.log(`Sent overdue email for invoice ${invoice.invoiceNumber}`);
        }
      } catch (emailError) {
        console.error(`Failed to send overdue email for invoice ${invoice.invoiceNumber}:`, emailError);
      }
    }
    return updatedCount;
  }
  async createInvoiceFromJobLog(jobLogId, dueDate, createdBy) {
    const jobLog = await this.getJobLog(jobLogId);
    if (!jobLog) {
      throw new Error("Job log not found");
    }
    if (!jobLog.clientId) {
      throw new Error("Job log has no associated client");
    }
    const client = await this.getClient(jobLog.clientId);
    if (!client) {
      throw new Error("Client not found");
    }
    const invoice = await this.createInvoice({
      clientId: jobLog.clientId,
      jobLogId,
      dueDate,
      subtotal: "0",
      // Will be calculated from line items
      taxTotal: "0",
      total: "0",
      createdBy
    });
    const unitRate = String(jobLog.amount || "200");
    const quantity = "1";
    const taxRate = "6";
    let techName;
    let serviceTypeName;
    try {
      if (jobLog.employeeId) {
        const employees = await this.getFieldEmployees();
        const emp = employees.find((e) => e.id === jobLog.employeeId);
        if (emp) techName = emp.name;
      }
      if (jobLog.serviceRateId) {
        const rates = await this.getServiceRates();
        const rate = rates.find((r) => r.id === jobLog.serviceRateId);
        if (rate) serviceTypeName = rate.name;
      }
    } catch {
    }
    await this.createLineItem({
      invoiceId: invoice.id,
      description: jobLog.workPerformed,
      quantity,
      unitRate,
      taxRate,
      materials: jobLog.materials || null,
      serviceDate: jobLog.jobDate ? String(jobLog.jobDate).slice(0, 10) : void 0,
      technicianName: techName,
      serviceType: serviceTypeName,
      serviceAddress: jobLog.siteAddress || void 0,
      servicedArea: jobLog.servicedArea || void 0,
      jobLogId: jobLog.id
    });
    const lineItems = await this.getLineItemsByInvoice(invoice.id);
    let subtotal = 0;
    let taxTotal = 0;
    for (const item of lineItems) {
      subtotal += parseFloat(String(item.lineTotal));
      taxTotal += parseFloat(String(item.lineTax));
    }
    await this.updateInvoice(invoice.id, {
      subtotal: subtotal.toFixed(2),
      taxTotal: taxTotal.toFixed(2),
      total: (subtotal + taxTotal).toFixed(2)
    });
    return await this.getInvoice(invoice.id);
  }
  // ==========================================
  // Reminder Implementations (SC-REMINDERS-001)
  // ==========================================
  async getReminderLogs(appointmentType, appointmentId, limit = 50) {
    let query = db.select().from(reminderLogs).orderBy(desc(reminderLogs.sentAt)).limit(limit);
    if (appointmentType && appointmentId) {
      return await db.select().from(reminderLogs).where(and(
        eq(reminderLogs.appointmentType, appointmentType),
        eq(reminderLogs.appointmentId, appointmentId)
      )).orderBy(desc(reminderLogs.sentAt)).limit(limit);
    } else if (appointmentType) {
      return await db.select().from(reminderLogs).where(eq(reminderLogs.appointmentType, appointmentType)).orderBy(desc(reminderLogs.sentAt)).limit(limit);
    }
    return await query;
  }
  async createReminderLog(log2) {
    const [created] = await db.insert(reminderLogs).values(log2).returning();
    return created;
  }
  async getReminderLogByAppointment(appointmentType, appointmentId, reminderType, channel) {
    const [log2] = await db.select().from(reminderLogs).where(and(
      eq(reminderLogs.appointmentType, appointmentType),
      eq(reminderLogs.appointmentId, appointmentId),
      eq(reminderLogs.reminderType, reminderType),
      eq(reminderLogs.channel, channel)
    ));
    return log2 || void 0;
  }
  async deleteReminderLog(id) {
    await db.delete(reminderLogs).where(eq(reminderLogs.id, id));
  }
  // Opt-out operations
  async getReminderOptOuts() {
    return await db.select().from(reminderOptOuts).orderBy(desc(reminderOptOuts.optedOutAt));
  }
  async getReminderOptOutByToken(token) {
    const [optOut] = await db.select().from(reminderOptOuts).where(eq(reminderOptOuts.token, token));
    return optOut || void 0;
  }
  async getReminderOptOutByEmail(email) {
    const [optOut] = await db.select().from(reminderOptOuts).where(eq(reminderOptOuts.email, email.toLowerCase()));
    return optOut || void 0;
  }
  async getReminderOptOutByPhone(phone) {
    const [optOut] = await db.select().from(reminderOptOuts).where(eq(reminderOptOuts.phone, phone));
    return optOut || void 0;
  }
  async createReminderOptOut(optOut) {
    const [created] = await db.insert(reminderOptOuts).values({
      ...optOut,
      email: optOut.email?.toLowerCase(),
      phone: optOut.phone
    }).returning();
    return created;
  }
  async deleteReminderOptOut(id) {
    await db.delete(reminderOptOuts).where(eq(reminderOptOuts.id, id));
  }
  // System settings operations
  async getSystemSetting(key) {
    const [setting] = await db.select().from(systemSettings).where(eq(systemSettings.key, key));
    return setting?.value;
  }
  async getAllReminderSettings() {
    const settings = { ...DEFAULT_REMINDER_SETTINGS };
    for (const key of Object.keys(DEFAULT_REMINDER_SETTINGS)) {
      const value = await this.getSystemSetting(key);
      if (value !== void 0) {
        if (key === "reminder_time_hour") {
          settings[key] = parseInt(value, 10);
        } else if (key.endsWith("_enabled")) {
          settings[key] = value === "true";
        } else {
          settings[key] = value;
        }
      }
    }
    return settings;
  }
  async setSystemSetting(key, value, updatedBy) {
    const [setting] = await db.insert(systemSettings).values({ key, value, updatedBy }).onConflictDoUpdate({
      target: systemSettings.key,
      set: { value, updatedBy, updatedAt: /* @__PURE__ */ new Date() }
    }).returning();
    return setting;
  }
  async setReminderSettings(settings, updatedBy) {
    for (const [key, value] of Object.entries(settings)) {
      await this.setSystemSetting(key, String(value), updatedBy);
    }
    return this.getAllReminderSettings();
  }
  // ============================================
  // Review Request Operations (SC-REVIEWS-001)
  // ============================================
  async getReviewSettings() {
    const settings = { ...DEFAULT_REVIEW_SETTINGS, id: 1, updatedAt: /* @__PURE__ */ new Date() };
    const keys = [
      "review_enabled",
      "review_delay_hours",
      "review_google_link",
      "review_facebook_link",
      "review_cooldown_days",
      "review_trigger_job_completion",
      "review_trigger_invoice_paid",
      "review_custom_message"
    ];
    for (const key of keys) {
      const value = await this.getSystemSetting(key);
      if (value !== void 0) {
        const settingKey = key.replace("review_", "").replace("_enabled", "Enabled");
        switch (settingKey) {
          case "delayHours":
          case "cooldownDays":
            settings[settingKey] = parseInt(value, 10);
            break;
          case "googleReviewLink":
          case "facebookReviewLink":
          case "customMessage":
            settings[settingKey] = value;
            break;
          case "enabled":
          case "triggerJobCompletion":
          case "triggerInvoicePaid":
            settings[settingKey] = value === "true";
            break;
        }
      }
    }
    return settings;
  }
  async updateReviewSettings(updates) {
    const settingMap = {
      "enabled": "review_enabled",
      "delayHours": "review_delay_hours",
      "googleReviewLink": "review_google_link",
      "facebookReviewLink": "review_facebook_link",
      "cooldownDays": "review_cooldown_days",
      "triggerJobCompletion": "review_trigger_job_completion",
      "triggerInvoicePaid": "review_trigger_invoice_paid",
      "customMessage": "review_custom_message"
    };
    for (const [key, value] of Object.entries(updates)) {
      const settingKey = settingMap[key];
      if (settingKey) {
        await this.setSystemSetting(settingKey, String(value));
      }
    }
    return this.getReviewSettings();
  }
  async createReviewRequestLog(log2) {
    const [created] = await db.insert(reviewRequestLogs).values(log2).returning();
    return created;
  }
  async getReviewRequestLogByJobLogId(jobLogId) {
    const [log2] = await db.select().from(reviewRequestLogs).where(sql`${reviewRequestLogs.jobLogId} = ${jobLogId}`);
    return log2;
  }
  async getReviewRequestLogByInvoiceId(invoiceId) {
    const [log2] = await db.select().from(reviewRequestLogs).where(sql`${reviewRequestLogs.invoiceId} = ${invoiceId}`);
    return log2;
  }
  async getPendingReviewRequests() {
    return await db.select().from(reviewRequestLogs).where(and(
      sql`${reviewRequestLogs.status} = 'pending'`,
      sql`${reviewRequestLogs.scheduledSendAt} <= ${/* @__PURE__ */ new Date()}`
    ));
  }
  async updateReviewRequestLog(id, updates) {
    const [updated] = await db.update(reviewRequestLogs).set(updates).where(sql`${reviewRequestLogs.id} = ${id}`).returning();
    return updated;
  }
  async getReviewRequestLogs(options) {
    const limit = options?.limit || 50;
    const offset = options?.offset || 0;
    let whereClause = void 0;
    const conditions = [];
    if (options?.status) {
      conditions.push(sql`${reviewRequestLogs.status} = ${options.status}`);
    }
    if (options?.clientId) {
      conditions.push(sql`${reviewRequestLogs.clientId} = ${options.clientId}`);
    }
    if (conditions.length > 0) {
      whereClause = and(...conditions);
    }
    const logs = await db.select().from(reviewRequestLogs).where(whereClause).orderBy(sql`${reviewRequestLogs.createdAt} DESC`).limit(limit).offset(offset);
    const [{ count }] = await db.select({ count: sql`COUNT(*)` }).from(reviewRequestLogs).where(whereClause);
    return { logs, total: Number(count) };
  }
  async deleteReviewRequestLog(id) {
    await db.delete(reviewRequestLogs).where(sql`${reviewRequestLogs.id} = ${id}`);
  }
  async getClientById(id) {
    const [client] = await db.select().from(clients).where(sql`${clients.id} = ${id}`);
    return client;
  }
  async getJobLogById(id) {
    const [jobLog] = await db.select().from(jobLogs).where(sql`${jobLogs.id} = ${id}`);
    return jobLog;
  }
  async getInvoiceById(id) {
    const [invoice] = await db.select().from(invoices).where(sql`${invoices.id} = ${id}`);
    return invoice;
  }
  async hasRecentReviewRequest(clientId, days) {
    const cutoffDate = /* @__PURE__ */ new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    const [log2] = await db.select().from(reviewRequestLogs).where(and(
      sql`${reviewRequestLogs.clientId} = ${clientId}`,
      sql`${reviewRequestLogs.status} = 'sent'`,
      sql`${reviewRequestLogs.sentAt} >= ${cutoffDate}`
    ));
    return !!log2;
  }
  async countReviewRequestsSentThisYear(clientId) {
    const startOfYear = new Date((/* @__PURE__ */ new Date()).getFullYear(), 0, 1);
    const [{ count }] = await db.select({ count: sql`COUNT(*)` }).from(reviewRequestLogs).where(and(
      sql`${reviewRequestLogs.clientId} = ${clientId}`,
      sql`${reviewRequestLogs.status} = 'sent'`,
      sql`${reviewRequestLogs.sentAt} >= ${startOfYear}`
    ));
    return Number(count);
  }
  // Query appointments for reminders
  async getInspectionsFor24hReminder() {
    const now = /* @__PURE__ */ new Date();
    const windowStart = new Date(now.getTime() + 20 * 60 * 60 * 1e3);
    const windowEnd = new Date(now.getTime() + 44 * 60 * 60 * 1e3);
    return await db.select().from(inspectionSchedules).where(and(
      sql`${inspectionSchedules.preferredDate} BETWEEN ${windowStart} AND ${windowEnd}`,
      sql`${inspectionSchedules.status} != 'cancelled'`
    ));
  }
  async getInspectionsForSameDayReminder() {
    const now = /* @__PURE__ */ new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    return await db.select().from(inspectionSchedules).where(and(
      sql`${inspectionSchedules.preferredDate} BETWEEN ${todayStart} AND ${todayEnd}`,
      sql`${inspectionSchedules.status} != 'cancelled'`
    ));
  }
  async getServiceRequestsFor24hReminder() {
    const now = /* @__PURE__ */ new Date();
    const windowStart = new Date(now.getTime() + 20 * 60 * 60 * 1e3);
    const windowEnd = new Date(now.getTime() + 44 * 60 * 60 * 1e3);
    return await db.select().from(serviceRequests).where(and(
      sql`${serviceRequests.scheduledDate} BETWEEN ${windowStart} AND ${windowEnd}`,
      eq(serviceRequests.status, "scheduled")
    ));
  }
  async getServiceRequestsForSameDayReminder() {
    const now = /* @__PURE__ */ new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    return await db.select().from(serviceRequests).where(and(
      sql`${serviceRequests.scheduledDate} BETWEEN ${todayStart} AND ${todayEnd}`,
      eq(serviceRequests.status, "scheduled")
    ));
  }
  async getJobLogsFor24hReminder() {
    const now = /* @__PURE__ */ new Date();
    const windowStart = new Date(now.getTime() + 20 * 60 * 60 * 1e3);
    const windowEnd = new Date(now.getTime() + 44 * 60 * 60 * 1e3);
    return await db.select().from(jobLogs).where(and(
      sql`${jobLogs.jobDate} BETWEEN ${windowStart} AND ${windowEnd}`,
      eq(jobLogs.status, "scheduled")
    ));
  }
  async getJobLogsForSameDayReminder() {
    const now = /* @__PURE__ */ new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    return await db.select().from(jobLogs).where(and(
      sql`${jobLogs.jobDate} BETWEEN ${todayStart} AND ${todayEnd}`,
      eq(jobLogs.status, "scheduled")
    ));
  }
  // ==========================================
  // Analytics Implementations
  // ==========================================
  async getAnalyticsOverview(from, to) {
    const now = /* @__PURE__ */ new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    const [jobsThisMonthResult] = await db.select({ count: sql`count(*)` }).from(jobLogs).where(gte(jobLogs.jobDate, startOfMonth));
    const jobsThisMonth = jobsThisMonthResult?.count || 0;
    const [jobsThisWeekResult] = await db.select({ count: sql`count(*)` }).from(jobLogs).where(gte(jobLogs.jobDate, startOfWeek));
    const jobsThisWeek = jobsThisWeekResult?.count || 0;
    const [activeClientsResult] = await db.select({ count: sql`count(*)` }).from(clients).where(eq(clients.status, "active"));
    const activeClients = activeClientsResult?.count || 0;
    const [activeContractsResult] = await db.select({ count: sql`count(*)` }).from(serviceContracts).where(eq(serviceContracts.isActive, true));
    const activeContracts = activeContractsResult?.count || 0;
    const [openRequestsResult] = await db.select({ count: sql`count(*)` }).from(serviceRequests).where(sql`${serviceRequests.status} IN ('pending', 'scheduled')`);
    const openServiceRequests = openRequestsResult?.count || 0;
    const [overdueInvoicesResult] = await db.select({ count: sql`count(*)` }).from(invoices).where(eq(invoices.status, "overdue"));
    const overdueInvoices = overdueInvoicesResult?.count || 0;
    const [outstandingResult] = await db.select({ total: sql`COALESCE(SUM(${invoices.total}), 0)` }).from(invoices).where(sql`${invoices.status} IN ('sent', 'viewed', 'overdue')`);
    const outstandingRevenue = parseFloat(outstandingResult?.total || "0");
    return {
      jobsThisMonth,
      jobsThisWeek,
      activeClients,
      activeContracts,
      openServiceRequests,
      overdueInvoices,
      outstandingRevenue
    };
  }
  async getJobsOverTime(from, to, groupBy = "month") {
    const interval = groupBy === "month" ? "month" : "week";
    const results = await db.select({
      period: sql`DATE_TRUNC('${sql.raw(interval)}', ${jobLogs.jobDate})`,
      count: sql`count(*)`
    }).from(jobLogs).where(and(gte(jobLogs.jobDate, from), lte(jobLogs.jobDate, to))).groupBy(sql`DATE_TRUNC('${sql.raw(interval)}', ${jobLogs.jobDate})`).orderBy(sql`DATE_TRUNC('${sql.raw(interval)}', ${jobLogs.jobDate})`);
    return results.map((r) => ({
      month: new Date(r.period).toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
      count: Number(r.count)
    }));
  }
  async getJobsByArea(from, to) {
    const results = await db.select({
      area: jobLogs.servicedArea,
      count: sql`count(*)`
    }).from(jobLogs).where(and(gte(jobLogs.jobDate, from), lte(jobLogs.jobDate, to))).groupBy(jobLogs.servicedArea).orderBy(sql`count(*) DESC`);
    const top6 = results.slice(0, 6);
    const otherCount = results.slice(6).reduce((sum2, r) => sum2 + Number(r.count), 0);
    const mapped = top6.map((r) => ({
      area: r.area || "Unknown",
      count: Number(r.count)
    }));
    if (otherCount > 0) {
      mapped.push({ area: "Other", count: otherCount });
    }
    return mapped;
  }
  async getJobsByStatus(from, to) {
    const results = await db.select({
      status: jobLogs.status,
      count: sql`count(*)`
    }).from(jobLogs).where(and(gte(jobLogs.jobDate, from), lte(jobLogs.jobDate, to))).groupBy(jobLogs.status).orderBy(sql`count(*) DESC`);
    return results.map((r) => ({
      status: r.status || "unknown",
      count: Number(r.count)
    }));
  }
  async getEmployeeProductivity(from, to) {
    const employees = await this.getFieldEmployees();
    const productivity = [];
    for (const emp of employees) {
      const [periodResult] = await db.select({ count: sql`count(*)` }).from(jobLogs).where(and(eq(jobLogs.employeeId, emp.id), gte(jobLogs.jobDate, from), lte(jobLogs.jobDate, to)));
      const [allTimeResult] = await db.select({ count: sql`count(*)` }).from(jobLogs).where(eq(jobLogs.employeeId, emp.id));
      const [lastJob] = await db.select({ jobDate: jobLogs.jobDate }).from(jobLogs).where(eq(jobLogs.employeeId, emp.id)).orderBy(desc(jobLogs.jobDate)).limit(1);
      productivity.push({
        employeeId: emp.id,
        name: emp.name,
        jobsThisPeriod: Number(periodResult?.count || 0),
        jobsAllTime: Number(allTimeResult?.count || 0),
        lastJobDate: lastJob?.jobDate || null,
        isActive: emp.isActive
      });
    }
    return productivity.sort((a, b) => b.jobsThisPeriod - a.jobsThisPeriod);
  }
  async getContractsSummary() {
    const now = /* @__PURE__ */ new Date();
    const endOfWeek = new Date(now);
    endOfWeek.setDate(now.getDate() + 7);
    const [totalActiveResult] = await db.select({ count: sql`count(*)` }).from(serviceContracts).where(eq(serviceContracts.isActive, true));
    const totalActive = Number(totalActiveResult?.count || 0);
    const [dueThisWeekResult] = await db.select({ count: sql`count(*)` }).from(serviceContracts).where(and(
      eq(serviceContracts.isActive, true),
      gte(serviceContracts.nextScheduledDate, now),
      lte(serviceContracts.nextScheduledDate, endOfWeek)
    ));
    const dueThisWeek = Number(dueThisWeekResult?.count || 0);
    const [overdueResult] = await db.select({ count: sql`count(*)` }).from(serviceContracts).where(and(
      eq(serviceContracts.isActive, true),
      lt(serviceContracts.nextScheduledDate, now)
    ));
    const overdue = Number(overdueResult?.count || 0);
    const freqResults = await db.select({
      frequency: serviceContracts.frequency,
      count: sql`count(*)`
    }).from(serviceContracts).where(eq(serviceContracts.isActive, true)).groupBy(serviceContracts.frequency);
    const byFrequency = freqResults.map((r) => ({
      frequency: r.frequency || "monthly",
      count: Number(r.count)
    }));
    return { totalActive, dueThisWeek, overdue, byFrequency };
  }
  async getUpcomingItems() {
    const now = /* @__PURE__ */ new Date();
    const twoWeeksLater = new Date(now);
    twoWeeksLater.setDate(now.getDate() + 14);
    const scheduledJobsResult = await db.select({
      id: jobLogs.id,
      jobDate: jobLogs.jobDate,
      customerName: jobLogs.customerName,
      workPerformed: jobLogs.workPerformed
    }).from(jobLogs).where(and(
      eq(jobLogs.status, "scheduled"),
      gte(jobLogs.jobDate, now),
      lte(jobLogs.jobDate, twoWeeksLater)
    )).orderBy(jobLogs.jobDate);
    const scheduledJobs = scheduledJobsResult.map((j) => ({
      type: "job",
      id: Number(j.id),
      date: new Date(j.jobDate),
      customerName: j.customerName || "Unknown",
      serviceType: j.workPerformed || "Service"
    }));
    const inspectionsResult = await db.select({
      id: inspectionSchedules.id,
      preferredDate: inspectionSchedules.preferredDate,
      firstName: inspectionSchedules.firstName,
      lastName: inspectionSchedules.lastName,
      serviceType: inspectionSchedules.serviceType
    }).from(inspectionSchedules).where(eq(inspectionSchedules.status, "pending")).orderBy(inspectionSchedules.preferredDate);
    const pendingInspections = inspectionsResult.filter((i) => i.preferredDate && new Date(i.preferredDate) <= twoWeeksLater).map((i) => ({
      type: "inspection",
      id: Number(i.id),
      date: new Date(i.preferredDate),
      customerName: `${i.firstName || ""} ${i.lastName || ""}`.trim(),
      serviceType: i.serviceType || "Inspection"
    }));
    const requestsResult = await db.select({
      id: serviceRequests.id,
      scheduledDate: serviceRequests.scheduledDate,
      firstName: serviceRequests.firstName,
      lastName: serviceRequests.lastName,
      serviceType: serviceRequests.serviceType
    }).from(serviceRequests).where(sql`${serviceRequests.status} IN ('pending', 'scheduled')`).orderBy(serviceRequests.scheduledDate);
    const pendingRequests = requestsResult.filter((r) => r.scheduledDate && new Date(r.scheduledDate) <= twoWeeksLater).map((r) => ({
      type: "request",
      id: Number(r.id),
      date: r.scheduledDate ? new Date(r.scheduledDate) : /* @__PURE__ */ new Date(),
      customerName: `${r.firstName || ""} ${r.lastName || ""}`.trim(),
      serviceType: r.serviceType || "Service Request"
    }));
    return { scheduledJobs, pendingInspections, pendingRequests };
  }
  async getTopClients(from, to, limit = 10) {
    const jobWithClients = await db.select({
      clientId: jobLogs.clientId,
      clientName: clients.name,
      jobDate: jobLogs.jobDate
    }).from(jobLogs).leftJoin(clients, eq(jobLogs.clientId, clients.id)).where(and(gte(jobLogs.jobDate, from), lte(jobLogs.jobDate, to), sql`${jobLogs.clientId} IS NOT NULL`));
    const clientMap = /* @__PURE__ */ new Map();
    for (const job of jobWithClients) {
      if (!job.clientId) continue;
      const existing = clientMap.get(job.clientId);
      if (existing) {
        existing.jobs++;
        if (job.jobDate && (!existing.lastJob || new Date(job.jobDate) > existing.lastJob)) {
          existing.lastJob = new Date(job.jobDate);
        }
      } else {
        clientMap.set(job.clientId, {
          name: job.clientName || "Unknown",
          jobs: 1,
          lastJob: job.jobDate ? new Date(job.jobDate) : null
        });
      }
    }
    const activeContractClients = await db.select({ customerId: serviceContracts.customerId }).from(serviceContracts).where(eq(serviceContracts.isActive, true));
    const activeClientIds = new Set(activeContractClients.map((c) => c.customerId));
    const result = [];
    for (const [clientId, data] of clientMap) {
      result.push({
        clientId,
        clientName: data.name,
        totalJobs: data.jobs,
        lastJobDate: data.lastJob,
        hasActiveContract: activeClientIds.has(clientId)
      });
    }
    return result.sort((a, b) => b.totalJobs - a.totalJobs).slice(0, limit);
  }
  async getContactSubmissionsSummary(from, to) {
    const [countResult] = await db.select({ count: sql`count(*)` }).from(contactSubmissions).where(and(gte(contactSubmissions.createdAt, from), lte(contactSubmissions.createdAt, to)));
    const recentResult = await db.select({
      id: contactSubmissions.id,
      firstName: contactSubmissions.firstName,
      lastName: contactSubmissions.lastName,
      serviceType: contactSubmissions.serviceType,
      city: contactSubmissions.city,
      createdAt: contactSubmissions.createdAt
    }).from(contactSubmissions).orderBy(desc(contactSubmissions.createdAt)).limit(5);
    return {
      count: Number(countResult?.count || 0),
      recent: recentResult.map((r) => ({
        id: Number(r.id),
        firstName: r.firstName || "",
        lastName: r.lastName || "",
        serviceType: r.serviceType || "",
        city: r.city || "",
        createdAt: new Date(r.createdAt)
      }))
    };
  }
  // ==========================================
  // Route Optimization (SC-ROUTE-001)
  // ==========================================
  async getGeocache(address) {
    const normalizedAddress = address.toLowerCase().trim();
    const [result] = await db.select().from(geocache).where(eq(geocache.addressText, normalizedAddress));
    return result;
  }
  async setGeocache(entry) {
    const normalizedAddress = entry.addressText.toLowerCase().trim();
    const [result] = await db.insert(geocache).values({
      ...entry,
      addressText: normalizedAddress
    }).onConflictDoUpdate({
      target: geocache.addressText,
      set: {
        lat: entry.lat,
        lng: entry.lng,
        geocodedAt: /* @__PURE__ */ new Date(),
        source: entry.source || "google"
      }
    }).returning();
    return result;
  }
  async getDailyRoute(employeeId, routeDate) {
    const dateStr = routeDate.toISOString().split("T")[0];
    const [result] = await db.select().from(dailyRoutes).where(
      and(
        eq(dailyRoutes.employeeId, employeeId),
        eq(dailyRoutes.routeDate, dateStr)
      )
    );
    return result;
  }
  async createOrUpdateDailyRoute(route) {
    const dateStr = route.routeDate.toString().split("T")[0];
    const existing = await this.getDailyRoute(route.employeeId, new Date(route.routeDate));
    if (existing) {
      const [result] = await db.update(dailyRoutes).set({
        startAddress: route.startAddress,
        optimizedStopOrder: route.optimizedStopOrder,
        googleMapsUrl: route.googleMapsUrl,
        totalDistanceMeters: route.totalDistanceMeters,
        totalDurationSeconds: route.totalDurationSeconds,
        generatedAt: /* @__PURE__ */ new Date(),
        generatedBy: route.generatedBy
      }).where(eq(dailyRoutes.id, existing.id)).returning();
      return result;
    } else {
      const [result] = await db.insert(dailyRoutes).values({
        employeeId: route.employeeId,
        routeDate: route.routeDate,
        startAddress: route.startAddress,
        optimizedStopOrder: route.optimizedStopOrder,
        googleMapsUrl: route.googleMapsUrl,
        totalDistanceMeters: route.totalDistanceMeters,
        totalDurationSeconds: route.totalDurationSeconds,
        generatedBy: route.generatedBy
      }).returning();
      return result;
    }
  }
  async getJobLogsForRoute(employeeId, routeDate) {
    const dateStart = new Date(routeDate);
    dateStart.setHours(0, 0, 0, 0);
    const dateEnd = new Date(routeDate);
    dateEnd.setHours(23, 59, 59, 999);
    const result = await db.select().from(jobLogs).where(
      and(
        eq(jobLogs.employeeId, employeeId),
        gte(jobLogs.jobDate, dateStart),
        lte(jobLogs.jobDate, dateEnd),
        sql`${jobLogs.siteAddress} IS NOT NULL`,
        sql`${jobLogs.siteAddress} != ''`,
        or(
          eq(jobLogs.status, "scheduled"),
          eq(jobLogs.status, "in_progress")
        )
      )
    ).orderBy(jobLogs.jobDate);
    return result;
  }
  // ==========================================
  // Admin Job Scheduling Operations (SC-SCHEDULING-001)
  // ==========================================
  async createScheduledJob(jobData) {
    const [jobLog] = await db.insert(jobLogs).values({
      employeeId: jobData.employeeId,
      customerName: jobData.customerName,
      clientId: jobData.clientId || null,
      siteLocation: jobData.siteLocation,
      siteAddress: jobData.siteAddress || "",
      servicedArea: jobData.servicedArea,
      workPerformed: jobData.workPerformed,
      jobDate: jobData.jobDate,
      status: "scheduled",
      customFields: jobData.customFields,
      priority: jobData.priority || "medium",
      scheduledBy: jobData.scheduledBy,
      scheduledEndTime: jobData.scheduledEndTime || null
    }).returning();
    await this.createJobScheduleLog({
      jobLogId: jobLog.id,
      action: "created",
      performedBy: jobData.scheduledBy,
      previousValue: null,
      newValue: {
        employeeId: jobLog.employeeId,
        jobDate: jobLog.jobDate,
        status: "scheduled",
        priority: jobLog.priority || "medium"
      }
    });
    return jobLog;
  }
  async updateJobScheduling(id, updates, performedBy) {
    const existing = await this.getJobLog(id);
    if (!existing) {
      throw new Error("Job log not found");
    }
    const updateValues = { ...updates };
    if (updates.adminNotes !== void 0) {
      updateValues.adminNotes = updates.adminNotes;
    }
    const [updated] = await db.update(jobLogs).set(updateValues).where(eq(jobLogs.id, id)).returning();
    const previousValue = {};
    const newValue = {};
    if (updates.priority !== void 0) {
      previousValue.priority = existing.priority;
      newValue.priority = updates.priority;
    }
    if (updates.adminNotes !== void 0) {
      previousValue.adminNotes = existing.adminNotes;
      newValue.adminNotes = updates.adminNotes;
    }
    if (updates.scheduledEndTime !== void 0) {
      previousValue.scheduledEndTime = existing.scheduledEndTime;
      newValue.scheduledEndTime = updates.scheduledEndTime;
    }
    if (updates.employeeId !== void 0) {
      previousValue.employeeId = existing.employeeId;
      newValue.employeeId = updates.employeeId;
    }
    if (updates.jobDate !== void 0) {
      previousValue.jobDate = existing.jobDate;
      newValue.jobDate = updates.jobDate;
    }
    await this.createJobScheduleLog({
      jobLogId: id,
      action: "updated",
      performedBy,
      previousValue: Object.keys(previousValue).length > 0 ? previousValue : null,
      newValue: Object.keys(newValue).length > 0 ? newValue : null
    });
    return updated;
  }
  async assignJobToTech(jobLogId, employeeId, performedBy) {
    const existing = await this.getJobLog(jobLogId);
    if (!existing) {
      throw new Error("Job log not found");
    }
    const previousEmployeeId = existing.employeeId;
    const [updated] = await db.update(jobLogs).set({ employeeId }).where(eq(jobLogs.id, jobLogId)).returning();
    await this.createJobScheduleLog({
      jobLogId,
      action: employeeId === null ? "unassigned" : "assigned",
      performedBy,
      previousValue: { employeeId: previousEmployeeId },
      newValue: { employeeId }
    });
    return updated;
  }
  async rescheduleJob(jobLogId, newJobDate, performedBy) {
    const existing = await this.getJobLog(jobLogId);
    if (!existing) {
      throw new Error("Job log not found");
    }
    const previousJobDate = existing.jobDate;
    const [updated] = await db.update(jobLogs).set({ jobDate: newJobDate }).where(eq(jobLogs.id, jobLogId)).returning();
    await this.createJobScheduleLog({
      jobLogId,
      action: "rescheduled",
      performedBy,
      previousValue: { jobDate: previousJobDate },
      newValue: { jobDate: newJobDate }
    });
    return updated;
  }
  async cancelScheduledJob(jobLogId, performedBy, reason) {
    const existing = await this.getJobLog(jobLogId);
    if (!existing) {
      throw new Error("Job log not found");
    }
    if (existing.status === "completed" || existing.status === "paid" || existing.status === "invoiced") {
      throw new Error("Cannot cancel a completed job");
    }
    const [updated] = await db.update(jobLogs).set({
      status: "cancelled",
      cancelledAt: /* @__PURE__ */ new Date(),
      cancelledBy: performedBy,
      adminNotes: reason ? `${existing.adminNotes || ""}

Cancellation reason: ${reason}`.trim() : existing.adminNotes
    }).where(eq(jobLogs.id, jobLogId)).returning();
    await this.createJobScheduleLog({
      jobLogId,
      action: "cancelled",
      performedBy,
      previousValue: { status: existing.status },
      newValue: { status: "cancelled", reason }
    });
    return updated;
  }
  async getScheduledJobs(filters) {
    const conditions = [];
    if (filters?.employeeId) {
      conditions.push(eq(jobLogs.employeeId, filters.employeeId));
    }
    if (filters?.dateFrom) {
      conditions.push(gte(jobLogs.jobDate, filters.dateFrom));
    }
    if (filters?.dateTo) {
      conditions.push(lte(jobLogs.jobDate, filters.dateTo));
    }
    if (filters?.status && filters.status !== "all") {
      conditions.push(eq(jobLogs.status, filters.status));
    } else if (!filters?.status) {
      conditions.push(or(eq(jobLogs.status, "scheduled"), eq(jobLogs.status, "in_progress")));
    }
    if (conditions.length > 0) {
      return await db.select().from(jobLogs).where(and(...conditions)).orderBy(jobLogs.jobDate);
    }
    return await db.select().from(jobLogs).orderBy(jobLogs.jobDate);
  }
  async getUnassignedScheduledJobs(filters) {
    const conditions = [isNull(jobLogs.employeeId)];
    if (filters?.dateFrom) {
      conditions.push(gte(jobLogs.jobDate, filters.dateFrom));
    }
    if (filters?.dateTo) {
      conditions.push(lte(jobLogs.jobDate, filters.dateTo));
    }
    if (filters?.status) {
      conditions.push(eq(jobLogs.status, filters.status));
    } else {
      conditions.push(eq(jobLogs.status, "scheduled"));
    }
    return await db.select().from(jobLogs).where(and(...conditions)).orderBy(jobLogs.jobDate);
  }
  async claimScheduledJob(jobLogId, employeeId) {
    const existing = await this.getJobLog(jobLogId);
    if (!existing) {
      throw new Error("Job log not found");
    }
    if (existing.employeeId !== null) {
      throw new Error("This job is already assigned to someone else");
    }
    if (existing.status !== "scheduled") {
      throw new Error("Job is not in scheduled status");
    }
    const [updated] = await db.update(jobLogs).set({ employeeId }).where(eq(jobLogs.id, jobLogId)).returning();
    await this.createJobScheduleLog({
      jobLogId,
      action: "claimed",
      performedBy: null,
      previousValue: { employeeId: null },
      newValue: { employeeId, fieldEmployeeId: employeeId }
    });
    return updated;
  }
  async startScheduledJob(jobLogId, employeeId) {
    const existing = await this.getJobLog(jobLogId);
    if (!existing) {
      throw new Error("Job log not found");
    }
    if (existing.employeeId !== employeeId) {
      throw new Error("This job is not assigned to you");
    }
    if (existing.status !== "scheduled") {
      throw new Error("Job is not in scheduled status");
    }
    const [updated] = await db.update(jobLogs).set({ status: "in_progress" }).where(eq(jobLogs.id, jobLogId)).returning();
    await this.createJobScheduleLog({
      jobLogId,
      action: "started",
      performedBy: null,
      previousValue: { status: existing.status },
      newValue: { status: "in_progress", fieldEmployeeId: employeeId }
    });
    return updated;
  }
  async completeScheduledJob(jobLogId, employeeId, workPerformed) {
    const existing = await this.getJobLog(jobLogId);
    if (!existing) {
      throw new Error("Job log not found");
    }
    if (existing.employeeId !== employeeId) {
      throw new Error("This job is not assigned to you");
    }
    if (existing.status !== "in_progress" && existing.status !== "scheduled") {
      throw new Error("Job must be in progress or scheduled to be completed");
    }
    const [updated] = await db.update(jobLogs).set({
      status: "completed",
      workPerformed: workPerformed || existing.workPerformed
    }).where(eq(jobLogs.id, jobLogId)).returning();
    await this.createJobScheduleLog({
      jobLogId,
      action: "completed",
      performedBy: null,
      previousValue: { status: existing.status },
      newValue: { status: "completed", workPerformed, fieldEmployeeId: employeeId }
    });
    return updated;
  }
  async getTodaysScheduledJobs(employeeId) {
    const today = /* @__PURE__ */ new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return await db.select().from(jobLogs).where(
      and(
        eq(jobLogs.employeeId, employeeId),
        gte(jobLogs.jobDate, today),
        lt(jobLogs.jobDate, tomorrow),
        or(
          eq(jobLogs.status, "scheduled"),
          eq(jobLogs.status, "in_progress")
        )
      )
    ).orderBy(jobLogs.jobDate);
  }
  // ==========================================
  // Job Schedule Audit Log Operations
  // ==========================================
  async createJobScheduleLog(log2) {
    const [result] = await db.insert(jobScheduleLogs).values({
      jobLogId: log2.jobLogId,
      action: log2.action,
      performedBy: log2.performedBy || null,
      previousValue: log2.previousValue || null,
      newValue: log2.newValue || null
    }).returning();
    return result;
  }
  async getJobScheduleLogs(jobLogId) {
    return await db.select().from(jobScheduleLogs).where(eq(jobScheduleLogs.jobLogId, jobLogId)).orderBy(jobScheduleLogs.createdAt);
  }
};
var storage = new DatabaseStorage();

// server/routes.ts
init_email();
import { eq as eq2 } from "drizzle-orm";
import { z as z2 } from "zod";
import session from "express-session";

// server/invoice-pdf.ts
import { jsPDF } from "jspdf";
import "jspdf-autotable";
function formatDate(d) {
  if (!d) return "\u2014";
  try {
    const date2 = new Date(typeof d === "string" ? d.slice(0, 10) + "T12:00:00" : d);
    return date2.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  } catch {
    return "\u2014";
  }
}
function formatMaterials(materials) {
  if (!materials) return "";
  if (materials.type === "product" && materials.productName) {
    let s = materials.productName;
    if (materials.volume !== "" && materials.volume !== void 0) {
      s += ` \u2014 ${materials.volume} ${materials.unit || "oz"}`;
    }
    return `Product: ${s}`;
  }
  if (materials.type === "supplies" && materials.items?.length) {
    const items = materials.items.map(
      (i) => `${i.name}${i.quantity !== "" ? ` (\xD7${i.quantity})` : ""}`
    ).join(", ");
    return `Supplies: ${items}`;
  }
  return "";
}
function generateInvoicePdf(invoice) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  let y = margin;
  doc.setFillColor(30, 58, 138);
  doc.rect(0, 0, pageWidth, 38, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("Absolute Pest Services", margin, 16);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("(484) 643-2225  |  rob@absolutepestservices.com  |  absolutepestservices.com", margin, 24);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(`INVOICE ${invoice.invoiceNumber}`, pageWidth - margin, 16, { align: "right" });
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`Status: ${invoice.status.toUpperCase()}`, pageWidth - margin, 24, { align: "right" });
  y = 45;
  doc.setTextColor(0, 0, 0);
  const col1X = margin;
  const col2X = pageWidth / 2 + 5;
  doc.setFontSize(8);
  doc.setTextColor(107, 114, 128);
  doc.text("BILL TO", col1X, y);
  doc.text("INVOICE DETAILS", col2X, y);
  y += 5;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(invoice.client?.name || "\u2014", col1X, y);
  y += 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  if (invoice.client?.address) {
    const addrLines = doc.splitTextToSize(invoice.client.address, 80);
    doc.text(addrLines, col1X, y);
    y += addrLines.length * 4;
  }
  if (invoice.client?.phone) {
    doc.text(invoice.client.phone, col1X, y);
    y += 4;
  }
  if (invoice.client?.email) {
    doc.text(invoice.client.email, col1X, y);
    y += 4;
  }
  if (invoice.client?.propertyType) {
    doc.setFontSize(8);
    doc.setTextColor(107, 114, 128);
    doc.text(`Property: ${invoice.client.propertyType.charAt(0).toUpperCase() + invoice.client.propertyType.slice(1)}`, col1X, y);
    y += 4;
  }
  let detailY = 50;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(9);
  const details = [
    ["Invoice Date:", formatDate(invoice.issueDate)],
    ["Due Date:", formatDate(invoice.dueDate)],
    ["Total Due:", `$${parseFloat(invoice.total).toFixed(2)}`]
  ];
  for (const [label, value] of details) {
    doc.setFont("helvetica", "normal");
    doc.setTextColor(107, 114, 128);
    doc.text(label, col2X, detailY);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", label === "Total Due:" ? "bold" : "normal");
    doc.text(value, col2X + 28, detailY);
    detailY += 5;
  }
  y = Math.max(y, detailY) + 6;
  doc.setDrawColor(229, 231, 235);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;
  const tableBody = [];
  for (const item of invoice.lineItems) {
    let desc2 = item.description;
    if (item.serviceDate || item.technicianName || item.serviceType) {
      const meta = [];
      if (item.serviceDate) meta.push(`Date: ${formatDate(item.serviceDate)}`);
      if (item.technicianName) meta.push(`Tech: ${item.technicianName}`);
      if (item.serviceType) meta.push(`Service: ${item.serviceType}`);
      if (item.servicedArea) meta.push(`Area: ${item.servicedArea}`);
      if (item.serviceAddress) meta.push(`Location: ${item.serviceAddress}`);
      desc2 = meta.join("\n") + "\n\n" + desc2;
    }
    const matStr = formatMaterials(item.materials);
    if (matStr) desc2 += "\n" + matStr;
    tableBody.push([
      desc2,
      parseFloat(item.quantity).toString(),
      `$${parseFloat(item.unitRate).toFixed(2)}`,
      `${parseFloat(item.taxRate)}%`,
      `$${parseFloat(item.lineTotal).toFixed(2)}`
    ]);
  }
  doc.autoTable({
    startY: y,
    head: [["Description", "Qty", "Rate", "Tax", "Total"]],
    body: tableBody,
    margin: { left: margin, right: margin },
    headStyles: { fillColor: [243, 244, 246], textColor: [31, 41, 55], fontStyle: "bold", fontSize: 8 },
    bodyStyles: { fontSize: 8, cellPadding: 3, textColor: [55, 65, 81] },
    columnStyles: {
      0: { cellWidth: "auto" },
      1: { cellWidth: 15, halign: "center" },
      2: { cellWidth: 22, halign: "right" },
      3: { cellWidth: 18, halign: "right" },
      4: { cellWidth: 25, halign: "right" }
    },
    theme: "grid",
    styles: { lineColor: [229, 231, 235], lineWidth: 0.3 }
  });
  y = doc.lastAutoTable.finalY + 8;
  const totalsX = pageWidth - margin - 60;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(107, 114, 128);
  doc.text("Subtotal:", totalsX, y);
  doc.setTextColor(0, 0, 0);
  doc.text(`$${parseFloat(invoice.subtotal).toFixed(2)}`, pageWidth - margin, y, { align: "right" });
  y += 5;
  doc.setTextColor(107, 114, 128);
  doc.text("Tax:", totalsX, y);
  doc.setTextColor(0, 0, 0);
  doc.text(`$${parseFloat(invoice.taxTotal).toFixed(2)}`, pageWidth - margin, y, { align: "right" });
  y += 6;
  doc.setDrawColor(229, 231, 235);
  doc.line(totalsX, y - 2, pageWidth - margin, y - 2);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 58, 138);
  doc.text("Total Due:", totalsX, y + 3);
  doc.text(`$${parseFloat(invoice.total).toFixed(2)}`, pageWidth - margin, y + 3, { align: "right" });
  y += 12;
  if (invoice.notes) {
    doc.setDrawColor(229, 231, 235);
    doc.line(margin, y, pageWidth - margin, y);
    y += 5;
    doc.setFontSize(8);
    doc.setTextColor(107, 114, 128);
    doc.text("NOTES", margin, y);
    y += 4;
    doc.setTextColor(55, 65, 81);
    doc.setFont("helvetica", "normal");
    const noteLines = doc.splitTextToSize(invoice.notes, pageWidth - margin * 2);
    doc.text(noteLines, margin, y);
    y += noteLines.length * 3.5 + 4;
  }
  const footerY = doc.internal.pageSize.getHeight() - 20;
  doc.setDrawColor(229, 231, 235);
  doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 58, 138);
  doc.text("Thank you for choosing Absolute Pest Services!", pageWidth / 2, footerY, { align: "center" });
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(107, 114, 128);
  doc.text("Questions? Call (484) 643-2225 or email rob@absolutepestservices.com", pageWidth / 2, footerY + 5, { align: "center" });
  doc.text(`Please reference invoice ${invoice.invoiceNumber} when making payment.`, pageWidth / 2, footerY + 10, { align: "center" });
  const arrayBuffer = doc.output("arraybuffer");
  return Buffer.from(arrayBuffer);
}

// server/reviews.ts
init_email();
async function scheduleReviewRequestForJobLog(jobLogId) {
  try {
    const settings = await storage.getReviewSettings();
    if (!settings.enabled) {
      return { success: false, message: "Review requests are disabled" };
    }
    if (!settings.triggerJobCompletion) {
      return { success: false, message: "Job completion trigger is disabled" };
    }
    const jobLog = await storage.getJobLogById(jobLogId);
    if (!jobLog) {
      return { success: false, message: "Job log not found" };
    }
    const client = jobLog.clientId ? await storage.getClientById(jobLog.clientId) : null;
    if (!client) {
      return { success: false, message: "Client not found" };
    }
    if (client.reviewOptOut) {
      return { success: false, message: "Client has opted out of review requests" };
    }
    if (!client.email) {
      return { success: false, message: "Client has no email address" };
    }
    const existingLog = await storage.getReviewRequestLogByJobLogId(jobLogId);
    if (existingLog) {
      return { success: false, message: "Review request already exists for this job log", existingLogId: existingLog.id };
    }
    const hasRecentRequest = await storage.hasRecentReviewRequest(client.id, settings.cooldownDays);
    if (hasRecentRequest) {
      await storage.createReviewRequestLog({
        clientId: client.id,
        jobLogId,
        invoiceId: null,
        recipientEmail: client.email,
        triggerType: "job_completion",
        status: "skipped",
        scheduledSendAt: /* @__PURE__ */ new Date()
      });
      return { success: false, message: "Client recently received a review request (cooldown period)" };
    }
    const countThisYear = await storage.countReviewRequestsSentThisYear(client.id);
    if (countThisYear >= 6) {
      await storage.createReviewRequestLog({
        clientId: client.id,
        jobLogId,
        invoiceId: null,
        recipientEmail: client.email,
        triggerType: "job_completion",
        status: "skipped",
        scheduledSendAt: /* @__PURE__ */ new Date()
      });
      return { success: false, message: "Maximum review requests per year reached" };
    }
    const scheduledSendAt = /* @__PURE__ */ new Date();
    scheduledSendAt.setHours(scheduledSendAt.getHours() + settings.delayHours);
    await storage.createReviewRequestLog({
      clientId: client.id,
      jobLogId,
      invoiceId: null,
      recipientEmail: client.email,
      triggerType: "job_completion",
      status: "pending",
      scheduledSendAt
    });
    return { success: true, message: "Review request scheduled" };
  } catch (error) {
    console.error("[ReviewRequest] Error scheduling review request for job log:", error);
    return { success: false, message: "Internal error" };
  }
}
async function scheduleReviewRequestForInvoice(invoiceId) {
  try {
    const settings = await storage.getReviewSettings();
    if (!settings.enabled) {
      return { success: false, message: "Review requests are disabled" };
    }
    if (!settings.triggerInvoicePaid) {
      return { success: false, message: "Invoice paid trigger is disabled" };
    }
    const invoice = await storage.getInvoiceById(invoiceId);
    if (!invoice) {
      return { success: false, message: "Invoice not found" };
    }
    const client = await storage.getClientById(invoice.clientId);
    if (!client) {
      return { success: false, message: "Client not found" };
    }
    if (client.reviewOptOut) {
      return { success: false, message: "Client has opted out of review requests" };
    }
    if (!client.email) {
      return { success: false, message: "Client has no email address" };
    }
    const existingLog = await storage.getReviewRequestLogByInvoiceId(invoiceId);
    if (existingLog) {
      return { success: false, message: "Review request already exists for this invoice", existingLogId: existingLog.id };
    }
    const hasRecentRequest = await storage.hasRecentReviewRequest(client.id, settings.cooldownDays);
    if (hasRecentRequest) {
      await storage.createReviewRequestLog({
        clientId: client.id,
        jobLogId: null,
        invoiceId,
        recipientEmail: client.email,
        triggerType: "invoice_paid",
        status: "skipped",
        scheduledSendAt: /* @__PURE__ */ new Date()
      });
      return { success: false, message: "Client recently received a review request (cooldown period)" };
    }
    const countThisYear = await storage.countReviewRequestsSentThisYear(client.id);
    if (countThisYear >= 6) {
      await storage.createReviewRequestLog({
        clientId: client.id,
        jobLogId: null,
        invoiceId,
        recipientEmail: client.email,
        triggerType: "invoice_paid",
        status: "skipped",
        scheduledSendAt: /* @__PURE__ */ new Date()
      });
      return { success: false, message: "Maximum review requests per year reached" };
    }
    const scheduledSendAt = /* @__PURE__ */ new Date();
    scheduledSendAt.setHours(scheduledSendAt.getHours() + settings.delayHours);
    await storage.createReviewRequestLog({
      clientId: client.id,
      jobLogId: invoice.jobLogId || null,
      invoiceId,
      recipientEmail: client.email,
      triggerType: "invoice_paid",
      status: "pending",
      scheduledSendAt
    });
    return { success: true, message: "Review request scheduled" };
  } catch (error) {
    console.error("[ReviewRequest] Error scheduling review request for invoice:", error);
    return { success: false, message: "Internal error" };
  }
}
async function dispatchPendingReviewRequests() {
  const settings = await storage.getReviewSettings();
  if (!settings.enabled) {
    console.log("[ReviewRequests] Review requests are disabled, skipping");
    return 0;
  }
  const pendingRequests = await storage.getPendingReviewRequests();
  if (pendingRequests.length === 0) {
    return 0;
  }
  let sentCount = 0;
  const maxAttempts = 3;
  for (const request of pendingRequests) {
    try {
      const client = request.clientId ? await storage.getClientById(request.clientId) : null;
      if (client?.reviewOptOut) {
        await storage.updateReviewRequestLog(request.id, { status: "skipped" });
        continue;
      }
      let jobLog = null;
      if (request.jobLogId) {
        jobLog = await storage.getJobLogById(request.jobLogId);
      }
      const customerName = client?.name || jobLog?.customerName || "Valued Customer";
      const serviceDescription = jobLog?.workPerformed ? jobLog.workPerformed.length > 100 ? jobLog.workPerformed.substring(0, 100) + "..." : jobLog.workPerformed : "Pest control service";
      const jobDate = jobLog?.jobDate || /* @__PURE__ */ new Date();
      const siteLocation = jobLog?.siteLocation || "";
      const emailData = {
        recipientEmail: request.recipientEmail,
        customerName,
        serviceDescription,
        jobDate,
        siteLocation,
        googleReviewLink: settings.googleReviewLink,
        customMessage: settings.customMessage || void 0
      };
      const success = await sendReviewRequestEmail(emailData);
      if (success) {
        await storage.updateReviewRequestLog(request.id, {
          status: "sent",
          sentAt: /* @__PURE__ */ new Date(),
          attemptCount: request.attemptCount + 1
        });
        sentCount++;
        console.log(`[ReviewRequests] Sent review request to ${request.recipientEmail}`);
      } else {
        const newAttemptCount = request.attemptCount + 1;
        if (newAttemptCount >= maxAttempts) {
          await storage.updateReviewRequestLog(request.id, {
            status: "failed",
            attemptCount: newAttemptCount,
            errorMessage: "Max retry attempts reached"
          });
          console.error(`[ReviewRequests] Failed to send to ${request.recipientEmail}: Max attempts reached`);
        } else {
          await storage.updateReviewRequestLog(request.id, {
            attemptCount: newAttemptCount,
            errorMessage: "Send failed, will retry"
          });
          console.error(`[ReviewRequests] Failed to send to ${request.recipientEmail}, will retry`);
        }
      }
    } catch (error) {
      console.error(`[ReviewRequests] Error processing review request ${request.id}:`, error);
      const newAttemptCount = request.attemptCount + 1;
      if (newAttemptCount >= maxAttempts) {
        await storage.updateReviewRequestLog(request.id, {
          status: "failed",
          attemptCount: newAttemptCount,
          errorMessage: error.message || "Unknown error"
        });
      } else {
        await storage.updateReviewRequestLog(request.id, {
          attemptCount: newAttemptCount,
          errorMessage: error.message || "Unknown error"
        });
      }
    }
  }
  return sentCount;
}
async function sendReviewRequestNow(jobLogId) {
  try {
    const settings = await storage.getReviewSettings();
    if (!settings.enabled) {
      return { success: false, message: "Review requests are disabled" };
    }
    const jobLog = await storage.getJobLogById(jobLogId);
    if (!jobLog) {
      return { success: false, message: "Job log not found" };
    }
    const client = jobLog.clientId ? await storage.getClientById(jobLog.clientId) : null;
    if (!client) {
      return { success: false, message: "Client not found" };
    }
    if (client.reviewOptOut) {
      return { success: false, message: "Client has opted out of review requests" };
    }
    if (!client.email) {
      return { success: false, message: "Client has no email address" };
    }
    const existingLog = await storage.getReviewRequestLogByJobLogId(jobLogId);
    if (existingLog && existingLog.status === "sent") {
      return { success: false, message: "Review request already sent for this job" };
    }
    if (existingLog) {
      await storage.updateReviewRequestLog(existingLog.id, {
        status: "pending",
        scheduledSendAt: /* @__PURE__ */ new Date()
      });
    } else {
      await storage.createReviewRequestLog({
        clientId: client.id,
        jobLogId,
        invoiceId: null,
        recipientEmail: client.email,
        triggerType: "manual",
        status: "pending",
        scheduledSendAt: /* @__PURE__ */ new Date()
      });
    }
    const customerName = client.name || jobLog.customerName || "Valued Customer";
    const serviceDescription = jobLog.workPerformed ? jobLog.workPerformed.length > 100 ? jobLog.workPerformed.substring(0, 100) + "..." : jobLog.workPerformed : "Pest control service";
    const emailData = {
      recipientEmail: client.email,
      customerName,
      serviceDescription,
      jobDate: jobLog.jobDate,
      siteLocation: jobLog.siteLocation,
      googleReviewLink: settings.googleReviewLink,
      customMessage: settings.customMessage || void 0
    };
    const success = await sendReviewRequestEmail(emailData);
    const log2 = existingLog || await storage.getReviewRequestLogByJobLogId(jobLogId);
    if (log2) {
      await storage.updateReviewRequestLog(log2.id, {
        status: success ? "sent" : "failed",
        sentAt: success ? /* @__PURE__ */ new Date() : null,
        attemptCount: (log2.attemptCount || 0) + 1,
        errorMessage: success ? null : "Manual send failed"
      });
    }
    return success ? { success: true, message: "Review request sent successfully" } : { success: false, message: "Failed to send review request email" };
  } catch (error) {
    console.error("[ReviewRequest] Error sending manual review request:", error);
    return { success: false, message: "Internal error" };
  }
}

// server/invoiceStateMachine.ts
var ALLOWED_TRANSITIONS = {
  draft: ["sent", "void"],
  sent: ["viewed", "overdue", "paid", "void"],
  viewed: ["overdue", "paid", "void"],
  overdue: ["paid", "void"],
  paid: [],
  // terminal state
  void: []
  // terminal state
};
function assertTransition(from, to) {
  const allowed = ALLOWED_TRANSITIONS[from];
  if (!allowed.includes(to)) {
    throw new Error(`Invalid status transition: ${from} \u2192 ${to}`);
  }
}

// server/routes.ts
import Parser from "rss-parser";

// server/turnstile.ts
async function verifyTurnstile(token) {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;
  if (!secretKey) {
    console.warn("TURNSTILE_SECRET_KEY not configured, skipping CAPTCHA verification");
    return true;
  }
  if (!token) {
    console.error("No CAPTCHA token provided");
    return false;
  }
  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        secret: secretKey,
        response: token
      })
    });
    const data = await response.json();
    if (!data.success) {
      console.error("Turnstile verification failed:", data["error-codes"]);
      return false;
    }
    return true;
  } catch (error) {
    console.error("Error verifying Turnstile token:", error);
    return false;
  }
}

// server/cloudinary.ts
import { v2 as cloudinary } from "cloudinary";
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// server/routes.ts
import jsPDF2 from "jspdf";
import autoTable from "jspdf-autotable";
import path from "path";
import fs from "fs";
async function registerRoutes(app2) {
  const isProduction = process.env.NODE_ENV === "production";
  if (isProduction) {
    app2.set("trust proxy", 1);
  }
  app2.use(session({
    secret: process.env.SESSION_SECRET || "your-secret-key-change-in-production",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: isProduction,
      httpOnly: true,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1e3
      // 24 hours
    }
  }));
  const requireAuth = (req, res, next) => {
    if (!req.session.userId) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }
    next();
  };
  const requireAdmin = async (req, res, next) => {
    if (!req.session.userId) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }
    try {
      const user = await storage.getUser(req.session.userId);
      if (!user || user.role !== "admin") {
        return res.status(403).json({ success: false, message: "Admin access required" });
      }
      next();
    } catch (error) {
      console.error("Error checking admin status:", error);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  };
  const parseDateRange = (req) => {
    const now = /* @__PURE__ */ new Date();
    let from, to;
    if (req.query.from && req.query.to) {
      from = new Date(req.query.from);
      to = new Date(req.query.to);
    } else {
      from = new Date(now.getFullYear(), now.getMonth() - 11, 1);
      to = now;
    }
    return { from, to };
  };
  app2.get("/api/admin/analytics/overview", requireAdmin, async (req, res) => {
    try {
      const { from, to } = parseDateRange(req);
      const overview = await storage.getAnalyticsOverview(from, to);
      res.json({ success: true, overview });
    } catch (error) {
      console.error("Error fetching analytics overview:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  app2.get("/api/admin/analytics/jobs-over-time", requireAdmin, async (req, res) => {
    try {
      const { from, to } = parseDateRange(req);
      const groupBy = req.query.groupBy || "month";
      const data = await storage.getJobsOverTime(from, to, groupBy);
      res.json({ success: true, data });
    } catch (error) {
      console.error("Error fetching jobs over time:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  app2.get("/api/admin/analytics/jobs-by-area", requireAdmin, async (req, res) => {
    try {
      const { from, to } = parseDateRange(req);
      const data = await storage.getJobsByArea(from, to);
      res.json({ success: true, data });
    } catch (error) {
      console.error("Error fetching jobs by area:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  app2.get("/api/admin/analytics/jobs-by-status", requireAdmin, async (req, res) => {
    try {
      const { from, to } = parseDateRange(req);
      const data = await storage.getJobsByStatus(from, to);
      res.json({ success: true, data });
    } catch (error) {
      console.error("Error fetching jobs by status:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  app2.get("/api/admin/analytics/employee-productivity", requireAdmin, async (req, res) => {
    try {
      const { from, to } = parseDateRange(req);
      const data = await storage.getEmployeeProductivity(from, to);
      res.json({ success: true, data });
    } catch (error) {
      console.error("Error fetching employee productivity:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  app2.get("/api/admin/analytics/contracts-summary", requireAdmin, async (req, res) => {
    try {
      const data = await storage.getContractsSummary();
      res.json({ success: true, data });
    } catch (error) {
      console.error("Error fetching contracts summary:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  app2.get("/api/admin/analytics/upcoming", requireAdmin, async (req, res) => {
    try {
      const data = await storage.getUpcomingItems();
      res.json({ success: true, data });
    } catch (error) {
      console.error("Error fetching upcoming items:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  app2.get("/api/admin/analytics/top-clients", requireAdmin, async (req, res) => {
    try {
      const { from, to } = parseDateRange(req);
      const limit = req.query.limit ? parseInt(req.query.limit) : 10;
      const data = await storage.getTopClients(from, to, limit);
      res.json({ success: true, data });
    } catch (error) {
      console.error("Error fetching top clients:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  app2.get("/api/admin/analytics/contact-submissions", requireAdmin, async (req, res) => {
    try {
      const { from, to } = parseDateRange(req);
      const data = await storage.getContactSubmissionsSummary(from, to);
      res.json({ success: true, data });
    } catch (error) {
      console.error("Error fetching contact submissions:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  app2.post("/api/auth/register", async (req, res) => {
    try {
      const validatedData = registerSchema.parse(req.body);
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "User with this email already exists"
        });
      }
      const user = await storage.createUser({
        email: validatedData.email,
        password: validatedData.password,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        phone: validatedData.phone,
        address: validatedData.address
      });
      req.session.userId = user.id;
      res.json({
        success: true,
        message: "Account created successfully",
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          address: user.address,
          role: user.role
        }
      });
    } catch (error) {
      if (error instanceof z2.ZodError) {
        res.status(400).json({
          success: false,
          message: "Invalid registration data",
          errors: error.errors
        });
      } else {
        console.error("Error during registration:", error);
        res.status(500).json({
          success: false,
          message: "Internal server error"
        });
      }
    }
  });
  app2.post("/api/auth/login", async (req, res) => {
    try {
      const validatedData = loginSchema.parse(req.body);
      const user = await storage.authenticateUser(validatedData.email, validatedData.password);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password"
        });
      }
      req.session.userId = user.id;
      res.json({
        success: true,
        message: "Login successful",
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          address: user.address,
          role: user.role
        }
      });
    } catch (error) {
      if (error instanceof z2.ZodError) {
        res.status(400).json({
          success: false,
          message: "Invalid login data",
          errors: error.errors
        });
      } else {
        console.error("Error during login:", error);
        res.status(500).json({
          success: false,
          message: "Internal server error"
        });
      }
    }
  });
  app2.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Could not log out"
        });
      }
      res.json({
        success: true,
        message: "Logout successful"
      });
    });
  });
  app2.get("/api/auth/me", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }
    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }
      res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          address: user.address,
          role: user.role
        }
      });
    } catch (error) {
      console.error("Error getting user data:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  });
  app2.post("/api/service-requests", requireAuth, async (req, res) => {
    try {
      const captchaToken = req.body.captchaToken;
      const captchaValid = await verifyTurnstile(captchaToken);
      if (!captchaValid) {
        return res.status(400).json({
          success: false,
          message: "CAPTCHA verification failed. Please try again."
        });
      }
      const validatedData = insertServiceRequestSchema.parse({
        ...req.body,
        userId: req.session.userId
      });
      const serviceRequest = await storage.createServiceRequest(validatedData);
      const user = await storage.getUser(req.session.userId);
      if (user) {
        try {
          await storage.createOrUpdateProspect({
            name: `${validatedData.firstName} ${validatedData.lastName}`,
            email: user.email,
            phone: user.phone || void 0,
            address: validatedData.address,
            notes: `Service Request (Portal) - Service: ${validatedData.serviceType}
Priority: ${validatedData.priority}
Description: ${validatedData.description}`,
            serviceType: validatedData.serviceType
          });
        } catch (prospectError) {
          console.error("Failed to create/update prospect:", prospectError);
        }
        const emailSent = await sendServiceRequestEmail({
          firstName: validatedData.firstName,
          lastName: validatedData.lastName,
          serviceType: validatedData.serviceType,
          description: validatedData.description,
          address: validatedData.address,
          city: validatedData.city,
          priority: validatedData.priority || "medium",
          customerEmail: user.email,
          customerPhone: user.phone || ""
        });
        if (!emailSent) {
          console.error("Failed to send service request email");
        }
      }
      res.json({
        success: true,
        message: "Service request created successfully",
        serviceRequest
      });
    } catch (error) {
      if (error instanceof z2.ZodError) {
        res.status(400).json({
          success: false,
          message: "Invalid service request data",
          errors: error.errors
        });
      } else {
        console.error("Error creating service request:", error);
        res.status(500).json({
          success: false,
          message: "Internal server error"
        });
      }
    }
  });
  app2.get("/api/service-requests", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId;
      const serviceRequests2 = await storage.getServiceRequestsByUser(userId);
      res.json({
        success: true,
        serviceRequests: serviceRequests2
      });
    } catch (error) {
      console.error("Error fetching service requests:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  });
  app2.get("/api/admin/service-requests", requireAdmin, async (req, res) => {
    try {
      const serviceRequests2 = await storage.getServiceRequests();
      res.json({
        success: true,
        serviceRequests: serviceRequests2
      });
    } catch (error) {
      console.error("Error fetching all service requests:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  });
  app2.put("/api/admin/service-requests/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const currentRequest = await storage.getServiceRequestsByUser(req.body.userId || 0);
      const current = currentRequest.find((r) => r.id === id);
      const oldStatus = current?.status || "pending";
      const serviceRequest = await storage.updateServiceRequest(id, updates);
      if (updates.status && updates.status !== oldStatus) {
        const user = await storage.getUser(serviceRequest.userId);
        if (user) {
          await sendServiceRequestStatusUpdate({
            customerName: `${user.firstName} ${user.lastName}`,
            customerEmail: user.email,
            serviceType: serviceRequest.serviceType,
            oldStatus,
            newStatus: updates.status,
            address: serviceRequest.address,
            scheduledDate: serviceRequest.scheduledDate || void 0,
            technicianNotes: serviceRequest.technicianNotes || void 0
          });
        }
      }
      res.json({
        success: true,
        message: "Service request updated successfully",
        serviceRequest
      });
    } catch (error) {
      console.error("Error updating service request:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  });
  app2.get("/api/inspections/my", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId;
      const inspections = await storage.getInspectionSchedulesByUser(userId);
      res.json({
        success: true,
        inspections
      });
    } catch (error) {
      console.error("Error fetching user inspections:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  });
  app2.get("/api/payments/my", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId;
      const payments2 = await storage.getPaymentsByUser(userId);
      res.json({
        success: true,
        payments: payments2
      });
    } catch (error) {
      console.error("Error fetching user payments:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  });
  app2.post("/api/contact", async (req, res) => {
    try {
      const captchaToken = req.body.captchaToken;
      const captchaValid = await verifyTurnstile(captchaToken);
      if (!captchaValid) {
        return res.status(400).json({
          success: false,
          message: "CAPTCHA verification failed. Please try again."
        });
      }
      const validatedData = insertContactSchema.parse(req.body);
      const contact = await storage.createContactSubmission(validatedData);
      try {
        await storage.createOrUpdateProspect({
          name: `${validatedData.firstName} ${validatedData.lastName}`,
          email: validatedData.email,
          phone: validatedData.phone,
          notes: `Contact Form - Service: ${validatedData.serviceType}
Message: ${validatedData.message}`,
          serviceType: validatedData.serviceType
        });
      } catch (prospectError) {
        console.error("Failed to create/update prospect:", prospectError);
      }
      const emailSent = await sendContactFormEmail({
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        phone: validatedData.phone,
        email: validatedData.email,
        city: validatedData.city,
        serviceType: validatedData.serviceType,
        message: validatedData.message
      });
      if (!emailSent) {
        console.error("Failed to send contact form email");
      }
      res.json({
        success: true,
        message: "Contact form submitted successfully",
        id: contact.id
      });
    } catch (error) {
      if (error instanceof z2.ZodError) {
        res.status(400).json({
          success: false,
          message: "Invalid form data",
          errors: error.errors
        });
      } else {
        console.error("Error submitting contact form:", error);
        res.status(500).json({
          success: false,
          message: "Internal server error"
        });
      }
    }
  });
  app2.get("/api/contact", async (req, res) => {
    try {
      const submissions = await storage.getContactSubmissions();
      res.json(submissions);
    } catch (error) {
      console.error("Error fetching contact submissions:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  });
  app2.post("/api/inspection", async (req, res) => {
    try {
      const captchaToken = req.body.captchaToken;
      const captchaValid = await verifyTurnstile(captchaToken);
      if (!captchaValid) {
        return res.status(400).json({
          success: false,
          message: "CAPTCHA verification failed. Please try again."
        });
      }
      const requestData = {
        ...req.body,
        preferredDate: new Date(req.body.preferredDate)
      };
      const validatedData = insertInspectionSchema.parse(requestData);
      const inspection = await storage.createInspectionSchedule(validatedData);
      try {
        await storage.createOrUpdateProspect({
          name: `${validatedData.firstName} ${validatedData.lastName}`,
          email: validatedData.email,
          phone: validatedData.phone,
          address: validatedData.address,
          notes: `Inspection Request - Service: ${validatedData.serviceType}
Preferred: ${validatedData.preferredDate.toLocaleDateString()} ${validatedData.preferredTime}
Urgency: ${validatedData.urgency}${validatedData.message ? `
Message: ${validatedData.message}` : ""}`,
          serviceType: validatedData.serviceType
        });
      } catch (prospectError) {
        console.error("Failed to create/update prospect:", prospectError);
      }
      const emailSent = await sendInspectionScheduleEmail({
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        phone: validatedData.phone,
        email: validatedData.email,
        address: validatedData.address,
        city: validatedData.city,
        serviceType: validatedData.serviceType,
        preferredDate: validatedData.preferredDate,
        preferredTime: validatedData.preferredTime,
        urgency: validatedData.urgency,
        message: validatedData.message || ""
      });
      if (!emailSent) {
        console.error("Failed to send inspection schedule email");
      }
      res.json({
        success: true,
        message: "Inspection scheduled successfully",
        id: inspection.id
      });
    } catch (error) {
      if (error instanceof z2.ZodError) {
        res.status(400).json({
          success: false,
          message: "Invalid inspection data",
          errors: error.errors
        });
      } else {
        console.error("Error scheduling inspection:", error);
        res.status(500).json({
          success: false,
          message: "Internal server error"
        });
      }
    }
  });
  app2.get("/api/inspection", requireAdmin, async (req, res) => {
    try {
      const inspections = await storage.getInspectionSchedules();
      res.json(inspections);
    } catch (error) {
      console.error("Error fetching inspection schedules:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  });
  app2.put("/api/admin/inspections/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const inspection = await storage.updateInspectionSchedule(id, updates);
      res.json({
        success: true,
        message: "Inspection schedule updated successfully",
        inspection
      });
    } catch (error) {
      console.error("Error updating inspection schedule:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  });
  app2.get("/api/clients", requireAdmin, async (req, res) => {
    try {
      const clients2 = await storage.getClients();
      res.json({ success: true, clients: clients2 });
    } catch (error) {
      console.error("Error fetching clients:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  app2.get("/api/clients/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const client = await storage.getClient(id);
      if (!client) {
        return res.status(404).json({ success: false, message: "Client not found" });
      }
      res.json({ success: true, client });
    } catch (error) {
      console.error("Error fetching client:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  app2.post("/api/clients", requireAdmin, async (req, res) => {
    try {
      const validatedData = insertClientSchema.parse(req.body);
      const client = await storage.createClient(validatedData);
      res.json({ success: true, message: "Client created successfully", client });
    } catch (error) {
      if (error instanceof z2.ZodError) {
        res.status(400).json({ success: false, message: "Invalid client data", errors: error.errors });
      } else {
        console.error("Error creating client:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
      }
    }
  });
  app2.put("/api/clients/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertClientSchema.partial().parse(req.body);
      const client = await storage.updateClient(id, validatedData);
      res.json({ success: true, message: "Client updated successfully", client });
    } catch (error) {
      if (error instanceof z2.ZodError) {
        res.status(400).json({ success: false, message: "Invalid client data", errors: error.errors });
      } else {
        console.error("Error updating client:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
      }
    }
  });
  app2.delete("/api/clients/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteClient(id);
      res.json({ success: true, message: "Client deleted successfully" });
    } catch (error) {
      console.error("Error deleting client:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  app2.get("/api/projects", requireAdmin, async (req, res) => {
    try {
      const projects2 = await storage.getProjects();
      res.json({ success: true, projects: projects2 });
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  app2.get("/api/projects/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const project = await storage.getProject(id);
      if (!project) {
        return res.status(404).json({ success: false, message: "Project not found" });
      }
      res.json({ success: true, project });
    } catch (error) {
      console.error("Error fetching project:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  app2.get("/api/clients/:clientId/projects", requireAdmin, async (req, res) => {
    try {
      const clientId = parseInt(req.params.clientId);
      const projects2 = await storage.getProjectsByClient(clientId);
      res.json({ success: true, projects: projects2 });
    } catch (error) {
      console.error("Error fetching projects by client:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  app2.post("/api/projects", requireAdmin, async (req, res) => {
    try {
      console.log("Creating project with data:", JSON.stringify(req.body, null, 2));
      const validatedData = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(validatedData);
      res.json({ success: true, message: "Project created successfully", project });
    } catch (error) {
      if (error instanceof z2.ZodError) {
        console.error("Zod validation errors:", JSON.stringify(error.errors, null, 2));
        res.status(400).json({ success: false, message: "Invalid project data", errors: error.errors });
      } else {
        console.error("Error creating project:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
      }
    }
  });
  app2.put("/api/projects/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertProjectSchema.partial().parse(req.body);
      const project = await storage.updateProject(id, validatedData);
      res.json({ success: true, message: "Project updated successfully", project });
    } catch (error) {
      if (error instanceof z2.ZodError) {
        res.status(400).json({ success: false, message: "Invalid project data", errors: error.errors });
      } else {
        console.error("Error updating project:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
      }
    }
  });
  app2.delete("/api/projects/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteProject(id);
      res.json({ success: true, message: "Project deleted successfully" });
    } catch (error) {
      console.error("Error deleting project:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  app2.get("/api/milestones", requireAdmin, async (req, res) => {
    try {
      const milestones2 = await storage.getMilestones();
      res.json({ success: true, milestones: milestones2 });
    } catch (error) {
      console.error("Error fetching milestones:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  app2.get("/api/projects/:projectId/milestones", requireAdmin, async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const milestones2 = await storage.getMilestonesByProject(projectId);
      res.json({ success: true, milestones: milestones2 });
    } catch (error) {
      console.error("Error fetching milestones by project:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  app2.post("/api/milestones", requireAdmin, async (req, res) => {
    try {
      console.log("Creating milestone with data:", JSON.stringify(req.body, null, 2));
      const validatedData = insertMilestoneSchema.parse(req.body);
      const milestone = await storage.createMilestone(validatedData);
      res.json({ success: true, message: "Milestone created successfully", milestone });
    } catch (error) {
      if (error instanceof z2.ZodError) {
        console.error("Zod validation errors:", JSON.stringify(error.errors, null, 2));
        res.status(400).json({ success: false, message: "Invalid milestone data", errors: error.errors });
      } else {
        console.error("Error creating milestone:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
      }
    }
  });
  app2.put("/api/milestones/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertMilestoneSchema.partial().parse(req.body);
      const milestone = await storage.updateMilestone(id, validatedData);
      res.json({ success: true, message: "Milestone updated successfully", milestone });
    } catch (error) {
      if (error instanceof z2.ZodError) {
        res.status(400).json({ success: false, message: "Invalid milestone data", errors: error.errors });
      } else {
        console.error("Error updating milestone:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
      }
    }
  });
  app2.delete("/api/milestones/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteMilestone(id);
      res.json({ success: true, message: "Milestone deleted successfully" });
    } catch (error) {
      console.error("Error deleting milestone:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  app2.get("/api/dashboards", requireAdmin, async (req, res) => {
    try {
      const dashboards2 = await storage.getDashboards();
      res.json({ success: true, dashboards: dashboards2 });
    } catch (error) {
      console.error("Error fetching dashboards:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  app2.get("/api/projects/:projectId/dashboards", requireAdmin, async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const dashboards2 = await storage.getDashboardsByProject(projectId);
      res.json({ success: true, dashboards: dashboards2 });
    } catch (error) {
      console.error("Error fetching dashboards by project:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  app2.post("/api/dashboards", requireAdmin, async (req, res) => {
    try {
      const validatedData = insertDashboardSchema.parse({
        ...req.body,
        createdBy: req.session.userId
      });
      const dashboard = await storage.createDashboard(validatedData);
      res.json({ success: true, message: "Dashboard created successfully", dashboard });
    } catch (error) {
      if (error instanceof z2.ZodError) {
        res.status(400).json({ success: false, message: "Invalid dashboard data", errors: error.errors });
      } else {
        console.error("Error creating dashboard:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
      }
    }
  });
  app2.put("/api/dashboards/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertDashboardSchema.partial().parse(req.body);
      const dashboard = await storage.updateDashboard(id, validatedData);
      res.json({ success: true, message: "Dashboard updated successfully", dashboard });
    } catch (error) {
      if (error instanceof z2.ZodError) {
        res.status(400).json({ success: false, message: "Invalid dashboard data", errors: error.errors });
      } else {
        console.error("Error updating dashboard:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
      }
    }
  });
  app2.delete("/api/dashboards/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteDashboard(id);
      res.json({ success: true, message: "Dashboard deleted successfully" });
    } catch (error) {
      console.error("Error deleting dashboard:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  app2.get("/api/blog/posts", async (req, res) => {
    try {
      const posts = await storage.getPublishedBlogPosts();
      res.json({ success: true, posts });
    } catch (error) {
      console.error("Error fetching blog posts:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  app2.get("/api/blog/posts/:slug", async (req, res) => {
    try {
      const slug = req.params.slug;
      const post = await storage.getBlogPostBySlug(slug);
      if (!post || !post.isPublished) {
        res.status(404).json({ success: false, message: "Blog post not found" });
        return;
      }
      res.json({ success: true, post });
    } catch (error) {
      console.error("Error fetching blog post:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  app2.get("/api/admin/blog/posts", requireAdmin, async (req, res) => {
    try {
      const posts = await storage.getBlogPosts();
      res.json({ success: true, posts });
    } catch (error) {
      console.error("Error fetching all blog posts:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  app2.get("/api/admin/blog/posts/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const post = await storage.getBlogPost(id);
      if (!post) {
        res.status(404).json({ success: false, message: "Blog post not found" });
        return;
      }
      res.json({ success: true, post });
    } catch (error) {
      console.error("Error fetching blog post:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  app2.post("/api/admin/blog/posts", requireAdmin, async (req, res) => {
    try {
      const validatedData = insertBlogPostSchema.parse(req.body);
      const post = await storage.createBlogPost(validatedData);
      res.json({ success: true, message: "Blog post created successfully", post });
    } catch (error) {
      if (error instanceof z2.ZodError) {
        res.status(400).json({ success: false, message: "Invalid blog post data", errors: error.errors });
      } else {
        console.error("Error creating blog post:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
      }
    }
  });
  app2.put("/api/admin/blog/posts/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertBlogPostSchema.partial().parse(req.body);
      const post = await storage.updateBlogPost(id, validatedData);
      res.json({ success: true, message: "Blog post updated successfully", post });
    } catch (error) {
      if (error instanceof z2.ZodError) {
        res.status(400).json({ success: false, message: "Invalid blog post data", errors: error.errors });
      } else {
        console.error("Error updating blog post:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
      }
    }
  });
  app2.delete("/api/admin/blog/posts/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteBlogPost(id);
      res.json({ success: true, message: "Blog post deleted successfully" });
    } catch (error) {
      console.error("Error deleting blog post:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  app2.post("/api/admin/blog/posts/bulk-delete", requireAdmin, async (req, res) => {
    try {
      const { ids } = req.body;
      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ success: false, message: "Invalid ids array" });
      }
      for (const id of ids) {
        await storage.deleteBlogPost(id);
      }
      res.json({ success: true, message: `${ids.length} blog posts deleted successfully` });
    } catch (error) {
      console.error("Error bulk deleting blog posts:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  app2.post("/api/admin/blog/syndicate", requireAdmin, async (req, res) => {
    try {
      const { feedUrl } = req.body;
      if (!feedUrl) {
        return res.status(400).json({ success: false, message: "Feed URL is required" });
      }
      const parser = new Parser({
        customFields: {
          item: [
            ["content:encoded", "contentEncoded"],
            ["dc:creator", "creator"]
          ]
        }
      });
      const feed = await parser.parseURL(feedUrl);
      const results = {
        imported: 0,
        skipped: 0,
        errors: 0,
        details: []
      };
      for (const item of feed.items) {
        try {
          const slug = item.title?.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim() || "";
          const existingPost = await storage.getBlogPostBySlug(slug);
          if (existingPost) {
            results.skipped++;
            results.details.push({ title: item.title, status: "skipped", reason: "Already exists" });
            continue;
          }
          const contentHtml = item.contentEncoded || item.content || "";
          const imgMatch = contentHtml.match(/<img[^>]+src="([^">]+)"/);
          const featuredImage = imgMatch ? imgMatch[1] : null;
          const plainText = contentHtml.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
          const excerpt = plainText.substring(0, 300) + (plainText.length > 300 ? "..." : "");
          const tags = item.categories || [];
          const category = tags.length > 0 ? tags[0] : "General";
          const authorName = item.creator || item["dc:creator"] || "Guest Author";
          await storage.createBlogPost({
            title: item.title || "Untitled",
            slug,
            content: contentHtml,
            excerpt: item.contentSnippet || excerpt,
            author: authorName,
            featuredImage,
            category,
            tags,
            metaTitle: item.title || "Untitled",
            metaDescription: (item.contentSnippet || excerpt).substring(0, 160),
            isPublished: true
          });
          results.imported++;
          results.details.push({ title: item.title, status: "imported" });
        } catch (error) {
          results.errors++;
          const errorMessage = error instanceof Error ? error.message : "Unknown error";
          console.error(`Error importing post "${item.title}":`, errorMessage, error);
          results.details.push({
            title: item.title,
            status: "error",
            error: errorMessage
          });
        }
      }
      res.json({
        success: true,
        message: `Syndication complete: ${results.imported} imported, ${results.skipped} skipped, ${results.errors} errors`,
        results
      });
    } catch (error) {
      console.error("Error syndicating RSS feed:", error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to syndicate RSS feed"
      });
    }
  });
  app2.post("/api/admin/newsletter/send", requireAdmin, async (req, res) => {
    try {
      const { postIds, recipientEmail, subject } = req.body;
      if (!Array.isArray(postIds) || postIds.length === 0) {
        return res.status(400).json({ success: false, message: "At least one post must be selected" });
      }
      if (!recipientEmail || !recipientEmail.trim()) {
        return res.status(400).json({ success: false, message: "Recipient email is required" });
      }
      if (!subject || !subject.trim()) {
        return res.status(400).json({ success: false, message: "Subject is required" });
      }
      const allPosts = await storage.getBlogPosts();
      const selectedPosts = allPosts.filter((post) => postIds.includes(post.id));
      if (selectedPosts.length === 0) {
        return res.status(404).json({ success: false, message: "No valid posts found" });
      }
      const emailSent = await sendNewsletterEmail({
        recipientEmail: recipientEmail.trim(),
        subject: subject.trim(),
        posts: selectedPosts.map((post) => ({
          title: post.title,
          excerpt: post.excerpt,
          slug: post.slug,
          featuredImage: post.featuredImage,
          category: post.category
        }))
      });
      if (!emailSent) {
        return res.status(500).json({ success: false, message: "Failed to send newsletter email" });
      }
      res.json({ success: true, message: "Newsletter sent successfully" });
    } catch (error) {
      console.error("Error sending newsletter:", error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to send newsletter"
      });
    }
  });
  app2.post("/api/admin/blog/research-topics", requireAdmin, async (req, res) => {
    try {
      const currentMonth = (/* @__PURE__ */ new Date()).getMonth();
      const season = currentMonth >= 2 && currentMonth <= 4 ? "spring" : currentMonth >= 5 && currentMonth <= 7 ? "summer" : currentMonth >= 8 && currentMonth <= 10 ? "fall" : "winter";
      const allTopics = [
        // Insect/Pest specific
        {
          id: 1,
          title: "10 Warning Signs You Have a Bed Bug Infestation",
          category: "Insect Control",
          type: "pest",
          searchVolume: 12500,
          description: "Homeowners want to identify bed bugs before infestations spread. Covers signs, detection tips, and when to call professionals.",
          keywords: ["bed bugs", "bed bug signs", "bed bug infestation", "bed bug identification"]
        },
        {
          id: 2,
          title: "Ant Prevention Tips: Keep Your Chester County Home Ant-Free",
          category: "Insect Control",
          type: "pest",
          searchVolume: 9800,
          description: "Spring is prime ant season. Practical prevention tips for common Pennsylvania ant species including carpenter ants.",
          keywords: ["ant prevention", "carpenter ants", "ant control", "Chester County pest control"]
        },
        {
          id: 3,
          title: "Tick Season Alert: Protecting Your Family in Southeastern PA",
          category: "Insect Control",
          type: "pest",
          searchVolume: 15200,
          description: "Ticks are a major concern for families with pets and children. Covers Lyme disease prevention and yard treatments.",
          keywords: ["tick prevention", "Lyme disease", "tick control", "yard ticks"]
        },
        {
          id: 4,
          title: "Why You're Seeing More Spiders in Your Home (And What to Do)",
          category: "Insect Control",
          type: "pest",
          searchVolume: 8400,
          description: "Homeowners notice spider increases at certain times. Explains spider behavior and safe removal methods.",
          keywords: ["spider control", "spiders in house", "spider prevention", "common spiders PA"]
        },
        // Wildlife prevention
        {
          id: 5,
          title: "How to Keep Mice Out of Your Garage This Winter",
          category: "Wildlife Prevention",
          type: "wildlife",
          searchVolume: 11e3,
          description: "Garages are prime entry points for mice. Covers exclusion techniques, sealing entry points, and prevention.",
          keywords: ["mice prevention", "garage mice", "mouse control", "rodent exclusion"]
        },
        {
          id: 6,
          title: "Bat Exclusion 101: Safely Removing Bats from Your Attic",
          category: "Wildlife Prevention",
          type: "wildlife",
          searchVolume: 7200,
          description: "Bats are protected species in PA. Explains legal, safe exclusion methods and why DIY removal is risky.",
          keywords: ["bat exclusion", "bats in attic", "bat removal", "Pennsylvania bat control"]
        },
        {
          id: 7,
          title: "Squirrel Problems? How to Protect Your Home from Damage",
          category: "Wildlife Prevention",
          type: "wildlife",
          searchVolume: 6800,
          description: "Squirrels cause significant home damage. Covers identification of entry points and professional exclusion.",
          keywords: ["squirrel control", "squirrels in attic", "wildlife damage", "squirrel removal"]
        },
        // Seasonal
        {
          id: 8,
          title: `${season.charAt(0).toUpperCase() + season.slice(1)} Pest Prep: What Chester County Homeowners Need to Know`,
          category: "Seasonal Tips",
          type: "seasonal",
          searchVolume: 5500,
          description: `Season-specific pest preparation guide for Southeastern Pennsylvania homeowners. Covers ${season} pest trends and prevention.`,
          keywords: [`${season} pests`, "Chester County", "pest prevention", "seasonal pest control"]
        },
        // Product/Service
        {
          id: 9,
          title: "Why Professional Termite Inspection Is Worth Every Penny",
          category: "Services",
          type: "product",
          searchVolume: 8900,
          description: "Termites cause billions in damage annually. Explains inspection process, costs vs. damage costs, and early detection value.",
          keywords: ["termite inspection", "termite damage", "termite prevention", "professional pest control"]
        },
        {
          id: 10,
          title: "Quarterly Pest Control Plans: Are They Right for Your Home?",
          category: "Services",
          type: "product",
          searchVolume: 7600,
          description: "Compares DIY vs. professional quarterly pest control. Covers costs, benefits, and what's included in professional service.",
          keywords: ["quarterly pest control", "pest control plan", "recurring pest service", "pest control cost"]
        }
      ];
      const shuffled = allTopics.sort(() => Math.random() - 0.5);
      res.json({ success: true, topics: shuffled });
    } catch (error) {
      console.error("Error researching topics:", error);
      res.status(500).json({ success: false, message: "Failed to research topics" });
    }
  });
  app2.post("/api/admin/blog/generate-image", requireAdmin, async (req, res) => {
    try {
      const { title, category } = req.body;
      if (!title) {
        return res.status(400).json({ success: false, message: "Title is required" });
      }
      const openaiApiKey = process.env.OPENAI_API_KEY;
      if (!openaiApiKey) {
        return res.status(500).json({ success: false, message: "OpenAI API key not configured" });
      }
      const imagePrompt = `Professional photograph for a pest control blog article about: ${title}. 
        Realistic style, high quality, showing a clean suburban home exterior or interior with subtle pest control context. 
        Warm lighting, professional photography style suitable for a business blog. 
        No text or words in the image. 
        Aspect ratio 16:9 for web use.`;
      const response = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openaiApiKey}`
        },
        body: JSON.stringify({
          model: "dall-e-3",
          prompt: imagePrompt,
          n: 1,
          size: "1792x1024"
        })
      });
      const data = await response.json();
      if (data.error) {
        console.error("OpenAI image generation error:", data.error);
        return res.status(500).json({ success: false, message: "Image generation failed: " + data.error.message });
      }
      const imageUrl = data.data?.[0]?.url;
      if (!imageUrl) {
        return res.status(500).json({ success: false, message: "No image URL returned" });
      }
      const imageResponse = await fetch(imageUrl);
      const arrayBuffer = await imageResponse.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64 = buffer.toString("base64");
      const dataUrl = `data:image/png;base64,${base64}`;
      res.json({ success: true, imageUrl: dataUrl });
    } catch (error) {
      console.error("Error generating image:", error);
      res.status(500).json({ success: false, message: "Failed to generate image" });
    }
  });
  app2.post("/api/admin/blog/generate-articles", requireAdmin, async (req, res) => {
    try {
      const { topicIds, topics } = req.body;
      if (!topics || !Array.isArray(topics) || topics.length === 0) {
        return res.status(400).json({ success: false, message: "Topics array is required" });
      }
      const openaiApiKey = process.env.OPENAI_API_KEY;
      if (!openaiApiKey) {
        return res.status(500).json({ success: false, message: "OpenAI API key not configured" });
      }
      const generatedArticles = [];
      const baseUrl = process.env.REPLIT_DOMAINS?.split(",")[0] ? `https://${process.env.REPLIT_DOMAINS.split(",")[0]}` : "https://absolutepestservices.com";
      for (let i = 0; i < topics.length && i < 6; i++) {
        const topic = topics[i];
        try {
          const articlePrompt = `Write a 600-800 word blog article for a pest control company serving Chester County, Pennsylvania. 
          
Title: ${topic.title}
Category: ${topic.category}
Target Keywords: ${topic.keywords?.join(", ") || topic.title}

Requirements:
- Write in HTML format with <h2> and <h3> headings
- Include practical tips homeowners can use
- Mention Chester County or Southeastern PA naturally
- Include a call-to-action to contact Absolute Pest Services
- Use professional but approachable tone
- Structure: Introduction, 3-4 main points with tips, Conclusion with CTA

Return the article as JSON with fields:
- content: the HTML article body
- excerpt: a 150-200 word summary for meta description
- suggestedTags: array of 3-5 relevant tags`;
          const chatResponse = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${openaiApiKey}`
            },
            body: JSON.stringify({
              model: "gpt-4o",
              messages: [
                {
                  role: "system",
                  content: "You are a professional content writer for a pest control company. You write SEO-optimized blog articles in JSON format."
                },
                {
                  role: "user",
                  content: articlePrompt
                }
              ],
              response_format: { type: "json_object" },
              max_tokens: 2e3,
              temperature: 0.7
            })
          });
          const chatData = await chatResponse.json();
          if (chatData.error) {
            console.error("OpenAI article generation error:", chatData.error);
            continue;
          }
          const articleContent = JSON.parse(chatData.choices[0].message.content);
          let imageUrl = "";
          try {
            const imageResponse = await fetch("https://api.openai.com/v1/images/generations", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${openaiApiKey}`
              },
              body: JSON.stringify({
                model: "dall-e-3",
                prompt: `Professional photograph for a pest control blog article about: ${topic.title}. Realistic style, high quality, showing relevant pest control context. Warm lighting, professional photography. No text in image.`,
                n: 1,
                size: "1792x1024"
              })
            });
            const imageData = await imageResponse.json();
            if (imageData.data?.[0]?.url) {
              const imgResponse = await fetch(imageData.data[0].url);
              const arrayBuffer = await imgResponse.arrayBuffer();
              const buffer = Buffer.from(arrayBuffer);
              const base64 = buffer.toString("base64");
              imageUrl = `data:image/png;base64,${base64}`;
            }
          } catch (imgError) {
            console.error("Image generation failed for article:", topic.title, imgError);
          }
          const slug = topic.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
          const blogPost = await storage.createBlogPost({
            title: topic.title,
            slug: `${slug}-${Date.now()}`,
            // Add timestamp to ensure uniqueness
            content: articleContent.content || "",
            excerpt: articleContent.excerpt || topic.description,
            author: "AI Generated",
            featuredImage: imageUrl || null,
            category: topic.category,
            tags: articleContent.suggestedTags || topic.keywords || [],
            isPublished: false,
            // Draft by default for review
            metaTitle: topic.title,
            metaDescription: articleContent.excerpt?.substring(0, 160) || topic.description
          });
          generatedArticles.push({
            id: blogPost.id,
            title: blogPost.title,
            slug: blogPost.slug,
            featuredImage: blogPost.featuredImage,
            status: "created"
          });
        } catch (articleError) {
          console.error("Error generating article for topic:", topic.title, articleError);
          generatedArticles.push({
            title: topic.title,
            status: "error",
            error: articleError instanceof Error ? articleError.message : "Unknown error"
          });
        }
      }
      res.json({
        success: true,
        message: `Generated ${generatedArticles.filter((a) => a.status === "created").length} articles`,
        articles: generatedArticles
      });
    } catch (error) {
      console.error("Error generating articles:", error);
      res.status(500).json({ success: false, message: "Failed to generate articles" });
    }
  });
  const requireFieldAuth = (req, res, next) => {
    if (!req.session.fieldEmployeeId) {
      return res.status(401).json({ success: false, message: "Field authentication required" });
    }
    next();
  };
  async function notifyJobStatusChange(jobLog, oldStatus, newStatus) {
    try {
      if (oldStatus === newStatus) return;
      if (!jobLog.clientId) return;
      const client = await storage.getClient(jobLog.clientId);
      if (!client?.email) return;
      let techName;
      if (jobLog.employeeId) {
        const emp = await storage.getFieldEmployee(jobLog.employeeId);
        techName = emp?.name;
      }
      const dateStr = new Date(jobLog.jobDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
      const sent = await sendJobStatusNotification({
        customerEmail: client.email,
        customerName: client.name,
        oldStatus,
        newStatus,
        jobDate: dateStr,
        siteLocation: jobLog.siteLocation,
        servicedArea: jobLog.servicedArea,
        workPerformed: jobLog.workPerformed,
        technicianName: techName
      });
      if (!sent) {
        console.warn(`[JobStatusNotification] Email failed to send for job ${jobLog.id}, client ${client.id} (${oldStatus} \u2192 ${newStatus})`);
      }
    } catch (err) {
      console.error("[JobStatusNotification] Error sending notification:", err);
    }
  }
  const requireFieldManager = (req, res, next) => {
    if (!req.session.fieldEmployeeId) {
      return res.status(401).json({ success: false, message: "Field authentication required" });
    }
    if (!req.session.fieldCanManage) {
      return res.status(403).json({ success: false, message: "Management access required" });
    }
    next();
  };
  app2.post("/api/field/auth", async (req, res) => {
    try {
      const { pin } = req.body;
      if (!pin) {
        return res.status(400).json({ success: false, message: "PIN is required" });
      }
      const employee = await storage.getFieldEmployeeByPin(pin);
      if (!employee) {
        return res.status(401).json({ success: false, message: "Invalid PIN" });
      }
      req.session.fieldEmployeeId = employee.id;
      req.session.fieldCanManage = employee.canManageEmployees;
      res.json({
        success: true,
        employee: {
          id: employee.id,
          name: employee.name,
          canManageEmployees: employee.canManageEmployees
        }
      });
    } catch (error) {
      console.error("Error authenticating field employee:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  app2.post("/api/field/logout", (req, res) => {
    req.session.fieldEmployeeId = void 0;
    req.session.fieldCanManage = void 0;
    res.json({ success: true, message: "Logged out" });
  });
  app2.post("/api/field/seed", async (req, res) => {
    try {
      const employees = await storage.getFieldEmployees();
      if (employees.length === 0) {
        const frank = await storage.createFieldEmployee({
          name: "Frank",
          pin: "2121",
          isActive: true,
          canManageEmployees: true
        });
        return res.json({ success: true, message: "Default employee created" });
      }
      res.json({ success: true, message: "Employees already exist" });
    } catch (error) {
      console.error("Error seeding employees:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  app2.get("/api/field/clients", requireFieldAuth, async (req, res) => {
    try {
      const allClients = await storage.getClients();
      res.json({
        success: true,
        clients: allClients.map((c) => ({ id: c.id, name: c.name, address: c.address }))
      });
    } catch (error) {
      console.error("Error fetching clients for field:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  app2.get("/api/field/service-rates", requireFieldAuth, async (req, res) => {
    try {
      const rates = await storage.getActiveServiceRates();
      res.json({ success: true, rates });
    } catch (error) {
      console.error("Error fetching service rates:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  app2.post("/api/field/create-invoice", requireFieldAuth, async (req, res) => {
    try {
      const { jobLogIds, dueDate } = req.body;
      if (!jobLogIds || !Array.isArray(jobLogIds) || jobLogIds.length === 0) {
        return res.status(400).json({ success: false, message: "At least one job log ID is required" });
      }
      if (!dueDate) {
        return res.status(400).json({ success: false, message: "Due date is required" });
      }
      const uniqueIds = [...new Set(jobLogIds.map((id) => parseInt(id)).filter((id) => !isNaN(id)))];
      if (uniqueIds.length === 0) {
        return res.status(400).json({ success: false, message: "Invalid job log IDs" });
      }
      const logs = [];
      let clientId = null;
      const empId = req.session.fieldEmployeeId;
      for (const id of uniqueIds) {
        const log2 = await storage.getJobLog(id);
        if (!log2) {
          return res.status(404).json({ success: false, message: `Job log ${id} not found` });
        }
        if (log2.employeeId !== empId) {
          return res.status(403).json({ success: false, message: `Job log ${id} does not belong to you` });
        }
        if (log2.status !== "completed") {
          return res.status(400).json({ success: false, message: `Job log ${id} is not in completed status (current: ${log2.status})` });
        }
        if (!log2.clientId) {
          return res.status(400).json({ success: false, message: `Job log ${id} has no associated client` });
        }
        if (clientId && log2.clientId !== clientId) {
          return res.status(400).json({ success: false, message: "All job logs must belong to the same client" });
        }
        clientId = log2.clientId;
        logs.push(log2);
      }
      const invoice = await storage.createInvoice({
        clientId,
        dueDate: new Date(dueDate),
        subtotal: "0",
        taxTotal: "0",
        total: "0"
      });
      for (const log2 of logs) {
        const unitRate = String(log2.amount || "200");
        let techName;
        let serviceTypeName;
        try {
          if (log2.employeeId) {
            const employees = await storage.getFieldEmployees();
            const emp = employees.find((e) => e.id === log2.employeeId);
            if (emp) techName = emp.name;
          }
          if (log2.serviceRateId) {
            const rates = await storage.getServiceRates();
            const rate = rates.find((r) => r.id === log2.serviceRateId);
            if (rate) serviceTypeName = rate.name;
          }
        } catch {
        }
        await storage.createLineItem({
          invoiceId: invoice.id,
          description: `${log2.servicedArea} \u2014 ${log2.workPerformed}`,
          quantity: "1",
          unitRate,
          taxRate: "6",
          materials: log2.materials || null,
          serviceDate: log2.jobDate ? String(log2.jobDate).slice(0, 10) : void 0,
          technicianName: techName,
          serviceType: serviceTypeName,
          serviceAddress: log2.siteAddress || void 0,
          servicedArea: log2.servicedArea || void 0,
          jobLogId: log2.id
        });
        await storage.updateJobLog(log2.id, { status: "invoiced" });
      }
      const lineItems = await storage.getLineItemsByInvoice(invoice.id);
      let subtotal = 0;
      let taxTotal = 0;
      for (const item of lineItems) {
        subtotal += parseFloat(String(item.lineTotal));
        taxTotal += parseFloat(String(item.lineTax));
      }
      await storage.updateInvoice(invoice.id, {
        subtotal: subtotal.toFixed(2),
        taxTotal: taxTotal.toFixed(2),
        total: (subtotal + taxTotal).toFixed(2)
      });
      await storage.logInvoiceStatusChange({
        invoiceId: invoice.id,
        fromStatus: null,
        toStatus: "draft",
        actor: `field:${req.session.fieldEmployeeId}`,
        note: `Created from ${logs.length} job log(s) by field technician`
      });
      const updatedInvoice = await storage.getInvoice(invoice.id);
      const invoiceClient = await storage.getClient(clientId);
      res.status(201).json({
        success: true,
        invoice: updatedInvoice,
        clientEmail: invoiceClient?.email || null,
        clientName: invoiceClient?.name || null
      });
    } catch (error) {
      console.error("Error creating field invoice:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  app2.get("/api/field/suggestions", requireFieldAuth, async (req, res) => {
    try {
      const allLogs = await storage.getJobLogs();
      const standaloneLocs = await storage.getSiteLocations();
      const standaloneAreas = await storage.getServicedAreas();
      const fieldCusts = await storage.getFieldCustomers();
      const dedup = (items) => {
        const seen = /* @__PURE__ */ new Map();
        for (const item of items) {
          const key = item.toLowerCase();
          if (!seen.has(key)) seen.set(key, item);
        }
        return [...seen.values()].sort((a, b) => a.localeCompare(b));
      };
      const customerNames = allLogs.map((l) => l.customerName.trim()).filter(Boolean);
      const locationCustomerNames = standaloneLocs.map((l) => l.customerName?.trim()).filter(Boolean);
      const fieldCustomerNames = fieldCusts.map((c) => c.name.trim()).filter(Boolean);
      const mergedCustomers = dedup([...customerNames, ...locationCustomerNames, ...fieldCustomerNames]);
      const customerLocations = {};
      const locationAreas = {};
      for (const log2 of allLogs) {
        const cust = log2.customerName.trim();
        const loc = log2.siteLocation.trim();
        const area = log2.servicedArea.trim();
        if (cust && loc) {
          const custKey = cust.toLowerCase();
          if (!customerLocations[custKey]) customerLocations[custKey] = [];
          if (!customerLocations[custKey].some((l) => l.toLowerCase() === loc.toLowerCase())) {
            customerLocations[custKey].push(loc);
          }
        }
        if (loc && area) {
          const locKey = loc.toLowerCase();
          if (!locationAreas[locKey]) locationAreas[locKey] = [];
          if (!locationAreas[locKey].some((a) => a.toLowerCase() === area.toLowerCase())) {
            locationAreas[locKey].push(area);
          }
        }
      }
      for (const loc of standaloneLocs) {
        const custKey = (loc.customerName || "").toLowerCase();
        if (custKey && !customerLocations[custKey]) customerLocations[custKey] = [];
        if (custKey && !customerLocations[custKey].some((l) => l.toLowerCase() === loc.name.toLowerCase())) {
          customerLocations[custKey].push(loc.name);
        }
      }
      for (const area of standaloneAreas) {
        const locKey = (area.siteLocationName || "").toLowerCase();
        if (locKey && !locationAreas[locKey]) locationAreas[locKey] = [];
        if (locKey && !locationAreas[locKey].some((a) => a.toLowerCase() === area.name.toLowerCase())) {
          locationAreas[locKey].push(area.name);
        }
      }
      for (const key in customerLocations) {
        customerLocations[key].sort((a, b) => a.localeCompare(b));
      }
      for (const key in locationAreas) {
        locationAreas[key].sort((a, b) => a.localeCompare(b));
      }
      const allClientRecords = await storage.getClients();
      const clientsForField = allClientRecords.map((c) => ({
        id: c.id,
        name: c.name,
        address: c.address ?? null,
        propertyType: c.propertyType ?? "residential"
      }));
      res.json({
        success: true,
        customers: mergedCustomers,
        customerLocations,
        locationAreas,
        clients: clientsForField
      });
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  app2.get("/api/admin/suggestions", requireAdmin, async (req, res) => {
    try {
      const allLogs = await storage.getJobLogs();
      const standaloneLocs = await storage.getSiteLocations();
      const standaloneAreas = await storage.getServicedAreas();
      const dedup = (items) => {
        const seen = /* @__PURE__ */ new Map();
        for (const item of items) {
          const key = item.toLowerCase();
          if (!seen.has(key)) seen.set(key, item);
        }
        return [...seen.values()].sort((a, b) => a.localeCompare(b));
      };
      const customerLocations = {};
      const locationAreas = {};
      for (const log2 of allLogs) {
        const cust = log2.customerName.trim();
        const loc = log2.siteLocation.trim();
        const area = log2.servicedArea.trim();
        if (cust && loc) {
          const custKey = cust.toLowerCase();
          if (!customerLocations[custKey]) customerLocations[custKey] = [];
          if (!customerLocations[custKey].some((l) => l.toLowerCase() === loc.toLowerCase())) {
            customerLocations[custKey].push(loc);
          }
        }
        if (loc && area) {
          const locKey = loc.toLowerCase();
          if (!locationAreas[locKey]) locationAreas[locKey] = [];
          if (!locationAreas[locKey].some((a) => a.toLowerCase() === area.toLowerCase())) {
            locationAreas[locKey].push(area);
          }
        }
      }
      for (const loc of standaloneLocs) {
        const custKey = (loc.customerName || "").toLowerCase();
        if (custKey && !customerLocations[custKey]) customerLocations[custKey] = [];
        if (custKey && !customerLocations[custKey].some((l) => l.toLowerCase() === loc.name.toLowerCase())) {
          customerLocations[custKey].push(loc.name);
        }
      }
      for (const area of standaloneAreas) {
        const locKey = (area.siteLocationName || "").toLowerCase();
        if (locKey && !locationAreas[locKey]) locationAreas[locKey] = [];
        if (locKey && !locationAreas[locKey].some((a) => a.toLowerCase() === area.name.toLowerCase())) {
          locationAreas[locKey].push(area.name);
        }
      }
      for (const key in customerLocations) {
        customerLocations[key].sort((a, b) => a.localeCompare(b));
      }
      for (const key in locationAreas) {
        locationAreas[key].sort((a, b) => a.localeCompare(b));
      }
      res.json({ success: true, customerLocations, locationAreas });
    } catch (error) {
      console.error("Error fetching admin suggestions:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  app2.get("/api/field/employees", requireFieldManager, async (req, res) => {
    try {
      const employees = await storage.getFieldEmployees();
      res.json({
        success: true,
        employees: employees.map((e) => ({
          id: e.id,
          name: e.name,
          isActive: e.isActive,
          canManageEmployees: e.canManageEmployees,
          pin: e.pin
        }))
      });
    } catch (error) {
      console.error("Error fetching field employees:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  app2.post("/api/field/employees", requireFieldManager, async (req, res) => {
    try {
      const validatedData = insertFieldEmployeeSchema.parse(req.body);
      const existing = await storage.getFieldEmployeeByPin(validatedData.pin);
      if (existing) {
        return res.status(400).json({ success: false, message: "An employee with this PIN already exists" });
      }
      const employee = await storage.createFieldEmployee(validatedData);
      res.json({ success: true, message: "Employee created", employee });
    } catch (error) {
      if (error instanceof z2.ZodError) {
        res.status(400).json({ success: false, message: "Invalid employee data", errors: error.errors });
      } else {
        console.error("Error creating field employee:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
      }
    }
  });
  app2.patch("/api/field/employees/:id", requireFieldManager, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      if (updates.pin) {
        const existing = await storage.getFieldEmployeeByPin(updates.pin);
        if (existing && existing.id !== id) {
          return res.status(400).json({ success: false, message: "An employee with this PIN already exists" });
        }
      }
      const employee = await storage.updateFieldEmployee(id, updates);
      res.json({ success: true, message: "Employee updated", employee });
    } catch (error) {
      console.error("Error updating field employee:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  app2.delete("/api/field/employees/:id", requireFieldManager, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteFieldEmployee(id);
      res.json({ success: true, message: "Employee deleted" });
    } catch (error) {
      console.error("Error deleting field employee:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  app2.post("/api/field/job-logs", requireFieldAuth, async (req, res) => {
    try {
      let resolvedClientId = req.body.clientId || null;
      if (!resolvedClientId && req.body.customerName) {
        const existingClients = await storage.getClients();
        const match = existingClients.find(
          (c) => c.name.toLowerCase().trim() === req.body.customerName.toLowerCase().trim()
        );
        if (match) {
          resolvedClientId = match.id;
        } else {
          try {
            const newClient = await storage.createClient({
              name: req.body.customerName,
              address: req.body.newCustomerAddress || req.body.siteAddress || null,
              propertyType: req.body.propertyType || "residential",
              clientType: "prospect",
              status: "pending"
            });
            resolvedClientId = newClient.id;
          } catch (e) {
            console.error("Error auto-creating client from field log:", e);
          }
        }
      }
      const data = {
        ...req.body,
        employeeId: req.session.fieldEmployeeId,
        jobDate: new Date(req.body.jobDate),
        clientId: resolvedClientId
      };
      const validatedData = insertJobLogSchema.parse(data);
      const jobLog = await storage.createJobLog(validatedData);
      const employee = await storage.getFieldEmployee(req.session.fieldEmployeeId);
      sendJobLogNotification({
        employeeName: employee?.name || "Unknown",
        customerName: jobLog.customerName,
        siteLocation: jobLog.siteLocation,
        servicedArea: jobLog.servicedArea,
        workPerformed: jobLog.workPerformed,
        jobDate: jobLog.jobDate.toString()
      }).catch((err) => console.error("Error sending job log email:", err));
      res.json({ success: true, message: "Job log created", jobLog });
    } catch (error) {
      if (error instanceof z2.ZodError) {
        res.status(400).json({ success: false, message: "Invalid job log data", errors: error.errors });
      } else {
        console.error("Error creating job log:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
      }
    }
  });
  app2.get("/api/field/job-logs", requireFieldAuth, async (req, res) => {
    try {
      const filters = { employeeId: req.session.fieldEmployeeId };
      if (req.query.customerName) filters.customerName = req.query.customerName;
      if (req.query.dateFrom) filters.dateFrom = new Date(req.query.dateFrom);
      if (req.query.dateTo) filters.dateTo = new Date(req.query.dateTo);
      const logs = await storage.getJobLogs(filters);
      res.json({ success: true, jobLogs: logs });
    } catch (error) {
      console.error("Error fetching job logs:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  app2.delete("/api/field/job-logs/:id", requireFieldAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const log2 = await storage.getJobLog(id);
      if (!log2 || log2.employeeId !== req.session.fieldEmployeeId) {
        return res.status(403).json({ success: false, message: "Access denied" });
      }
      await storage.deleteJobLog(id);
      res.json({ success: true, message: "Job log deleted" });
    } catch (error) {
      console.error("Error deleting job log:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  app2.patch("/api/field/job-logs/:id", requireFieldAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const existing = await storage.getJobLog(id);
      if (!existing || existing.employeeId !== req.session.fieldEmployeeId) {
        return res.status(403).json({ success: false, message: "Access denied" });
      }
      if (existing.status === "invoiced" || existing.status === "paid") {
        return res.status(400).json({ success: false, message: "Cannot edit a job that has already been invoiced." });
      }
      const { customerName, siteLocation, siteAddress, servicedArea, workPerformed, jobDate, serviceRateId, amount, materials } = req.body;
      const updates = {};
      if (customerName !== void 0) updates.customerName = customerName;
      if (siteLocation !== void 0) updates.siteLocation = siteLocation;
      if (siteAddress !== void 0) updates.siteAddress = siteAddress;
      if (servicedArea !== void 0) updates.servicedArea = servicedArea;
      if (workPerformed !== void 0) updates.workPerformed = workPerformed;
      if (jobDate !== void 0) updates.jobDate = new Date(jobDate);
      if (serviceRateId !== void 0) updates.serviceRateId = serviceRateId === "none" || serviceRateId === "" ? null : Number(serviceRateId);
      if (amount !== void 0) updates.amount = String(amount);
      if (materials !== void 0) updates.materials = materials || null;
      const updated = await storage.updateJobLog(id, updates);
      res.json({ success: true, jobLog: updated });
    } catch (error) {
      console.error("Error updating field job log:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  app2.get("/api/admin/job-logs/filter-options", requireAdmin, async (req, res) => {
    try {
      const allLogs = await storage.getJobLogs();
      const employees = await storage.getFieldEmployees();
      const customers = Array.from(new Set(allLogs.map((l) => l.customerName?.trim()).filter(Boolean))).sort();
      const locations = Array.from(new Set(allLogs.map((l) => l.siteLocation?.trim()).filter(Boolean))).sort();
      const areas = Array.from(new Set(allLogs.map((l) => l.servicedArea?.trim()).filter(Boolean))).sort();
      res.json({ success: true, customers, locations, areas, employees });
    } catch (error) {
      console.error("Error fetching filter options:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  app2.get("/api/admin/job-logs", requireAdmin, async (req, res) => {
    try {
      const filters = {};
      if (req.query.employeeId) filters.employeeId = parseInt(req.query.employeeId);
      if (req.query.customerName) filters.customerName = req.query.customerName;
      if (req.query.clientId) filters.clientId = parseInt(req.query.clientId);
      if (req.query.dateFrom) filters.dateFrom = new Date(req.query.dateFrom);
      if (req.query.dateTo) filters.dateTo = new Date(req.query.dateTo);
      if (req.query.siteLocation) filters.siteLocation = req.query.siteLocation;
      if (req.query.servicedArea) filters.servicedArea = req.query.servicedArea;
      if (req.query.status) filters.status = req.query.status;
      const logs = await storage.getJobLogs(filters);
      const employees = await storage.getFieldEmployees();
      const logsWithPhotos = await Promise.all(
        logs.map(async (log2) => {
          const photos = await storage.getJobLogPhotos(log2.id);
          return { ...log2, photos };
        })
      );
      res.json({ success: true, jobLogs: logsWithPhotos, employees });
    } catch (error) {
      console.error("Error fetching admin job logs:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  app2.get("/api/admin/field-employees", requireAdmin, async (req, res) => {
    try {
      const employees = await storage.getFieldEmployees();
      res.json({ success: true, employees });
    } catch (error) {
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  app2.post("/api/admin/field-employees", requireAdmin, async (req, res) => {
    try {
      const data = insertFieldEmployeeSchema.parse(req.body);
      const employee = await storage.createFieldEmployee(data);
      res.json({ success: true, employee });
    } catch (error) {
      if (error instanceof z2.ZodError) {
        res.status(400).json({ success: false, message: "Invalid data", errors: error.errors });
      } else {
        res.status(500).json({ success: false, message: "Internal server error" });
      }
    }
  });
  app2.patch("/api/admin/field-employees/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateSchema = insertFieldEmployeeSchema.partial();
      const validatedData = updateSchema.parse(req.body);
      const employee = await storage.updateFieldEmployee(id, validatedData);
      res.json({ success: true, employee });
    } catch (error) {
      if (error instanceof z2.ZodError) {
        res.status(400).json({ success: false, message: "Invalid data", errors: error.errors });
      } else {
        res.status(500).json({ success: false, message: "Internal server error" });
      }
    }
  });
  app2.delete("/api/admin/field-employees/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteFieldEmployee(id);
      res.json({ success: true, message: "Employee deleted" });
    } catch (error) {
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  app2.patch("/api/admin/job-logs/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const allowed = ["siteLocation", "servicedArea", "workPerformed", "customerName", "jobDate", "status"];
      const updates = {};
      for (const key of allowed) {
        if (req.body[key] !== void 0) updates[key] = req.body[key];
      }
      if (updates.jobDate && typeof updates.jobDate === "string") {
        updates.jobDate = new Date(updates.jobDate);
      }
      const existingJobLog = await storage.getJobLogById(id);
      const oldStatus = existingJobLog?.status;
      const newStatus = updates.status;
      const jobLog = await storage.updateJobLog(id, updates);
      if (oldStatus && newStatus && oldStatus !== newStatus) {
        notifyJobStatusChange(jobLog, oldStatus, newStatus).catch((err) => {
          console.error("[JobStatusNotification] Failed for admin job update", id, err);
        });
      }
      if (oldStatus !== "completed" && newStatus === "completed") {
        scheduleReviewRequestForJobLog(id).catch((err) => {
          console.error("[ReviewRequest] Error scheduling review request on job completion:", err);
        });
      }
      res.json({ success: true, jobLog });
    } catch (error) {
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  app2.delete("/api/admin/job-logs/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteJobLog(id);
      res.json({ success: true, message: "Job log deleted" });
    } catch (error) {
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  app2.get("/api/admin/custom-fields", requireAdmin, async (req, res) => {
    try {
      const fields = await storage.getJobLogCustomFields();
      res.json({ success: true, fields });
    } catch (error) {
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  app2.post("/api/admin/custom-fields", requireAdmin, async (req, res) => {
    try {
      const data = insertJobLogCustomFieldSchema.parse(req.body);
      if (data.fieldType === "select" && (!data.options || data.options.trim() === "")) {
        return res.status(400).json({ success: false, message: "Select fields require at least one option" });
      }
      const field = await storage.createJobLogCustomField(data);
      res.json({ success: true, field });
    } catch (error) {
      if (error instanceof z2.ZodError) {
        res.status(400).json({ success: false, message: "Invalid data", errors: error.errors });
      } else {
        res.status(500).json({ success: false, message: "Internal server error" });
      }
    }
  });
  app2.patch("/api/admin/custom-fields/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = insertJobLogCustomFieldSchema.partial().parse(req.body);
      if (data.fieldType === "select" && data.options !== void 0 && (!data.options || data.options.trim() === "")) {
        return res.status(400).json({ success: false, message: "Select fields require at least one option" });
      }
      const field = await storage.updateJobLogCustomField(id, data);
      res.json({ success: true, field });
    } catch (error) {
      if (error instanceof z2.ZodError) {
        res.status(400).json({ success: false, message: "Invalid data", errors: error.errors });
      } else {
        res.status(500).json({ success: false, message: "Internal server error" });
      }
    }
  });
  app2.delete("/api/admin/custom-fields/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteJobLogCustomField(id);
      res.json({ success: true, message: "Custom field deleted" });
    } catch (error) {
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  app2.get("/api/field/custom-fields", requireFieldAuth, async (req, res) => {
    try {
      const allFields = await storage.getJobLogCustomFields();
      const activeFields = allFields.filter((f) => f.isActive);
      res.json({ success: true, fields: activeFields });
    } catch (error) {
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  app2.get("/api/admin/field-customers", requireAdmin, async (req, res) => {
    try {
      const customers = await storage.getFieldCustomers();
      res.json({ success: true, customers });
    } catch (error) {
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  app2.post("/api/admin/field-customers", requireAdmin, async (req, res) => {
    try {
      const data = insertFieldCustomerSchema.parse(req.body);
      const customer = await storage.createFieldCustomer(data);
      res.json({ success: true, customer });
    } catch (error) {
      if (error instanceof z2.ZodError) {
        res.status(400).json({ success: false, message: "Invalid data", errors: error.errors });
      } else {
        res.status(500).json({ success: false, message: "Internal server error" });
      }
    }
  });
  app2.patch("/api/admin/field-customers/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateSchema = insertFieldCustomerSchema.partial();
      const data = updateSchema.parse(req.body);
      const customer = await storage.updateFieldCustomer(id, data);
      res.json({ success: true, customer });
    } catch (error) {
      if (error instanceof z2.ZodError) {
        res.status(400).json({ success: false, message: "Invalid data", errors: error.errors });
      } else {
        res.status(500).json({ success: false, message: "Internal server error" });
      }
    }
  });
  app2.delete("/api/admin/field-customers/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteFieldCustomer(id);
      res.json({ success: true, message: "Customer deleted" });
    } catch (error) {
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  app2.get("/api/admin/site-locations", requireAdmin, async (req, res) => {
    try {
      const locations = await storage.getSiteLocations();
      res.json({ success: true, locations });
    } catch (error) {
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  app2.post("/api/admin/site-locations", requireAdmin, async (req, res) => {
    try {
      const data = insertSiteLocationSchema.parse(req.body);
      const location = await storage.createSiteLocation(data);
      res.json({ success: true, location });
    } catch (error) {
      if (error instanceof z2.ZodError) {
        res.status(400).json({ success: false, message: "Invalid data", errors: error.errors });
      } else {
        res.status(500).json({ success: false, message: "Internal server error" });
      }
    }
  });
  app2.patch("/api/admin/site-locations/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateSchema = insertSiteLocationSchema.partial();
      const data = updateSchema.parse(req.body);
      const location = await storage.updateSiteLocation(id, data);
      res.json({ success: true, location });
    } catch (error) {
      if (error instanceof z2.ZodError) {
        res.status(400).json({ success: false, message: "Invalid data", errors: error.errors });
      } else {
        res.status(500).json({ success: false, message: "Internal server error" });
      }
    }
  });
  app2.delete("/api/admin/site-locations/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteSiteLocation(id);
      res.json({ success: true, message: "Location deleted" });
    } catch (error) {
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  app2.get("/api/admin/serviced-areas", requireAdmin, async (req, res) => {
    try {
      const areas = await storage.getServicedAreas();
      res.json({ success: true, areas });
    } catch (error) {
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  app2.post("/api/admin/serviced-areas", requireAdmin, async (req, res) => {
    try {
      const data = insertServicedAreaSchema.parse(req.body);
      const area = await storage.createServicedArea(data);
      res.json({ success: true, area });
    } catch (error) {
      if (error instanceof z2.ZodError) {
        res.status(400).json({ success: false, message: "Invalid data", errors: error.errors });
      } else {
        res.status(500).json({ success: false, message: "Internal server error" });
      }
    }
  });
  app2.patch("/api/admin/serviced-areas/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateSchema = insertServicedAreaSchema.partial();
      const data = updateSchema.parse(req.body);
      const area = await storage.updateServicedArea(id, data);
      res.json({ success: true, area });
    } catch (error) {
      if (error instanceof z2.ZodError) {
        res.status(400).json({ success: false, message: "Invalid data", errors: error.errors });
      } else {
        res.status(500).json({ success: false, message: "Internal server error" });
      }
    }
  });
  app2.delete("/api/admin/serviced-areas/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteServicedArea(id);
      res.json({ success: true, message: "Area deleted" });
    } catch (error) {
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  app2.get("/api/admin/service-contracts/calendar", requireAdmin, async (req, res) => {
    try {
      const fromParam = req.query.from;
      const toParam = req.query.to;
      if (!fromParam || !toParam) {
        return res.status(400).json({
          success: false,
          message: "Missing required query parameters: 'from' and 'to' (ISO date strings)"
        });
      }
      const from = new Date(fromParam);
      const to = new Date(toParam);
      if (isNaN(from.getTime()) || isNaN(to.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid date format. Use ISO date strings (e.g., '2026-01-01')"
        });
      }
      to.setHours(23, 59, 59, 999);
      const contracts = await storage.getServiceContractsInDateRange(from, to);
      res.json({ success: true, contracts });
    } catch (error) {
      console.error("Error fetching calendar contracts:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  app2.get("/api/admin/service-contracts", requireAdmin, async (req, res) => {
    try {
      const customerId = req.query.customerId ? parseInt(req.query.customerId) : void 0;
      const isActive = req.query.isActive !== void 0 ? req.query.isActive === "true" : void 0;
      const assignedEmployeeId = req.query.assignedEmployeeId ? parseInt(req.query.assignedEmployeeId) : void 0;
      const contracts = await storage.getServiceContracts({ customerId, isActive, assignedEmployeeId });
      res.json({ success: true, contracts });
    } catch (error) {
      console.error("Error fetching service contracts:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  app2.get("/api/admin/service-contracts/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const contract = await storage.getServiceContract(id);
      if (!contract) {
        return res.status(404).json({ success: false, message: "Service contract not found" });
      }
      res.json({ success: true, contract });
    } catch (error) {
      console.error("Error fetching service contract:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  app2.post("/api/admin/service-contracts", requireAdmin, async (req, res) => {
    try {
      const validatedData = insertServiceContractSchema.parse(req.body);
      const contract = await storage.createServiceContract(validatedData);
      res.json({ success: true, message: "Service contract created successfully", contract });
    } catch (error) {
      if (error instanceof z2.ZodError) {
        res.status(400).json({ success: false, message: "Invalid contract data", errors: error.errors });
      } else {
        console.error("Error creating service contract:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
      }
    }
  });
  app2.patch("/api/admin/service-contracts/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertServiceContractSchema.partial().parse(req.body);
      const contract = await storage.updateServiceContract(id, validatedData);
      res.json({ success: true, message: "Service contract updated successfully", contract });
    } catch (error) {
      if (error instanceof z2.ZodError) {
        res.status(400).json({ success: false, message: "Invalid contract data", errors: error.errors });
      } else {
        console.error("Error updating service contract:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
      }
    }
  });
  app2.delete("/api/admin/service-contracts/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteServiceContract(id);
      res.json({ success: true, message: "Service contract deleted successfully" });
    } catch (error) {
      console.error("Error deleting service contract:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  app2.post("/api/admin/service-contracts/:id/generate-job", requireAdmin, async (req, res) => {
    try {
      const contractId = parseInt(req.params.id);
      const contract = await storage.getServiceContract(contractId);
      if (!contract) {
        return res.status(404).json({ success: false, message: "Service contract not found" });
      }
      if (!contract.isActive) {
        return res.status(400).json({ success: false, message: "Cannot generate job from an inactive contract" });
      }
      if (!contract.assignedEmployeeId) {
        return res.status(400).json({ success: false, message: "Contract has no assigned technician \u2014 assign one before generating a job" });
      }
      if (contract.lastGeneratedJobDate) {
        const now = /* @__PURE__ */ new Date();
        const last = new Date(contract.lastGeneratedJobDate);
        let windowMs = 28 * 24 * 60 * 60 * 1e3;
        if (contract.frequency === "weekly") windowMs = 7 * 24 * 60 * 60 * 1e3;
        if (contract.frequency === "quarterly") windowMs = 84 * 24 * 60 * 60 * 1e3;
        if (contract.frequency === "bi-annual") windowMs = 180 * 24 * 60 * 60 * 1e3;
        if (contract.frequency === "annual") windowMs = 365 * 24 * 60 * 60 * 1e3;
        if (now.getTime() - last.getTime() < windowMs) {
          return res.status(409).json({
            success: false,
            message: "A job has already been generated for this contract in the current cycle",
            lastGeneratedJobDate: contract.lastGeneratedJobDate
          });
        }
      }
      const result = await storage.generateJobFromContract(contractId);
      res.json({
        success: true,
        message: "Job generated successfully",
        jobLog: result.jobLog,
        updatedContract: result.updatedContract
      });
    } catch (error) {
      console.error("Error generating job from contract:", error);
      if (error instanceof Error && error.message === "Service contract not found") {
        return res.status(404).json({ success: false, message: "Service contract not found" });
      }
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  app2.post("/api/field/photos/sign", requireFieldAuth, (req, res) => {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    if (!cloudName || !apiKey || !apiSecret) {
      return res.status(503).json({ success: false, message: "Cloudinary is not configured" });
    }
    const timestamp2 = Math.round(Date.now() / 1e3);
    const folder = "aps-job-logs";
    const paramsToSign = {
      timestamp: timestamp2,
      folder,
      allowed_formats: "jpg,jpeg,png,webp,heic",
      max_file_size: 5242880
    };
    const signature = cloudinary.utils.api_sign_request(paramsToSign, apiSecret);
    res.json({
      signature,
      timestamp: timestamp2,
      folder,
      cloudName,
      apiKey
    });
  });
  app2.get("/api/field/job-logs/:logId/photos", requireFieldAuth, async (req, res) => {
    try {
      const logId = parseInt(req.params.logId);
      if (isNaN(logId)) return res.status(400).json({ success: false, message: "Invalid log ID" });
      const log2 = await storage.getJobLog(logId);
      if (!log2 || log2.employeeId !== req.session.fieldEmployeeId) {
        return res.status(403).json({ success: false, message: "Forbidden" });
      }
      const photos = await storage.getJobLogPhotos(logId);
      res.json({ success: true, photos });
    } catch (error) {
      console.error("Error fetching photos:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  app2.post("/api/field/job-logs/:logId/photos", requireFieldAuth, async (req, res) => {
    try {
      const logId = parseInt(req.params.logId);
      if (isNaN(logId)) return res.status(400).json({ success: false, message: "Invalid log ID" });
      const log2 = await storage.getJobLog(logId);
      if (!log2 || log2.employeeId !== req.session.fieldEmployeeId) {
        return res.status(403).json({ success: false, message: "Forbidden" });
      }
      const parsed = insertJobLogPhotoSchema.safeParse({ ...req.body, jobLogId: logId });
      if (!parsed.success) {
        return res.status(400).json({ success: false, error: parsed.error.flatten() });
      }
      const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
      const urlObj = new URL(parsed.data.url);
      if (!urlObj.hostname.includes("cloudinary.com") || !urlObj.pathname.startsWith(`/${cloudName}`)) {
        return res.status(400).json({ success: false, message: "Invalid image host" });
      }
      try {
        const photo = await storage.createJobLogPhoto(parsed.data);
        res.status(201).json({ success: true, photo });
      } catch (err) {
        if (err.message === "MAX_PHOTOS_EXCEEDED") {
          return res.status(422).json({ success: false, message: "Maximum 5 photos per log" });
        }
        throw err;
      }
    } catch (error) {
      console.error("Error saving photo:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  app2.delete("/api/field/job-logs/:logId/photos/:photoId", requireFieldAuth, async (req, res) => {
    try {
      const logId = parseInt(req.params.logId);
      const photoId = parseInt(req.params.photoId);
      if (isNaN(logId) || isNaN(photoId)) {
        return res.status(400).json({ success: false, message: "Invalid ID" });
      }
      const log2 = await storage.getJobLog(logId);
      if (!log2 || log2.employeeId !== req.session.fieldEmployeeId) {
        return res.status(403).json({ success: false, message: "Forbidden" });
      }
      await storage.deleteJobLogPhoto(photoId, logId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting photo:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  app2.get("/api/admin/job-logs/:logId/photos", requireAdmin, async (req, res) => {
    try {
      const logId = parseInt(req.params.logId);
      if (isNaN(logId)) return res.status(400).json({ success: false, message: "Invalid log ID" });
      const photos = await storage.getJobLogPhotos(logId);
      res.json({ success: true, photos });
    } catch (error) {
      console.error("Error fetching admin photos:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  app2.get("/api/admin/field-materials", requireAdmin, async (req, res) => {
    try {
      const category = req.query.category;
      const materials = await storage.getFieldMaterials(category);
      res.json({ success: true, materials });
    } catch (error) {
      console.error("Error fetching field materials:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  app2.post("/api/admin/field-materials", requireAdmin, async (req, res) => {
    try {
      const material = await storage.createFieldMaterial(req.body);
      res.json({ success: true, material });
    } catch (error) {
      console.error("Error creating field material:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  app2.put("/api/admin/field-materials/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const material = await storage.updateFieldMaterial(id, req.body);
      res.json({ success: true, material });
    } catch (error) {
      console.error("Error updating field material:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  app2.delete("/api/admin/field-materials/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteFieldMaterial(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting field material:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  app2.get("/api/field/materials", async (req, res) => {
    try {
      const category = req.query.category;
      const allMaterials = await storage.getFieldMaterials(category);
      const active = allMaterials.filter((m) => m.isActive);
      res.json({ success: true, materials: active });
    } catch (error) {
      console.error("Error fetching field materials:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  app2.get("/api/admin/service-rates", requireAdmin, async (req, res) => {
    try {
      const rates = await storage.getServiceRates();
      res.json({ success: true, rates });
    } catch (error) {
      console.error("Error fetching service rates:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  app2.post("/api/admin/service-rates", requireAdmin, async (req, res) => {
    try {
      const rate = await storage.createServiceRate(req.body);
      res.status(201).json({ success: true, rate });
    } catch (error) {
      console.error("Error creating service rate:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  app2.put("/api/admin/service-rates/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const rate = await storage.updateServiceRate(id, req.body);
      res.json({ success: true, rate });
    } catch (error) {
      console.error("Error updating service rate:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  app2.delete("/api/admin/service-rates/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteServiceRate(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting service rate:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  app2.get("/api/admin/invoices", requireAdmin, async (req, res) => {
    try {
      const filters = {};
      if (req.query.clientId) filters.clientId = parseInt(req.query.clientId);
      if (req.query.status) filters.status = req.query.status;
      if (req.query.fromDate) filters.fromDate = new Date(req.query.fromDate);
      if (req.query.toDate) filters.toDate = new Date(req.query.toDate);
      if (req.query.page) filters.page = parseInt(req.query.page);
      if (req.query.limit) filters.limit = parseInt(req.query.limit);
      const invoices2 = await storage.listInvoices(filters);
      res.json({ success: true, invoices: invoices2 });
    } catch (error) {
      console.error("Error fetching invoices:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  app2.get("/api/admin/invoices/stats", requireAdmin, async (req, res) => {
    try {
      const stats = await storage.getInvoiceStats();
      res.json({ success: true, stats });
    } catch (error) {
      console.error("Error fetching invoice stats:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  app2.get("/api/admin/invoices/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const invoice = await storage.getInvoice(id);
      if (!invoice) {
        return res.status(404).json({ success: false, message: "Invoice not found" });
      }
      const client = await storage.getClient(invoice.clientId);
      const lineItems = await storage.getLineItemsByInvoice(id);
      const statusLogs = await storage.getInvoiceStatusLog(id);
      res.json({
        success: true,
        invoice: {
          ...invoice,
          client,
          lineItems,
          statusLogs
        }
      });
    } catch (error) {
      console.error("Error fetching invoice:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  app2.post("/api/admin/invoices", requireAdmin, async (req, res) => {
    try {
      const validatedData = insertInvoiceSchema.parse(req.body);
      const userId = req.session.userId;
      const invoice = await storage.createInvoice({
        ...validatedData,
        createdBy: userId
      });
      if (req.body.lineItems && Array.isArray(req.body.lineItems)) {
        for (const item of req.body.lineItems) {
          const lineItemData = insertInvoiceLineItemSchema.parse({
            ...item,
            invoiceId: invoice.id
          });
          await storage.createLineItem(lineItemData);
        }
        const lineItems2 = await storage.getLineItemsByInvoice(invoice.id);
        let subtotal = 0;
        let taxTotal = 0;
        for (const item of lineItems2) {
          subtotal += parseFloat(String(item.lineTotal));
          taxTotal += parseFloat(String(item.lineTax));
        }
        await storage.updateInvoice(invoice.id, {
          subtotal: subtotal.toFixed(2),
          taxTotal: taxTotal.toFixed(2),
          total: (subtotal + taxTotal).toFixed(2)
        });
      }
      const updatedInvoice = await storage.getInvoice(invoice.id);
      const lineItems = await storage.getLineItemsByInvoice(invoice.id);
      res.status(201).json({
        success: true,
        message: "Invoice created successfully",
        invoice: { ...updatedInvoice, lineItems }
      });
    } catch (error) {
      if (error instanceof z2.ZodError) {
        res.status(400).json({ success: false, message: "Invalid invoice data", errors: error.errors });
      } else {
        console.error("Error creating invoice:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
      }
    }
  });
  app2.put("/api/admin/invoices/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const invoice = await storage.getInvoice(id);
      if (!invoice) {
        return res.status(404).json({ success: false, message: "Invoice not found" });
      }
      if (invoice.status !== "draft") {
        return res.status(400).json({ success: false, message: "Can only edit invoices in draft status" });
      }
      const { status: _status, ...bodyWithoutStatus } = req.body;
      const validatedData = insertInvoiceSchema.partial().parse(bodyWithoutStatus);
      await storage.updateInvoice(id, validatedData);
      if (req.body.lineItems !== void 0) {
        const existingItems = await storage.getLineItemsByInvoice(id);
        for (const item of existingItems) {
          await storage.deleteLineItem(item.id);
        }
        if (Array.isArray(req.body.lineItems)) {
          for (const item of req.body.lineItems) {
            const lineItemData = insertInvoiceLineItemSchema.parse({
              ...item,
              invoiceId: id
            });
            await storage.createLineItem(lineItemData);
          }
        }
        const lineItems2 = await storage.getLineItemsByInvoice(id);
        let subtotal = 0;
        let taxTotal = 0;
        for (const item of lineItems2) {
          subtotal += parseFloat(String(item.lineTotal));
          taxTotal += parseFloat(String(item.lineTax));
        }
        await storage.updateInvoice(id, {
          subtotal: subtotal.toFixed(2),
          taxTotal: taxTotal.toFixed(2),
          total: (subtotal + taxTotal).toFixed(2)
        });
      }
      const updatedInvoice = await storage.getInvoice(id);
      const lineItems = await storage.getLineItemsByInvoice(id);
      const statusLogs = await storage.getInvoiceStatusLog(id);
      res.json({
        success: true,
        message: "Invoice updated successfully",
        invoice: { ...updatedInvoice, lineItems, statusLogs }
      });
    } catch (error) {
      if (error instanceof z2.ZodError) {
        res.status(400).json({ success: false, message: "Invalid invoice data", errors: error.errors });
      } else {
        console.error("Error updating invoice:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
      }
    }
  });
  app2.post("/api/admin/invoices/:id/send", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const invoice = await storage.getInvoice(id);
      if (!invoice) {
        return res.status(404).json({ success: false, message: "Invoice not found" });
      }
      try {
        assertTransition(invoice.status, "sent");
      } catch (e) {
        return res.status(400).json({ success: false, message: e.message });
      }
      const client = await storage.getClient(invoice.clientId);
      if (!client || !client.email) {
        return res.status(400).json({ success: false, message: "Client email not found" });
      }
      const adminBaseUrl = await getAppBaseUrl();
      const lineItems = await storage.getLineItemsByInvoice(id);
      let pdfBuffer;
      try {
        pdfBuffer = generateInvoicePdf({
          invoiceNumber: invoice.invoiceNumber,
          status: "sent",
          issueDate: String(invoice.issueDate),
          dueDate: String(invoice.dueDate),
          subtotal: String(invoice.subtotal),
          taxTotal: String(invoice.taxTotal),
          total: String(invoice.total),
          notes: invoice.notes,
          client: { name: client.name, email: client.email, address: client.address, phone: client.phone, propertyType: client.propertyType },
          lineItems: lineItems.map((li) => ({
            description: li.description,
            quantity: String(li.quantity),
            unitRate: String(li.unitRate),
            taxRate: String(li.taxRate),
            lineTotal: String(li.lineTotal),
            lineTax: String(li.lineTax),
            serviceDate: li.serviceDate,
            technicianName: li.technicianName,
            serviceType: li.serviceType,
            serviceAddress: li.serviceAddress,
            servicedArea: li.servicedArea,
            materials: li.materials
          }))
        });
      } catch (e) {
        console.error(`[Invoice ${invoice.invoiceNumber}] PDF generation failed:`, e);
      }
      const emailSent = await sendInvoiceEmail({
        clientEmail: client.email,
        clientName: client.name,
        invoiceNumber: invoice.invoiceNumber,
        invoiceDate: new Date(invoice.issueDate),
        dueDate: new Date(invoice.dueDate),
        total: String(invoice.total),
        viewToken: invoice.viewToken,
        baseUrl: adminBaseUrl,
        pdfBuffer
      });
      if (!emailSent) {
        return res.status(500).json({ success: false, message: "Failed to send invoice email. Invoice status was not changed." });
      }
      await storage.updateInvoiceStatus(id, "sent", `admin:${req.session.userId}`, "Invoice sent to customer");
      const updatedInvoice = await storage.getInvoice(id);
      const statusLogs = await storage.getInvoiceStatusLog(id);
      res.json({
        success: true,
        message: "Invoice sent successfully",
        invoice: { ...updatedInvoice, lineItems, statusLogs }
      });
    } catch (error) {
      console.error("Error sending invoice:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  app2.post("/api/field/invoices/:id/send", requireFieldAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { overrideEmail } = req.body || {};
      const invoice = await storage.getInvoice(id);
      if (!invoice) {
        return res.status(404).json({ success: false, message: "Invoice not found" });
      }
      const client = await storage.getClient(invoice.clientId);
      const recipientEmail = overrideEmail?.trim() || client?.email || "";
      const recipientName = client?.name || "Valued Customer";
      if (!recipientEmail) {
        return res.status(400).json({ success: false, message: "No email address provided. Enter an email address to send the invoice." });
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(recipientEmail)) {
        return res.status(400).json({ success: false, message: "Invalid email address format." });
      }
      const fieldBaseUrl = await getAppBaseUrl();
      const fieldLineItems = await storage.getLineItemsByInvoice(id);
      let fieldPdfBuffer;
      try {
        fieldPdfBuffer = generateInvoicePdf({
          invoiceNumber: invoice.invoiceNumber,
          status: "sent",
          issueDate: String(invoice.issueDate),
          dueDate: String(invoice.dueDate),
          subtotal: String(invoice.subtotal),
          taxTotal: String(invoice.taxTotal),
          total: String(invoice.total),
          notes: invoice.notes,
          client: client ? { name: client.name, email: client.email, address: client.address, phone: client.phone, propertyType: client.propertyType } : { name: recipientName },
          lineItems: fieldLineItems.map((li) => ({
            description: li.description,
            quantity: String(li.quantity),
            unitRate: String(li.unitRate),
            taxRate: String(li.taxRate),
            lineTotal: String(li.lineTotal),
            lineTax: String(li.lineTax),
            serviceDate: li.serviceDate,
            technicianName: li.technicianName,
            serviceType: li.serviceType,
            serviceAddress: li.serviceAddress,
            servicedArea: li.servicedArea,
            materials: li.materials
          }))
        });
      } catch (e) {
        console.error(`[Invoice ${invoice.invoiceNumber}] PDF generation failed:`, e);
      }
      const fieldEmailSent = await sendInvoiceEmail({
        clientEmail: recipientEmail,
        clientName: recipientName,
        invoiceNumber: invoice.invoiceNumber,
        invoiceDate: new Date(invoice.issueDate),
        dueDate: new Date(invoice.dueDate),
        total: String(invoice.total),
        viewToken: invoice.viewToken,
        baseUrl: fieldBaseUrl,
        pdfBuffer: fieldPdfBuffer
      });
      if (!fieldEmailSent) {
        return res.status(500).json({ success: false, message: "Failed to send invoice email. Please try again." });
      }
      await storage.updateInvoiceStatus(id, "sent", `field:${req.session.fieldEmployeeId}`, `Invoice sent by field technician to ${recipientEmail}`);
      res.json({ success: true, message: `Invoice emailed to ${recipientEmail}` });
    } catch (error) {
      console.error("Error sending field invoice:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  app2.post("/api/admin/invoices/:id/mark-paid", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { paymentMethod, paymentAmount, paymentNote } = req.body;
      const invoice = await storage.getInvoice(id);
      if (!invoice) {
        return res.status(404).json({ success: false, message: "Invoice not found" });
      }
      try {
        assertTransition(invoice.status, "paid");
      } catch (e) {
        return res.status(400).json({ success: false, message: e.message });
      }
      await storage.updateInvoice(id, {
        paymentMethod: paymentMethod || "other",
        paymentAmount: paymentAmount || invoice.total,
        paymentNote
      });
      await storage.updateInvoiceStatus(id, "paid", `admin:${req.session.userId}`, "Payment recorded");
      const client = await storage.getClient(invoice.clientId);
      if (client?.email) {
        await sendPaymentConfirmationEmail({
          clientEmail: client.email,
          clientName: client.name,
          invoiceNumber: invoice.invoiceNumber,
          amountPaid: String(paymentAmount || invoice.total),
          paidAt: /* @__PURE__ */ new Date(),
          paymentMethod: paymentMethod || "other"
        });
        scheduleReviewRequestForInvoice(id).catch((err) => {
          console.error("[ReviewRequest] Error scheduling review request on invoice paid:", err);
        });
      }
      const updatedInvoice = await storage.getInvoice(id);
      const lineItems = await storage.getLineItemsByInvoice(id);
      const statusLogs = await storage.getInvoiceStatusLog(id);
      res.json({
        success: true,
        message: "Invoice marked as paid",
        invoice: { ...updatedInvoice, lineItems, statusLogs }
      });
    } catch (error) {
      console.error("Error marking invoice as paid:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  app2.post("/api/admin/invoices/:id/void", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { reason } = req.body;
      const invoice = await storage.getInvoice(id);
      if (!invoice) {
        return res.status(404).json({ success: false, message: "Invoice not found" });
      }
      try {
        assertTransition(invoice.status, "void");
      } catch (e) {
        return res.status(400).json({ success: false, message: e.message });
      }
      await storage.updateInvoice(id, { voidReason: reason });
      await storage.updateInvoiceStatus(id, "void", `admin:${req.session.userId}`, reason || "Invoice voided");
      const updatedInvoice = await storage.getInvoice(id);
      const lineItems = await storage.getLineItemsByInvoice(id);
      const statusLogs = await storage.getInvoiceStatusLog(id);
      res.json({
        success: true,
        message: "Invoice voided",
        invoice: { ...updatedInvoice, lineItems, statusLogs }
      });
    } catch (error) {
      console.error("Error voiding invoice:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  app2.get("/api/admin/invoices/:id/log", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const logs = await storage.getInvoiceStatusLog(id);
      res.json({ success: true, logs });
    } catch (error) {
      console.error("Error fetching invoice logs:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  app2.post("/api/admin/invoices/from-job/:jobLogId", requireAdmin, async (req, res) => {
    try {
      const jobLogId = parseInt(req.params.jobLogId);
      const { dueDate } = req.body;
      if (!dueDate) {
        return res.status(400).json({ success: false, message: "dueDate is required" });
      }
      const userId = req.session.userId;
      const invoice = await storage.createInvoiceFromJobLog(
        jobLogId,
        new Date(dueDate),
        userId
      );
      const lineItems = await storage.getLineItemsByInvoice(invoice.id);
      const statusLogs = await storage.getInvoiceStatusLog(invoice.id);
      res.status(201).json({
        success: true,
        message: "Invoice created from job log",
        invoice: { ...invoice, lineItems, statusLogs }
      });
    } catch (error) {
      console.error("Error creating invoice from job log:", error);
      res.status(400).json({ success: false, message: error.message || "Internal server error" });
    }
  });
  app2.get("/api/invoices/view/:token", async (req, res) => {
    try {
      const { token } = req.params;
      const invoice = await storage.getInvoiceByToken(token);
      if (!invoice) {
        return res.status(404).json({ success: false, message: "Invoice not found" });
      }
      if (invoice.status === "sent") {
        await storage.updateInvoiceStatus(invoice.id, "viewed", "customer", "Customer viewed invoice");
        const updated = await storage.getInvoice(invoice.id);
        Object.assign(invoice, updated);
      }
      const client = await storage.getClient(invoice.clientId);
      const lineItems = await storage.getLineItemsByInvoice(invoice.id);
      const jobLogIds = lineItems.map((li) => li.jobLogId).filter(Boolean);
      const uniqueJobLogIds = [...new Set(jobLogIds)];
      let photos = [];
      for (const jlId of uniqueJobLogIds) {
        try {
          const jlPhotos = await storage.getJobLogPhotos(jlId);
          photos.push(...jlPhotos.map((p) => ({ ...p, jobLogId: jlId })));
        } catch {
        }
      }
      res.json({
        success: true,
        invoice: {
          id: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          status: invoice.status,
          issueDate: invoice.issueDate,
          dueDate: invoice.dueDate,
          subtotal: invoice.subtotal,
          taxTotal: invoice.taxTotal,
          total: invoice.total,
          notes: invoice.notes,
          pdfUrl: invoice.pdfUrl,
          client: client ? { name: client.name, email: client.email, address: client.address, phone: client.phone, propertyType: client.propertyType } : void 0,
          lineItems,
          photos
        }
      });
    } catch (error) {
      console.error("Error viewing invoice:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  app2.post("/api/admin/invoices/mark-overdue", requireAdmin, async (req, res) => {
    try {
      const count = await storage.markInvoicesOverdue();
      res.json({ success: true, message: `${count} invoices marked as overdue`, count });
    } catch (error) {
      console.error("Error marking invoices overdue:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  app2.post("/api/admin/invoices/:id/generate-pdf", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const invoice = await storage.getInvoice(id);
      if (!invoice) {
        return res.status(404).json({ success: false, message: "Invoice not found" });
      }
      const client = await storage.getClient(invoice.clientId);
      const lineItems = await storage.getLineItemsByInvoice(id);
      if (!client) {
        return res.status(400).json({ success: false, message: "Client not found" });
      }
      const doc = new jsPDF2();
      doc.setFontSize(24);
      doc.setTextColor(40, 40, 40);
      doc.text("INVOICE", 20, 30);
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text(`Invoice #: ${invoice.invoiceNumber}`, 20, 45);
      doc.text(`Date: ${new Date(invoice.issueDate).toLocaleDateString()}`, 20, 52);
      doc.text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`, 20, 59);
      doc.setFontSize(10);
      doc.text("From:", 120, 40);
      doc.setFontSize(11);
      doc.text("Absolute Pest Services", 120, 46);
      doc.setFontSize(9);
      doc.text("rob@absolutepestservices.com", 120, 52);
      doc.setFontSize(10);
      doc.text("Bill To:", 20, 75);
      doc.setFontSize(11);
      doc.text(client.name, 20, 81);
      doc.setFontSize(9);
      if (client.address) doc.text(client.address, 20, 87);
      if (client.email) doc.text(client.email, 20, 93);
      const tableData = lineItems.map((item) => [
        item.description,
        item.quantity.toString(),
        `$${item.unitRate}`,
        `$${item.lineTotal}`
      ]);
      autoTable(doc, {
        startY: 105,
        head: [["Description", "Qty", "Unit Price", "Total"]],
        body: tableData,
        theme: "striped",
        headStyles: { fillColor: [66, 66, 66] }
      });
      const finalY = doc.lastAutoTable?.finalY || 150;
      doc.setFontSize(10);
      doc.text(`Subtotal: $${invoice.subtotal}`, 140, finalY + 15);
      doc.text(`Tax: $${invoice.taxTotal}`, 140, finalY + 22);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(`Total: $${invoice.total}`, 140, finalY + 30);
      if (invoice.notes) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.text("Notes:", 20, finalY + 45);
        doc.text(invoice.notes, 20, finalY + 51);
      }
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text("Thank you for your business!", 20, 280);
      const pdfDir = path.join(process.cwd(), "generated-pdfs");
      if (!fs.existsSync(pdfDir)) {
        fs.mkdirSync(pdfDir, { recursive: true });
      }
      const pdfFileName = `invoice-${invoice.invoiceNumber.replace(/[^a-zA-Z0-9]/g, "-")}.pdf`;
      const pdfPath = path.join(pdfDir, pdfFileName);
      const pdfBuffer = doc.output("arraybuffer");
      fs.writeFileSync(pdfPath, Buffer.from(pdfBuffer));
      const cloudinaryUpload = await cloudinary.uploader.upload(`data:application/pdf;base64,${Buffer.from(pdfBuffer).toString("base64")}`, {
        folder: "invoices",
        resource_type: "raw",
        public_id: pdfFileName.replace(".pdf", "")
      });
      const pdfUrl = cloudinaryUpload.secure_url;
      await storage.updateInvoice(id, { pdfUrl });
      const updatedInvoice = await storage.getInvoice(id);
      res.json({
        success: true,
        message: "PDF generated successfully",
        invoice: updatedInvoice
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      res.status(500).json({ success: false, message: "Failed to generate PDF" });
    }
  });
  async function getAppBaseUrl() {
    const stored = await storage.getSystemSetting("app_base_url");
    if (stored && stored.trim()) return stored.trim().replace(/\/$/, "");
    if (process.env.APP_BASE_URL) return process.env.APP_BASE_URL.replace(/\/$/, "");
    const replitDomains = process.env.REPLIT_DOMAINS;
    if (replitDomains) {
      const primaryDomain = replitDomains.split(",")[0].trim();
      if (primaryDomain) return `https://${primaryDomain}`;
    }
    if (process.env.REPLIT_DEV_DOMAIN) return `https://${process.env.REPLIT_DEV_DOMAIN}`;
    return "http://localhost:5000";
  }
  app2.get("/api/admin/settings/app-url", requireAdmin, async (req, res) => {
    try {
      const appUrl = await storage.getSystemSetting("app_base_url");
      res.json({ success: true, appUrl: appUrl || "" });
    } catch (error) {
      res.status(500).json({ success: false, message: "Failed to fetch app URL" });
    }
  });
  app2.patch("/api/admin/settings/app-url", requireAdmin, async (req, res) => {
    try {
      const { appUrl } = req.body;
      if (typeof appUrl !== "string") {
        return res.status(400).json({ success: false, message: "Invalid value" });
      }
      const trimmed = appUrl.trim().replace(/\/$/, "");
      const userId = req.session?.userId;
      await storage.setSystemSetting("app_base_url", trimmed, userId);
      res.json({ success: true, appUrl: trimmed });
    } catch (error) {
      res.status(500).json({ success: false, message: "Failed to save app URL" });
    }
  });
  app2.get("/api/admin/settings/timezone", requireAdmin, async (req, res) => {
    try {
      const tz = await storage.getSystemSetting("timezone");
      res.json({ success: true, timezone: tz || "America/New_York" });
    } catch (error) {
      console.error("Error fetching timezone:", error);
      res.status(500).json({ success: false, message: "Failed to fetch timezone" });
    }
  });
  app2.patch("/api/admin/settings/timezone", requireAdmin, async (req, res) => {
    try {
      const { timezone } = req.body;
      const validTimezones = [
        "America/New_York",
        "America/Chicago",
        "America/Denver",
        "America/Los_Angeles",
        "America/Anchorage",
        "Pacific/Honolulu"
      ];
      if (!timezone || typeof timezone !== "string" || !validTimezones.includes(timezone)) {
        return res.status(400).json({ success: false, message: "Invalid timezone value" });
      }
      const userId = req.session?.userId;
      await storage.setSystemSetting("timezone", timezone, userId);
      res.json({ success: true, timezone });
    } catch (error) {
      console.error("Error updating timezone:", error);
      res.status(500).json({ success: false, message: "Failed to update timezone" });
    }
  });
  app2.get("/api/admin/reminders/settings", requireAdmin, async (req, res) => {
    try {
      const settings = await storage.getAllReminderSettings();
      res.json({ success: true, settings });
    } catch (error) {
      console.error("Error fetching reminder settings:", error);
      res.status(500).json({ success: false, message: "Failed to fetch settings" });
    }
  });
  app2.patch("/api/admin/reminders/settings", requireAdmin, async (req, res) => {
    try {
      const userId = req.session?.userId;
      const settings = await storage.setReminderSettings(req.body, userId);
      res.json({ success: true, settings });
    } catch (error) {
      console.error("Error updating reminder settings:", error);
      res.status(500).json({ success: false, message: "Failed to update settings" });
    }
  });
  app2.get("/api/admin/reminders/logs", requireAdmin, async (req, res) => {
    try {
      const { appointmentType, appointmentId, limit } = req.query;
      const logs = await storage.getReminderLogs(
        appointmentType,
        appointmentId ? parseInt(appointmentId) : void 0,
        limit ? parseInt(limit) : void 0
      );
      res.json({ success: true, logs });
    } catch (error) {
      console.error("Error fetching reminder logs:", error);
      res.status(500).json({ success: false, message: "Failed to fetch logs" });
    }
  });
  app2.delete("/api/admin/reminders/logs/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteReminderLog(id);
      res.json({ success: true, message: "Reminder log deleted" });
    } catch (error) {
      console.error("Error deleting reminder log:", error);
      res.status(500).json({ success: false, message: "Failed to delete log" });
    }
  });
  app2.post("/api/admin/reminders/send-now", requireAdmin, async (req, res) => {
    try {
      const { appointmentType, appointmentId, reminderType, channel } = req.body;
      let appointment;
      let reminderData;
      if (appointmentType === "inspection") {
        const inspections = await storage.getInspectionSchedules();
        appointment = inspections.find((i) => i.id === appointmentId);
        if (appointment) {
          reminderData = {
            appointmentType: "inspection",
            appointmentId: appointment.id,
            customerName: `${appointment.firstName} ${appointment.lastName}`,
            email: appointment.email,
            phone: appointment.phone,
            serviceType: appointment.serviceType,
            appointmentDate: new Date(appointment.preferredDate),
            appointmentTime: appointment.preferredTime,
            address: appointment.address,
            city: appointment.city
          };
        }
      } else if (appointmentType === "service_request") {
        const srs = await storage.getServiceRequests();
        appointment = srs.find((sr) => sr.id === appointmentId);
        if (appointment) {
          const user = await storage.getUser(appointment.userId);
          reminderData = {
            appointmentType: "service_request",
            appointmentId: appointment.id,
            customerName: `${appointment.firstName} ${appointment.lastName}`,
            email: user?.email || "",
            phone: user?.phone,
            serviceType: appointment.serviceType,
            appointmentDate: new Date(appointment.scheduledDate || /* @__PURE__ */ new Date()),
            address: appointment.address,
            city: appointment.city
          };
        }
      } else if (appointmentType === "job_log") {
        const jobLogs2 = await db.select().from(jobLogs).where(eq2(jobLogs.id, appointmentId));
        appointment = jobLogs2[0];
        if (appointment) {
          const client = appointment.clientId ? await storage.getClient(appointment.clientId) : null;
          reminderData = {
            appointmentType: "job_log",
            appointmentId: appointment.id,
            customerName: appointment.customerName,
            email: client?.email || "",
            phone: client?.phone,
            serviceType: appointment.workPerformed,
            appointmentDate: new Date(appointment.jobDate),
            address: appointment.siteAddress || appointment.siteLocation,
            city: ""
          };
        }
      }
      if (!reminderData) {
        return res.status(404).json({ success: false, message: "Appointment not found" });
      }
      let success = false;
      if (channel === "email" || !channel) {
        const { sendAppointmentReminderEmail: sendAppointmentReminderEmail2 } = await Promise.resolve().then(() => (init_email(), email_exports));
        success = await sendAppointmentReminderEmail2({
          recipientEmail: reminderData.email,
          customerName: reminderData.customerName,
          serviceType: reminderData.serviceType,
          appointmentDate: reminderData.appointmentDate,
          appointmentTime: reminderData.appointmentTime,
          address: reminderData.address,
          city: reminderData.city,
          reminderType: reminderType || "24h"
        });
      } else if (channel === "sms") {
        const { sendAppointmentReminderSMS: sendAppointmentReminderSMS2 } = await Promise.resolve().then(() => (init_sms(), sms_exports));
        success = await sendAppointmentReminderSMS2({
          toPhone: reminderData.phone || "",
          customerName: reminderData.customerName,
          serviceType: reminderData.serviceType,
          appointmentDate: reminderData.appointmentDate,
          appointmentTime: reminderData.appointmentTime,
          address: reminderData.address,
          reminderType: reminderType || "24h"
        });
      }
      await storage.createReminderLog({
        appointmentType,
        appointmentId,
        reminderType: reminderType || "24h",
        channel: channel || "email",
        recipientEmail: channel === "sms" ? void 0 : reminderData.email,
        recipientPhone: channel === "sms" ? reminderData.phone : void 0,
        success,
        errorMessage: success ? void 0 : "Manual send failed"
      });
      res.json({ success, message: success ? "Reminder sent" : "Failed to send reminder" });
    } catch (error) {
      console.error("Error sending manual reminder:", error);
      res.status(500).json({ success: false, message: "Failed to send reminder" });
    }
  });
  app2.get("/api/admin/reminders/opt-outs", requireAdmin, async (req, res) => {
    try {
      const optOuts = await storage.getReminderOptOuts();
      res.json({ success: true, optOuts });
    } catch (error) {
      console.error("Error fetching opt-outs:", error);
      res.status(500).json({ success: false, message: "Failed to fetch opt-outs" });
    }
  });
  app2.delete("/api/admin/reminders/opt-outs/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteReminderOptOut(id);
      res.json({ success: true, message: "Opt-out removed" });
    } catch (error) {
      console.error("Error deleting opt-out:", error);
      res.status(500).json({ success: false, message: "Failed to delete opt-out" });
    }
  });
  app2.get("/api/admin/reviews/settings", requireAdmin, async (req, res) => {
    try {
      const settings = await storage.getReviewSettings();
      res.json({ success: true, settings });
    } catch (error) {
      console.error("Error fetching review settings:", error);
      res.status(500).json({ success: false, message: "Failed to fetch review settings" });
    }
  });
  app2.patch("/api/admin/reviews/settings", requireAdmin, async (req, res) => {
    try {
      const updates = req.body;
      const settings = await storage.updateReviewSettings(updates);
      res.json({ success: true, settings });
    } catch (error) {
      console.error("Error updating review settings:", error);
      res.status(500).json({ success: false, message: "Failed to update review settings" });
    }
  });
  app2.get("/api/admin/reviews/logs", requireAdmin, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 50;
      const offset = parseInt(req.query.offset) || 0;
      const status = req.query.status || void 0;
      const clientId = req.query.clientId ? parseInt(req.query.clientId) : void 0;
      const result = await storage.getReviewRequestLogs({ limit, offset, status, clientId });
      res.json({ success: true, logs: result.logs, total: result.total });
    } catch (error) {
      console.error("Error fetching review request logs:", error);
      res.status(500).json({ success: false, message: "Failed to fetch review request logs" });
    }
  });
  app2.delete("/api/admin/reviews/logs/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteReviewRequestLog(id);
      res.json({ success: true, message: "Review request log deleted" });
    } catch (error) {
      console.error("Error deleting review request log:", error);
      res.status(500).json({ success: false, message: "Failed to delete review request log" });
    }
  });
  app2.post("/api/admin/reviews/send-now/:jobLogId", requireAdmin, async (req, res) => {
    try {
      const jobLogId = parseInt(req.params.jobLogId);
      const result = await sendReviewRequestNow(jobLogId);
      res.json(result);
    } catch (error) {
      console.error("Error sending manual review request:", error);
      res.status(500).json({ success: false, message: "Failed to send review request" });
    }
  });
  app2.patch("/api/admin/clients/:id/review-opt-out", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { reviewOptOut } = req.body;
      const client = await storage.getClientById(id);
      if (!client) {
        return res.status(404).json({ success: false, message: "Client not found" });
      }
      const updated = await storage.updateClient(id, { reviewOptOut: !!reviewOptOut });
      res.json({ success: true, client: updated });
    } catch (error) {
      console.error("Error updating client opt-out:", error);
      res.status(500).json({ success: false, message: "Failed to update client opt-out status" });
    }
  });
  app2.get("/api/reminders/unsubscribe", async (req, res) => {
    try {
      const { token } = req.query;
      if (!token) {
        return res.status(400).json({ success: false, message: "Token required" });
      }
      const optOut = await storage.getReminderOptOutByToken(token);
      if (!optOut) {
        return res.status(404).json({ success: false, message: "Invalid token" });
      }
      const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Unsubscribe - Absolute Pest Services</title>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50 min-h-screen flex items-center justify-center">
  <div class="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
    <h1 class="text-2xl font-bold text-gray-800 mb-4">You're Unsubscribed</h1>
    <p class="text-gray-600 mb-6">
      You've been successfully unsubscribed from appointment reminders.
    </p>
    <a href="https://absolutepestservices.com" class="inline-block bg-yellow-500 text-gray-900 px-6 py-2 rounded font-semibold hover:bg-yellow-400">
      Return to Website
    </a>
  </div>
</body>
</html>
      `;
      res.setHeader("Content-Type", "text/html");
      res.send(html);
    } catch (error) {
      console.error("Error processing unsubscribe:", error);
      res.status(500).json({ success: false, message: "Failed to process unsubscribe" });
    }
  });
  app2.post("/api/reminders/unsubscribe", async (req, res) => {
    try {
      const { email, phone, optOutType } = req.body;
      if (!email && !phone) {
        return res.status(400).json({ success: false, message: "Email or phone required" });
      }
      const token = __require("uuid").v4();
      await storage.createReminderOptOut({
        email,
        phone,
        optOutType: optOutType || "all",
        token
      });
      res.json({ success: true, message: "Successfully unsubscribed", token });
    } catch (error) {
      console.error("Error creating opt-out:", error);
      res.status(500).json({ success: false, message: "Failed to unsubscribe" });
    }
  });
  async function geocodeAddress(address) {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.error("Google Maps API key not configured");
      return null;
    }
    try {
      const encodedAddress = encodeURIComponent(address);
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${apiKey}`
      );
      const data = await response.json();
      if (data.status === "OK" && data.results.length > 0) {
        const location = data.results[0].geometry.location;
        return { lat: location.lat, lng: location.lng };
      }
      console.error("Geocoding failed:", data.status, address);
      return null;
    } catch (error) {
      console.error("Error geocoding address:", error);
      return null;
    }
  }
  async function getOrCreateGeocache(address) {
    const existing = await storage.getGeocache(address);
    if (existing && existing.lat && existing.lng) {
      return { lat: Number(existing.lat), lng: Number(existing.lng), cached: true };
    }
    const coords = await geocodeAddress(address);
    if (coords) {
      await storage.setGeocache({
        addressText: address,
        lat: String(coords.lat),
        lng: String(coords.lng),
        source: "google"
      });
      return { ...coords, cached: false };
    }
    return { lat: 0, lng: 0, cached: false };
  }
  async function optimizeRouteWithGoogle(origin, destination, waypoints, startTime) {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.error("Google Maps API key not configured");
      return null;
    }
    if (waypoints.length === 0) {
      return null;
    }
    const requestBody = {
      origin: { address: origin },
      destination: { address: destination },
      intermediates: waypoints.map((wp) => ({ address: wp.address })),
      travelMode: "DRIVE",
      optimizeWaypointOrder: true,
      departureTime: startTime || (/* @__PURE__ */ new Date()).toISOString(),
      routingPreference: "TRAFFIC_AWARE"
    };
    try {
      const response = await fetch(
        `https://routes.googleapis.com/v2:computeRoutes?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Goog-FieldMask": "routes.duration,routes.distanceMeters,routes.legs,routes.optimizedIntermediateWaypointIndexOrder"
          },
          body: JSON.stringify(requestBody)
        }
      );
      const data = await response.json();
      if (data.error) {
        console.error("Google Routes API error:", data.error);
        return null;
      }
      const route = data.routes?.[0];
      if (!route) {
        console.error("No route returned from Google Routes API");
        return null;
      }
      const optimizedOrder = route.optimizedIntermediateWaypointIndexOrder || [];
      const parseDuration = (duration) => {
        if (!duration) return 0;
        const match = duration.match(/^(\d+)s$/);
        return match ? parseInt(match[1], 10) : 0;
      };
      const stops = [];
      let cumulativeDuration = 0;
      const legs = route.legs || [];
      for (let i = 0; i < waypoints.length; i++) {
        const waypointIndex = optimizedOrder[i];
        const waypoint = waypoints[waypointIndex];
        const leg = legs[i];
        if (!leg || !waypoint) continue;
        const legDurationSeconds = parseDuration(leg.duration);
        cumulativeDuration += legDurationSeconds;
        const arrivalTime = startTime ? new Date(new Date(startTime).getTime() + cumulativeDuration * 1e3).toISOString() : null;
        stops.push({
          sequence: i + 1,
          jobLogId: waypoint.jobLogId,
          customerName: waypoint.customerName,
          address: waypoint.address,
          estimatedArrival: arrivalTime,
          driveDurationSeconds: legDurationSeconds,
          lat: leg.endLocation?.latLng?.latitude || 0,
          lng: leg.endLocation?.latLng?.longitude || 0
        });
      }
      const stopsForUrl = stops.slice(0, -1);
      const waypointStr = stopsForUrl.map((s) => encodeURIComponent(s.address)).join("|");
      const mapsUrl = waypointStr ? `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&waypoints=${waypointStr}&travelmode=driving` : `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&travelmode=driving`;
      const totalDurationSeconds = parseDuration(route.duration);
      return {
        stops,
        totalDistanceMeters: route.distanceMeters || 0,
        totalDurationSeconds,
        googleMapsUrl: mapsUrl
      };
    } catch (error) {
      console.error("Error calling Google Routes API:", error);
      return null;
    }
  }
  app2.get("/api/admin/routes/jobs", requireAdmin, async (req, res) => {
    try {
      const employeeId = parseInt(req.query.employeeId);
      const dateStr = req.query.date;
      if (!employeeId || !dateStr) {
        return res.status(400).json({ success: false, message: "employeeId and date required" });
      }
      const routeDate = new Date(dateStr);
      const jobLogs2 = await storage.getJobLogsForRoute(employeeId, routeDate);
      const jobsWithGeocode = await Promise.all(
        jobLogs2.map(async (job) => {
          const geocodeData = job.siteAddress ? await getOrCreateGeocache(job.siteAddress) : null;
          return {
            id: job.id,
            customerName: job.customerName,
            siteAddress: job.siteAddress,
            siteLocation: job.siteLocation,
            jobDate: job.jobDate,
            status: job.status,
            hasGeocode: !!(geocodeData && geocodeData.lat && geocodeData.lng),
            geocodeCached: geocodeData?.cached || false,
            lat: geocodeData?.lat || null,
            lng: geocodeData?.lng || null
          };
        })
      );
      res.json({ success: true, jobs: jobsWithGeocode });
    } catch (error) {
      console.error("Error fetching jobs for route:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  app2.post("/api/admin/routes/optimize", requireAdmin, async (req, res) => {
    try {
      const { employeeId, date: date2, startAddress, jobIds } = req.body;
      if (!employeeId || !date2 || !startAddress) {
        return res.status(400).json({ success: false, message: "employeeId, date, and startAddress required" });
      }
      const routeDate = new Date(date2);
      let jobLogs2 = await storage.getJobLogsForRoute(employeeId, routeDate);
      if (jobIds && Array.isArray(jobIds) && jobIds.length > 0) {
        jobLogs2 = jobLogs2.filter((job) => jobIds.includes(job.id));
      }
      const geocodableJobs = jobLogs2.filter((job) => job.siteAddress);
      if (geocodableJobs.length === 0) {
        return res.status(400).json({ success: false, message: "No jobs with geocodable addresses found" });
      }
      const waypoints = [];
      for (const job of geocodableJobs) {
        if (!job.siteAddress) continue;
        const geocodeData = await getOrCreateGeocache(job.siteAddress);
        if (geocodeData && geocodeData.lat && geocodeData.lng) {
          waypoints.push({
            address: job.siteAddress,
            jobLogId: job.id,
            customerName: job.customerName
          });
        }
      }
      if (waypoints.length === 0) {
        return res.status(400).json({ success: false, message: "No jobs could be geocoded" });
      }
      const destination = startAddress;
      const optimized = await optimizeRouteWithGoogle(startAddress, destination, waypoints);
      if (!optimized) {
        return res.status(500).json({ success: false, message: "Failed to optimize route with Google" });
      }
      const route = await storage.createOrUpdateDailyRoute({
        employeeId,
        routeDate: routeDate.toISOString().split("T")[0],
        startAddress,
        optimizedStopOrder: optimized.stops,
        googleMapsUrl: optimized.googleMapsUrl,
        totalDistanceMeters: optimized.totalDistanceMeters,
        totalDurationSeconds: optimized.totalDurationSeconds,
        generatedBy: req.session.userId
      });
      res.json({
        success: true,
        route: {
          ...route,
          optimizedStopOrder: JSON.parse(JSON.stringify(route.optimizedStopOrder))
        },
        googleMapsUrl: optimized.googleMapsUrl
      });
    } catch (error) {
      console.error("Error optimizing route:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  app2.get("/api/admin/routes/saved", requireAdmin, async (req, res) => {
    try {
      const employeeId = parseInt(req.query.employeeId);
      const dateStr = req.query.date;
      if (!employeeId || !dateStr) {
        return res.status(400).json({ success: false, message: "employeeId and date required" });
      }
      const routeDate = new Date(dateStr);
      const route = await storage.getDailyRoute(employeeId, routeDate);
      if (!route) {
        return res.json({ success: true, route: null });
      }
      res.json({
        success: true,
        route: {
          ...route,
          optimizedStopOrder: JSON.parse(JSON.stringify(route.optimizedStopOrder))
        }
      });
    } catch (error) {
      console.error("Error fetching saved route:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  app2.put("/api/admin/routes/saved/:id", requireAdmin, async (req, res) => {
    try {
      const routeId = parseInt(req.params.id);
      const { optimizedStopOrder, googleMapsUrl } = req.body;
      if (!optimizedStopOrder) {
        return res.status(400).json({ success: false, message: "optimizedStopOrder required" });
      }
      const [existing] = await db.select().from(dailyRoutes).where(eq2(dailyRoutes.id, routeId));
      if (!existing) {
        return res.status(404).json({ success: false, message: "Route not found" });
      }
      const [updated] = await db.update(dailyRoutes).set({
        optimizedStopOrder,
        googleMapsUrl: googleMapsUrl || existing.googleMapsUrl,
        generatedAt: /* @__PURE__ */ new Date()
      }).where(eq2(dailyRoutes.id, routeId)).returning();
      res.json({
        success: true,
        route: {
          ...updated,
          optimizedStopOrder: JSON.parse(JSON.stringify(updated.optimizedStopOrder))
        }
      });
    } catch (error) {
      console.error("Error updating saved route:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  app2.get("/api/field/route/today", requireFieldAuth, async (req, res) => {
    try {
      const employeeId = req.session.fieldEmployeeId;
      const today = /* @__PURE__ */ new Date();
      const route = await storage.getDailyRoute(employeeId, today);
      if (!route) {
        return res.json({ success: true, route: null, message: "No route generated for today" });
      }
      res.json({
        success: true,
        route: {
          ...route,
          optimizedStopOrder: JSON.parse(JSON.stringify(route.optimizedStopOrder))
        }
      });
    } catch (error) {
      console.error("Error fetching today's route:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  const requirePortalUser = async (req, res, next) => {
    if (!req.session.userId) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }
    try {
      const user = await storage.getUser(req.session.userId);
      if (!user || user.role === "admin") {
        return res.status(403).json({ success: false, message: "Customer portal access required" });
      }
      next();
    } catch (error) {
      console.error("Error checking portal access:", error);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  };
  app2.get("/api/portal/summary", requirePortalUser, async (req, res) => {
    try {
      const userId = req.session.userId;
      const serviceRequests2 = await storage.getServiceRequestsByUser(userId);
      const inspections = await storage.getInspectionSchedulesByUser(userId);
      const upcomingAppointments = [
        ...serviceRequests2.filter((sr) => sr.status === "scheduled" || sr.status === "in-progress"),
        ...inspections.filter((ins) => ins.status === "scheduled" || ins.status === "pending")
      ];
      const startOfYear = new Date((/* @__PURE__ */ new Date()).getFullYear(), 0, 1);
      const completedThisYear = [
        ...serviceRequests2.filter((sr) => sr.status === "completed" && sr.completedDate && new Date(sr.completedDate) >= startOfYear),
        ...inspections.filter((ins) => ins.status === "completed" && ins.createdAt >= startOfYear)
      ];
      const openRequests = serviceRequests2.filter((sr) => sr.status === "pending");
      const user = await storage.getUser(userId);
      let outstandingBalance = "0.00";
      let hasOverdue = false;
      if (user) {
        const clients2 = await storage.getClients();
        const client = clients2.find((c) => c.userId === userId);
        if (client) {
          const allInvoices = await storage.listInvoices({ clientId: client.id });
          const unpaidInvoices = allInvoices.filter(
            (inv) => inv.status === "sent" || inv.status === "viewed" || inv.status === "overdue"
          );
          outstandingBalance = unpaidInvoices.reduce((sum2, inv) => sum2 + parseFloat(String(inv.total)), 0).toFixed(2);
          hasOverdue = unpaidInvoices.some((inv) => inv.status === "overdue");
        }
      }
      res.json({
        success: true,
        summary: {
          upcomingCount: upcomingAppointments.length,
          completedThisYearCount: completedThisYear.length,
          openRequestsCount: openRequests.length,
          outstandingBalance,
          hasOverdue
        }
      });
    } catch (error) {
      console.error("Error fetching portal summary:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  app2.get("/api/portal/appointments", requirePortalUser, async (req, res) => {
    try {
      const userId = req.session.userId;
      const { status, type, search } = req.query;
      const [inspections, serviceRequests2] = await Promise.all([
        storage.getInspectionSchedulesByUser(userId),
        storage.getServiceRequestsByUser(userId)
      ]);
      let appointments = [
        ...inspections.map((ins) => ({
          id: ins.id,
          type: "inspection",
          serviceType: ins.serviceType,
          address: ins.address,
          city: ins.city,
          date: ins.preferredDate,
          time: ins.preferredTime,
          status: ins.status,
          urgency: ins.urgency,
          description: ins.message || "",
          createdAt: ins.createdAt,
          scheduledDate: null,
          completedDate: null,
          estimatedCost: null,
          finalCost: null,
          technicianNotes: null
        })),
        ...serviceRequests2.map((sr) => ({
          id: sr.id,
          type: "service",
          serviceType: sr.serviceType,
          address: sr.address,
          city: sr.city,
          date: sr.scheduledDate || sr.createdAt,
          time: null,
          status: sr.status,
          urgency: sr.priority,
          description: sr.description,
          createdAt: sr.createdAt,
          scheduledDate: sr.scheduledDate,
          completedDate: sr.completedDate,
          estimatedCost: sr.estimatedCost,
          finalCost: sr.finalCost,
          technicianNotes: sr.technicianNotes
        }))
      ];
      if (status) {
        appointments = appointments.filter((apt) => apt.status === status);
      }
      if (type) {
        appointments = appointments.filter((apt) => apt.type === type);
      }
      if (search) {
        const searchLower = search.toLowerCase();
        appointments = appointments.filter(
          (apt) => apt.address.toLowerCase().includes(searchLower) || apt.serviceType.toLowerCase().includes(searchLower)
        );
      }
      appointments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      res.json({ success: true, appointments });
    } catch (error) {
      console.error("Error fetching portal appointments:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  app2.get("/api/portal/appointments/:id", requirePortalUser, async (req, res) => {
    try {
      const { id } = req.params;
      const { type } = req.query;
      const userId = req.session.userId;
      if (!type || type !== "inspection" && type !== "service") {
        return res.status(400).json({ success: false, message: "Invalid or missing type parameter" });
      }
      let appointment;
      if (type === "inspection") {
        const inspections = await storage.getInspectionSchedulesByUser(userId);
        appointment = inspections.find((ins) => ins.id === parseInt(id));
        if (appointment) {
          appointment = { ...appointment, appointmentType: "inspection" };
        }
      } else {
        const serviceRequests2 = await storage.getServiceRequestsByUser(userId);
        appointment = serviceRequests2.find((sr) => sr.id === parseInt(id));
        if (appointment) {
          appointment = { ...appointment, appointmentType: "service" };
        }
      }
      if (!appointment) {
        return res.status(404).json({ success: false, message: "Appointment not found" });
      }
      res.json({ success: true, appointment });
    } catch (error) {
      console.error("Error fetching portal appointment detail:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  app2.post("/api/portal/appointments", requirePortalUser, async (req, res) => {
    try {
      const userId = req.session.userId;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
      const { serviceType, preferredDate, preferredTime, urgency, address, city, message } = req.body;
      if (!serviceType || !preferredDate || !preferredTime || !urgency || !address || !city) {
        return res.status(400).json({ success: false, message: "Missing required fields" });
      }
      const requestedDate = new Date(preferredDate);
      const tomorrow = /* @__PURE__ */ new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      if (requestedDate < tomorrow) {
        return res.status(400).json({ success: false, message: "Appointments must be scheduled at least 1 day in advance" });
      }
      const inspection = await storage.createInspectionSchedule({
        userId,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone || "",
        email: user.email,
        address,
        city,
        serviceType,
        preferredDate: requestedDate,
        preferredTime,
        urgency,
        message: message || null
      });
      await sendInspectionScheduleEmail({
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone || "",
        email: user.email,
        address,
        city,
        serviceType,
        preferredDate: requestedDate,
        preferredTime,
        urgency,
        message: message || ""
      });
      try {
        await storage.createOrUpdateProspect({
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          phone: user.phone || void 0,
          address,
          notes: `Inspection Request (Portal) - Service: ${serviceType}
Preferred: ${requestedDate.toLocaleDateString()} ${preferredTime}
Urgency: ${urgency}`,
          serviceType
        });
      } catch (prospectError) {
        console.error("Failed to create/update prospect:", prospectError);
      }
      res.json({
        success: true,
        message: "Appointment scheduled successfully",
        appointment: { ...inspection, type: "inspection" }
      });
    } catch (error) {
      console.error("Error creating portal appointment:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  app2.get("/api/portal/service-requests", requirePortalUser, async (req, res) => {
    try {
      const userId = req.session.userId;
      const serviceRequests2 = await storage.getServiceRequestsByUser(userId);
      res.json({ success: true, serviceRequests: serviceRequests2 });
    } catch (error) {
      console.error("Error fetching portal service requests:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  app2.post("/api/portal/service-requests", requirePortalUser, async (req, res) => {
    try {
      const userId = req.session.userId;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
      const { serviceType, description, address, city, priority } = req.body;
      if (!serviceType || !description || !address || !city || !priority) {
        return res.status(400).json({ success: false, message: "Missing required fields" });
      }
      const existingRequests = await storage.getServiceRequestsByUser(userId);
      const duplicate = existingRequests.find(
        (req2) => req2.serviceType === serviceType && req2.address.toLowerCase() === address.toLowerCase() && (req2.status === "pending" || req2.status === "scheduled")
      );
      const serviceRequest = await storage.createServiceRequest({
        userId,
        firstName: user.firstName,
        lastName: user.lastName,
        serviceType,
        description,
        address,
        city,
        priority
      });
      await sendServiceRequestEmail({
        firstName: user.firstName,
        lastName: user.lastName,
        serviceType,
        description,
        address,
        city,
        priority,
        customerEmail: user.email,
        customerPhone: user.phone || ""
      });
      try {
        await storage.createOrUpdateProspect({
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          phone: user.phone || void 0,
          address,
          notes: `Service Request (Portal) - Service: ${serviceType}
Priority: ${priority}
Description: ${description}`,
          serviceType
        });
      } catch (prospectError) {
        console.error("Failed to create/update prospect:", prospectError);
      }
      res.json({
        success: true,
        message: duplicate ? "Service request submitted. Note: You have an existing open request for this service at this address." : "Service request submitted successfully",
        serviceRequest,
        duplicateWarning: duplicate ? true : false
      });
    } catch (error) {
      console.error("Error creating portal service request:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  app2.get("/api/portal/profile", requirePortalUser, async (req, res) => {
    try {
      const userId = req.session.userId;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
      res.json({
        success: true,
        profile: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          address: user.address
        }
      });
    } catch (error) {
      console.error("Error fetching portal profile:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  app2.put("/api/portal/profile", requirePortalUser, async (req, res) => {
    try {
      const userId = req.session.userId;
      const { firstName, lastName, phone, address } = req.body;
      const updates = {};
      if (firstName) updates.firstName = firstName;
      if (lastName) updates.lastName = lastName;
      if (phone !== void 0) updates.phone = phone;
      if (address !== void 0) updates.address = address;
      const updatedUser = await storage.updateUser(userId, updates);
      res.json({
        success: true,
        message: "Profile updated successfully",
        profile: {
          id: updatedUser.id,
          email: updatedUser.email,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          phone: updatedUser.phone,
          address: updatedUser.address
        }
      });
    } catch (error) {
      console.error("Error updating portal profile:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  app2.get("/api/portal/invoices", requirePortalUser, async (req, res) => {
    try {
      const userId = req.session.userId;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
      const clients2 = await storage.getClients();
      const client = clients2.find((c) => c.userId === userId);
      if (!client) {
        return res.json({ success: true, invoices: [] });
      }
      const allInvoices = await storage.listInvoices({ clientId: client.id });
      const visibleInvoices = allInvoices.filter(
        (inv) => inv.status !== "draft" && inv.status !== "void"
      );
      visibleInvoices.sort((a, b) => {
        if (a.status === "overdue" && b.status !== "overdue") return -1;
        if (b.status === "overdue" && a.status !== "overdue") return 1;
        if (a.status === "paid" && b.status !== "paid") return 1;
        if (b.status === "paid" && a.status !== "paid") return -1;
        if (a.status !== "paid" && b.status !== "paid") {
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        }
        return new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime();
      });
      res.json({ success: true, invoices: visibleInvoices });
    } catch (error) {
      console.error("Error fetching portal invoices:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  app2.get("/api/portal/invoices/:id", requirePortalUser, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.session.userId;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
      const clients2 = await storage.getClients();
      const client = clients2.find((c) => c.userId === userId);
      if (!client) {
        return res.status(403).json({ success: false, message: "No client account linked" });
      }
      const invoice = await storage.getInvoice(parseInt(id));
      if (!invoice || invoice.clientId !== client.id) {
        return res.status(404).json({ success: false, message: "Invoice not found" });
      }
      if (invoice.status === "sent") {
        await storage.updateInvoiceStatus(invoice.id, "viewed", "customer", "Customer viewed in portal");
        const updatedInvoice = await storage.getInvoice(invoice.id);
        Object.assign(invoice, updatedInvoice);
      }
      const lineItems = await storage.getLineItemsByInvoice(invoice.id);
      res.json({
        success: true,
        invoice: {
          ...invoice,
          client: { name: client.name, email: client.email, address: client.address, phone: client.phone },
          lineItems
        }
      });
    } catch (error) {
      console.error("Error fetching portal invoice detail:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  app2.get("/api/portal/invoices/:id/pdf", requirePortalUser, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.session.userId;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
      const clients2 = await storage.getClients();
      const client = clients2.find((c) => c.userId === userId);
      if (!client) {
        return res.status(403).json({ success: false, message: "No client account linked" });
      }
      const invoice = await storage.getInvoice(parseInt(id));
      if (!invoice || invoice.clientId !== client.id) {
        return res.status(404).json({ success: false, message: "Invoice not found" });
      }
      if (!invoice.pdfUrl) {
        return res.status(404).json({ success: false, message: "PDF not available" });
      }
      res.redirect(invoice.pdfUrl);
    } catch (error) {
      console.error("Error downloading portal invoice PDF:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  app2.get("/api/admin/scheduled-jobs", requireAdmin, async (req, res) => {
    try {
      const filters = {};
      if (req.query.employeeId) filters.employeeId = parseInt(req.query.employeeId);
      if (req.query.dateFrom) filters.dateFrom = new Date(req.query.dateFrom);
      if (req.query.dateTo) filters.dateTo = new Date(req.query.dateTo);
      if (req.query.status) filters.status = req.query.status;
      const jobs = await storage.getScheduledJobs(filters);
      const employeeIds = [...new Set(jobs.map((j) => j.employeeId))];
      const employees = await storage.getFieldEmployees();
      const employeeMap = new Map(employees.map((e) => [e.id, e.name]));
      const allClients = await storage.getClients();
      const clientPropertyMap = new Map(allClients.map((c) => [c.id, c.propertyType ?? "residential"]));
      const jobsWithEmployees = jobs.map((job) => ({
        ...job,
        employeeName: job.employeeId ? employeeMap.get(job.employeeId) || "Unknown" : "Unassigned",
        propertyType: job.clientId ? clientPropertyMap.get(job.clientId) ?? "residential" : "residential"
      }));
      res.json({ success: true, scheduledJobs: jobsWithEmployees });
    } catch (error) {
      console.error("Error fetching scheduled jobs:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  app2.get("/api/admin/scheduled-jobs/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const job = await storage.getJobLog(id);
      if (!job) {
        return res.status(404).json({ success: false, message: "Job not found" });
      }
      const employees = await storage.getFieldEmployees();
      const employeeMap = new Map(employees.map((e) => [e.id, e.name]));
      const scheduleLogs = await storage.getJobScheduleLogs(id);
      res.json({
        success: true,
        job: {
          ...job,
          employeeName: job.employeeId ? employeeMap.get(job.employeeId) || "Unknown" : "Unassigned"
        },
        scheduleLogs
      });
    } catch (error) {
      console.error("Error fetching scheduled job:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  app2.post("/api/admin/scheduled-jobs", requireAdmin, async (req, res) => {
    try {
      const { customerName, clientId, siteLocation, siteAddress, servicedArea, workPerformed, jobDate, employeeId, priority, adminNotes, scheduledEndTime, propertyType } = req.body;
      if (!customerName || !siteLocation || !servicedArea || !jobDate) {
        return res.status(400).json({ success: false, message: "Missing required fields: customerName, siteLocation, servicedArea, jobDate" });
      }
      let resolvedClientId = clientId || null;
      if (!clientId && propertyType && customerName) {
        try {
          const newClient = await storage.createClient({ name: customerName, propertyType, clientType: "prospect", status: "active" });
          resolvedClientId = newClient.id;
        } catch {
        }
      }
      const job = await storage.createScheduledJob({
        employeeId: employeeId || null,
        customerName,
        clientId: resolvedClientId,
        siteLocation,
        siteAddress: siteAddress || "",
        servicedArea,
        workPerformed: workPerformed || "",
        jobDate: new Date(jobDate),
        priority: priority || "medium",
        adminNotes: adminNotes || null,
        scheduledBy: req.session.userId,
        scheduledEndTime: scheduledEndTime ? new Date(scheduledEndTime) : null
      });
      res.json({ success: true, message: "Scheduled job created", job });
    } catch (error) {
      console.error("Error creating scheduled job:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  app2.patch("/api/admin/scheduled-jobs/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { priority, adminNotes, scheduledEndTime, employeeId, jobDate } = req.body;
      const updates = {};
      if (priority !== void 0) updates.priority = priority;
      if (adminNotes !== void 0) updates.adminNotes = adminNotes;
      if (scheduledEndTime !== void 0) updates.scheduledEndTime = scheduledEndTime ? new Date(scheduledEndTime) : null;
      if (employeeId !== void 0) updates.employeeId = employeeId;
      if (jobDate !== void 0) updates.jobDate = new Date(jobDate);
      const job = await storage.updateJobScheduling(id, updates, req.session.userId);
      res.json({ success: true, message: "Job updated", job });
    } catch (error) {
      console.error("Error updating scheduled job:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  app2.post("/api/admin/scheduled-jobs/:id/assign", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (!req.body.hasOwnProperty("employeeId")) {
        return res.status(400).json({ success: false, message: "employeeId is required (use null to unassign)" });
      }
      const assignTo = req.body.employeeId !== void 0 ? req.body.employeeId || null : null;
      const job = await storage.assignJobToTech(id, assignTo, req.session.userId);
      res.json({ success: true, message: assignTo === null ? "Job unassigned" : "Job assigned to tech", job });
    } catch (error) {
      console.error("Error assigning job:", error);
      if (error instanceof Error) {
        return res.status(400).json({ success: false, message: error.message });
      }
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  app2.post("/api/admin/scheduled-jobs/:id/reschedule", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { jobDate, scheduledEndTime } = req.body;
      if (!jobDate) {
        return res.status(400).json({ success: false, message: "jobDate is required" });
      }
      const job = await storage.rescheduleJob(id, new Date(jobDate), req.session.userId);
      if (scheduledEndTime) {
        await storage.updateJobScheduling(id, { scheduledEndTime: new Date(scheduledEndTime) }, req.session.userId);
      }
      res.json({ success: true, message: "Job rescheduled", job });
    } catch (error) {
      console.error("Error rescheduling job:", error);
      if (error instanceof Error) {
        return res.status(400).json({ success: false, message: error.message });
      }
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  app2.post("/api/admin/scheduled-jobs/:id/cancel", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { reason } = req.body;
      const existingJob = await storage.getJobLogById(id);
      const oldStatus = existingJob?.status || "scheduled";
      const job = await storage.cancelScheduledJob(id, req.session.userId, reason);
      notifyJobStatusChange(job, oldStatus, "cancelled").catch((err) => {
        console.error("[JobStatusNotification] Failed for cancelled job", id, err);
      });
      res.json({ success: true, message: "Job cancelled", job });
    } catch (error) {
      console.error("Error cancelling job:", error);
      if (error instanceof Error) {
        return res.status(400).json({ success: false, message: error.message });
      }
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  app2.get("/api/admin/scheduled-jobs/:id/logs", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const logs = await storage.getJobScheduleLogs(id);
      res.json({ success: true, logs });
    } catch (error) {
      console.error("Error fetching schedule logs:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  app2.get("/api/field/scheduled-jobs", requireFieldAuth, async (req, res) => {
    try {
      const employeeId = req.session.fieldEmployeeId;
      const jobs = await storage.getTodaysScheduledJobs(employeeId);
      res.json({ success: true, scheduledJobs: jobs });
    } catch (error) {
      console.error("Error fetching today's scheduled jobs:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  app2.post("/api/field/scheduled-jobs/:id/start", requireFieldAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const employeeId = req.session.fieldEmployeeId;
      const existingJob = await storage.getJobLogById(id);
      const oldStatus = existingJob?.status || "scheduled";
      const job = await storage.startScheduledJob(id, employeeId);
      notifyJobStatusChange(job, oldStatus, "in_progress").catch((err) => {
        console.error("[JobStatusNotification] Failed for started job", id, err);
      });
      res.json({ success: true, message: "Job started", job });
    } catch (error) {
      console.error("Error starting scheduled job:", error);
      if (error instanceof Error) {
        return res.status(400).json({ success: false, message: error.message });
      }
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  app2.post("/api/field/scheduled-jobs/:id/complete", requireFieldAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const employeeId = req.session.fieldEmployeeId;
      const { workPerformed } = req.body;
      if (!workPerformed) {
        return res.status(400).json({ success: false, message: "workPerformed is required" });
      }
      const existingJob = await storage.getJobLogById(id);
      const oldStatus = existingJob?.status || "in_progress";
      const job = await storage.completeScheduledJob(id, employeeId, workPerformed);
      notifyJobStatusChange(job, oldStatus, "completed").catch((err) => {
        console.error("[JobStatusNotification] Failed for completed job", id, err);
      });
      res.json({ success: true, message: "Job completed", job });
    } catch (error) {
      console.error("Error completing scheduled job:", error);
      if (error instanceof Error) {
        return res.status(400).json({ success: false, message: error.message });
      }
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  app2.get("/api/field/jobs/unassigned", requireFieldAuth, async (req, res) => {
    try {
      const filters = {};
      if (req.query.dateFrom) filters.dateFrom = new Date(req.query.dateFrom);
      if (req.query.dateTo) filters.dateTo = new Date(req.query.dateTo);
      if (req.query.status) filters.status = req.query.status;
      const jobs = await storage.getUnassignedScheduledJobs(filters);
      res.json({ success: true, jobs });
    } catch (error) {
      console.error("Error fetching unassigned jobs:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  app2.post("/api/field/jobs/:id/claim", requireFieldAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const employeeId = req.session.fieldEmployeeId;
      const job = await storage.claimScheduledJob(id, employeeId);
      res.json({ success: true, message: "Job claimed successfully", job });
    } catch (error) {
      console.error("Error claiming job:", error);
      if (error instanceof Error) {
        return res.status(400).json({ success: false, message: error.message });
      }
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  app2.get("/api/ping", (req, res) => {
    res.json({ ok: true, timestamp: (/* @__PURE__ */ new Date()).toISOString() });
  });
  app2.post("/api/field/sync", requireFieldAuth, async (req, res) => {
    try {
      const { jobLogs: jobLogs2, clientTimestamp } = req.body;
      const employeeId = req.session.fieldEmployeeId;
      if (!Array.isArray(jobLogs2) || jobLogs2.length === 0) {
        return res.status(400).json({ success: false, message: "No job logs provided" });
      }
      const results = [];
      const now = /* @__PURE__ */ new Date();
      for (const log2 of jobLogs2) {
        try {
          const existingLogs = await storage.getJobLogs({ employeeId });
          const existing = existingLogs.find((l) => l.localId === log2.localId);
          if (existing) {
            results.push({
              localId: log2.localId,
              serverId: existing.id,
              status: "already_synced"
            });
            continue;
          }
          const clientCreatedAt = log2.clientCreatedAt ? new Date(log2.clientCreatedAt) : now;
          const hoursDiff = Math.abs(now.getTime() - clientCreatedAt.getTime()) / (1e3 * 60 * 60);
          const needsAdminReview = hoursDiff > 48;
          let resolvedClientId = log2.clientId || null;
          if (!resolvedClientId && log2.customerName) {
            const existingClients = await storage.getClients();
            const match = existingClients.find(
              (c) => c.name.toLowerCase().trim() === log2.customerName.toLowerCase().trim()
            );
            if (match) {
              resolvedClientId = match.id;
            } else {
              try {
                const newClient = await storage.createClient({
                  name: log2.customerName,
                  address: log2.siteAddress || null,
                  propertyType: log2.propertyType || "residential",
                  clientType: "prospect",
                  status: "pending"
                });
                resolvedClientId = newClient.id;
              } catch (e) {
                console.error("Error auto-creating client from sync:", e);
              }
            }
          }
          const newLog = await storage.createJobLog({
            employeeId,
            customerName: log2.customerName,
            clientId: resolvedClientId,
            siteLocation: log2.siteLocation,
            siteAddress: log2.siteAddress || "",
            servicedArea: log2.servicedArea,
            workPerformed: log2.workPerformed,
            jobDate: log2.jobDate,
            status: log2.status || "completed",
            customFields: log2.customFields,
            materials: log2.materials || null,
            clientCreatedAt: log2.clientCreatedAt,
            serverReceivedAt: now,
            needsAdminReview
          });
          if (newLog && newLog.id) {
            await storage.updateJobLog(newLog.id, { localId: log2.localId });
          }
          results.push({
            localId: log2.localId,
            serverId: newLog?.id,
            status: "accepted"
          });
        } catch (logError) {
          console.error("Error syncing job log:", logError);
          results.push({
            localId: log2.localId,
            status: "error",
            error: logError instanceof Error ? logError.message : "Unknown error"
          });
        }
      }
      res.json({
        success: true,
        results,
        processedAt: now.toISOString()
      });
    } catch (error) {
      console.error("Error in batch sync:", error);
      res.status(500).json({ success: false, message: "Sync failed", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });
  const MARKETING_DATA_DIR = "/data/.openclaw/workspace/projects/absolute-pest-services/data";
  const findLatestDataFile = (prefix) => {
    try {
      const files = fs.readdirSync(MARKETING_DATA_DIR).filter((f) => f.startsWith(prefix) && f.endsWith(".json")).sort().reverse();
      return files.length > 0 ? path.join(MARKETING_DATA_DIR, files[0]) : null;
    } catch {
      return null;
    }
  };
  app2.get("/api/admin/marketing/ads-campaigns", requireAdmin, (req, res) => {
    const filePath = findLatestDataFile("ads_campaigns_");
    if (!filePath) {
      return res.json({ success: true, data: null, lastFetched: null });
    }
    try {
      const raw = fs.readFileSync(filePath, "utf-8");
      const data = JSON.parse(raw);
      res.json({ success: true, data, lastFetched: data.fetched_at });
    } catch (err) {
      res.status(500).json({ success: false, message: "Failed to read ads campaigns data" });
    }
  });
  app2.get("/api/admin/marketing/ads-search-terms", requireAdmin, (req, res) => {
    const filePath = findLatestDataFile("ads_search_terms_");
    if (!filePath) {
      return res.json({ success: true, data: null, lastFetched: null });
    }
    try {
      const raw = fs.readFileSync(filePath, "utf-8");
      const data = JSON.parse(raw);
      res.json({ success: true, data, lastFetched: data.fetched_at });
    } catch (err) {
      res.status(500).json({ success: false, message: "Failed to read search terms data" });
    }
  });
  app2.get("/api/admin/marketing/ga4-overview", requireAdmin, (req, res) => {
    const filePath = findLatestDataFile("ga4_overview_");
    if (!filePath) {
      return res.json({ success: true, data: null, lastFetched: null });
    }
    try {
      const raw = fs.readFileSync(filePath, "utf-8");
      const data = JSON.parse(raw);
      res.json({ success: true, data, lastFetched: data.fetched_at });
    } catch (err) {
      res.status(500).json({ success: false, message: "Failed to read GA4 overview data" });
    }
  });
  app2.get("/api/admin/marketing/facebook", requireAdmin, (req, res) => {
    const filePath = findLatestDataFile("facebook_metrics_");
    if (!filePath) {
      return res.json({ success: true, data: null, lastFetched: null });
    }
    try {
      const raw = fs.readFileSync(filePath, "utf-8");
      const data = JSON.parse(raw);
      res.json({ success: true, data, lastFetched: data.fetched_at });
    } catch (err) {
      res.status(500).json({ success: false, message: "Failed to read Facebook data" });
    }
  });
  app2.get("/api/admin/marketing/instagram", requireAdmin, (req, res) => {
    const filePath = findLatestDataFile("instagram_metrics_");
    if (!filePath) {
      return res.json({ success: true, data: null, lastFetched: null });
    }
    try {
      const raw = fs.readFileSync(filePath, "utf-8");
      const data = JSON.parse(raw);
      res.json({ success: true, data, lastFetched: data.fetched_at });
    } catch (err) {
      res.status(500).json({ success: false, message: "Failed to read Instagram data" });
    }
  });
  seedAdminUser();
  seedFieldMaterials();
  seedServiceRates();
  const httpServer = createServer(app2);
  return httpServer;
}
async function seedFieldMaterials() {
  try {
    const existing = await storage.getFieldMaterials();
    if (existing.length > 0) return;
    const products = [
      "Termidor SC",
      "Termidor HE",
      "Termidor Foam",
      "Phantom II",
      "Alpine WSG",
      "Alpine Foam",
      "Temprid FX",
      "Temprid SC",
      "Demand CS",
      "Suspend Polyzone",
      "Suspend SC",
      "Talstar P",
      "Bifen I/T",
      "Cy-Kick CS",
      "Cy-Kick Aerosol",
      "Demon WP",
      "Demon Max",
      "Advion Cockroach Gel",
      "Advion Ant Gel",
      "Advion WDG",
      "Vendetta Plus Gel",
      "InVict Gold Gel",
      "Maxforce FC Magnum",
      "Maxforce Quantum",
      "Maxforce Complete",
      "Avert Dry Flowable",
      "Gentrol IGR",
      "Gentrol Point Source",
      "NyGuard IGR",
      "Precor IGR",
      "Tekko Pro IGR",
      "Crossfire Concentrate",
      "Crossfire Aerosol",
      "Bedlam Plus",
      "Transport Mikron",
      "Cimexa Dust",
      "Delta Dust",
      "Drione Dust",
      "Tempo 1% Dust",
      "D-Fense Dust",
      "Taurus SC",
      "Sentricon Bait",
      "Advance Termite Bait",
      "Contrac Blox",
      "Final Blox",
      "Fastrac Blox",
      "Generation Mini Block",
      "Ditrac All-Weather",
      "Rozol Tracking Powder",
      "Zenprox EC",
      "PT 221L Residual",
      "PT Alpine Flea & Bed Bug",
      "Stryker Wasp & Hornet",
      "Wasp-Freeze",
      "EcoVia EC",
      "Essentria IC3",
      "Nisus DSV",
      "BorActin Dust",
      "Boracare",
      "Tim-Bor",
      "Altriset",
      "Arilon",
      "Fuse Insecticide",
      "Optigard Ant Gel",
      "Optigard Flex",
      "Tandem",
      "Trelona ATBS",
      "Master Line Bifenthrin"
    ];
    const supplies = [
      "Glue Board (Small)",
      "Glue Board (Large)",
      "Snap Trap",
      "Rodent Bait Station",
      "Tamper-Resistant Bait Station",
      "Termite Bait Station",
      "Insect Bait Station",
      "Pheromone Trap",
      "Fly Paper / Strip",
      "Fly Light Trap",
      "Mosquito Trap",
      "Catch-All Trap",
      "Tick Tube",
      "Bed Bug Monitor",
      "Aerosol Applicator Tip",
      "Duster",
      "Granule Spreader"
    ];
    for (let i = 0; i < products.length; i++) {
      await storage.createFieldMaterial({ name: products[i], category: "product", isActive: true, sortOrder: i });
    }
    for (let i = 0; i < supplies.length; i++) {
      await storage.createFieldMaterial({ name: supplies[i], category: "supply", isActive: true, sortOrder: i });
    }
    console.log(`Seeded ${products.length + supplies.length} field materials`);
  } catch (error) {
    console.error("Error seeding field materials:", error);
  }
}
async function seedServiceRates() {
  try {
    const existing = await storage.getServiceRates();
    if (existing.length > 0) return;
    const defaults = [
      { name: "General Pest Control", description: "Standard interior/exterior treatment", defaultRate: "200.00", isActive: true, sortOrder: 0 },
      { name: "Termite Treatment", description: "Liquid treatment or bait system", defaultRate: "500.00", isActive: true, sortOrder: 1 },
      { name: "Bed Bug Treatment", description: "Heat or chemical bed bug elimination", defaultRate: "350.00", isActive: true, sortOrder: 2 },
      { name: "Rodent Control", description: "Trapping and exclusion services", defaultRate: "250.00", isActive: true, sortOrder: 3 },
      { name: "Mosquito Treatment", description: "Yard spray and larvicide application", defaultRate: "150.00", isActive: true, sortOrder: 4 },
      { name: "Wildlife Removal", description: "Humane trapping and relocation", defaultRate: "300.00", isActive: true, sortOrder: 5 },
      { name: "Cockroach Treatment", description: "Gel bait and residual spray application", defaultRate: "175.00", isActive: true, sortOrder: 6 },
      { name: "Ant Treatment", description: "Interior/exterior ant colony elimination", defaultRate: "150.00", isActive: true, sortOrder: 7 },
      { name: "Wasp / Hornet Removal", description: "Nest removal and preventive treatment", defaultRate: "175.00", isActive: true, sortOrder: 8 },
      { name: "Flea & Tick Treatment", description: "Interior treatment for fleas and ticks", defaultRate: "200.00", isActive: true, sortOrder: 9 },
      { name: "Spider Treatment", description: "Web removal and perimeter treatment", defaultRate: "150.00", isActive: true, sortOrder: 10 },
      { name: "Commercial Pest Control", description: "Scheduled commercial property service", defaultRate: "350.00", isActive: true, sortOrder: 11 },
      { name: "Crawl Space Treatment", description: "Encapsulation and pest treatment", defaultRate: "400.00", isActive: true, sortOrder: 12 },
      { name: "Initial Inspection", description: "Full property inspection and assessment", defaultRate: "125.00", isActive: true, sortOrder: 13 }
    ];
    for (const rate of defaults) {
      await storage.createServiceRate(rate);
    }
    console.log(`Seeded ${defaults.length} service rates`);
  } catch (error) {
    console.error("Error seeding service rates:", error);
  }
}
async function seedAdminUser() {
  try {
    const existing = await storage.getUserByEmail("rob@absolutepestservices.com");
    if (!existing) {
      const existingAlt = await storage.getUserByEmail("Rob@absolutepestservices.com");
      if (!existingAlt) {
        await storage.createUser({
          email: "rob@absolutepestservices.com",
          password: "Sheffield2121",
          firstName: "Rob",
          lastName: "Admin",
          phone: "",
          address: "",
          role: "admin"
        });
        console.log("Admin user seeded: rob@absolutepestservices.com");
      }
    }
  } catch (error) {
    console.error("Error seeding admin user:", error);
  }
}

// server/vite.ts
import express from "express";
import fs2 from "fs";
import path3 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path2 from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { VitePWA } from "vite-plugin-pwa";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "robots.txt", "apple-touch-icon.png"],
      manifest: {
        name: "Absolute Pest Services - Field Portal",
        short_name: "Field Portal",
        description: "Offline-capable field portal for pest service technicians",
        theme_color: "#1a5f2a",
        background_color: "#ffffff",
        display: "standalone",
        scope: "/field",
        start_url: "/field",
        icons: [
          {
            src: "/icon-192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "/icon-512.png",
            sizes: "512x512",
            type: "image/png"
          }
        ]
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        runtimeCaching: [
          {
            urlPattern: /\/api\/field\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "field-api-cache",
              networkTimeoutSeconds: 10,
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24
                // 24 hours
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /\/api\/ping/i,
            handler: "NetworkOnly",
            options: {
              cacheName: "ping-cache"
            }
          }
        ]
      },
      devOptions: {
        enabled: true,
        navigateFallback: "/field"
      }
    }),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path2.resolve(import.meta.dirname, "client", "src"),
      "@shared": path2.resolve(import.meta.dirname, "shared"),
      "@assets": path2.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path2.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path2.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";

// server/seo-meta.ts
var DEFAULT_META = {
  title: "Absolute Pest Services - Professional Pest Control in PA, DE, MD",
  description: "Expert pest control in PA, DE & MD. Humane wildlife control, bed bug treatment, termite protection & bat removal. Licensed, insured & available 24/7. Call 484-643-2225."
};
var ROUTE_META = {
  // ── Homepage ──────────────────────────────────────────────────────────────
  "/": DEFAULT_META,
  // ── Static / service pages ────────────────────────────────────────────────
  "/termites": {
    title: "Termite Treatment Chester County PA | Free Inspection | Absolute Pest Services",
    description: "Expert termite treatment in Chester County, PA. Free termite inspection. Licensed termite exterminators serving West Chester, Kennett Square, Malvern & all of Chester County. Call 484-643-2225."
  },
  "/bed-bugs": {
    title: "Bed Bug Exterminator Chester County PA | Heat Treatment | Absolute Pest Services",
    description: "Professional bed bug exterminator in Chester County, PA. Heat & chemical treatment options. Free bed bug inspection. Same-day service. Serving West Chester, Kennett Square, Malvern & all Chester County. Call 484-643-2225."
  },
  "/rodents": {
    title: "Mouse Exterminator Chester County PA | Rat Control | Absolute Pest Services",
    description: "Professional mouse & rat exterminator in Chester County, PA. Rodent control, exclusion & prevention. Free inspection. Serving West Chester, Kennett Square, Malvern & all Chester County. Call 484-643-2225."
  },
  "/wildlife": {
    title: "Wildlife Removal Chester County PA | Raccoon Removal | Absolute Pest Services",
    description: "Professional wildlife removal in Chester County, PA. Humane raccoon removal, squirrel removal, groundhog control & more. Licensed PA wildlife control. Free inspection. Call 484-643-2225."
  },
  "/wildlife-control": {
    title: "Wildlife Control Services | Absolute Pest Services",
    description: "Humane wildlife control in PA, DE & MD. Expert removal of raccoons, squirrels, groundhogs, skunks & more. Licensed wildlife control operators. Call 484-643-2225."
  },
  "/bed-bug-treatment": {
    title: "Bed Bug Treatment | Absolute Pest Services",
    description: "Professional bed bug treatment in PA, DE & MD. Heat & chemical treatments available. Free inspection. Same-day service. Call 484-643-2225."
  },
  "/termite-treatment": {
    title: "Termite Treatment | Absolute Pest Services",
    description: "Expert termite inspection and treatment in PA, DE & MD. Protect your home from termite damage. Free inspection available. Call 484-643-2225."
  },
  "/bat-removal": {
    title: "Bat Removal Services | Absolute Pest Services",
    description: "Safe, humane bat removal in PA, DE & MD. Licensed & insured. We handle bat exclusion, guano cleanup & prevention. Call 484-643-2225."
  },
  "/request-service": {
    title: "Request Pest Control Service | Absolute Pest Services",
    description: "Request pest control service from Absolute Pest Services. Serving PA, DE & MD. Same-day service available. Call 484-643-2225."
  },
  "/blog": {
    title: "Pest Control Tips & News | Absolute Pest Services Blog",
    description: "Pest control tips, seasonal alerts, and expert advice from the team at Absolute Pest Services. Serving Chester County, PA and surrounding areas."
  },
  "/cost-calculator": {
    title: "Pest Control Cost Calculator | Absolute Pest Services",
    description: "Estimate your pest control costs with our free calculator. Get a quick quote for services in PA, DE & MD. Call 484-643-2225 to confirm pricing."
  },
  // ── Service area index ────────────────────────────────────────────────────
  "/service-areas": {
    title: "Pest Control Service Areas | PA, DE, MD | Absolute Pest Services",
    description: "Absolute Pest Services covers Chester County, Delaware County, Montgomery County PA, New Castle County DE, and Northeast MD. Find your city and schedule service today."
  },
  // ── County-level service area pages ──────────────────────────────────────
  "/service-areas/chester-county-pa": {
    title: "Chester County PA Pest Control Services | Absolute Pest Services",
    description: "Chester County PA: Expert pest control services in West Grove, Kennett Square, Oxford, Avondale. Licensed, insured, emergency service available. 5.0 star rated."
  },
  "/service-areas/delaware-county-pa": {
    title: "Delaware County PA Pest Control Services | Absolute Pest Services",
    description: "Delaware County PA: Expert pest control in Media, Newtown Square, Chester, Aston, Brookhaven. Licensed, insured, emergency service available."
  },
  "/service-areas/new-castle-county-de": {
    title: "New Castle County DE Pest Control Services | Absolute Pest Services",
    description: "New Castle County DE: Expert pest control in Hockessin, Newark, Wilmington, Bear. Licensed, insured, emergency service available."
  },
  "/service-areas/montgomery-county-pa": {
    title: "Montgomery County PA Pest Control Services | Absolute Pest Services",
    description: "Montgomery County PA: Expert pest control in Norristown, King of Prussia, Collegeville, Pottstown. Licensed, insured, emergency service available."
  },
  "/service-areas/northeast-maryland": {
    title: "Northeast Maryland Pest Control Services | Absolute Pest Services",
    description: "Northeast MD: Expert pest control in Elkton, North East, Perryville, Rising Sun. Licensed, insured, emergency service available."
  },
  // ── City-level service area pages ────────────────────────────────────────
  "/service-areas/avondale-pa": {
    title: "Avondale PA Pest Control Services | Absolute Pest Services",
    description: "Avondale, PA pest control: wildlife removal, termite treatment, bed bug control & rodent extermination. Serving Chester County. Licensed & insured. Call 484-643-2225."
  },
  "/service-areas/chadds-ford-pa": {
    title: "Chadds Ford PA Pest Control Services | Absolute Pest Services",
    description: "Chadds Ford, PA pest control: wildlife removal, termite treatment, bed bug control & rodent extermination. Serving Chester County. Licensed & insured. Call 484-643-2225."
  },
  "/service-areas/coatesville-pa": {
    title: "Coatesville PA Pest Control Services | Absolute Pest Services",
    description: "Coatesville, PA pest control: wildlife removal, termite treatment, bed bug control & rodent extermination. Serving Chester County. Licensed & insured. Call 484-643-2225."
  },
  "/service-areas/cochranville-pa": {
    title: "Cochranville PA Pest Control Services | Absolute Pest Services",
    description: "Cochranville, PA pest control: wildlife removal, termite treatment, bed bug control & rodent extermination. Serving Chester County. Licensed & insured. Call 484-643-2225."
  },
  "/service-areas/collegeville-pa": {
    title: "Collegeville PA Pest Control Services | Absolute Pest Services",
    description: "Collegeville PA pest control: wildlife removal, termite treatment, and rodent control near Ursinus College and Perkiomen Creek. Call 484-643-2225."
  },
  "/service-areas/downingtown-pa": {
    title: "Downingtown PA Pest Control Services | Absolute Pest Services",
    description: "Downingtown PA pest control: wildlife removal, termite treatment, bed bug control near Marsh Creek State Park and East Brandywine. Call 484-643-2225."
  },
  "/service-areas/exton-pa": {
    title: "Exton PA Pest Control Services | Absolute Pest Services",
    description: "Exton PA pest control: wildlife removal, termite treatment, bed bug control, and rodent extermination near the PA Turnpike. Serving Exton, Lionville, and Uwchlan. Call 484-643-2225."
  },
  "/service-areas/glen-mills-pa": {
    title: "Glen Mills PA Pest Control Services | Absolute Pest Services",
    description: "Glen Mills, PA pest control: wildlife removal, termite treatment, bed bug control & rodent extermination. Serving Chester County. Licensed & insured. Call 484-643-2225."
  },
  "/service-areas/hockessin-de": {
    title: "Hockessin DE Pest Control Services | Absolute Pest Services",
    description: "Hockessin DE pest control: wildlife removal, termite treatment, and rodent control in heavily wooded Northern Delaware. Serving Kennett Pike corridor. Call 484-643-2225."
  },
  "/service-areas/kennett-square-pa": {
    title: "Kennett Square PA Pest Control Services | Absolute Pest Services",
    description: "Kennett Square, PA pest control: wildlife removal, termite treatment, bed bug control & rodent extermination. Serving Chester County. Licensed & insured. Call 484-643-2225."
  },
  "/service-areas/king-of-prussia-pa": {
    title: "King of Prussia PA Pest Control Services | Absolute Pest Services",
    description: "King of Prussia PA pest control: commercial and residential wildlife removal, termite treatment, and rodent control near Valley Forge. Call 484-643-2225."
  },
  "/service-areas/landenberg-pa": {
    title: "Landenberg PA Pest Control Services | Absolute Pest Services",
    description: "Landenberg, PA pest control: wildlife removal, termite treatment, bed bug control & rodent extermination. Serving Chester County. Licensed & insured. Call 484-643-2225."
  },
  "/service-areas/lincoln-university-pa": {
    title: "Lincoln University PA Pest Control Services | Absolute Pest Services",
    description: "Lincoln University, PA pest control: wildlife removal, termite treatment, bed bug control & rodent extermination. Serving Chester County. Licensed & insured. Call 484-643-2225."
  },
  "/service-areas/malvern-pa": {
    title: "Malvern PA Pest Control Services | Absolute Pest Services",
    description: "Malvern PA pest control: wildlife removal, termite treatment, bed bug control along the Paoli Pike corridor. Serving Malvern, Frazer, and Great Valley. Call 484-643-2225."
  },
  "/service-areas/newark-de": {
    title: "Newark DE Pest Control Services | Absolute Pest Services",
    description: "Newark DE pest control: bed bug treatment, wildlife removal, termite control near the University of Delaware. Serving Newark and growing New Castle County suburbs. Call 484-643-2225."
  },
  "/service-areas/norristown-pa": {
    title: "Norristown PA Pest Control Services | Absolute Pest Services",
    description: "Norristown PA pest control: rodent control, wildlife removal, termite treatment along the Schuylkill River corridor. Montgomery County's trusted pest experts. Call 484-643-2225."
  },
  "/service-areas/oxford-pa": {
    title: "Oxford PA Pest Control Services | Absolute Pest Services",
    description: "Oxford, PA pest control: wildlife removal, termite treatment, bed bug control & rodent extermination. Serving Chester County. Licensed & insured. Call 484-643-2225."
  },
  "/service-areas/pottstown-pa": {
    title: "Pottstown PA Pest Control Services | Absolute Pest Services",
    description: "Pottstown PA pest control: rodent control, wildlife removal, and termite treatment in Montgomery County's industrial heritage corridor. Call 484-643-2225."
  },
  "/service-areas/west-chester-pa": {
    title: "West Chester PA Pest Control Services | Absolute Pest Services",
    description: "West Chester PA pest control: expert wildlife removal, termite treatment, bed bug control, and rodent extermination. Serving West Chester Borough and surrounding townships. Call 484-643-2225."
  },
  "/service-areas/west-grove-pa": {
    title: "West Grove PA Pest Control Services | Absolute Pest Services",
    description: "West Grove, PA pest control: wildlife removal, termite treatment, bed bug control & rodent extermination. Serving Chester County. Licensed & insured. Call 484-643-2225."
  },
  "/service-areas/wilmington-de": {
    title: "Wilmington DE Pest Control Services | Absolute Pest Services",
    description: "Wilmington DE pest control: rodent control, wildlife removal, termite treatment near the Brandywine River. Delaware's largest city pest experts. Call 484-643-2225."
  },
  "/service-areas/aberdeen-md": {
    title: "Aberdeen MD Pest Control Services | Absolute Pest Services",
    description: "Aberdeen MD pest control: wildlife removal, termite treatment, and rodent control near Aberdeen Proving Ground and the Chesapeake Bay. Call 484-643-2225."
  },
  "/service-areas/bel-air-md": {
    title: "Bel Air MD Pest Control Services | Absolute Pest Services",
    description: "Bel Air MD pest control: wildlife removal, termite treatment, and rodent control near I-95 in Harford County. Serving Bel Air and surrounding suburbs. Call 484-643-2225."
  },
  "/service-areas/havre-de-grace-md": {
    title: "Havre de Grace MD Pest Control Services | Absolute Pest Services",
    description: "Havre de Grace MD pest control: wildlife removal, termite treatment near the Susquehanna River and Chesapeake Bay. Historic waterfront city pest experts. Call 484-643-2225."
  },
  // ── 60 City × Service programmatic pages ─────────────────────────────────
  // General Pest Control (15 cities)
  "/pest-control-avondale-pa/": {
    title: "General Pest Control in Avondale, PA | Absolute Pest Services",
    description: "Expert general pest control in Avondale, PA. Licensed & insured. Serving Chester County. Free inspection available. Call 484-643-2225 for fast service."
  },
  "/pest-control-chadds-ford-pa/": {
    title: "General Pest Control in Chadds Ford, PA | Absolute Pest Services",
    description: "Expert general pest control in Chadds Ford, PA. Licensed & insured. Serving Chester County. Free inspection available. Call 484-643-2225 for fast service."
  },
  "/pest-control-coatesville-pa/": {
    title: "General Pest Control in Coatesville, PA | Absolute Pest Services",
    description: "Expert general pest control in Coatesville, PA. Licensed & insured. Serving Chester County. Free inspection available. Call 484-643-2225 for fast service."
  },
  "/pest-control-cochranville-pa/": {
    title: "General Pest Control in Cochranville, PA | Absolute Pest Services",
    description: "Expert general pest control in Cochranville, PA. Licensed & insured. Serving Chester County. Free inspection available. Call 484-643-2225 for fast service."
  },
  "/pest-control-downingtown-pa/": {
    title: "General Pest Control in Downingtown, PA | Absolute Pest Services",
    description: "Expert general pest control in Downingtown, PA. Licensed & insured. Serving Chester County. Free inspection available. Call 484-643-2225 for fast service."
  },
  "/pest-control-exton-pa/": {
    title: "General Pest Control in Exton, PA | Absolute Pest Services",
    description: "Expert general pest control in Exton, PA. Licensed & insured. Serving Chester County. Free inspection available. Call 484-643-2225 for fast service."
  },
  "/pest-control-glen-mills-pa/": {
    title: "General Pest Control in Glen Mills, PA | Absolute Pest Services",
    description: "Expert general pest control in Glen Mills, PA. Licensed & insured. Serving Chester County. Free inspection available. Call 484-643-2225 for fast service."
  },
  "/pest-control-hockessin-de/": {
    title: "General Pest Control in Hockessin, DE | Absolute Pest Services",
    description: "Expert general pest control in Hockessin, DE. Licensed & insured. Serving New Castle County. Free inspection available. Call 484-643-2225 for fast service."
  },
  "/pest-control-kennett-square-pa/": {
    title: "General Pest Control in Kennett Square, PA | Absolute Pest Services",
    description: "Expert general pest control in Kennett Square, PA. Licensed & insured. Serving Chester County. Free inspection available. Call 484-643-2225 for fast service."
  },
  "/pest-control-landenberg-pa/": {
    title: "General Pest Control in Landenberg, PA | Absolute Pest Services",
    description: "Expert general pest control in Landenberg, PA. Licensed & insured. Serving Chester County. Free inspection available. Call 484-643-2225 for fast service."
  },
  "/pest-control-lincoln-university-pa/": {
    title: "General Pest Control in Lincoln University, PA | Absolute Pest Services",
    description: "Expert general pest control in Lincoln University, PA. Licensed & insured. Serving Chester County. Free inspection available. Call 484-643-2225 for fast service."
  },
  "/pest-control-newark-de/": {
    title: "General Pest Control in Newark, DE | Absolute Pest Services",
    description: "Expert general pest control in Newark, DE. Licensed & insured. Serving New Castle County. Free inspection available. Call 484-643-2225 for fast service."
  },
  "/pest-control-oxford-pa/": {
    title: "General Pest Control in Oxford, PA | Absolute Pest Services",
    description: "Expert general pest control in Oxford, PA. Licensed & insured. Serving Chester County. Free inspection available. Call 484-643-2225 for fast service."
  },
  "/pest-control-west-grove-pa/": {
    title: "General Pest Control in West Grove, PA | Absolute Pest Services",
    description: "Expert general pest control in West Grove, PA. Licensed & insured. Serving Chester County. Free inspection available. Call 484-643-2225 for fast service."
  },
  "/pest-control-wilmington-de/": {
    title: "General Pest Control in Wilmington, DE | Absolute Pest Services",
    description: "Expert general pest control in Wilmington, DE. Licensed & insured. Serving New Castle County. Free inspection available. Call 484-643-2225 for fast service."
  },
  // Termite Control (15 cities)
  "/termite-control-avondale-pa/": {
    title: "Termite Control in Avondale, PA | Absolute Pest Services",
    description: "Expert termite control in Avondale, PA. Licensed & insured. Serving Chester County. Free inspection available. Call 484-643-2225 for fast service."
  },
  "/termite-control-chadds-ford-pa/": {
    title: "Termite Control in Chadds Ford, PA | Absolute Pest Services",
    description: "Expert termite control in Chadds Ford, PA. Licensed & insured. Serving Chester County. Free inspection available. Call 484-643-2225 for fast service."
  },
  "/termite-control-coatesville-pa/": {
    title: "Termite Control in Coatesville, PA | Absolute Pest Services",
    description: "Expert termite control in Coatesville, PA. Licensed & insured. Serving Chester County. Free inspection available. Call 484-643-2225 for fast service."
  },
  "/termite-control-cochranville-pa/": {
    title: "Termite Control in Cochranville, PA | Absolute Pest Services",
    description: "Expert termite control in Cochranville, PA. Licensed & insured. Serving Chester County. Free inspection available. Call 484-643-2225 for fast service."
  },
  "/termite-control-downingtown-pa/": {
    title: "Termite Control in Downingtown, PA | Absolute Pest Services",
    description: "Expert termite control in Downingtown, PA. Licensed & insured. Serving Chester County. Free inspection available. Call 484-643-2225 for fast service."
  },
  "/termite-control-exton-pa/": {
    title: "Termite Control in Exton, PA | Absolute Pest Services",
    description: "Expert termite control in Exton, PA. Licensed & insured. Serving Chester County. Free inspection available. Call 484-643-2225 for fast service."
  },
  "/termite-control-glen-mills-pa/": {
    title: "Termite Control in Glen Mills, PA | Absolute Pest Services",
    description: "Expert termite control in Glen Mills, PA. Licensed & insured. Serving Chester County. Free inspection available. Call 484-643-2225 for fast service."
  },
  "/termite-control-hockessin-de/": {
    title: "Termite Control in Hockessin, DE | Absolute Pest Services",
    description: "Expert termite control in Hockessin, DE. Licensed & insured. Serving New Castle County. Free inspection available. Call 484-643-2225 for fast service."
  },
  "/termite-control-kennett-square-pa/": {
    title: "Termite Control in Kennett Square, PA | Absolute Pest Services",
    description: "Expert termite control in Kennett Square, PA. Licensed & insured. Serving Chester County. Free inspection available. Call 484-643-2225 for fast service."
  },
  "/termite-control-landenberg-pa/": {
    title: "Termite Control in Landenberg, PA | Absolute Pest Services",
    description: "Expert termite control in Landenberg, PA. Licensed & insured. Serving Chester County. Free inspection available. Call 484-643-2225 for fast service."
  },
  "/termite-control-lincoln-university-pa/": {
    title: "Termite Control in Lincoln University, PA | Absolute Pest Services",
    description: "Expert termite control in Lincoln University, PA. Licensed & insured. Serving Chester County. Free inspection available. Call 484-643-2225 for fast service."
  },
  "/termite-control-newark-de/": {
    title: "Termite Control in Newark, DE | Absolute Pest Services",
    description: "Expert termite control in Newark, DE. Licensed & insured. Serving New Castle County. Free inspection available. Call 484-643-2225 for fast service."
  },
  "/termite-control-oxford-pa/": {
    title: "Termite Control in Oxford, PA | Absolute Pest Services",
    description: "Expert termite control in Oxford, PA. Licensed & insured. Serving Chester County. Free inspection available. Call 484-643-2225 for fast service."
  },
  "/termite-control-west-grove-pa/": {
    title: "Termite Control in West Grove, PA | Absolute Pest Services",
    description: "Expert termite control in West Grove, PA. Licensed & insured. Serving Chester County. Free inspection available. Call 484-643-2225 for fast service."
  },
  "/termite-control-wilmington-de/": {
    title: "Termite Control in Wilmington, DE | Absolute Pest Services",
    description: "Expert termite control in Wilmington, DE. Licensed & insured. Serving New Castle County. Free inspection available. Call 484-643-2225 for fast service."
  },
  // Wildlife & Rodent Control (15 cities)
  "/wildlife-control-avondale-pa/": {
    title: "Wildlife & Rodent Control in Avondale, PA | Absolute Pest Services",
    description: "Expert wildlife & rodent control in Avondale, PA. Licensed & insured. Serving Chester County. Free inspection available. Call 484-643-2225 for fast service."
  },
  "/wildlife-control-chadds-ford-pa/": {
    title: "Wildlife & Rodent Control in Chadds Ford, PA | Absolute Pest Services",
    description: "Expert wildlife & rodent control in Chadds Ford, PA. Licensed & insured. Serving Chester County. Free inspection available. Call 484-643-2225 for fast service."
  },
  "/wildlife-control-coatesville-pa/": {
    title: "Wildlife & Rodent Control in Coatesville, PA | Absolute Pest Services",
    description: "Expert wildlife & rodent control in Coatesville, PA. Licensed & insured. Serving Chester County. Free inspection available. Call 484-643-2225 for fast service."
  },
  "/wildlife-control-cochranville-pa/": {
    title: "Wildlife & Rodent Control in Cochranville, PA | Absolute Pest Services",
    description: "Expert wildlife & rodent control in Cochranville, PA. Licensed & insured. Serving Chester County. Free inspection available. Call 484-643-2225 for fast service."
  },
  "/wildlife-control-downingtown-pa/": {
    title: "Wildlife & Rodent Control in Downingtown, PA | Absolute Pest Services",
    description: "Expert wildlife & rodent control in Downingtown, PA. Licensed & insured. Serving Chester County. Free inspection available. Call 484-643-2225 for fast service."
  },
  "/wildlife-control-exton-pa/": {
    title: "Wildlife & Rodent Control in Exton, PA | Absolute Pest Services",
    description: "Expert wildlife & rodent control in Exton, PA. Licensed & insured. Serving Chester County. Free inspection available. Call 484-643-2225 for fast service."
  },
  "/wildlife-control-glen-mills-pa/": {
    title: "Wildlife & Rodent Control in Glen Mills, PA | Absolute Pest Services",
    description: "Expert wildlife & rodent control in Glen Mills, PA. Licensed & insured. Serving Chester County. Free inspection available. Call 484-643-2225 for fast service."
  },
  "/wildlife-control-hockessin-de/": {
    title: "Wildlife & Rodent Control in Hockessin, DE | Absolute Pest Services",
    description: "Expert wildlife & rodent control in Hockessin, DE. Licensed & insured. Serving New Castle County. Free inspection available. Call 484-643-2225 for fast service."
  },
  "/wildlife-control-kennett-square-pa/": {
    title: "Wildlife & Rodent Control in Kennett Square, PA | Absolute Pest Services",
    description: "Expert wildlife & rodent control in Kennett Square, PA. Licensed & insured. Serving Chester County. Free inspection available. Call 484-643-2225 for fast service."
  },
  "/wildlife-control-landenberg-pa/": {
    title: "Wildlife & Rodent Control in Landenberg, PA | Absolute Pest Services",
    description: "Expert wildlife & rodent control in Landenberg, PA. Licensed & insured. Serving Chester County. Free inspection available. Call 484-643-2225 for fast service."
  },
  "/wildlife-control-lincoln-university-pa/": {
    title: "Wildlife & Rodent Control in Lincoln University, PA | Absolute Pest Services",
    description: "Expert wildlife & rodent control in Lincoln University, PA. Licensed & insured. Serving Chester County. Free inspection available. Call 484-643-2225 for fast service."
  },
  "/wildlife-control-newark-de/": {
    title: "Wildlife & Rodent Control in Newark, DE | Absolute Pest Services",
    description: "Expert wildlife & rodent control in Newark, DE. Licensed & insured. Serving New Castle County. Free inspection available. Call 484-643-2225 for fast service."
  },
  "/wildlife-control-oxford-pa/": {
    title: "Wildlife & Rodent Control in Oxford, PA | Absolute Pest Services",
    description: "Expert wildlife & rodent control in Oxford, PA. Licensed & insured. Serving Chester County. Free inspection available. Call 484-643-2225 for fast service."
  },
  "/wildlife-control-west-grove-pa/": {
    title: "Wildlife & Rodent Control in West Grove, PA | Absolute Pest Services",
    description: "Expert wildlife & rodent control in West Grove, PA. Licensed & insured. Serving Chester County. Free inspection available. Call 484-643-2225 for fast service."
  },
  "/wildlife-control-wilmington-de/": {
    title: "Wildlife & Rodent Control in Wilmington, DE | Absolute Pest Services",
    description: "Expert wildlife & rodent control in Wilmington, DE. Licensed & insured. Serving New Castle County. Free inspection available. Call 484-643-2225 for fast service."
  },
  // Ant & Wasp Control (15 cities)
  "/ant-wasp-control-avondale-pa/": {
    title: "Ant & Wasp Control in Avondale, PA | Absolute Pest Services",
    description: "Expert ant, wasp, hornet & carpenter bee control in Avondale, PA. Licensed & insured. Serving Chester County. Free inspection available. Call 484-643-2225."
  },
  "/ant-wasp-control-chadds-ford-pa/": {
    title: "Ant & Wasp Control in Chadds Ford, PA | Absolute Pest Services",
    description: "Expert ant, wasp, hornet & carpenter bee control in Chadds Ford, PA. Licensed & insured. Serving Chester County. Free inspection available. Call 484-643-2225."
  },
  "/ant-wasp-control-coatesville-pa/": {
    title: "Ant & Wasp Control in Coatesville, PA | Absolute Pest Services",
    description: "Expert ant, wasp, hornet & carpenter bee control in Coatesville, PA. Licensed & insured. Serving Chester County. Free inspection available. Call 484-643-2225."
  },
  "/ant-wasp-control-cochranville-pa/": {
    title: "Ant & Wasp Control in Cochranville, PA | Absolute Pest Services",
    description: "Expert ant, wasp, hornet & carpenter bee control in Cochranville, PA. Licensed & insured. Serving Chester County. Free inspection available. Call 484-643-2225."
  },
  "/ant-wasp-control-downingtown-pa/": {
    title: "Ant & Wasp Control in Downingtown, PA | Absolute Pest Services",
    description: "Expert ant, wasp, hornet & carpenter bee control in Downingtown, PA. Licensed & insured. Serving Chester County. Free inspection available. Call 484-643-2225."
  },
  "/ant-wasp-control-exton-pa/": {
    title: "Ant & Wasp Control in Exton, PA | Absolute Pest Services",
    description: "Expert ant, wasp, hornet & carpenter bee control in Exton, PA. Licensed & insured. Serving Chester County. Free inspection available. Call 484-643-2225."
  },
  "/ant-wasp-control-glen-mills-pa/": {
    title: "Ant & Wasp Control in Glen Mills, PA | Absolute Pest Services",
    description: "Expert ant, wasp, hornet & carpenter bee control in Glen Mills, PA. Licensed & insured. Serving Chester County. Free inspection available. Call 484-643-2225."
  },
  "/ant-wasp-control-hockessin-de/": {
    title: "Ant & Wasp Control in Hockessin, DE | Absolute Pest Services",
    description: "Expert ant, wasp, hornet & carpenter bee control in Hockessin, DE. Licensed & insured. Serving New Castle County. Free inspection available. Call 484-643-2225."
  },
  "/ant-wasp-control-kennett-square-pa/": {
    title: "Ant & Wasp Control in Kennett Square, PA | Absolute Pest Services",
    description: "Expert ant, wasp, hornet & carpenter bee control in Kennett Square, PA. Licensed & insured. Serving Chester County. Free inspection available. Call 484-643-2225."
  },
  "/ant-wasp-control-landenberg-pa/": {
    title: "Ant & Wasp Control in Landenberg, PA | Absolute Pest Services",
    description: "Expert ant, wasp, hornet & carpenter bee control in Landenberg, PA. Licensed & insured. Serving Chester County. Free inspection available. Call 484-643-2225."
  },
  "/ant-wasp-control-lincoln-university-pa/": {
    title: "Ant & Wasp Control in Lincoln University, PA | Absolute Pest Services",
    description: "Expert ant, wasp, hornet & carpenter bee control in Lincoln University, PA. Licensed & insured. Serving Chester County. Free inspection available. Call 484-643-2225."
  },
  "/ant-wasp-control-newark-de/": {
    title: "Ant & Wasp Control in Newark, DE | Absolute Pest Services",
    description: "Expert ant, wasp, hornet & carpenter bee control in Newark, DE. Licensed & insured. Serving New Castle County. Free inspection available. Call 484-643-2225."
  },
  "/ant-wasp-control-oxford-pa/": {
    title: "Ant & Wasp Control in Oxford, PA | Absolute Pest Services",
    description: "Expert ant, wasp, hornet & carpenter bee control in Oxford, PA. Licensed & insured. Serving Chester County. Free inspection available. Call 484-643-2225."
  },
  "/ant-wasp-control-west-grove-pa/": {
    title: "Ant & Wasp Control in West Grove, PA | Absolute Pest Services",
    description: "Expert ant, wasp, hornet & carpenter bee control in West Grove, PA. Licensed & insured. Serving Chester County. Free inspection available. Call 484-643-2225."
  },
  "/ant-wasp-control-wilmington-de/": {
    title: "Ant & Wasp Control in Wilmington, DE | Absolute Pest Services",
    description: "Expert ant, wasp, hornet & carpenter bee control in Wilmington, DE. Licensed & insured. Serving New Castle County. Free inspection available. Call 484-643-2225."
  }
};
function getRouteMeta(pathname) {
  const normalised = pathname === "/" ? "/" : pathname.replace(/\/+$/, "");
  if (ROUTE_META[normalised]) return ROUTE_META[normalised];
  if (ROUTE_META[normalised + "/"]) return ROUTE_META[normalised + "/"];
  return DEFAULT_META;
}
function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function injectSeoMeta(html, meta) {
  const safeTitle = escapeHtml(meta.title);
  const safeDesc = escapeHtml(meta.description);
  let result = html;
  result = result.replace(
    /<title>[^<]*<\/title>/,
    `<title>${safeTitle}</title>`
  );
  result = result.replace(
    /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/,
    `<meta name="description" content="${safeDesc}" />`
  );
  result = result.replace(
    /(<meta\s+property="og:title"\s+content=")[^"]*(")/,
    `$1${safeTitle}$2`
  );
  result = result.replace(
    /(<meta\s+property="og:description"\s+content=")[^"]*(")/,
    `$1${safeDesc}$2`
  );
  result = result.replace(
    /(<meta\s+name="twitter:title"\s+content=")[^"]*(")/,
    `$1${safeTitle}$2`
  );
  result = result.replace(
    /(<meta\s+name="twitter:description"\s+content=")[^"]*(")/,
    `$1${safeDesc}$2`
  );
  return result;
}

// server/vite.ts
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path3.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs2.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      const pathname = url.split("?")[0];
      const meta = getRouteMeta(pathname);
      const seoPage = injectSeoMeta(page, meta);
      res.status(200).set({ "Content-Type": "text/html" }).end(seoPage);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path3.resolve(import.meta.dirname, "public");
  if (!fs2.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  const indexPath = path3.resolve(distPath, "index.html");
  const baseHtml = fs2.readFileSync(indexPath, "utf-8");
  app2.use("*", (req, res) => {
    const pathname = (req.originalUrl || req.url || "/").split("?")[0];
    const meta = getRouteMeta(pathname);
    const html = injectSeoMeta(baseHtml, meta);
    res.setHeader("Content-Type", "text/html");
    res.send(html);
  });
}

// server/index.ts
import cron from "node-cron";

// server/reminders.ts
init_email();
init_sms();
import { v4 as uuidv42 } from "uuid";
async function sendUpcomingReminders(type) {
  console.log(`[Reminder] Starting ${type} reminder check...`);
  const settings = await storage.getAllReminderSettings();
  if (!settings.reminders_enabled) {
    console.log("[Reminder] Reminders are disabled globally");
    return 0;
  }
  if (type === "24h" && !settings.reminder_24h_enabled) {
    console.log("[Reminder] 24h reminders are disabled");
    return 0;
  }
  if (type === "same_day" && !settings.reminder_same_day_enabled) {
    console.log("[Reminder] Same-day reminders are disabled");
    return 0;
  }
  let totalSent = 0;
  try {
    if (settings.reminder_inspection_enabled) {
      const inspections = type === "24h" ? await storage.getInspectionsFor24hReminder() : await storage.getInspectionsForSameDayReminder();
      console.log(`[Reminder] Found ${inspections.length} inspections for ${type} reminder`);
      for (const inspection of inspections) {
        const sent = await sendReminderForInspection(inspection, type, settings);
        if (sent) totalSent++;
      }
    }
    if (settings.reminder_service_request_enabled) {
      const serviceRequests2 = type === "24h" ? await storage.getServiceRequestsFor24hReminder() : await storage.getServiceRequestsForSameDayReminder();
      console.log(`[Reminder] Found ${serviceRequests2.length} service requests for ${type} reminder`);
      for (const sr of serviceRequests2) {
        const sent = await sendReminderForServiceRequest(sr, type, settings);
        if (sent) totalSent++;
      }
    }
    if (settings.reminder_job_log_enabled) {
      const jobLogs2 = type === "24h" ? await storage.getJobLogsFor24hReminder() : await storage.getJobLogsForSameDayReminder();
      console.log(`[Reminder] Found ${jobLogs2.length} job logs for ${type} reminder`);
      for (const job of jobLogs2) {
        const sent = await sendReminderForJobLog(job, type, settings);
        if (sent) totalSent++;
      }
    }
  } catch (error) {
    console.error("[Reminder] Error in reminder cron:", error);
  }
  console.log(`[Reminder] Completed ${type} reminder check. Sent ${totalSent} reminders.`);
  return totalSent;
}
async function sendReminderForInspection(inspection, reminderType, settings) {
  if (reminderType === "same_day" && new Date(inspection.preferredDate) < /* @__PURE__ */ new Date()) {
    console.log(`[Reminder] Skipping past appointment ${inspection.id}`);
    return false;
  }
  const reminderData = {
    appointmentType: "inspection",
    appointmentId: inspection.id,
    customerName: `${inspection.firstName} ${inspection.lastName}`,
    email: inspection.email,
    phone: inspection.phone,
    serviceType: inspection.serviceType,
    appointmentDate: new Date(inspection.preferredDate),
    appointmentTime: inspection.preferredTime,
    address: inspection.address,
    city: inspection.city
  };
  return await sendReminder(reminderData, reminderType, settings);
}
async function sendReminderForServiceRequest(serviceRequest, reminderType, settings) {
  if (serviceRequest.scheduledDate && new Date(serviceRequest.scheduledDate) < /* @__PURE__ */ new Date()) {
    console.log(`[Reminder] Skipping past appointment ${serviceRequest.id}`);
    return false;
  }
  const user = serviceRequest.userId ? await storage.getUser(serviceRequest.userId) : null;
  const reminderData = {
    appointmentType: "service_request",
    appointmentId: serviceRequest.id,
    customerName: `${serviceRequest.firstName} ${serviceRequest.lastName}`,
    email: user?.email || "",
    phone: user?.phone,
    serviceType: serviceRequest.serviceType,
    appointmentDate: serviceRequest.scheduledDate ? new Date(serviceRequest.scheduledDate) : /* @__PURE__ */ new Date(),
    address: serviceRequest.address,
    city: serviceRequest.city
  };
  if (!reminderData.email) {
    console.log(`[Reminder] No email for service request ${serviceRequest.id}, skipping`);
    return false;
  }
  return await sendReminder(reminderData, reminderType, settings);
}
async function sendReminderForJobLog(jobLog, reminderType, settings) {
  if (jobLog.jobDate && new Date(jobLog.jobDate) < /* @__PURE__ */ new Date()) {
    console.log(`[Reminder] Skipping past job ${jobLog.id}`);
    return false;
  }
  const client = jobLog.clientId ? await storage.getClient(jobLog.clientId) : null;
  const reminderData = {
    appointmentType: "job_log",
    appointmentId: jobLog.id,
    customerName: jobLog.customerName,
    email: client?.email || "",
    phone: client?.phone,
    serviceType: jobLog.workPerformed,
    appointmentDate: new Date(jobLog.jobDate),
    address: jobLog.siteAddress || jobLog.siteLocation,
    city: ""
  };
  if (!reminderData.email) {
    console.log(`[Reminder] No email for job log ${jobLog.id}, skipping`);
    return false;
  }
  return await sendReminder(reminderData, reminderType, settings);
}
async function sendReminder(data, reminderType, settings) {
  const { appointmentType, appointmentId, email, phone } = data;
  if (email) {
    const emailOptOut = await storage.getReminderOptOutByEmail(email);
    if (emailOptOut && (emailOptOut.optOutType === "email" || emailOptOut.optOutType === "all")) {
      console.log(`[Reminder] Customer ${email} has opted out of email reminders`);
      return false;
    }
  }
  if (phone) {
    const phoneOptOut = await storage.getReminderOptOutByPhone(phone);
    if (phoneOptOut && (phoneOptOut.optOutType === "sms" || phoneOptOut.optOutType === "all")) {
      console.log(`[Reminder] Customer ${phone} has opted out of SMS reminders`);
      return false;
    }
  }
  let emailSent = false;
  let smsSent = false;
  if (settings.reminder_email_enabled && email) {
    const existingEmailLog = await storage.getReminderLogByAppointment(
      appointmentType,
      appointmentId,
      reminderType,
      "email"
    );
    if (existingEmailLog) {
      console.log(`[Reminder] Email already sent for ${appointmentType} ${appointmentId} (${reminderType})`);
    } else {
      const unsubscribeToken = uuidv42();
      try {
        emailSent = await sendAppointmentReminderEmail({
          recipientEmail: email,
          customerName: data.customerName,
          serviceType: data.serviceType,
          appointmentDate: data.appointmentDate,
          appointmentTime: data.appointmentTime,
          address: data.address,
          city: data.city,
          reminderType,
          unsubscribeToken
        });
        await storage.createReminderLog({
          appointmentType,
          appointmentId,
          reminderType,
          channel: "email",
          recipientEmail: email,
          success: emailSent,
          errorMessage: emailSent ? null : "Failed to send email"
        });
        console.log(`[Reminder] ${emailSent ? "Sent" : "Failed"} email for ${appointmentType} ${appointmentId}`);
      } catch (error) {
        console.error(`[Reminder] Error sending email for ${appointmentType} ${appointmentId}:`, error?.message || error);
        await storage.createReminderLog({
          appointmentType,
          appointmentId,
          reminderType,
          channel: "email",
          recipientEmail: email,
          success: false,
          errorMessage: error?.message || "Unknown error"
        });
      }
    }
  }
  if (settings.reminder_sms_enabled && phone && isSMSConfigured()) {
    const existingSmsLog = await storage.getReminderLogByAppointment(
      appointmentType,
      appointmentId,
      reminderType,
      "sms"
    );
    if (existingSmsLog) {
      console.log(`[Reminder] SMS already sent for ${appointmentType} ${appointmentId} (${reminderType})`);
    } else {
      try {
        smsSent = await sendAppointmentReminderSMS({
          toPhone: phone,
          customerName: data.customerName,
          serviceType: data.serviceType,
          appointmentDate: data.appointmentDate,
          appointmentTime: data.appointmentTime,
          address: data.address,
          reminderType
        });
        await storage.createReminderLog({
          appointmentType,
          appointmentId,
          reminderType,
          channel: "sms",
          recipientPhone: phone,
          success: smsSent,
          errorMessage: smsSent ? null : "Failed to send SMS"
        });
        console.log(`[Reminder] ${smsSent ? "Sent" : "Failed"} SMS for ${appointmentType} ${appointmentId}`);
      } catch (error) {
        console.error(`[Reminder] Error sending SMS for ${appointmentType} ${appointmentId}:`, error?.message || error);
        await storage.createReminderLog({
          appointmentType,
          appointmentId,
          reminderType,
          channel: "sms",
          recipientPhone: phone,
          success: false,
          errorMessage: error?.message || "Unknown error"
        });
      }
    }
  }
  return emailSent || smsSent;
}
function getUTCHourForLocalTime(hour, timezone) {
  const now = /* @__PURE__ */ new Date();
  const month = now.getMonth();
  const isDST = month >= 3 && month <= 10;
  const offset = isDST ? -4 : -5;
  let utcHour = hour - offset;
  if (utcHour < 0) utcHour += 24;
  if (utcHour >= 24) utcHour -= 24;
  return utcHour;
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
var publicPath = path4.resolve(process.cwd(), "public");
app.use("/uploads", express2.static(path4.join(publicPath, "uploads")));
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});
app.get("/api/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});
app.use((req, res, next) => {
  const start = Date.now();
  const path5 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path5.startsWith("/api")) {
      let logLine = `${req.method} ${path5} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  cron.schedule("0 9 * * *", async () => {
    try {
      console.log("Running daily overdue invoice check...");
      const count = await storage.markInvoicesOverdue();
      if (count > 0) {
        console.log(`Marked ${count} invoices as overdue and sent emails`);
      }
    } catch (error) {
      console.error("Error in overdue invoice cron job:", error);
    }
  });
  console.log("Scheduled daily overdue invoice check at 9 AM");
  async function scheduleReminderCron() {
    const settings = await storage.getAllReminderSettings();
    const utcHour = getUTCHourForLocalTime(settings.reminder_time_hour, settings.reminder_timezone);
    return cron.schedule(`0 ${utcHour} * * *`, async () => {
      try {
        console.log("Running daily appointment reminder check...");
        const count24h = await sendUpcomingReminders("24h");
        console.log(`Sent ${count24h} 24-hour advance reminders`);
        const countSameDay = await sendUpcomingReminders("same_day");
        console.log(`Sent ${countSameDay} same-day reminders`);
        console.log("Completed daily appointment reminder check");
      } catch (error) {
        console.error("Error in appointment reminder cron job:", error);
      }
    }, {
      scheduled: settings.reminders_enabled
    });
  }
  scheduleReminderCron().then((job) => {
    console.log("Scheduled daily appointment reminder cron (4 PM Eastern default)");
  }).catch((err) => {
    console.error("Failed to schedule reminder cron:", err);
  });
  cron.schedule("0 * * * *", async () => {
    try {
      const count = await dispatchPendingReviewRequests();
      if (count > 0) {
        console.log(`[ReviewRequests] Sent ${count} review request emails`);
      }
    } catch (err) {
      console.error("[ReviewRequests] Cron error:", err);
    }
  });
  console.log("Scheduled hourly review request dispatcher");
  const port = 5e3;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
