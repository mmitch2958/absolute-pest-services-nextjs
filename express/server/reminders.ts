import { storage } from "./storage";
import { sendAppointmentReminderEmail } from "./email";
import { sendAppointmentReminderSMS, isSMSConfigured } from "./sms";
import { v4 as uuidv4 } from "uuid";
import type { ReminderType, AppointmentType, ReminderData, ReminderSettings } from "@shared/schema";

/**
 * Main function to send upcoming appointment reminders
 * Called by cron jobs for 24h and same-day reminders
 */
export async function sendUpcomingReminders(type: ReminderType): Promise<number> {
  console.log(`[Reminder] Starting ${type} reminder check...`);
  
  // Get settings
  const settings = await storage.getAllReminderSettings();
  
  if (!settings.reminders_enabled) {
    console.log('[Reminder] Reminders are disabled globally');
    return 0;
  }

  // Check if this reminder type is enabled
  if (type === '24h' && !settings.reminder_24h_enabled) {
    console.log('[Reminder] 24h reminders are disabled');
    return 0;
  }
  if (type === 'same_day' && !settings.reminder_same_day_enabled) {
    console.log('[Reminder] Same-day reminders are disabled');
    return 0;
  }

  let totalSent = 0;

  try {
    // Get appointments from each source based on settings and reminder type
    if (settings.reminder_inspection_enabled) {
      const inspections = type === '24h' 
        ? await storage.getInspectionsFor24hReminder()
        : await storage.getInspectionsForSameDayReminder();
      
      console.log(`[Reminder] Found ${inspections.length} inspections for ${type} reminder`);
      
      for (const inspection of inspections) {
        const sent = await sendReminderForInspection(inspection, type, settings);
        if (sent) totalSent++;
      }
    }

    if (settings.reminder_service_request_enabled) {
      const serviceRequests = type === '24h'
        ? await storage.getServiceRequestsFor24hReminder()
        : await storage.getServiceRequestsForSameDayReminder();
      
      console.log(`[Reminder] Found ${serviceRequests.length} service requests for ${type} reminder`);
      
      for (const sr of serviceRequests) {
        const sent = await sendReminderForServiceRequest(sr, type, settings);
        if (sent) totalSent++;
      }
    }

    if (settings.reminder_job_log_enabled) {
      const jobLogs = type === '24h'
        ? await storage.getJobLogsFor24hReminder()
        : await storage.getJobLogsForSameDayReminder();
      
      console.log(`[Reminder] Found ${jobLogs.length} job logs for ${type} reminder`);
      
      for (const job of jobLogs) {
        const sent = await sendReminderForJobLog(job, type, settings);
        if (sent) totalSent++;
      }
    }

  } catch (error) {
    console.error('[Reminder] Error in reminder cron:', error);
  }

  console.log(`[Reminder] Completed ${type} reminder check. Sent ${totalSent} reminders.`);
  return totalSent;
}

/**
 * Send reminder for an inspection schedule
 */
async function sendReminderForInspection(
  inspection: any,
  reminderType: ReminderType,
  settings: ReminderSettings
): Promise<boolean> {
  // Check if appointment has already passed (for same-day)
  if (reminderType === 'same_day' && new Date(inspection.preferredDate) < new Date()) {
    console.log(`[Reminder] Skipping past appointment ${inspection.id}`);
    return false;
  }

  const reminderData: ReminderData = {
    appointmentType: 'inspection',
    appointmentId: inspection.id,
    customerName: `${inspection.firstName} ${inspection.lastName}`,
    email: inspection.email,
    phone: inspection.phone,
    serviceType: inspection.serviceType,
    appointmentDate: new Date(inspection.preferredDate),
    appointmentTime: inspection.preferredTime,
    address: inspection.address,
    city: inspection.city,
  };

  return await sendReminder(reminderData, reminderType, settings);
}

/**
 * Send reminder for a service request
 */
async function sendReminderForServiceRequest(
  serviceRequest: any,
  reminderType: ReminderType,
  settings: ReminderSettings
): Promise<boolean> {
  // Check if appointment has already passed
  if (serviceRequest.scheduledDate && new Date(serviceRequest.scheduledDate) < new Date()) {
    console.log(`[Reminder] Skipping past appointment ${serviceRequest.id}`);
    return false;
  }

  // Get user email from userId
  const user = serviceRequest.userId ? await storage.getUser(serviceRequest.userId) : null;
  
  const reminderData: ReminderData = {
    appointmentType: 'service_request',
    appointmentId: serviceRequest.id,
    customerName: `${serviceRequest.firstName} ${serviceRequest.lastName}`,
    email: user?.email || '',
    phone: user?.phone,
    serviceType: serviceRequest.serviceType,
    appointmentDate: serviceRequest.scheduledDate ? new Date(serviceRequest.scheduledDate) : new Date(),
    address: serviceRequest.address,
    city: serviceRequest.city,
  };

  if (!reminderData.email) {
    console.log(`[Reminder] No email for service request ${serviceRequest.id}, skipping`);
    return false;
  }

  return await sendReminder(reminderData, reminderType, settings);
}

/**
 * Send reminder for a job log
 */
