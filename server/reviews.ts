import { storage } from "./storage";
import { sendReviewRequestEmail, type ReviewRequestEmailData } from "./email";
import { DEFAULT_REVIEW_SETTINGS } from "@shared/schema";

// Schedule a review request when a job log is completed
export async function scheduleReviewRequestForJobLog(jobLogId: number): Promise<{ success: boolean; message: string; existingLogId?: number }> {
  try {
    // Get review settings
    const settings = await storage.getReviewSettings();
    
    if (!settings.enabled) {
      return { success: false, message: "Review requests are disabled" };
    }
    
    if (!settings.triggerJobCompletion) {
      return { success: false, message: "Job completion trigger is disabled" };
    }

    // Get the job log
    const jobLog = await storage.getJobLogById(jobLogId);
    if (!jobLog) {
      return { success: false, message: "Job log not found" };
    }

    // Get the client
    const client = jobLog.clientId ? await storage.getClientById(jobLog.clientId) : null;
    if (!client) {
      return { success: false, message: "Client not found" };
    }

    // Check opt-out
    if (client.reviewOptOut) {
      return { success: false, message: "Client has opted out of review requests" };
    }

    // Check if email exists
    if (!client.email) {
      return { success: false, message: "Client has no email address" };
    }

    // Check if already sent for this job log
    const existingLog = await storage.getReviewRequestLogByJobLogId(jobLogId);
    if (existingLog) {
      return { success: false, message: "Review request already exists for this job log", existingLogId: existingLog.id };
    }

    // Check 30-day cooldown (unless manual trigger)
    const hasRecentRequest = await storage.hasRecentReviewRequest(client.id, settings.cooldownDays);
    if (hasRecentRequest) {
      // Log as skipped due to cooldown
      await storage.createReviewRequestLog({
        clientId: client.id,
        jobLogId,
        invoiceId: null,
        recipientEmail: client.email,
        triggerType: 'job_completion',
        status: 'skipped',
        scheduledSendAt: new Date(),
      });
      return { success: false, message: "Client recently received a review request (cooldown period)" };
    }

    // Check max 6 per year
    const countThisYear = await storage.countReviewRequestsSentThisYear(client.id);
    if (countThisYear >= 6) {
      await storage.createReviewRequestLog({
        clientId: client.id,
        jobLogId,
        invoiceId: null,
        recipientEmail: client.email,
        triggerType: 'job_completion',
        status: 'skipped',
        scheduledSendAt: new Date(),
      });
      return { success: false, message: "Maximum review requests per year reached" };
    }

    // Schedule the review request
    const scheduledSendAt = new Date();
    scheduledSendAt.setHours(scheduledSendAt.getHours() + settings.delayHours);

    await storage.createReviewRequestLog({
      clientId: client.id,
      jobLogId,
      invoiceId: null,
      recipientEmail: client.email,
      triggerType: 'job_completion',
      status: 'pending',
      scheduledSendAt,
    });

    return { success: true, message: "Review request scheduled" };
  } catch (error) {
    console.error("[ReviewRequest] Error scheduling review request for job log:", error);
    return { success: false, message: "Internal error" };
  }
}

