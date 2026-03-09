import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import cron from "node-cron";
import { storage } from "./storage";
import { sendUpcomingReminders, getUTCHourForLocalTime } from "./reminders";
import { dispatchPendingReviewRequests } from "./reviews";

// Extend session type to include userId
declare module 'express-session' {
  interface SessionData {
    userId: number;
  }
}

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Health check endpoints - must be before any middleware or route registration
// Deployment health checks hit these endpoints and expect fast 200 responses
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.get("/api/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

// Fast response for root path health checks
// Replit's autoscale deployment health checks hit / and expect a quick 200
// Health checks don't send Accept: text/html header, so we can distinguish them
app.use((req, res, next) => {
  if (req.method === 'GET' && req.path === '/') {
    const acceptHeader = req.headers['accept'] || '';
    // If this doesn't look like a browser request (no text/html), treat as health check
    if (!acceptHeader.includes('text/html')) {
      return res.status(200).send('OK');
    }
  }
  next();
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Cron job to check for overdue invoices (runs daily at 9 AM)
  // BUG-002 fix: Wire up automatic overdue check
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

  // Appointment reminder cron job (SC-REMINDERS-001)
  // Runs daily at 4 PM Eastern (default), configurable via system_settings
  async function scheduleReminderCron() {
    const settings = await storage.getAllReminderSettings();
    const utcHour = getUTCHourForLocalTime(settings.reminder_time_hour, settings.reminder_timezone);
    
    return cron.schedule(`0 ${utcHour} * * *`, async () => {
      try {
        console.log("Running daily appointment reminder check...");
        
        // Send 24h advance reminders
        const count24h = await sendUpcomingReminders('24h');
        console.log(`Sent ${count24h} 24-hour advance reminders`);
        
        // Send same-day reminders
        const countSameDay = await sendUpcomingReminders('same_day');
        console.log(`Sent ${countSameDay} same-day reminders`);
        
        console.log("Completed daily appointment reminder check");
      } catch (error) {
        console.error("Error in appointment reminder cron job:", error);
      }
    }, {
      scheduled: settings.reminders_enabled,
    });
  }
  
  // Schedule reminder cron
  scheduleReminderCron().then((job) => {
    console.log("Scheduled daily appointment reminder cron (4 PM Eastern default)");
  }).catch((err) => {
    console.error("Failed to schedule reminder cron:", err);
  });

  // Review request dispatcher (SC-REVIEWS-001)
  // Runs every hour to send pending review requests
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

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