async function sendReminderForJobLog(
  jobLog: any,
  reminderType: ReminderType,
  settings: ReminderSettings
): Promise<boolean> {
  // Check if appointment has already passed
  if (jobLog.jobDate && new Date(jobLog.jobDate) < new Date()) {
    console.log(`[Reminder] Skipping past job ${jobLog.id}`);
    return false;
  }

  // Get client info for email/phone
  const client = jobLog.clientId ? await storage.getClient(jobLog.clientId) : null;
  
  const reminderData: ReminderData = {
    appointmentType: 'job_log',
    appointmentId: jobLog.id,
    customerName: jobLog.customerName,
    email: client?.email || '',
    phone: client?.phone,
    serviceType: jobLog.workPerformed,
    appointmentDate: new Date(jobLog.jobDate),
    address: jobLog.siteAddress || jobLog.siteLocation,
    city: '',
  };

  if (!reminderData.email) {
    console.log(`[Reminder] No email for job log ${jobLog.id}, skipping`);
    return false;
  }

  return await sendReminder(reminderData, reminderType, settings);
}

/**
 * Core reminder sending logic - checks idempotency, opt-outs, and sends via configured channels
 */
async function sendReminder(
  data: ReminderData,
  reminderType: ReminderType,
  settings: ReminderSettings
): Promise<boolean> {
  const { appointmentType, appointmentId, email, phone } = data;

  // Check if customer has opted out
  if (email) {
    const emailOptOut = await storage.getReminderOptOutByEmail(email);
    if (emailOptOut && (emailOptOut.optOutType === 'email' || emailOptOut.optOutType === 'all')) {
      console.log(`[Reminder] Customer ${email} has opted out of email reminders`);
      return false;
    }
  }

  if (phone) {
    const phoneOptOut = await storage.getReminderOptOutByPhone(phone);
    if (phoneOptOut && (phoneOptOut.optOutType === 'sms' || phoneOptOut.optOutType === 'all')) {
      console.log(`[Reminder] Customer ${phone} has opted out of SMS reminders`);
      return false;
    }
  }

  let emailSent = false;
  let smsSent = false;

  // Send email if enabled
  if (settings.reminder_email_enabled && email) {
    // Check idempotency for email
    const existingEmailLog = await storage.getReminderLogByAppointment(
      appointmentType, appointmentId, reminderType, 'email'
    );
    
    if (existingEmailLog) {
      console.log(`[Reminder] Email already sent for ${appointmentType} ${appointmentId} (${reminderType})`);
    } else {
      // Generate unsubscribe token for this email
      const unsubscribeToken = uuidv4();
      
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
          unsubscribeToken,
        });

        // Log the reminder
        await storage.createReminderLog({
          appointmentType,
          appointmentId,
          reminderType,
          channel: 'email',
          recipientEmail: email,
          success: emailSent,
          errorMessage: emailSent ? null : 'Failed to send email',
        });

        console.log(`[Reminder] ${emailSent ? 'Sent' : 'Failed'} email for ${appointmentType} ${appointmentId}`);
      } catch (error: any) {
        console.error(`[Reminder] Error sending email for ${appointmentType} ${appointmentId}:`, error?.message || error);
        
        // Log failure
        await storage.createReminderLog({
          appointmentType,
          appointmentId,
          reminderType,
          channel: 'email',
          recipientEmail: email,
          success: false,
          errorMessage: error?.message || 'Unknown error',
        });
      }
    }
  }

  // Send SMS if enabled and configured
  if (settings.reminder_sms_enabled && phone && isSMSConfigured()) {
    // Check idempotency for SMS
    const existingSmsLog = await storage.getReminderLogByAppointment(
      appointmentType, appointmentId, reminderType, 'sms'
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
          reminderType,
        });

        // Log the reminder
        await storage.createReminderLog({
          appointmentType,
          appointmentId,
          reminderType,
          channel: 'sms',
          recipientPhone: phone,
          success: smsSent,
          errorMessage: smsSent ? null : 'Failed to send SMS',
        });

        console.log(`[Reminder] ${smsSent ? 'Sent' : 'Failed'} SMS for ${appointmentType} ${appointmentId}`);
      } catch (error: any) {
        console.error(`[Reminder] Error sending SMS for ${appointmentType} ${appointmentId}:`, error?.message || error);
        
        // Log failure
        await storage.createReminderLog({
          appointmentType,
          appointmentId,
          reminderType,
          channel: 'sms',
          recipientPhone: phone,
          success: false,
          errorMessage: error?.message || 'Unknown error',
        });
      }
    }
  }

  return emailSent || smsSent;
}

/**
 * Get the UTC hour for a given local time
 * This is a simplified version - in production you'd want proper timezone handling
 */
export function getUTCHourForLocalTime(hour: number, timezone: string): number {
  // For America/New_York: EST is UTC-5, EDT is UTC-4
  // Simplified: assume EDT (UTC-4) for summer, EST (UTC-5) for winter
  // This should be calculated based on the actual date
  const now = new Date();
  const month = now.getMonth();
  
  // DST: March-November (approximate)
  const isDST = month >= 3 && month <= 10;
  const offset = isDST ? -4 : -5;
  
  let utcHour = hour - offset;
  if (utcHour < 0) utcHour += 24;
  if (utcHour >= 24) utcHour -= 24;
  
  return utcHour;
}