// Schedule a review request when an invoice is paid
export async function scheduleReviewRequestForInvoice(invoiceId: number): Promise<{ success: boolean; message: string; existingLogId?: number }> {
  try {
    // Get review settings
    const settings = await storage.getReviewSettings();
    
    if (!settings.enabled) {
      return { success: false, message: "Review requests are disabled" };
    }
    
    if (!settings.triggerInvoicePaid) {
      return { success: false, message: "Invoice paid trigger is disabled" };
    }

    // Get the invoice
    const invoice = await storage.getInvoiceById(invoiceId);
    if (!invoice) {
      return { success: false, message: "Invoice not found" };
    }

    // Get the client
    const client = await storage.getClientById(invoice.clientId);
    if (!client) {
      return { success: false, message: "Client not found" };
    }

    // Check opt-out
    if (client.reviewOptOut) {
      return { success: false, message: "Client has opted out of review requests" };
    }

    // Check if email exists
    if (!client.email) {
      return { success: false, message: "Client has no email address" };
    }

    // Check if already sent for this invoice
    const existingLog = await storage.getReviewRequestLogByInvoiceId(invoiceId);
    if (existingLog) {
      return { success: false, message: "Review request already exists for this invoice", existingLogId: existingLog.id };
    }

    // Check 30-day cooldown
    const hasRecentRequest = await storage.hasRecentReviewRequest(client.id, settings.cooldownDays);
    if (hasRecentRequest) {
      await storage.createReviewRequestLog({
        clientId: client.id,
        jobLogId: null,
        invoiceId,
        recipientEmail: client.email,
        triggerType: 'invoice_paid',
        status: 'skipped',
        scheduledSendAt: new Date(),
      });
      return { success: false, message: "Client recently received a review request (cooldown period)" };
    }

    // Check max 6 per year
    const countThisYear = await storage.countReviewRequestsSentThisYear(client.id);
    if (countThisYear >= 6) {
      await storage.createReviewRequestLog({
        clientId: client.id,
        jobLogId: null,
        invoiceId,
        recipientEmail: client.email,
        triggerType: 'invoice_paid',
        status: 'skipped',
        scheduledSendAt: new Date(),
      });
      return { success: false, message: "Maximum review requests per year reached" };
    }

    // Schedule the review request
    const scheduledSendAt = new Date();
    scheduledSendAt.setHours(scheduledSendAt.getHours() + settings.delayHours);

    await storage.createReviewRequestLog({
      clientId: client.id,
      jobLogId: invoice.jobLogId || null,
      invoiceId,
      recipientEmail: client.email,
      triggerType: 'invoice_paid',
      status: 'pending',
      scheduledSendAt,
    });

    return { success: true, message: "Review request scheduled" };
  } catch (error) {
    console.error("[ReviewRequest] Error scheduling review request for invoice:", error);
    return { success: false, message: "Internal error" };
  }
}

// Dispatch all pending review requests (called by cron)
export async function dispatchPendingReviewRequests(): Promise<number> {
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
      // Get client details
      const client = request.clientId ? await storage.getClientById(request.clientId) : null;
      
      // Check if still opted out (might have changed)
      if (client?.reviewOptOut) {
        await storage.updateReviewRequestLog(request.id, { status: 'skipped' });
        continue;
      }

      // Get job log details for email content
      let jobLog = null;
      if (request.jobLogId) {
        jobLog = await storage.getJobLogById(request.jobLogId);
      }

      // Prepare email data
      const customerName = client?.name || jobLog?.customerName || 'Valued Customer';
      const serviceDescription = jobLog?.workPerformed 
        ? (jobLog.workPerformed.length > 100 ? jobLog.workPerformed.substring(0, 100) + '...' : jobLog.workPerformed)
        : 'Pest control service';
      const jobDate = jobLog?.jobDate || new Date();
      const siteLocation = jobLog?.siteLocation || '';

      const emailData: ReviewRequestEmailData = {
        recipientEmail: request.recipientEmail,
        customerName,
        serviceDescription,
        jobDate,
        siteLocation,
        googleReviewLink: settings.googleReviewLink,
        customMessage: settings.customMessage || undefined,
      };

      // Send the email
      const success = await sendReviewRequestEmail(emailData);

      if (success) {
        await storage.updateReviewRequestLog(request.id, {
          status: 'sent',
          sentAt: new Date(),
          attemptCount: request.attemptCount + 1,
        });
        sentCount++;
        console.log(`[ReviewRequests] Sent review request to ${request.recipientEmail}`);
      } else {
        const newAttemptCount = request.attemptCount + 1;
        if (newAttemptCount >= maxAttempts) {
          await storage.updateReviewRequestLog(request.id, {
            status: 'failed',
            attemptCount: newAttemptCount,
            errorMessage: 'Max retry attempts reached',
          });
          console.error(`[ReviewRequests] Failed to send to ${request.recipientEmail}: Max attempts reached`);
        } else {
          await storage.updateReviewRequestLog(request.id, {
            attemptCount: newAttemptCount,
            errorMessage: 'Send failed, will retry',
          });
          console.error(`[ReviewRequests] Failed to send to ${request.recipientEmail}, will retry`);
        }
      }
    } catch (error: any) {
      console.error(`[ReviewRequests] Error processing review request ${request.id}:`, error);
      const newAttemptCount = request.attemptCount + 1;
      if (newAttemptCount >= maxAttempts) {
        await storage.updateReviewRequestLog(request.id, {
          status: 'failed',
          attemptCount: newAttemptCount,
          errorMessage: error.message || 'Unknown error',
        });
      } else {
        await storage.updateReviewRequestLog(request.id, {
          attemptCount: newAttemptCount,
          errorMessage: error.message || 'Unknown error',
        });
      }
    }
  }

  return sentCount;
}

// Manually trigger a review request for a specific job log (admin feature)
export async function sendReviewRequestNow(jobLogId: number): Promise<{ success: boolean; message: string }> {
  try {
    // Get review settings
    const settings = await storage.getReviewSettings();
    
    if (!settings.enabled) {
      return { success: false, message: "Review requests are disabled" };
    }

    // Get the job log
    const jobLog = await storage.getJobLogById(jobLogId);
    if (!jobLog) {
      return { success: false, message: "Job log not found" };
    }

    // Get the client
    const client = jobLog.clientId ? await storage.getClientById(jobLog.clientId) : null;
    if (!client) {
      return { success: false, message: "Client not found" };
    }

    // Check opt-out
    if (client.reviewOptOut) {
      return { success: false, message: "Client has opted out of review requests" };
    }

    // Check if email exists
    if (!client.email) {
      return { success: false, message: "Client has no email address" };
    }

    // Check if already exists (will allow re-send if manual)
    const existingLog = await storage.getReviewRequestLogByJobLogId(jobLogId);
    if (existingLog && existingLog.status === 'sent') {
      return { success: false, message: "Review request already sent for this job" };
    }

    // If existing pending/skipped/failed, update it for immediate send
    if (existingLog) {
      await storage.updateReviewRequestLog(existingLog.id, {
        status: 'pending',
        scheduledSendAt: new Date(),
      });
    } else {
      // Create new log entry
      await storage.createReviewRequestLog({
        clientId: client.id,
        jobLogId,
        invoiceId: null,
        recipientEmail: client.email,
        triggerType: 'manual',
        status: 'pending',
        scheduledSendAt: new Date(),
      });
    }

    // Prepare and send immediately
    const customerName = client.name || jobLog.customerName || 'Valued Customer';
    const serviceDescription = jobLog.workPerformed 
      ? (jobLog.workPerformed.length > 100 ? jobLog.workPerformed.substring(0, 100) + '...' : jobLog.workPerformed)
      : 'Pest control service';

    const emailData: ReviewRequestEmailData = {
      recipientEmail: client.email,
      customerName,
      serviceDescription,
      jobDate: jobLog.jobDate,
      siteLocation: jobLog.siteLocation,
      googleReviewLink: settings.googleReviewLink,
      customMessage: settings.customMessage || undefined,
    };

    const success = await sendReviewRequestEmail(emailData);
    
    const log = existingLog || await storage.getReviewRequestLogByJobLogId(jobLogId);
    if (log) {
      await storage.updateReviewRequestLog(log.id, {
        status: success ? 'sent' : 'failed',
        sentAt: success ? new Date() : null,
        attemptCount: (log.attemptCount || 0) + 1,
        errorMessage: success ? null : 'Manual send failed',
      });
    }

    return success 
      ? { success: true, message: "Review request sent successfully" }
      : { success: false, message: "Failed to send review request email" };
  } catch (error) {
    console.error("[ReviewRequest] Error sending manual review request:", error);
    return { success: false, message: "Internal error" };
  }
}

// Cancel pending review requests for a voided invoice
export async function cancelReviewRequestForInvoice(invoiceId: number): Promise<void> {
  const log = await storage.getReviewRequestLogByInvoiceId(invoiceId);
  if (log && log.status === 'pending') {
    await storage.updateReviewRequestLog(log.id, { status: 'cancelled' });
    console.log(`[ReviewRequests] Cancelled pending review request for invoice ${invoiceId}`);
  }
}
