import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertContactSchema, insertInspectionSchema, insertServiceRequestSchema, loginSchema, registerSchema, insertClientSchema, insertProjectSchema, insertMilestoneSchema, insertDashboardSchema, insertBlogPostSchema, insertFieldEmployeeSchema, insertJobLogSchema, insertJobLogCustomFieldSchema, insertFieldCustomerSchema, insertSiteLocationSchema, insertServicedAreaSchema, insertServiceContractSchema, insertJobLogPhotoSchema, insertInvoiceSchema, insertInvoiceLineItemSchema, insertJobScheduleLogSchema, type InvoiceStatus, jobLogs as jobLogsTable, geocache, dailyRoutes, jobScheduleLogs, type RouteStop } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { z } from "zod";
import session from "express-session";
import { sendContactFormEmail, sendInspectionScheduleEmail, sendServiceRequestEmail, sendServiceRequestStatusUpdate, sendNewsletterEmail, sendJobLogNotification, sendInvoiceEmail, sendInvoiceOverdueEmail, sendPaymentConfirmationEmail, sendJobStatusNotification } from "./email";
import { generateInvoicePdf } from "./invoice-pdf";
import { sendReviewRequestNow, scheduleReviewRequestForJobLog, scheduleReviewRequestForInvoice, cancelReviewRequestForInvoice } from "./reviews";
import { assertTransition, isTransitionAllowed } from "./invoiceStateMachine";
import Parser from "rss-parser";
import { verifyTurnstile } from "./turnstile";
import { cloudinary } from "./cloudinary";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import path from "path";
import fs from "fs";

declare module 'express-session' {
  interface SessionData {
    userId: number;
    fieldEmployeeId: number;
    fieldCanManage: boolean;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    app.set('trust proxy', 1);
  }

  // Session configuration
  app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: isProduction,
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

  // Authentication middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.session.userId) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }
    next();
  };

  // Admin middleware - check if user is admin
  const requireAdmin = async (req: any, res: any, next: any) => {
    if (!req.session.userId) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }
    
    try {
      const user = await storage.getUser(req.session.userId);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ success: false, message: "Admin access required" });
      }
      next();
    } catch (error) {
      console.error("Error checking admin status:", error);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  };

  // ==========================================
  // Analytics Routes (SC-DA-001)
  // ==========================================

  // Helper to parse date range from query params
  const parseDateRange = (req: any) => {
    const now = new Date();
    let from: Date, to: Date;

    if (req.query.from && req.query.to) {
      from = new Date(req.query.from);
      to = new Date(req.query.to);
    } else {
      // Default to last 12 months
      from = new Date(now.getFullYear(), now.getMonth() - 11, 1);
      to = now;
    }

    return { from, to };
  };

  // GET /api/admin/analytics/overview - KPI cards data
  app.get("/api/admin/analytics/overview", requireAdmin, async (req, res) => {
    try {
      const { from, to } = parseDateRange(req);
      const overview = await storage.getAnalyticsOverview(from, to);
      res.json({ success: true, overview });
    } catch (error) {
      console.error("Error fetching analytics overview:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });

  // GET /api/admin/analytics/jobs-over-time - Jobs over time chart data
  app.get("/api/admin/analytics/jobs-over-time", requireAdmin, async (req, res) => {
    try {
      const { from, to } = parseDateRange(req);
      const groupBy = (req.query.groupBy as 'month' | 'week') || 'month';
      const data = await storage.getJobsOverTime(from, to, groupBy);
      res.json({ success: true, data });
    } catch (error) {
      console.error("Error fetching jobs over time:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });

  // GET /api/admin/analytics/jobs-by-area - Jobs by area donut chart
  app.get("/api/admin/analytics/jobs-by-area", requireAdmin, async (req, res) => {
    try {
      const { from, to } = parseDateRange(req);
      const data = await storage.getJobsByArea(from, to);
      res.json({ success: true, data });
    } catch (error) {
      console.error("Error fetching jobs by area:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });

  // GET /api/admin/analytics/jobs-by-status - Jobs by status breakdown
  app.get("/api/admin/analytics/jobs-by-status", requireAdmin, async (req, res) => {
    try {
      const { from, to } = parseDateRange(req);
      const data = await storage.getJobsByStatus(from, to);
      res.json({ success: true, data });
    } catch (error) {
      console.error("Error fetching jobs by status:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });

  // GET /api/admin/analytics/employee-productivity - Employee productivity table
  app.get("/api/admin/analytics/employee-productivity", requireAdmin, async (req, res) => {
    try {
      const { from, to } = parseDateRange(req);
      const data = await storage.getEmployeeProductivity(from, to);
      res.json({ success: true, data });
    } catch (error) {
      console.error("Error fetching employee productivity:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });

  // GET /api/admin/analytics/contracts-summary - Contract health summary
  app.get("/api/admin/analytics/contracts-summary", requireAdmin, async (req, res) => {
    try {
      const data = await storage.getContractsSummary();
      res.json({ success: true, data });
    } catch (error) {
      console.error("Error fetching contracts summary:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });

  // GET /api/admin/analytics/upcoming - Upcoming scheduled jobs, inspections, requests
  app.get("/api/admin/analytics/upcoming", requireAdmin, async (req, res) => {
    try {
      const data = await storage.getUpcomingItems();
      res.json({ success: true, data });
    } catch (error) {
      console.error("Error fetching upcoming items:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });

  // GET /api/admin/analytics/top-clients - Top clients by job count
  app.get("/api/admin/analytics/top-clients", requireAdmin, async (req, res) => {
    try {
      const { from, to } = parseDateRange(req);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const data = await storage.getTopClients(from, to, limit);
      res.json({ success: true, data });
    } catch (error) {
      console.error("Error fetching top clients:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });

  // GET /api/admin/analytics/contact-submissions - Contact form submissions
  app.get("/api/admin/analytics/contact-submissions", requireAdmin, async (req, res) => {
    try {
      const { from, to } = parseDateRange(req);
      const data = await storage.getContactSubmissionsSummary(from, to);
      res.json({ success: true, data });
    } catch (error) {
      console.error("Error fetching contact submissions:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });

  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const validatedData = registerSchema.parse(req.body);
      
      // Check if user already exists
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
        address: validatedData.address,
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
          role: user.role,
        }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
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

  app.post("/api/auth/login", async (req, res) => {
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
          role: user.role,
        }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
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

  app.post("/api/auth/logout", (req, res) => {
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

  app.get("/api/auth/me", async (req, res) => {
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
          role: user.role,
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

  // Service request routes
  app.post("/api/service-requests", requireAuth, async (req, res) => {
    try {
      // Verify CAPTCHA token
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
        userId: req.session.userId,
      });
      
      const serviceRequest = await storage.createServiceRequest(validatedData);
      
      // Get user information for email
      const user = await storage.getUser(req.session.userId!);
      
      if (user) {
        // Create or update prospect in admin portal
        try {
          await storage.createOrUpdateProspect({
            name: `${validatedData.firstName} ${validatedData.lastName}`,
            email: user.email,
            phone: user.phone || undefined,
            address: validatedData.address,
            notes: `Service Request (Portal) - Service: ${validatedData.serviceType}\nPriority: ${validatedData.priority}\nDescription: ${validatedData.description}`,
            serviceType: validatedData.serviceType,
          });
        } catch (prospectError) {
          console.error("Failed to create/update prospect:", prospectError);
        }
        
        // Send email notification
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
      if (error instanceof z.ZodError) {
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

  app.get("/api/service-requests", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const serviceRequests = await storage.getServiceRequestsByUser(userId);
      res.json({
        success: true,
        serviceRequests
      });
    } catch (error) {
      console.error("Error fetching service requests:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  });

  // Admin endpoints for service requests
  app.get("/api/admin/service-requests", requireAdmin, async (req, res) => {
    try {
      const serviceRequests = await storage.getServiceRequests();
      res.json({
        success: true,
        serviceRequests
      });
    } catch (error) {
      console.error("Error fetching all service requests:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  });

  app.put("/api/admin/service-requests/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      
      // Get the current service request to check status change
      const currentRequest = await storage.getServiceRequestsByUser(req.body.userId || 0);
      const current = currentRequest.find(r => r.id === id);
      const oldStatus = current?.status || 'pending';
      
      // Update the service request
      const serviceRequest = await storage.updateServiceRequest(id, updates);
      
      // If status changed, send email notification
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
            scheduledDate: serviceRequest.scheduledDate || undefined,
            technicianNotes: serviceRequest.technicianNotes || undefined
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

  app.get("/api/inspections/my", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
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

  app.get("/api/payments/my", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const payments = await storage.getPaymentsByUser(userId);
      res.json({
        success: true,
        payments
      });
    } catch (error) {
      console.error("Error fetching user payments:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  });

  // Google Business Profile review count (public, cached)
  let cachedReviewData: { reviewCount: number; rating: number; fetchedAt: number } | null = null;
  const REVIEW_CACHE_TTL = 3600000; // 1 hour

  app.get("/api/google-reviews", async (req, res) => {
    try {
      if (cachedReviewData && Date.now() - cachedReviewData.fetchedAt < REVIEW_CACHE_TTL) {
        return res.json(cachedReviewData);
      }

      const apiKey = process.env.GOOGLE_MAPS_API_KEY;
      const placeId = "ChIJAAAAAAAAAAARN46yHZs0fVk";

      if (!apiKey) {
        return res.json({ reviewCount: 29, rating: 5.0, fetchedAt: Date.now() });
      }

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=user_ratings_total,rating&key=${apiKey}`
      );
      const data = await response.json();

      if (data.result) {
        cachedReviewData = {
          reviewCount: data.result.user_ratings_total || 29,
          rating: data.result.rating || 5.0,
          fetchedAt: Date.now()
        };
        return res.json(cachedReviewData);
      }

      res.json({ reviewCount: 29, rating: 5.0, fetchedAt: Date.now() });
    } catch (error) {
      console.error("Error fetching Google review count:", error);
      res.json({ reviewCount: 29, rating: 5.0, fetchedAt: Date.now() });
    }
  });

  // Contact form submission endpoint
  app.post("/api/contact", async (req, res) => {
    try {
      // Verify CAPTCHA token
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
      
      // Create or update prospect in admin portal
      try {
        await storage.createOrUpdateProspect({
          name: `${validatedData.firstName} ${validatedData.lastName}`,
          email: validatedData.email,
          phone: validatedData.phone,
          notes: `Contact Form - Service: ${validatedData.serviceType}\nMessage: ${validatedData.message}`,
          serviceType: validatedData.serviceType,
        });
      } catch (prospectError) {
        console.error("Failed to create/update prospect:", prospectError);
      }
      
      // Send email notification
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
      if (error instanceof z.ZodError) {
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

  // Get all contact submissions (for admin purposes)
  app.get("/api/contact", async (req, res) => {
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

  // Schedule inspection endpoint
  app.post("/api/inspection", async (req, res) => {
    try {
      // Verify CAPTCHA token
      const captchaToken = req.body.captchaToken;
      const captchaValid = await verifyTurnstile(captchaToken);
      
      if (!captchaValid) {
        return res.status(400).json({
          success: false,
          message: "CAPTCHA verification failed. Please try again."
        });
      }
      
      // Parse the preferredDate string to Date object
      const requestData = {
        ...req.body,
        preferredDate: new Date(req.body.preferredDate)
      };
      
      const validatedData = insertInspectionSchema.parse(requestData);
      const inspection = await storage.createInspectionSchedule(validatedData);
      
      // Create or update prospect in admin portal
      try {
        await storage.createOrUpdateProspect({
          name: `${validatedData.firstName} ${validatedData.lastName}`,
          email: validatedData.email,
          phone: validatedData.phone,
          address: validatedData.address,
          notes: `Inspection Request - Service: ${validatedData.serviceType}\nPreferred: ${validatedData.preferredDate.toLocaleDateString()} ${validatedData.preferredTime}\nUrgency: ${validatedData.urgency}${validatedData.message ? `\nMessage: ${validatedData.message}` : ''}`,
          serviceType: validatedData.serviceType,
        });
      } catch (prospectError) {
        console.error("Failed to create/update prospect:", prospectError);
      }
      
      // Send email notification
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
      if (error instanceof z.ZodError) {
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

  // Get all inspection schedules (for admin purposes)
  app.get("/api/inspection", requireAdmin, async (req, res) => {
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

  // Admin endpoint to update inspection schedule
  app.put("/api/admin/inspections/:id", requireAdmin, async (req, res) => {
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

  // Admin Portal Routes
  
  // Client routes
  app.get("/api/clients", requireAdmin, async (req, res) => {
    try {
      const clients = await storage.getClients();
      res.json({ success: true, clients });
    } catch (error) {
      console.error("Error fetching clients:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });

  app.get("/api/clients/:id", requireAdmin, async (req, res) => {
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

  app.post("/api/clients", requireAdmin, async (req, res) => {
    try {
      const validatedData = insertClientSchema.parse(req.body);
      const client = await storage.createClient(validatedData);
      res.json({ success: true, message: "Client created successfully", client });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, message: "Invalid client data", errors: error.errors });
      } else {
        console.error("Error creating client:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
      }
    }
  });

  app.put("/api/clients/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertClientSchema.partial().parse(req.body);
      const client = await storage.updateClient(id, validatedData);
      res.json({ success: true, message: "Client updated successfully", client });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, message: "Invalid client data", errors: error.errors });
      } else {
        console.error("Error updating client:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
      }
    }
  });

  app.delete("/api/clients/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteClient(id);
      res.json({ success: true, message: "Client deleted successfully" });
    } catch (error) {
      console.error("Error deleting client:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });

  // Project routes
  app.get("/api/projects", requireAdmin, async (req, res) => {
    try {
      const projects = await storage.getProjects();
      res.json({ success: true, projects });
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });

  app.get("/api/projects/:id", requireAdmin, async (req, res) => {
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

  app.get("/api/clients/:clientId/projects", requireAdmin, async (req, res) => {
    try {
      const clientId = parseInt(req.params.clientId);
      const projects = await storage.getProjectsByClient(clientId);
      res.json({ success: true, projects });
    } catch (error) {
      console.error("Error fetching projects by client:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });

  app.post("/api/projects", requireAdmin, async (req, res) => {
    try {
      console.log("Creating project with data:", JSON.stringify(req.body, null, 2));
      const validatedData = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(validatedData);
      res.json({ success: true, message: "Project created successfully", project });
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("Zod validation errors:", JSON.stringify(error.errors, null, 2));
        res.status(400).json({ success: false, message: "Invalid project data", errors: error.errors });
      } else {
        console.error("Error creating project:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
      }
    }
  });

  app.put("/api/projects/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertProjectSchema.partial().parse(req.body);
      const project = await storage.updateProject(id, validatedData);
      res.json({ success: true, message: "Project updated successfully", project });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, message: "Invalid project data", errors: error.errors });
      } else {
        console.error("Error updating project:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
      }
    }
  });

  app.delete("/api/projects/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteProject(id);
      res.json({ success: true, message: "Project deleted successfully" });
    } catch (error) {
      console.error("Error deleting project:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });

  // Milestone routes
  app.get("/api/milestones", requireAdmin, async (req, res) => {
    try {
      const milestones = await storage.getMilestones();
      res.json({ success: true, milestones });
    } catch (error) {
      console.error("Error fetching milestones:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });

  app.get("/api/projects/:projectId/milestones", requireAdmin, async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const milestones = await storage.getMilestonesByProject(projectId);
      res.json({ success: true, milestones });
    } catch (error) {
      console.error("Error fetching milestones by project:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });

  app.post("/api/milestones", requireAdmin, async (req, res) => {
    try {
      console.log("Creating milestone with data:", JSON.stringify(req.body, null, 2));
      const validatedData = insertMilestoneSchema.parse(req.body);
      const milestone = await storage.createMilestone(validatedData);
      res.json({ success: true, message: "Milestone created successfully", milestone });
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("Zod validation errors:", JSON.stringify(error.errors, null, 2));
        res.status(400).json({ success: false, message: "Invalid milestone data", errors: error.errors });
      } else {
        console.error("Error creating milestone:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
      }
    }
  });

  app.put("/api/milestones/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertMilestoneSchema.partial().parse(req.body);
      const milestone = await storage.updateMilestone(id, validatedData);
      res.json({ success: true, message: "Milestone updated successfully", milestone });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, message: "Invalid milestone data", errors: error.errors });
      } else {
        console.error("Error updating milestone:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
      }
    }
  });

  app.delete("/api/milestones/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteMilestone(id);
      res.json({ success: true, message: "Milestone deleted successfully" });
    } catch (error) {
      console.error("Error deleting milestone:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });

  // Dashboard routes
  app.get("/api/dashboards", requireAdmin, async (req, res) => {
    try {
      const dashboards = await storage.getDashboards();
      res.json({ success: true, dashboards });
    } catch (error) {
      console.error("Error fetching dashboards:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });

  app.get("/api/projects/:projectId/dashboards", requireAdmin, async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const dashboards = await storage.getDashboardsByProject(projectId);
      res.json({ success: true, dashboards });
    } catch (error) {
      console.error("Error fetching dashboards by project:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });

  app.post("/api/dashboards", requireAdmin, async (req, res) => {
    try {
      const validatedData = insertDashboardSchema.parse({
        ...req.body,
        createdBy: req.session.userId,
      });
      const dashboard = await storage.createDashboard(validatedData);
      res.json({ success: true, message: "Dashboard created successfully", dashboard });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, message: "Invalid dashboard data", errors: error.errors });
      } else {
        console.error("Error creating dashboard:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
      }
    }
  });

  app.put("/api/dashboards/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertDashboardSchema.partial().parse(req.body);
      const dashboard = await storage.updateDashboard(id, validatedData);
      res.json({ success: true, message: "Dashboard updated successfully", dashboard });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, message: "Invalid dashboard data", errors: error.errors });
      } else {
        console.error("Error updating dashboard:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
      }
    }
  });

  app.delete("/api/dashboards/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteDashboard(id);
      res.json({ success: true, message: "Dashboard deleted successfully" });
    } catch (error) {
      console.error("Error deleting dashboard:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });

  // Blog routes - Public
  app.get("/api/blog/posts", async (req, res) => {
    try {
      const posts = await storage.getPublishedBlogPosts();
      res.json({ success: true, posts });
    } catch (error) {
      console.error("Error fetching blog posts:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });

  app.get("/api/blog/posts/:slug", async (req, res) => {
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

  // Blog routes - Admin
  app.get("/api/admin/blog/posts", requireAdmin, async (req, res) => {
    try {
      const posts = await storage.getBlogPosts();
      res.json({ success: true, posts });
    } catch (error) {
      console.error("Error fetching all blog posts:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });

  app.get("/api/admin/blog/posts/:id", requireAdmin, async (req, res) => {
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

  app.post("/api/admin/blog/posts", requireAdmin, async (req, res) => {
    try {
      const validatedData = insertBlogPostSchema.parse(req.body);
      const post = await storage.createBlogPost(validatedData);
      res.json({ success: true, message: "Blog post created successfully", post });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, message: "Invalid blog post data", errors: error.errors });
      } else {
        console.error("Error creating blog post:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
      }
    }
  });

  app.put("/api/admin/blog/posts/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertBlogPostSchema.partial().parse(req.body);
      
      const post = await storage.updateBlogPost(id, validatedData);
      res.json({ success: true, message: "Blog post updated successfully", post });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, message: "Invalid blog post data", errors: error.errors });
      } else {
        console.error("Error updating blog post:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
      }
    }
  });

  app.delete("/api/admin/blog/posts/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteBlogPost(id);
      res.json({ success: true, message: "Blog post deleted successfully" });
    } catch (error) {
      console.error("Error deleting blog post:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });

  // Bulk delete blog posts
  app.post("/api/admin/blog/posts/bulk-delete", requireAdmin, async (req, res) => {
    try {
      const { ids } = req.body;
      
      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ success: false, message: "Invalid ids array" });
      }

      // Delete all posts
      for (const id of ids) {
        await storage.deleteBlogPost(id);
      }

      res.json({ success: true, message: `${ids.length} blog posts deleted successfully` });
    } catch (error) {
      console.error("Error bulk deleting blog posts:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });

  // RSS Syndication endpoint
  app.post("/api/admin/blog/syndicate", requireAdmin, async (req, res) => {
    try {
      const { feedUrl } = req.body;
      
      if (!feedUrl) {
        return res.status(400).json({ success: false, message: "Feed URL is required" });
      }

      const parser = new Parser({
        customFields: {
          item: [
            ['content:encoded', 'contentEncoded'],
            ['dc:creator', 'creator']
          ]
        }
      });

      console.log(`RSS Syndication: Fetching feed from ${feedUrl}`);
      const feed = await parser.parseURL(feedUrl);
      console.log(`RSS Syndication: Found ${feed.items?.length || 0} items in feed "${feed.title || 'Untitled'}"`);
      
      const results = {
        imported: 0,
        skipped: 0,
        errors: 0,
        details: [] as any[]
      };

      if (!feed.items || feed.items.length === 0) {
        return res.json({
          success: true,
          message: "Feed was fetched successfully but contained no articles.",
          results
        });
      }

      for (const item of feed.items) {
        try {
          // Generate slug from title
          const slug = item.title
            ?.toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim() || '';

          // Check if post already exists by slug
          const existingPost = await storage.getBlogPostBySlug(slug);
          if (existingPost) {
            results.skipped++;
            results.details.push({ title: item.title, status: 'skipped', reason: 'Already exists' });
            continue;
          }

          // Extract first image from content if available
          const contentHtml = item.contentEncoded || item.content || '';
          const imgMatch = contentHtml.match(/<img[^>]+src="([^">]+)"/);
          const featuredImage = imgMatch ? imgMatch[1] : null;

          // Clean HTML content and extract plain text for excerpt
          const plainText = contentHtml
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
          const excerpt = plainText.substring(0, 300) + (plainText.length > 300 ? '...' : '');

          // Extract categories/tags
          const tags = item.categories || [];
          const category = tags.length > 0 ? tags[0] : 'General';

          // Extract author safely
          const authorName = (item as any).creator || (item as any)['dc:creator'] || 'Guest Author';

          // Create blog post
          await storage.createBlogPost({
            title: item.title || 'Untitled',
            slug,
            content: contentHtml,
            excerpt: item.contentSnippet || excerpt,
            author: authorName,
            featuredImage,
            category,
            tags,
            metaTitle: item.title || 'Untitled',
            metaDescription: (item.contentSnippet || excerpt).substring(0, 160),
            isPublished: true
          });

          results.imported++;
          results.details.push({ title: item.title, status: 'imported' });
        } catch (error) {
          results.errors++;
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          console.error(`Error importing post "${item.title}":`, errorMessage, error);
          results.details.push({ 
            title: item.title, 
            status: 'error', 
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

  // Send newsletter email
  app.post("/api/admin/newsletter/send", requireAdmin, async (req, res) => {
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

      // Fetch selected posts
      const allPosts = await storage.getBlogPosts();
      const selectedPosts = allPosts.filter(post => postIds.includes(post.id));
      
      if (selectedPosts.length === 0) {
        return res.status(404).json({ success: false, message: "No valid posts found" });
      }

      // Send newsletter email
      const emailSent = await sendNewsletterEmail({
        recipientEmail: recipientEmail.trim(),
        subject: subject.trim(),
        posts: selectedPosts.map(post => ({
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

  // ==========================================
  // AI Blog Generation Routes
  // ==========================================

  // POST /api/admin/blog/research-topics - Research trending pest control topics
  app.post("/api/admin/blog/research-topics", requireAdmin, async (req, res) => {
    try {
      // Research topics using web search simulation (pre-defined trending topics)
      // In production, this would call Search Console API + web search
      
      const currentMonth = new Date().getMonth();
      const season = currentMonth >= 2 && currentMonth <= 4 ? 'spring' :
                     currentMonth >= 5 && currentMonth <= 7 ? 'summer' :
                     currentMonth >= 8 && currentMonth <= 10 ? 'fall' : 'winter';
      
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
          searchVolume: 11000,
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

      // Shuffle and return 10 topics
      const shuffled = allTopics.sort(() => Math.random() - 0.5);
      
      res.json({ success: true, topics: shuffled });
    } catch (error) {
      console.error("Error researching topics:", error);
      res.status(500).json({ success: false, message: "Failed to research topics" });
    }
  });

  // POST /api/admin/blog/generate-image - Generate featured image for article
  app.post("/api/admin/blog/generate-image", requireAdmin, async (req, res) => {
    try {
      const { title, category } = req.body;
      
      if (!title) {
        return res.status(400).json({ success: false, message: "Title is required" });
      }

      const openaiApiKey = process.env.OPENAI_API_KEY;
      if (!openaiApiKey) {
        return res.status(500).json({ success: false, message: "OpenAI API key not configured" });
      }

      // Create a detailed prompt for the image
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
      const base64 = buffer.toString('base64');
      const dataUrl = `data:image/png;base64,${base64}`;
      
      res.json({ success: true, imageUrl: dataUrl });
    } catch (error) {
      console.error("Error generating image:", error);
      res.status(500).json({ success: false, message: "Failed to generate image" });
    }
  });

  // POST /api/admin/blog/generate-articles - Generate 6 articles from selected topics
  app.post("/api/admin/blog/generate-articles", requireAdmin, async (req, res) => {
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
      const baseUrl = process.env.REPLIT_DOMAINS?.split(',')[0] 
        ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}`
        : 'https://absolutepestservices.com';

      // Generate articles for each topic
      for (let i = 0; i < topics.length && i < 6; i++) {
        const topic = topics[i];
        
        try {
          // Generate article content using OpenAI
          const articlePrompt = `Write a 600-800 word blog article for a pest control company serving Chester County, Pennsylvania. 
          
Title: ${topic.title}
Category: ${topic.category}
Target Keywords: ${topic.keywords?.join(', ') || topic.title}

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
              max_tokens: 2000,
              temperature: 0.7
            })
          });

          const chatData = await chatResponse.json();
          
          if (chatData.error) {
            console.error("OpenAI article generation error:", chatData.error);
            continue;
          }

          const articleContent = JSON.parse(chatData.choices[0].message.content);
          
          // Generate image for this article
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
              const base64 = buffer.toString('base64');
              imageUrl = `data:image/png;base64,${base64}`;
            }
          } catch (imgError) {
            console.error("Image generation failed for article:", topic.title, imgError);
          }

          // Create slug from title
          const slug = topic.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');

          // Create the blog post
          const blogPost = await storage.createBlogPost({
            title: topic.title,
            slug: `${slug}-${Date.now()}`, // Add timestamp to ensure uniqueness
            content: articleContent.content || '',
            excerpt: articleContent.excerpt || topic.description,
            author: "AI Generated",
            featuredImage: imageUrl || null,
            category: topic.category,
            tags: articleContent.suggestedTags || topic.keywords || [],
            isPublished: false, // Draft by default for review
            metaTitle: topic.title,
            metaDescription: articleContent.excerpt?.substring(0, 160) || topic.description
          });

          generatedArticles.push({
            id: blogPost.id,
            title: blogPost.title,
            slug: blogPost.slug,
            featuredImage: blogPost.featuredImage,
            status: 'created'
          });

        } catch (articleError) {
          console.error("Error generating article for topic:", topic.title, articleError);
          generatedArticles.push({
            title: topic.title,
            status: 'error',
            error: articleError instanceof Error ? articleError.message : 'Unknown error'
          });
        }
      }

      res.json({ 
        success: true, 
        message: `Generated ${generatedArticles.filter(a => a.status === 'created').length} articles`,
        articles: generatedArticles 
      });
    } catch (error) {
      console.error("Error generating articles:", error);
      res.status(500).json({ success: false, message: "Failed to generate articles" });
    }
  });

  // ==========================================
  // Field Service Routes
  // ==========================================

  const requireFieldAuth = (req: any, res: any, next: any) => {
    if (!req.session.fieldEmployeeId) {
      return res.status(401).json({ success: false, message: "Field authentication required" });
    }
    next();
  };

  async function notifyJobStatusChange(jobLog: any, oldStatus: string, newStatus: string) {
    try {
      if (oldStatus === newStatus) return;
      if (!jobLog.clientId) return;
      const client = await storage.getClient(jobLog.clientId);
      if (!client?.email) return;
      let techName: string | undefined;
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
        technicianName: techName,
      });
      if (!sent) {
        console.warn(`[JobStatusNotification] Email failed to send for job ${jobLog.id}, client ${client.id} (${oldStatus} → ${newStatus})`);
      }
    } catch (err) {
      console.error("[JobStatusNotification] Error sending notification:", err);
    }
  }

  const requireFieldManager = (req: any, res: any, next: any) => {
    if (!req.session.fieldEmployeeId) {
      return res.status(401).json({ success: false, message: "Field authentication required" });
    }
    if (!req.session.fieldCanManage) {
      return res.status(403).json({ success: false, message: "Management access required" });
    }
    next();
  };

  // PIN authentication for field employees
  app.post("/api/field/auth", async (req, res) => {
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
          canManageEmployees: employee.canManageEmployees,
        }
      });
    } catch (error) {
      console.error("Error authenticating field employee:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });

  app.post("/api/field/logout", (req, res) => {
    req.session.fieldEmployeeId = undefined as any;
    req.session.fieldCanManage = undefined as any;
    res.json({ success: true, message: "Logged out" });
  });

  // Seed Frank as default employee if none exist
  app.post("/api/field/seed", async (req, res) => {
    try {
      const employees = await storage.getFieldEmployees();
      if (employees.length === 0) {
        const frank = await storage.createFieldEmployee({
          name: "Frank",
          pin: "2121",
          isActive: true,
          canManageEmployees: true,
        });
        return res.json({ success: true, message: "Default employee created" });
      }
      res.json({ success: true, message: "Employees already exist" });
    } catch (error) {
      console.error("Error seeding employees:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });

  // Client list for field employees (requires field auth)
  app.get("/api/field/clients", requireFieldAuth, async (req, res) => {
    try {
      const allClients = await storage.getClients();
      res.json({
        success: true,
        clients: allClients.map(c => ({ id: c.id, name: c.name, address: c.address }))
      });
    } catch (error) {
      console.error("Error fetching clients for field:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });

  // GET /api/field/service-rates — Active service rates for technicians
  app.get("/api/field/service-rates", requireFieldAuth, async (req, res) => {
    try {
      const rates = await storage.getActiveServiceRates();
      res.json({ success: true, rates });
    } catch (error) {
      console.error("Error fetching service rates:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });

  // POST /api/field/create-invoice — Technician creates invoice from completed job logs
  app.post("/api/field/create-invoice", requireFieldAuth, async (req, res) => {
    try {
      const { jobLogIds, dueDate } = req.body;
      if (!jobLogIds || !Array.isArray(jobLogIds) || jobLogIds.length === 0) {
        return res.status(400).json({ success: false, message: "At least one job log ID is required" });
      }
      if (!dueDate) {
        return res.status(400).json({ success: false, message: "Due date is required" });
      }

      const uniqueIds = [...new Set(jobLogIds.map((id: any) => parseInt(id)).filter((id: number) => !isNaN(id)))];
      if (uniqueIds.length === 0) {
        return res.status(400).json({ success: false, message: "Invalid job log IDs" });
      }

      const logs: any[] = [];
      let clientId: number | null = null;
      const empId = req.session.fieldEmployeeId;
      for (const id of uniqueIds) {
        const log = await storage.getJobLog(id);
        if (!log) {
          return res.status(404).json({ success: false, message: `Job log ${id} not found` });
        }
        if (log.employeeId !== empId) {
          return res.status(403).json({ success: false, message: `Job log ${id} does not belong to you` });
        }
        if (log.status !== "completed") {
          return res.status(400).json({ success: false, message: `Job log ${id} is not in completed status (current: ${log.status})` });
        }
        if (!log.clientId) {
          return res.status(400).json({ success: false, message: `Job log ${id} has no associated client` });
        }
        if (clientId && log.clientId !== clientId) {
          return res.status(400).json({ success: false, message: "All job logs must belong to the same client" });
        }
        clientId = log.clientId;
        logs.push(log);
      }

      const invoice = await storage.createInvoice({
        clientId: clientId!,
        dueDate: new Date(dueDate),
        subtotal: '0',
        taxTotal: '0',
        total: '0',
      });

      for (const log of logs) {
        const unitRate = String(log.amount || '200');
        let techName: string | undefined;
        let serviceTypeName: string | undefined;
        try {
          if (log.employeeId) {
            const employees = await storage.getFieldEmployees();
            const emp = employees.find(e => e.id === log.employeeId);
            if (emp) techName = emp.name;
          }
          if (log.serviceRateId) {
            const rates = await storage.getServiceRates();
            const rate = rates.find(r => r.id === log.serviceRateId);
            if (rate) serviceTypeName = rate.name;
          }
        } catch {}
        await storage.createLineItem({
          invoiceId: invoice.id,
          description: `${log.servicedArea} — ${log.workPerformed}`,
          quantity: '1',
          unitRate,
          taxRate: '6',
          materials: log.materials || null,
          serviceDate: log.jobDate ? String(log.jobDate).slice(0, 10) : undefined,
          technicianName: techName,
          serviceType: serviceTypeName,
          serviceAddress: log.siteAddress || undefined,
          servicedArea: log.servicedArea || undefined,
          jobLogId: log.id,
        });
        await storage.updateJobLog(log.id, { status: 'invoiced' } as any);
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
        total: (subtotal + taxTotal).toFixed(2),
      });

      await storage.logInvoiceStatusChange({
        invoiceId: invoice.id,
        fromStatus: null,
        toStatus: 'draft',
        actor: `field:${req.session.fieldEmployeeId}`,
        note: `Created from ${logs.length} job log(s) by field technician`,
      });

      const updatedInvoice = await storage.getInvoice(invoice.id);
      const invoiceClient = await storage.getClient(clientId!);
      res.status(201).json({
        success: true,
        invoice: updatedInvoice,
        clientEmail: invoiceClient?.email || null,
        clientName: invoiceClient?.name || null,
      });
    } catch (error) {
      console.error("Error creating field invoice:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });

  // Get unique values from past job logs for dropdown suggestions
  app.get("/api/field/suggestions", requireFieldAuth, async (req, res) => {
    try {
      const allLogs = await storage.getJobLogs();
      const standaloneLocs = await storage.getSiteLocations();
      const standaloneAreas = await storage.getServicedAreas();
      const fieldCusts = await storage.getFieldCustomers();

      const dedup = (items: string[]) => {
        const seen = new Map<string, string>();
        for (const item of items) {
          const key = item.toLowerCase();
          if (!seen.has(key)) seen.set(key, item);
        }
        return [...seen.values()].sort((a, b) => a.localeCompare(b));
      };

      const customerNames = allLogs.map(l => l.customerName.trim()).filter(Boolean);
      const locationCustomerNames = standaloneLocs.map(l => l.customerName?.trim()).filter(Boolean) as string[];
      const fieldCustomerNames = fieldCusts.map(c => c.name.trim()).filter(Boolean);
      const mergedCustomers = dedup([...customerNames, ...locationCustomerNames, ...fieldCustomerNames]);

      const customerLocations: Record<string, string[]> = {};
      const locationAreas: Record<string, string[]> = {};

      for (const log of allLogs) {
        const cust = log.customerName.trim();
        const loc = log.siteLocation.trim();
        const area = log.servicedArea.trim();
        if (cust && loc) {
          const custKey = cust.toLowerCase();
          if (!customerLocations[custKey]) customerLocations[custKey] = [];
          if (!customerLocations[custKey].some(l => l.toLowerCase() === loc.toLowerCase())) {
            customerLocations[custKey].push(loc);
          }
        }
        if (loc && area) {
          const locKey = loc.toLowerCase();
          if (!locationAreas[locKey]) locationAreas[locKey] = [];
          if (!locationAreas[locKey].some(a => a.toLowerCase() === area.toLowerCase())) {
            locationAreas[locKey].push(area);
          }
        }
      }

      for (const loc of standaloneLocs) {
        const custKey = (loc.customerName || "").toLowerCase();
        if (custKey && !customerLocations[custKey]) customerLocations[custKey] = [];
        if (custKey && !customerLocations[custKey].some(l => l.toLowerCase() === loc.name.toLowerCase())) {
          customerLocations[custKey].push(loc.name);
        }
      }

      for (const area of standaloneAreas) {
        const locKey = (area.siteLocationName || "").toLowerCase();
        if (locKey && !locationAreas[locKey]) locationAreas[locKey] = [];
        if (locKey && !locationAreas[locKey].some(a => a.toLowerCase() === area.name.toLowerCase())) {
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
      const clientsForField = allClientRecords.map(c => ({
        id: c.id,
        name: c.name,
        address: c.address ?? null,
        propertyType: c.propertyType ?? "residential",
      }));

      res.json({
        success: true,
        customers: mergedCustomers,
        customerLocations,
        locationAreas,
        clients: clientsForField,
      });
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });

  // Admin version of suggestions endpoint (same data, admin auth)
  app.get("/api/admin/suggestions", requireAdmin, async (req, res) => {
    try {
      const allLogs = await storage.getJobLogs();
      const standaloneLocs = await storage.getSiteLocations();
      const standaloneAreas = await storage.getServicedAreas();

      const dedup = (items: string[]) => {
        const seen = new Map<string, string>();
        for (const item of items) {
          const key = item.toLowerCase();
          if (!seen.has(key)) seen.set(key, item);
        }
        return [...seen.values()].sort((a, b) => a.localeCompare(b));
      };

      const customerLocations: Record<string, string[]> = {};
      const locationAreas: Record<string, string[]> = {};

      for (const log of allLogs) {
        const cust = log.customerName.trim();
        const loc = log.siteLocation.trim();
        const area = log.servicedArea.trim();
        if (cust && loc) {
          const custKey = cust.toLowerCase();
          if (!customerLocations[custKey]) customerLocations[custKey] = [];
          if (!customerLocations[custKey].some(l => l.toLowerCase() === loc.toLowerCase())) {
            customerLocations[custKey].push(loc);
          }
        }
        if (loc && area) {
          const locKey = loc.toLowerCase();
          if (!locationAreas[locKey]) locationAreas[locKey] = [];
          if (!locationAreas[locKey].some(a => a.toLowerCase() === area.toLowerCase())) {
            locationAreas[locKey].push(area);
          }
        }
      }

      for (const loc of standaloneLocs) {
        const custKey = (loc.customerName || "").toLowerCase();
        if (custKey && !customerLocations[custKey]) customerLocations[custKey] = [];
        if (custKey && !customerLocations[custKey].some(l => l.toLowerCase() === loc.name.toLowerCase())) {
          customerLocations[custKey].push(loc.name);
        }
      }

      for (const area of standaloneAreas) {
        const locKey = (area.siteLocationName || "").toLowerCase();
        if (locKey && !locationAreas[locKey]) locationAreas[locKey] = [];
        if (locKey && !locationAreas[locKey].some(a => a.toLowerCase() === area.name.toLowerCase())) {
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

  // Field employee management (requires canManageEmployees)
  app.get("/api/field/employees", requireFieldManager, async (req, res) => {
    try {
      const employees = await storage.getFieldEmployees();
      res.json({
        success: true,
        employees: employees.map(e => ({
          id: e.id,
          name: e.name,
          isActive: e.isActive,
          canManageEmployees: e.canManageEmployees,
          pin: e.pin,
        }))
      });
    } catch (error) {
      console.error("Error fetching field employees:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });

  app.post("/api/field/employees", requireFieldManager, async (req, res) => {
    try {
      const validatedData = insertFieldEmployeeSchema.parse(req.body);
      const existing = await storage.getFieldEmployeeByPin(validatedData.pin);
      if (existing) {
        return res.status(400).json({ success: false, message: "An employee with this PIN already exists" });
      }
      const employee = await storage.createFieldEmployee(validatedData);
      res.json({ success: true, message: "Employee created", employee });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, message: "Invalid employee data", errors: error.errors });
      } else {
        console.error("Error creating field employee:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
      }
    }
  });

  app.patch("/api/field/employees/:id", requireFieldManager, async (req, res) => {
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

  app.delete("/api/field/employees/:id", requireFieldManager, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteFieldEmployee(id);
      res.json({ success: true, message: "Employee deleted" });
    } catch (error) {
      console.error("Error deleting field employee:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });

  // Job Log routes
  app.post("/api/field/job-logs", requireFieldAuth, async (req, res) => {
    try {
      let resolvedClientId = req.body.clientId || null;
      if (!resolvedClientId && req.body.customerName) {
        const existingClients = await storage.getClients();
        const match = existingClients.find(
          (c: any) => c.name.toLowerCase().trim() === req.body.customerName.toLowerCase().trim()
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
              status: "pending",
              phone: req.body.phone || null,
              email: req.body.email || null,
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
        clientId: resolvedClientId,
      };
      const validatedData = insertJobLogSchema.parse(data);
      const jobLog = await storage.createJobLog(validatedData);

      const employee = await storage.getFieldEmployee(req.session.fieldEmployeeId!);
      sendJobLogNotification({
        employeeName: employee?.name || "Unknown",
        customerName: jobLog.customerName,
        siteLocation: jobLog.siteLocation,
        servicedArea: jobLog.servicedArea,
        workPerformed: jobLog.workPerformed,
        jobDate: jobLog.jobDate.toString(),
      }).catch(err => console.error("Error sending job log email:", err));

      res.json({ success: true, message: "Job log created", jobLog });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, message: "Invalid job log data", errors: error.errors });
      } else {
        console.error("Error creating job log:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
      }
    }
  });

  // POST /api/field/site-locations — field employee creates a new site for a commercial customer
  app.post("/api/field/site-locations", requireFieldAuth, async (req, res) => {
    try {
      const data = insertSiteLocationSchema.parse({
        name: req.body.name,
        customerId: req.body.customerId || null,
        customerName: req.body.customerName,
        phone: req.body.phone || null,
        contactEmail: req.body.contactEmail || null,
      });
      const site = await storage.createSiteLocation(data);
      res.json({ success: true, site });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, message: "Invalid data", errors: error.errors });
      } else {
        console.error("Error creating site location:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
      }
    }
  });

  app.get("/api/field/job-logs", requireFieldAuth, async (req, res) => {
    try {
      const filters: any = { employeeId: req.session.fieldEmployeeId };
      if (req.query.customerName) filters.customerName = req.query.customerName as string;
      if (req.query.dateFrom) filters.dateFrom = new Date(req.query.dateFrom as string);
      if (req.query.dateTo) filters.dateTo = new Date(req.query.dateTo as string);

      const logs = await storage.getJobLogs(filters);
      res.json({ success: true, jobLogs: logs });
    } catch (error) {
      console.error("Error fetching job logs:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });

  app.delete("/api/field/job-logs/:id", requireFieldAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const log = await storage.getJobLog(id);
      if (!log || log.employeeId !== req.session.fieldEmployeeId) {
        return res.status(403).json({ success: false, message: "Access denied" });
      }
      await storage.deleteJobLog(id);
      res.json({ success: true, message: "Job log deleted" });
    } catch (error) {
      console.error("Error deleting job log:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });

  // PATCH /api/field/job-logs/:id — Field employee edits their own job log
  app.patch("/api/field/job-logs/:id", requireFieldAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const existing = await storage.getJobLog(id);
      if (!existing || existing.employeeId !== req.session.fieldEmployeeId) {
        return res.status(403).json({ success: false, message: "Access denied" });
      }
      // Only allow editing jobs that haven't been invoiced
      if (existing.status === "invoiced" || existing.status === "paid") {
        return res.status(400).json({ success: false, message: "Cannot edit a job that has already been invoiced." });
      }
      const { customerName, siteLocation, siteAddress, servicedArea, workPerformed, jobDate, serviceRateId, amount, materials } = req.body;
      const updates: Record<string, any> = {};
      if (customerName !== undefined) updates.customerName = customerName;
      if (siteLocation !== undefined) updates.siteLocation = siteLocation;
      if (siteAddress !== undefined) updates.siteAddress = siteAddress;
      if (servicedArea !== undefined) updates.servicedArea = servicedArea;
      if (workPerformed !== undefined) updates.workPerformed = workPerformed;
      if (jobDate !== undefined) updates.jobDate = new Date(jobDate);
      if (serviceRateId !== undefined) updates.serviceRateId = serviceRateId === "none" || serviceRateId === "" ? null : Number(serviceRateId);
      if (amount !== undefined) updates.amount = String(amount);
      if (materials !== undefined) updates.materials = materials || null;
      const updated = await storage.updateJobLog(id, updates as any);

      // Retroactive contact info editing
      if (req.body.customerPhone !== undefined || req.body.customerEmail !== undefined) {
        const log = await storage.getJobLog(id);
        if (log?.clientId) {
          const clientUpdates: any = {};
          if (req.body.customerPhone !== undefined) clientUpdates.phone = req.body.customerPhone || null;
          if (req.body.customerEmail !== undefined) clientUpdates.email = req.body.customerEmail || null;
          await storage.updateClient(log.clientId, clientUpdates);
        }
      }
      if (req.body.sitePhone !== undefined || req.body.siteContactEmail !== undefined) {
        const log = await storage.getJobLog(id);
        if (log) {
          const sites = await storage.getSiteLocations();
          const site = sites.find(s =>
            s.name === log.siteLocation &&
            (log.clientId ? s.customerId === log.clientId : s.customerName === log.customerName)
          );
          if (site) {
            const siteUpdates: any = {};
            if (req.body.sitePhone !== undefined) siteUpdates.phone = req.body.sitePhone || null;
            if (req.body.siteContactEmail !== undefined) siteUpdates.contactEmail = req.body.siteContactEmail || null;
            await storage.updateSiteLocation(site.id, siteUpdates);
          }
        }
      }
      res.json({ success: true, jobLog: updated });
    } catch (error) {
      console.error("Error updating field job log:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });

  // Admin: lightweight filter options for reports dropdowns
  app.get("/api/admin/job-logs/filter-options", requireAdmin, async (req, res) => {
    try {
      const allLogs = await storage.getJobLogs();
      const employees = await storage.getFieldEmployees();
      const customers = Array.from(new Set(allLogs.map(l => l.customerName?.trim()).filter(Boolean))).sort();
      const locations = Array.from(new Set(allLogs.map(l => l.siteLocation?.trim()).filter(Boolean))).sort();
      const areas = Array.from(new Set(allLogs.map(l => l.servicedArea?.trim()).filter(Boolean))).sort();
      res.json({ success: true, customers, locations, areas, employees });
    } catch (error) {
      console.error("Error fetching filter options:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });

  // Admin job logs endpoint
  app.get("/api/admin/job-logs", requireAdmin, async (req, res) => {
    try {
      const filters: any = {};
      if (req.query.employeeId) filters.employeeId = parseInt(req.query.employeeId as string);
      if (req.query.customerName) filters.customerName = req.query.customerName as string;
      if (req.query.clientId) filters.clientId = parseInt(req.query.clientId as string);
      if (req.query.dateFrom) filters.dateFrom = new Date(req.query.dateFrom as string);
      if (req.query.dateTo) filters.dateTo = new Date(req.query.dateTo as string);
      if (req.query.siteLocation) filters.siteLocation = req.query.siteLocation as string;
      if (req.query.servicedArea) filters.servicedArea = req.query.servicedArea as string;
      if (req.query.status) filters.status = req.query.status as string;

      const logs = await storage.getJobLogs(filters);
      const employees = await storage.getFieldEmployees();
      
      // Fetch photos for each log
      const logsWithPhotos = await Promise.all(
        logs.map(async (log) => {
          const photos = await storage.getJobLogPhotos(log.id);
          return { ...log, photos };
        })
      );
      
      res.json({ success: true, jobLogs: logsWithPhotos, employees });
    } catch (error) {
      console.error("Error fetching admin job logs:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });

  // Admin: manage field employees
  app.get("/api/admin/field-employees", requireAdmin, async (req, res) => {
    try {
      const employees = await storage.getFieldEmployees();
      res.json({ success: true, employees });
    } catch (error) {
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });

  app.post("/api/admin/field-employees", requireAdmin, async (req, res) => {
    try {
      const data = insertFieldEmployeeSchema.parse(req.body);
      const employee = await storage.createFieldEmployee(data);
      res.json({ success: true, employee });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, message: "Invalid data", errors: error.errors });
      } else {
        res.status(500).json({ success: false, message: "Internal server error" });
      }
    }
  });

  app.patch("/api/admin/field-employees/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateSchema = insertFieldEmployeeSchema.partial();
      const validatedData = updateSchema.parse(req.body);
      const employee = await storage.updateFieldEmployee(id, validatedData);
      res.json({ success: true, employee });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, message: "Invalid data", errors: error.errors });
      } else {
        res.status(500).json({ success: false, message: "Internal server error" });
      }
    }
  });

  app.delete("/api/admin/field-employees/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteFieldEmployee(id);
      res.json({ success: true, message: "Employee deleted" });
    } catch (error) {
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });

  // Admin: edit job logs
  app.patch("/api/admin/job-logs/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const allowed = ["siteLocation", "servicedArea", "workPerformed", "customerName", "jobDate", "status"];
      const updates: any = {};
      for (const key of allowed) {
        if (req.body[key] !== undefined) updates[key] = req.body[key];
      }
      if (updates.jobDate && typeof updates.jobDate === "string") {
        updates.jobDate = new Date(updates.jobDate);
      }
      
      // Get the existing job log to check status change
      const existingJobLog = await storage.getJobLogById(id);
      const oldStatus = existingJobLog?.status;
      const newStatus = updates.status;
      
      const jobLog = await storage.updateJobLog(id, updates);
      
      if (oldStatus && newStatus && oldStatus !== newStatus) {
        notifyJobStatusChange(jobLog, oldStatus, newStatus).catch(err => {
          console.error("[JobStatusNotification] Failed for admin job update", id, err);
        });
      }
      
      if (oldStatus !== 'completed' && newStatus === 'completed') {
        scheduleReviewRequestForJobLog(id).catch(err => {
          console.error("[ReviewRequest] Error scheduling review request on job completion:", err);
        });
      }
      
      res.json({ success: true, jobLog });
    } catch (error) {
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });

  app.delete("/api/admin/job-logs/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteJobLog(id);
      res.json({ success: true, message: "Job log deleted" });
    } catch (error) {
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });

  // Admin: job log custom fields CRUD
  app.get("/api/admin/custom-fields", requireAdmin, async (req, res) => {
    try {
      const fields = await storage.getJobLogCustomFields();
      res.json({ success: true, fields });
    } catch (error) {
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });

  app.post("/api/admin/custom-fields", requireAdmin, async (req, res) => {
    try {
      const data = insertJobLogCustomFieldSchema.parse(req.body);
      if (data.fieldType === "select" && (!data.options || data.options.trim() === "")) {
        return res.status(400).json({ success: false, message: "Select fields require at least one option" });
      }
      const field = await storage.createJobLogCustomField(data);
      res.json({ success: true, field });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, message: "Invalid data", errors: error.errors });
      } else {
        res.status(500).json({ success: false, message: "Internal server error" });
      }
    }
  });

  app.patch("/api/admin/custom-fields/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = insertJobLogCustomFieldSchema.partial().parse(req.body);
      if (data.fieldType === "select" && data.options !== undefined && (!data.options || data.options.trim() === "")) {
        return res.status(400).json({ success: false, message: "Select fields require at least one option" });
      }
      const field = await storage.updateJobLogCustomField(id, data);
      res.json({ success: true, field });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, message: "Invalid data", errors: error.errors });
      } else {
        res.status(500).json({ success: false, message: "Internal server error" });
      }
    }
  });

  app.delete("/api/admin/custom-fields/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteJobLogCustomField(id);
      res.json({ success: true, message: "Custom field deleted" });
    } catch (error) {
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });

  // Public endpoint for field employees to get active custom fields
  app.get("/api/field/custom-fields", requireFieldAuth, async (req, res) => {
    try {
      const allFields = await storage.getJobLogCustomFields();
      const activeFields = allFields.filter(f => f.isActive);
      res.json({ success: true, fields: activeFields });
    } catch (error) {
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });

  // Admin: field customers CRUD
  app.get("/api/admin/field-customers", requireAdmin, async (req, res) => {
    try {
      const customers = await storage.getFieldCustomers();
      res.json({ success: true, customers });
    } catch (error) {
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });

  app.post("/api/admin/field-customers", requireAdmin, async (req, res) => {
    try {
      const data = insertFieldCustomerSchema.parse(req.body);
      const customer = await storage.createFieldCustomer(data);
      res.json({ success: true, customer });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, message: "Invalid data", errors: error.errors });
      } else {
        res.status(500).json({ success: false, message: "Internal server error" });
      }
    }
  });

  app.patch("/api/admin/field-customers/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateSchema = insertFieldCustomerSchema.partial();
      const data = updateSchema.parse(req.body);
      const customer = await storage.updateFieldCustomer(id, data);
      res.json({ success: true, customer });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, message: "Invalid data", errors: error.errors });
      } else {
        res.status(500).json({ success: false, message: "Internal server error" });
      }
    }
  });

  app.delete("/api/admin/field-customers/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteFieldCustomer(id);
      res.json({ success: true, message: "Customer deleted" });
    } catch (error) {
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });

  // Admin: site locations CRUD
  app.get("/api/admin/site-locations", requireAdmin, async (req, res) => {
    try {
      const locations = await storage.getSiteLocations();
      res.json({ success: true, locations });
    } catch (error) {
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });

  app.post("/api/admin/site-locations", requireAdmin, async (req, res) => {
    try {
      const data = insertSiteLocationSchema.parse(req.body);
      const location = await storage.createSiteLocation(data);
      res.json({ success: true, location });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, message: "Invalid data", errors: error.errors });
      } else {
        res.status(500).json({ success: false, message: "Internal server error" });
      }
    }
  });

  app.patch("/api/admin/site-locations/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateSchema = insertSiteLocationSchema.partial();
      const data = updateSchema.parse(req.body);
      const location = await storage.updateSiteLocation(id, data);
      res.json({ success: true, location });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, message: "Invalid data", errors: error.errors });
      } else {
        res.status(500).json({ success: false, message: "Internal server error" });
      }
    }
  });

  app.delete("/api/admin/site-locations/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteSiteLocation(id);
      res.json({ success: true, message: "Location deleted" });
    } catch (error) {
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });

  // Admin: serviced areas CRUD
  app.get("/api/admin/serviced-areas", requireAdmin, async (req, res) => {
    try {
      const areas = await storage.getServicedAreas();
      res.json({ success: true, areas });
    } catch (error) {
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });

  app.post("/api/admin/serviced-areas", requireAdmin, async (req, res) => {
    try {
      const data = insertServicedAreaSchema.parse(req.body);
      const area = await storage.createServicedArea(data);
      res.json({ success: true, area });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, message: "Invalid data", errors: error.errors });
      } else {
        res.status(500).json({ success: false, message: "Internal server error" });
      }
    }
  });

  app.patch("/api/admin/serviced-areas/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateSchema = insertServicedAreaSchema.partial();
      const data = updateSchema.parse(req.body);
      const area = await storage.updateServicedArea(id, data);
      res.json({ success: true, area });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, message: "Invalid data", errors: error.errors });
      } else {
        res.status(500).json({ success: false, message: "Internal server error" });
      }
    }
  });

  app.delete("/api/admin/serviced-areas/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteServicedArea(id);
      res.json({ success: true, message: "Area deleted" });
    } catch (error) {
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });

  // Service Contract routes

  // Calendar endpoint must be registered BEFORE /:id to avoid route shadowing
  // GET /api/admin/service-contracts/calendar?from=<ISO>&to=<ISO>
  app.get("/api/admin/service-contracts/calendar", requireAdmin, async (req, res) => {
    try {
      const fromParam = req.query.from as string;
      const toParam = req.query.to as string;

      if (!fromParam || !toParam) {
        return res.status(400).json({
          success: false,
          message: "Missing required query parameters: 'from' and 'to' (ISO date strings)",
        });
      }

      const from = new Date(fromParam);
      const to = new Date(toParam);

      if (isNaN(from.getTime()) || isNaN(to.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid date format. Use ISO date strings (e.g., '2026-01-01')",
        });
      }

      // Set to end of day for 'to' param so the full day is included
      to.setHours(23, 59, 59, 999);

      const contracts = await storage.getServiceContractsInDateRange(from, to);
      res.json({ success: true, contracts });
    } catch (error) {
      console.error("Error fetching calendar contracts:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });

  app.get("/api/admin/service-contracts", requireAdmin, async (req, res) => {
    try {
      const customerId = req.query.customerId ? parseInt(req.query.customerId as string) : undefined;
      const isActive = req.query.isActive !== undefined ? req.query.isActive === "true" : undefined;
      const assignedEmployeeId = req.query.assignedEmployeeId ? parseInt(req.query.assignedEmployeeId as string) : undefined;
      const contracts = await storage.getServiceContracts({ customerId, isActive, assignedEmployeeId });
      res.json({ success: true, contracts });
    } catch (error) {
      console.error("Error fetching service contracts:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });

  app.get("/api/admin/service-contracts/:id", requireAdmin, async (req, res) => {
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

  app.post("/api/admin/service-contracts", requireAdmin, async (req, res) => {
    try {
      const validatedData = insertServiceContractSchema.parse(req.body);
      const contract = await storage.createServiceContract(validatedData);
      res.json({ success: true, message: "Service contract created successfully", contract });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, message: "Invalid contract data", errors: error.errors });
      } else {
        console.error("Error creating service contract:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
      }
    }
  });

  app.patch("/api/admin/service-contracts/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertServiceContractSchema.partial().parse(req.body);
      const contract = await storage.updateServiceContract(id, validatedData);
      res.json({ success: true, message: "Service contract updated successfully", contract });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, message: "Invalid contract data", errors: error.errors });
      } else {
        console.error("Error updating service contract:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
      }
    }
  });

  app.delete("/api/admin/service-contracts/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteServiceContract(id);
      res.json({ success: true, message: "Service contract deleted successfully" });
    } catch (error) {
      console.error("Error deleting service contract:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });

  // Generate job from contract - POST /api/admin/service-contracts/:id/generate-job
  app.post("/api/admin/service-contracts/:id/generate-job", requireAdmin, async (req, res) => {
    try {
      const contractId = parseInt(req.params.id);

      // Fetch contract first for pre-checks
      const contract = await storage.getServiceContract(contractId);
      if (!contract) {
        return res.status(404).json({ success: false, message: "Service contract not found" });
      }

      // Check contract is active
      if (!contract.isActive) {
        return res.status(400).json({ success: false, message: "Cannot generate job from an inactive contract" });
      }

      // Require an assigned technician
      if (!contract.assignedEmployeeId) {
        return res.status(400).json({ success: false, message: "Contract has no assigned technician — assign one before generating a job" });
      }

      // Idempotency check: prevent duplicate generation within the same frequency window
      if (contract.lastGeneratedJobDate) {
        const now = new Date();
        const last = new Date(contract.lastGeneratedJobDate);
        let windowMs = 28 * 24 * 60 * 60 * 1000; // monthly default
        if (contract.frequency === "weekly")    windowMs = 7  * 24 * 60 * 60 * 1000;
        if (contract.frequency === "quarterly") windowMs = 84 * 24 * 60 * 60 * 1000;
        if (contract.frequency === "bi-annual") windowMs = 180 * 24 * 60 * 60 * 1000;
        if (contract.frequency === "annual")    windowMs = 365 * 24 * 60 * 60 * 1000;
        if (now.getTime() - last.getTime() < windowMs) {
          return res.status(409).json({
            success: false,
            message: "A job has already been generated for this contract in the current cycle",
            lastGeneratedJobDate: contract.lastGeneratedJobDate,
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

  // ==========================================
  // Photo Attachment Routes
  // ==========================================

  // POST /api/field/photos/sign — generate Cloudinary signed upload params
  app.post("/api/field/photos/sign", requireFieldAuth, (req, res) => {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      return res.status(503).json({ success: false, message: "Cloudinary is not configured" });
    }

    const timestamp = Math.round(Date.now() / 1000);
    const folder = "aps-job-logs";

    const paramsToSign: Record<string, string | number> = {
      timestamp,
      folder,
      allowed_formats: "jpg,jpeg,png,webp,heic",
      max_file_size: 5242880,
    };

    const signature = cloudinary.utils.api_sign_request(paramsToSign, apiSecret);

    res.json({
      signature,
      timestamp,
      folder,
      cloudName,
      apiKey,
    });
  });

  // GET /api/field/job-logs/:logId/photos — field employee fetches photos for their log
  app.get("/api/field/job-logs/:logId/photos", requireFieldAuth, async (req, res) => {
    try {
      const logId = parseInt(req.params.logId);
      if (isNaN(logId)) return res.status(400).json({ success: false, message: "Invalid log ID" });

      const log = await storage.getJobLog(logId);
      if (!log || log.employeeId !== req.session.fieldEmployeeId) {
        return res.status(403).json({ success: false, message: "Forbidden" });
      }

      const photos = await storage.getJobLogPhotos(logId);
      res.json({ success: true, photos });
    } catch (error) {
      console.error("Error fetching photos:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });

  // POST /api/field/job-logs/:logId/photos — save Cloudinary URL after direct upload
  app.post("/api/field/job-logs/:logId/photos", requireFieldAuth, async (req, res) => {
    try {
      const logId = parseInt(req.params.logId);
      if (isNaN(logId)) return res.status(400).json({ success: false, message: "Invalid log ID" });

      const log = await storage.getJobLog(logId);
      if (!log || log.employeeId !== req.session.fieldEmployeeId) {
        return res.status(403).json({ success: false, message: "Forbidden" });
      }

      const parsed = insertJobLogPhotoSchema.safeParse({ ...req.body, jobLogId: logId });
      if (!parsed.success) {
        return res.status(400).json({ success: false, error: parsed.error.flatten() });
      }

      // Validate URL is from our Cloudinary account
      const cloudName = process.env.CLOUDINARY_CLOUD_NAME!;
      const urlObj = new URL(parsed.data.url);
      if (
        !urlObj.hostname.includes("cloudinary.com") ||
        !urlObj.pathname.startsWith(`/${cloudName}`)
      ) {
        return res.status(400).json({ success: false, message: "Invalid image host" });
      }

      try {
        const photo = await storage.createJobLogPhoto(parsed.data);
        res.status(201).json({ success: true, photo });
      } catch (err: any) {
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

  // DELETE /api/field/job-logs/:logId/photos/:photoId — remove a photo record
  app.delete("/api/field/job-logs/:logId/photos/:photoId", requireFieldAuth, async (req, res) => {
    try {
      const logId = parseInt(req.params.logId);
      const photoId = parseInt(req.params.photoId);
      if (isNaN(logId) || isNaN(photoId)) {
        return res.status(400).json({ success: false, message: "Invalid ID" });
      }

      const log = await storage.getJobLog(logId);
      if (!log || log.employeeId !== req.session.fieldEmployeeId) {
        return res.status(403).json({ success: false, message: "Forbidden" });
      }

      await storage.deleteJobLogPhoto(photoId, logId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting photo:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });

  // GET /api/admin/job-logs/:logId/photos — admin view photos for any log
  app.get("/api/admin/job-logs/:logId/photos", requireAdmin, async (req, res) => {
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

  // ==========================================
  // Invoice Routes (SC-INV-001)
  // ==========================================

  // ─── Admin Field Materials (Products & Supplies) ─────────────────────────
  app.get("/api/admin/field-materials", requireAdmin, async (req, res) => {
    try {
      const category = req.query.category as string | undefined;
      const materials = await storage.getFieldMaterials(category);
      res.json({ success: true, materials });
    } catch (error) {
      console.error("Error fetching field materials:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });

  app.post("/api/admin/field-materials", requireAdmin, async (req, res) => {
    try {
      const material = await storage.createFieldMaterial(req.body);
      res.json({ success: true, material });
    } catch (error) {
      console.error("Error creating field material:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });

  app.put("/api/admin/field-materials/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const material = await storage.updateFieldMaterial(id, req.body);
      res.json({ success: true, material });
    } catch (error) {
      console.error("Error updating field material:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });

  app.delete("/api/admin/field-materials/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteFieldMaterial(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting field material:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });

  // Field employee access to materials list (active only)
  app.get("/api/field/materials", async (req, res) => {
    try {
      const category = req.query.category as string | undefined;
      const allMaterials = await storage.getFieldMaterials(category);
      const active = allMaterials.filter(m => m.isActive);
      res.json({ success: true, materials: active });
    } catch (error) {
      console.error("Error fetching field materials:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });

  // ─── Admin Service Rates ──────────────────────────────────────────────────
  app.get("/api/admin/service-rates", requireAdmin, async (req, res) => {
    try {
      const rates = await storage.getServiceRates();
      res.json({ success: true, rates });
    } catch (error) {
      console.error("Error fetching service rates:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });

  app.post("/api/admin/service-rates", requireAdmin, async (req, res) => {
    try {
      const rate = await storage.createServiceRate(req.body);
      res.status(201).json({ success: true, rate });
    } catch (error) {
      console.error("Error creating service rate:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });

  app.put("/api/admin/service-rates/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const rate = await storage.updateServiceRate(id, req.body);
      res.json({ success: true, rate });
    } catch (error) {
      console.error("Error updating service rate:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });

  app.delete("/api/admin/service-rates/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteServiceRate(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting service rate:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });

  // GET /api/admin/invoices — List all invoices
  app.get("/api/admin/invoices", requireAdmin, async (req, res) => {
    try {
      const filters: {
        clientId?: number;
        status?: InvoiceStatus;
        fromDate?: Date;
        toDate?: Date;
        page?: number;
        limit?: number;
      } = {};
      if (req.query.clientId) filters.clientId = parseInt(req.query.clientId as string);
      if (req.query.status) filters.status = req.query.status as InvoiceStatus;
      if (req.query.fromDate) filters.fromDate = new Date(req.query.fromDate as string);
      if (req.query.toDate) filters.toDate = new Date(req.query.toDate as string);
      if (req.query.page) filters.page = parseInt(req.query.page as string);
      if (req.query.limit) filters.limit = parseInt(req.query.limit as string);

      const invoices = await storage.listInvoices(filters);
      res.json({ success: true, invoices });
    } catch (error) {
      console.error("Error fetching invoices:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });

  // GET /api/admin/invoices/stats — Invoice summary stats
  app.get("/api/admin/invoices/stats", requireAdmin, async (req, res) => {
    try {
      const stats = await storage.getInvoiceStats();
      res.json({ success: true, stats });
    } catch (error) {
      console.error("Error fetching invoice stats:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });

  // GET /api/admin/invoices/:id — Get single invoice with details
  app.get("/api/admin/invoices/:id", requireAdmin, async (req, res) => {
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
          statusLogs,
        },
      });
    } catch (error) {
      console.error("Error fetching invoice:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });

  // POST /api/admin/invoices — Create new invoice (draft)
  app.post("/api/admin/invoices", requireAdmin, async (req, res) => {
    try {
      const validatedData = insertInvoiceSchema.parse(req.body);
      const userId = req.session.userId!;
      const invoice = await storage.createInvoice({
        ...validatedData,
        createdBy: userId,
      });

      // Create line items if provided
      if (req.body.lineItems && Array.isArray(req.body.lineItems)) {
        for (const item of req.body.lineItems) {
          const lineItemData = insertInvoiceLineItemSchema.parse({
            ...item,
            invoiceId: invoice.id,
          });
          await storage.createLineItem(lineItemData);
        }

        // Recalculate totals
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
          total: (subtotal + taxTotal).toFixed(2),
        });
      }

      // Fetch the updated invoice with details
      const updatedInvoice = await storage.getInvoice(invoice.id);
      const lineItems = await storage.getLineItemsByInvoice(invoice.id);

      res.status(201).json({
        success: true,
        message: "Invoice created successfully",
        invoice: { ...updatedInvoice, lineItems },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, message: "Invalid invoice data", errors: error.errors });
      } else {
        console.error("Error creating invoice:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
      }
    }
  });

  // PUT /api/admin/invoices/:id — Update invoice (draft only)
  app.put("/api/admin/invoices/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const invoice = await storage.getInvoice(id);
      if (!invoice) {
        return res.status(404).json({ success: false, message: "Invoice not found" });
      }

      // Only allow editing in draft state
      if (invoice.status !== 'draft') {
        return res.status(400).json({ success: false, message: "Can only edit invoices in draft status" });
      }

      // Remove status from body to enforce state machine (prevents BUG-003)
      const { status: _status, ...bodyWithoutStatus } = req.body;
      const validatedData = insertInvoiceSchema.partial().parse(bodyWithoutStatus);
      await storage.updateInvoice(id, validatedData as any);

      // Update line items if provided
      if (req.body.lineItems !== undefined) {
        // Delete existing line items
        const existingItems = await storage.getLineItemsByInvoice(id);
        for (const item of existingItems) {
          await storage.deleteLineItem(item.id);
        }

        // Create new line items
        if (Array.isArray(req.body.lineItems)) {
          for (const item of req.body.lineItems) {
            const lineItemData = insertInvoiceLineItemSchema.parse({
              ...item,
              invoiceId: id,
            });
            await storage.createLineItem(lineItemData);
          }
        }

        // Recalculate totals
        const lineItems = await storage.getLineItemsByInvoice(id);
        let subtotal = 0;
        let taxTotal = 0;
        for (const item of lineItems) {
          subtotal += parseFloat(String(item.lineTotal));
          taxTotal += parseFloat(String(item.lineTax));
        }

        await storage.updateInvoice(id, {
          subtotal: subtotal.toFixed(2),
          taxTotal: taxTotal.toFixed(2),
          total: (subtotal + taxTotal).toFixed(2),
        });
      }

      const updatedInvoice = await storage.getInvoice(id);
      const lineItems = await storage.getLineItemsByInvoice(id);
      const statusLogs = await storage.getInvoiceStatusLog(id);

      res.json({
        success: true,
        message: "Invoice updated successfully",
        invoice: { ...updatedInvoice, lineItems, statusLogs },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, message: "Invalid invoice data", errors: error.errors });
      } else {
        console.error("Error updating invoice:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
      }
    }
  });

  // POST /api/admin/invoices/:id/send — Send invoice to customer (draft → sent)
  app.post("/api/admin/invoices/:id/send", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const invoice = await storage.getInvoice(id);
      if (!invoice) {
        return res.status(404).json({ success: false, message: "Invoice not found" });
      }

      // Validate transition
      try {
        assertTransition(invoice.status as InvoiceStatus, 'sent');
      } catch (e: any) {
        return res.status(400).json({ success: false, message: e.message });
      }

      const client = await storage.getClient(invoice.clientId);
      if (!client || !client.email) {
        return res.status(400).json({ success: false, message: "Client email not found" });
      }

      // Generate PDF and send email first, then update status
      const adminBaseUrl = await getAppBaseUrl();
      const lineItems = await storage.getLineItemsByInvoice(id);
      let pdfBuffer: Buffer | undefined;
      try {
        pdfBuffer = generateInvoicePdf({
          invoiceNumber: invoice.invoiceNumber,
          status: 'sent',
          issueDate: String(invoice.issueDate),
          dueDate: String(invoice.dueDate),
          subtotal: String(invoice.subtotal),
          taxTotal: String(invoice.taxTotal),
          total: String(invoice.total),
          notes: invoice.notes,
          client: { name: client.name, email: client.email, address: client.address, phone: client.phone, propertyType: (client as any).propertyType },
          lineItems: lineItems.map(li => ({
            description: li.description,
            quantity: String(li.quantity),
            unitRate: String(li.unitRate),
            taxRate: String(li.taxRate),
            lineTotal: String(li.lineTotal),
            lineTax: String(li.lineTax),
            serviceDate: (li as any).serviceDate,
            technicianName: (li as any).technicianName,
            serviceType: (li as any).serviceType,
            serviceAddress: (li as any).serviceAddress,
            servicedArea: (li as any).servicedArea,
            materials: li.materials,
          })),
        });
      } catch (e) { console.error(`[Invoice ${invoice.invoiceNumber}] PDF generation failed:`, e); }

      const emailSent = await sendInvoiceEmail({
        clientEmail: client.email,
        clientName: client.name,
        invoiceNumber: invoice.invoiceNumber,
        invoiceDate: new Date(invoice.issueDate),
        dueDate: new Date(invoice.dueDate),
        total: String(invoice.total),
        viewToken: invoice.viewToken!,
        baseUrl: adminBaseUrl,
        pdfBuffer,
      });

      if (!emailSent) {
        return res.status(500).json({ success: false, message: "Failed to send invoice email. Invoice status was not changed." });
      }

      await storage.updateInvoiceStatus(id, 'sent', `admin:${req.session.userId}`, 'Invoice sent to customer');
      const updatedInvoice = await storage.getInvoice(id);
      const statusLogs = await storage.getInvoiceStatusLog(id);

      res.json({
        success: true,
        message: "Invoice sent successfully",
        invoice: { ...updatedInvoice, lineItems, statusLogs },
      });
    } catch (error) {
      console.error("Error sending invoice:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });

  // POST /api/field/invoices/:id/send — Field employee sends invoice email to customer
  app.post("/api/field/invoices/:id/send", requireFieldAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { overrideEmail } = req.body || {};
      const invoice = await storage.getInvoice(id);
      if (!invoice) {
        return res.status(404).json({ success: false, message: "Invoice not found" });
      }
      const client = await storage.getClient(invoice.clientId);
      const recipientEmail: string = overrideEmail?.trim() || client?.email || '';
      const recipientName: string = client?.name || 'Valued Customer';
      if (!recipientEmail) {
        return res.status(400).json({ success: false, message: "No email address provided. Enter an email address to send the invoice." });
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(recipientEmail)) {
        return res.status(400).json({ success: false, message: "Invalid email address format." });
      }
      const fieldBaseUrl = await getAppBaseUrl();
      const fieldLineItems = await storage.getLineItemsByInvoice(id);
      let fieldPdfBuffer: Buffer | undefined;
      try {
        fieldPdfBuffer = generateInvoicePdf({
          invoiceNumber: invoice.invoiceNumber,
          status: 'sent',
          issueDate: String(invoice.issueDate),
          dueDate: String(invoice.dueDate),
          subtotal: String(invoice.subtotal),
          taxTotal: String(invoice.taxTotal),
          total: String(invoice.total),
          notes: invoice.notes,
          client: client ? { name: client.name, email: client.email, address: client.address, phone: client.phone, propertyType: (client as any).propertyType } : { name: recipientName },
          lineItems: fieldLineItems.map(li => ({
            description: li.description,
            quantity: String(li.quantity),
            unitRate: String(li.unitRate),
            taxRate: String(li.taxRate),
            lineTotal: String(li.lineTotal),
            lineTax: String(li.lineTax),
            serviceDate: (li as any).serviceDate,
            technicianName: (li as any).technicianName,
            serviceType: (li as any).serviceType,
            serviceAddress: (li as any).serviceAddress,
            servicedArea: (li as any).servicedArea,
            materials: li.materials,
          })),
        });
      } catch (e) { console.error(`[Invoice ${invoice.invoiceNumber}] PDF generation failed:`, e); }
      const fieldEmailSent = await sendInvoiceEmail({
        clientEmail: recipientEmail,
        clientName: recipientName,
        invoiceNumber: invoice.invoiceNumber,
        invoiceDate: new Date(invoice.issueDate),
        dueDate: new Date(invoice.dueDate),
        total: String(invoice.total),
        viewToken: invoice.viewToken!,
        baseUrl: fieldBaseUrl,
        pdfBuffer: fieldPdfBuffer,
      });
      if (!fieldEmailSent) {
        return res.status(500).json({ success: false, message: "Failed to send invoice email. Please try again." });
      }
      await storage.updateInvoiceStatus(id, 'sent', `field:${req.session.fieldEmployeeId}`, `Invoice sent by field technician to ${recipientEmail}`);
      res.json({ success: true, message: `Invoice emailed to ${recipientEmail}` });
    } catch (error) {
      console.error("Error sending field invoice:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });

  // POST /api/admin/invoices/:id/mark-paid — Mark invoice as paid
  app.post("/api/admin/invoices/:id/mark-paid", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { paymentMethod, paymentAmount, paymentNote } = req.body;

      const invoice = await storage.getInvoice(id);
      if (!invoice) {
        return res.status(404).json({ success: false, message: "Invoice not found" });
      }

      // Validate transition
      try {
        assertTransition(invoice.status as InvoiceStatus, 'paid');
      } catch (e: any) {
        return res.status(400).json({ success: false, message: e.message });
      }

      // Update invoice with payment details
      await storage.updateInvoice(id, {
        paymentMethod: paymentMethod || 'other',
        paymentAmount: paymentAmount || invoice.total,
        paymentNote,
      } as any);

      // Update status
      await storage.updateInvoiceStatus(id, 'paid', `admin:${req.session.userId}`, 'Payment recorded');

      // Send confirmation email
      const client = await storage.getClient(invoice.clientId);
      if (client?.email) {
        await sendPaymentConfirmationEmail({
          clientEmail: client.email,
          clientName: client.name,
          invoiceNumber: invoice.invoiceNumber,
          amountPaid: String(paymentAmount || invoice.total),
          paidAt: new Date(),
          paymentMethod: paymentMethod || 'other',
        });
        
        // Trigger review request on invoice payment (if enabled)
        scheduleReviewRequestForInvoice(id).catch(err => {
          console.error("[ReviewRequest] Error scheduling review request on invoice paid:", err);
        });
      }

      const updatedInvoice = await storage.getInvoice(id);
      const lineItems = await storage.getLineItemsByInvoice(id);
      const statusLogs = await storage.getInvoiceStatusLog(id);

      res.json({
        success: true,
        message: "Invoice marked as paid",
        invoice: { ...updatedInvoice, lineItems, statusLogs },
      });
    } catch (error) {
      console.error("Error marking invoice as paid:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });

  // POST /api/admin/invoices/:id/void — Void invoice
  app.post("/api/admin/invoices/:id/void", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { reason } = req.body;

      const invoice = await storage.getInvoice(id);
      if (!invoice) {
        return res.status(404).json({ success: false, message: "Invoice not found" });
      }

      // Validate transition
      try {
        assertTransition(invoice.status as InvoiceStatus, 'void');
      } catch (e: any) {
        return res.status(400).json({ success: false, message: e.message });
      }

      // Update with void reason
      await storage.updateInvoice(id, { voidReason: reason } as any);

      // Update status
      await storage.updateInvoiceStatus(id, 'void', `admin:${req.session.userId}`, reason || 'Invoice voided');

      const updatedInvoice = await storage.getInvoice(id);
      const lineItems = await storage.getLineItemsByInvoice(id);
      const statusLogs = await storage.getInvoiceStatusLog(id);

      res.json({
        success: true,
        message: "Invoice voided",
        invoice: { ...updatedInvoice, lineItems, statusLogs },
      });
    } catch (error) {
      console.error("Error voiding invoice:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });

  // GET /api/admin/invoices/:id/log — Get status log for invoice
  app.get("/api/admin/invoices/:id/log", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const logs = await storage.getInvoiceStatusLog(id);
      res.json({ success: true, logs });
    } catch (error) {
      console.error("Error fetching invoice logs:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });

  // POST /api/admin/invoices/from-job/:jobLogId — Create invoice from job log
  app.post("/api/admin/invoices/from-job/:jobLogId", requireAdmin, async (req, res) => {
    try {
      const jobLogId = parseInt(req.params.jobLogId);
      const { dueDate } = req.body;

      if (!dueDate) {
        return res.status(400).json({ success: false, message: "dueDate is required" });
      }

      const userId = req.session.userId!;
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
        invoice: { ...invoice, lineItems, statusLogs },
      });
    } catch (error: any) {
      console.error("Error creating invoice from job log:", error);
      res.status(400).json({ success: false, message: error.message || "Internal server error" });
    }
  });

  // GET /api/invoices/view/:token — Public customer view (no auth)
  app.get("/api/invoices/view/:token", async (req, res) => {
    try {
      const { token } = req.params;
      const invoice = await storage.getInvoiceByToken(token);
      
      if (!invoice) {
        return res.status(404).json({ success: false, message: "Invoice not found" });
      }

      // If invoice is 'sent', transition to 'viewed'
      if (invoice.status === 'sent') {
        await storage.updateInvoiceStatus(invoice.id, 'viewed', 'customer', 'Customer viewed invoice');
        const updated = await storage.getInvoice(invoice.id);
        Object.assign(invoice, updated);
      }

      // Get client info (without sensitive data)
      const client = await storage.getClient(invoice.clientId);
      const lineItems = await storage.getLineItemsByInvoice(invoice.id);

      // Fetch photos for linked job logs
      const jobLogIds = lineItems.map(li => (li as any).jobLogId).filter(Boolean) as number[];
      const uniqueJobLogIds = [...new Set(jobLogIds)];
      let photos: any[] = [];
      for (const jlId of uniqueJobLogIds) {
        try {
          const jlPhotos = await storage.getJobLogPhotos(jlId);
          photos.push(...jlPhotos.map(p => ({ ...p, jobLogId: jlId })));
        } catch {}
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
          client: client ? { name: client.name, email: client.email, address: client.address, phone: client.phone, propertyType: (client as any).propertyType } : undefined,
          lineItems,
          photos,
        },
      });
    } catch (error) {
      console.error("Error viewing invoice:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });

  // POST /api/admin/invoices/mark-overdue — Manually trigger overdue check (admin)
  app.post("/api/admin/invoices/mark-overdue", requireAdmin, async (req, res) => {
    try {
      const count = await storage.markInvoicesOverdue();
      res.json({ success: true, message: `${count} invoices marked as overdue`, count });
    } catch (error) {
      console.error("Error marking invoices overdue:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });

  // POST /api/admin/invoices/:id/generate-pdf — Generate PDF for invoice (BUG-001 fix)
  app.post("/api/admin/invoices/:id/generate-pdf", requireAdmin, async (req, res) => {
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

      // Generate PDF using jsPDF
      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(24);
      doc.setTextColor(40, 40, 40);
      doc.text("INVOICE", 20, 30);
      
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text(`Invoice #: ${invoice.invoiceNumber}`, 20, 45);
      doc.text(`Date: ${new Date(invoice.issueDate).toLocaleDateString()}`, 20, 52);
      doc.text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`, 20, 59);
      
      // Company info
      doc.setFontSize(10);
      doc.text("From:", 120, 40);
      doc.setFontSize(11);
      doc.text("Absolute Pest Services", 120, 46);
      doc.setFontSize(9);
      doc.text("rob@absolutepestservices.com", 120, 52);
      
      // Bill To
      doc.setFontSize(10);
      doc.text("Bill To:", 20, 75);
      doc.setFontSize(11);
      doc.text(client.name, 20, 81);
      doc.setFontSize(9);
      if (client.address) doc.text(client.address, 20, 87);
      if (client.email) doc.text(client.email, 20, 93);
      
      // Line items table
      const tableData = lineItems.map(item => [
        item.description,
        item.quantity.toString(),
        `$${item.unitRate}`,
        `$${item.lineTotal}`
      ]);
      
      autoTable(doc, {
        startY: 105,
        head: [['Description', 'Qty', 'Unit Price', 'Total']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [66, 66, 66] },
      });
      
      // Get final Y position after table
      const finalY = (doc as any).lastAutoTable?.finalY || 150;
      
      // Totals
      doc.setFontSize(10);
      doc.text(`Subtotal: $${invoice.subtotal}`, 140, finalY + 15);
      doc.text(`Tax: $${invoice.taxTotal}`, 140, finalY + 22);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(`Total: $${invoice.total}`, 140, finalY + 30);
      
      // Notes
      if (invoice.notes) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.text("Notes:", 20, finalY + 45);
        doc.text(invoice.notes, 20, finalY + 51);
      }
      
      // Footer
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text("Thank you for your business!", 20, 280);
      
      // Save PDF to file
      const pdfDir = path.join(process.cwd(), 'generated-pdfs');
      if (!fs.existsSync(pdfDir)) {
        fs.mkdirSync(pdfDir, { recursive: true });
      }
      
      const pdfFileName = `invoice-${invoice.invoiceNumber.replace(/[^a-zA-Z0-9]/g, '-')}.pdf`;
      const pdfPath = path.join(pdfDir, pdfFileName);
      
      const pdfBuffer = doc.output('arraybuffer');
      fs.writeFileSync(pdfPath, Buffer.from(pdfBuffer));
      
      // Upload to Cloudinary
      const cloudinaryUpload = await cloudinary.uploader.upload(`data:application/pdf;base64,${Buffer.from(pdfBuffer).toString('base64')}`, {
        folder: 'invoices',
        resource_type: 'raw',
        public_id: pdfFileName.replace('.pdf', '')
      });
      
      const pdfUrl = cloudinaryUpload.secure_url;
      
      // Update invoice with PDF URL
      await storage.updateInvoice(id, { pdfUrl });
      
      const updatedInvoice = await storage.getInvoice(id);
      
      res.json({
        success: true,
        message: "PDF generated successfully",
        invoice: updatedInvoice,
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      res.status(500).json({ success: false, message: "Failed to generate PDF" });
    }
  });

  // ==========================================
  // General Admin Settings
  // ==========================================

  async function getAppBaseUrl(): Promise<string> {
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

  // GET /api/admin/settings/app-url — Get configured public app URL
  app.get("/api/admin/settings/app-url", requireAdmin, async (req, res) => {
    try {
      const appUrl = await storage.getSystemSetting("app_base_url");
      res.json({ success: true, appUrl: appUrl || "" });
    } catch (error) {
      res.status(500).json({ success: false, message: "Failed to fetch app URL" });
    }
  });

  // PATCH /api/admin/settings/app-url — Save public app URL
  app.patch("/api/admin/settings/app-url", requireAdmin, async (req, res) => {
    try {
      const { appUrl } = req.body;
      if (typeof appUrl !== "string") {
        return res.status(400).json({ success: false, message: "Invalid value" });
      }
      const trimmed = appUrl.trim().replace(/\/$/, "");
      const userId = req.session?.userId;
      await storage.setSystemSetting("app_base_url", trimmed, userId!);
      res.json({ success: true, appUrl: trimmed });
    } catch (error) {
      res.status(500).json({ success: false, message: "Failed to save app URL" });
    }
  });

  app.get("/api/admin/settings/timezone", requireAdmin, async (req, res) => {
    try {
      const tz = await storage.getSystemSetting("timezone");
      res.json({ success: true, timezone: tz || "America/New_York" });
    } catch (error) {
      console.error("Error fetching timezone:", error);
      res.status(500).json({ success: false, message: "Failed to fetch timezone" });
    }
  });

  app.patch("/api/admin/settings/timezone", requireAdmin, async (req, res) => {
    try {
      const { timezone } = req.body;
      const validTimezones = [
        "America/New_York", "America/Chicago", "America/Denver",
        "America/Los_Angeles", "America/Anchorage", "Pacific/Honolulu"
      ];
      if (!timezone || typeof timezone !== "string" || !validTimezones.includes(timezone)) {
        return res.status(400).json({ success: false, message: "Invalid timezone value" });
      }
      const userId = req.session?.userId;
      await storage.setSystemSetting("timezone", timezone, userId!);
      res.json({ success: true, timezone });
    } catch (error) {
      console.error("Error updating timezone:", error);
      res.status(500).json({ success: false, message: "Failed to update timezone" });
    }
  });

  // ==========================================
  // Reminder Admin Routes (SC-REMINDERS-001)
  // ==========================================

  // Get reminder settings
  app.get("/api/admin/reminders/settings", requireAdmin, async (req, res) => {
    try {
      const settings = await storage.getAllReminderSettings();
      res.json({ success: true, settings });
    } catch (error) {
      console.error("Error fetching reminder settings:", error);
      res.status(500).json({ success: false, message: "Failed to fetch settings" });
    }
  });

  // Update reminder settings
  app.patch("/api/admin/reminders/settings", requireAdmin, async (req, res) => {
    try {
      const userId = req.session?.userId;
      const settings = await storage.setReminderSettings(req.body, userId);
      res.json({ success: true, settings });
    } catch (error) {
      console.error("Error updating reminder settings:", error);
      res.status(500).json({ success: false, message: "Failed to update settings" });
    }
  });

  // Get reminder logs
  app.get("/api/admin/reminders/logs", requireAdmin, async (req, res) => {
    try {
      const { appointmentType, appointmentId, limit } = req.query;
      const logs = await storage.getReminderLogs(
        appointmentType as any,
        appointmentId ? parseInt(appointmentId as string) : undefined,
        limit ? parseInt(limit as string) : undefined
      );
      res.json({ success: true, logs });
    } catch (error) {
      console.error("Error fetching reminder logs:", error);
      res.status(500).json({ success: false, message: "Failed to fetch logs" });
    }
  });

  // Delete reminder log (force re-send)
  app.delete("/api/admin/reminders/logs/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteReminderLog(id);
      res.json({ success: true, message: "Reminder log deleted" });
    } catch (error) {
      console.error("Error deleting reminder log:", error);
      res.status(500).json({ success: false, message: "Failed to delete log" });
    }
  });

  // Manual send reminder (bypass idempotency)
  app.post("/api/admin/reminders/send-now", requireAdmin, async (req, res) => {
    try {
      const { appointmentType, appointmentId, reminderType, channel } = req.body;
      
      // Fetch the appointment data based on type
      let appointment: any;
      let reminderData: any;
      
      if (appointmentType === 'inspection') {
        const inspections = await storage.getInspectionSchedules();
        appointment = inspections.find(i => i.id === appointmentId);
        if (appointment) {
          reminderData = {
            appointmentType: 'inspection',
            appointmentId: appointment.id,
            customerName: `${appointment.firstName} ${appointment.lastName}`,
            email: appointment.email,
            phone: appointment.phone,
            serviceType: appointment.serviceType,
            appointmentDate: new Date(appointment.preferredDate),
            appointmentTime: appointment.preferredTime,
            address: appointment.address,
            city: appointment.city,
          };
        }
      } else if (appointmentType === 'service_request') {
        const srs = await storage.getServiceRequests();
        appointment = srs.find(sr => sr.id === appointmentId);
        if (appointment) {
          const user = await storage.getUser(appointment.userId);
          reminderData = {
            appointmentType: 'service_request',
            appointmentId: appointment.id,
            customerName: `${appointment.firstName} ${appointment.lastName}`,
            email: user?.email || '',
            phone: user?.phone,
            serviceType: appointment.serviceType,
            appointmentDate: new Date(appointment.scheduledDate || new Date()),
            address: appointment.address,
            city: appointment.city,
          };
        }
      } else if (appointmentType === 'job_log') {
        const jobLogs = await db.select().from(jobLogsTable).where(eq(jobLogsTable.id, appointmentId));
        appointment = jobLogs[0];
        if (appointment) {
          const client = appointment.clientId ? await storage.getClient(appointment.clientId) : null;
          reminderData = {
            appointmentType: 'job_log',
            appointmentId: appointment.id,
            customerName: appointment.customerName,
            email: client?.email || '',
            phone: client?.phone,
            serviceType: appointment.workPerformed,
            appointmentDate: new Date(appointment.jobDate),
            address: appointment.siteAddress || appointment.siteLocation,
            city: '',
          };
        }
      }
      
      if (!reminderData) {
        return res.status(404).json({ success: false, message: "Appointment not found" });
      }

      let success = false;
      
      if (channel === 'email' || !channel) {
        const { sendAppointmentReminderEmail } = await import("./email");
        success = await sendAppointmentReminderEmail({
          recipientEmail: reminderData.email,
          customerName: reminderData.customerName,
          serviceType: reminderData.serviceType,
          appointmentDate: reminderData.appointmentDate,
          appointmentTime: reminderData.appointmentTime,
          address: reminderData.address,
          city: reminderData.city,
          reminderType: reminderType || '24h',
        });
      } else if (channel === 'sms') {
        const { sendAppointmentReminderSMS } = await import("./sms");
        success = await sendAppointmentReminderSMS({
          toPhone: reminderData.phone || '',
          customerName: reminderData.customerName,
          serviceType: reminderData.serviceType,
          appointmentDate: reminderData.appointmentDate,
          appointmentTime: reminderData.appointmentTime,
          address: reminderData.address,
          reminderType: reminderType || '24h',
        });
      }
      
      // Log the manual send
      await storage.createReminderLog({
        appointmentType,
        appointmentId,
        reminderType: reminderType || '24h',
        channel: channel || 'email',
        recipientEmail: channel === 'sms' ? undefined : reminderData.email,
        recipientPhone: channel === 'sms' ? reminderData.phone : undefined,
        success,
        errorMessage: success ? undefined : 'Manual send failed',
      });
      
      res.json({ success, message: success ? "Reminder sent" : "Failed to send reminder" });
    } catch (error) {
      console.error("Error sending manual reminder:", error);
      res.status(500).json({ success: false, message: "Failed to send reminder" });
    }
  });

  // Get opt-out list
  app.get("/api/admin/reminders/opt-outs", requireAdmin, async (req, res) => {
    try {
      const optOuts = await storage.getReminderOptOuts();
      res.json({ success: true, optOuts });
    } catch (error) {
      console.error("Error fetching opt-outs:", error);
      res.status(500).json({ success: false, message: "Failed to fetch opt-outs" });
    }
  });

  // Delete opt-out (re-enable customer)
  app.delete("/api/admin/reminders/opt-outs/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteReminderOptOut(id);
      res.json({ success: true, message: "Opt-out removed" });
    } catch (error) {
      console.error("Error deleting opt-out:", error);
      res.status(500).json({ success: false, message: "Failed to delete opt-out" });
    }
  });

  // ============================================
  // Review Request Routes (SC-REVIEWS-001)
  // ============================================

  // Get review settings
  app.get("/api/admin/reviews/settings", requireAdmin, async (req, res) => {
    try {
      const settings = await storage.getReviewSettings();
      res.json({ success: true, settings });
    } catch (error) {
      console.error("Error fetching review settings:", error);
      res.status(500).json({ success: false, message: "Failed to fetch review settings" });
    }
  });

  // Update review settings
  app.patch("/api/admin/reviews/settings", requireAdmin, async (req, res) => {
    try {
      const updates = req.body;
      const settings = await storage.updateReviewSettings(updates);
      res.json({ success: true, settings });
    } catch (error) {
      console.error("Error updating review settings:", error);
      res.status(500).json({ success: false, message: "Failed to update review settings" });
    }
  });

  // Get review request logs
  app.get("/api/admin/reviews/logs", requireAdmin, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      const status = req.query.status as string || undefined;
      const clientId = req.query.clientId ? parseInt(req.query.clientId as string) : undefined;
      
      const result = await storage.getReviewRequestLogs({ limit, offset, status, clientId });
      res.json({ success: true, logs: result.logs, total: result.total });
    } catch (error) {
      console.error("Error fetching review request logs:", error);
      res.status(500).json({ success: false, message: "Failed to fetch review request logs" });
    }
  });

  // Delete review request log (allow re-send)
  app.delete("/api/admin/reviews/logs/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteReviewRequestLog(id);
      res.json({ success: true, message: "Review request log deleted" });
    } catch (error) {
      console.error("Error deleting review request log:", error);
      res.status(500).json({ success: false, message: "Failed to delete review request log" });
    }
  });

  // Manually trigger review request for a job log
  app.post("/api/admin/reviews/send-now/:jobLogId", requireAdmin, async (req, res) => {
    try {
      const jobLogId = parseInt(req.params.jobLogId);
      const result = await sendReviewRequestNow(jobLogId);
      res.json(result);
    } catch (error) {
      console.error("Error sending manual review request:", error);
      res.status(500).json({ success: false, message: "Failed to send review request" });
    }
  });

  // Toggle client review opt-out
  app.patch("/api/admin/clients/:id/review-opt-out", requireAdmin, async (req, res) => {
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

  // Public unsubscribe endpoint
  app.get("/api/reminders/unsubscribe", async (req, res) => {
    try {
      const { token } = req.query;
      if (!token) {
        return res.status(400).json({ success: false, message: "Token required" });
      }
      
      const optOut = await storage.getReminderOptOutByToken(token as string);
      if (!optOut) {
        return res.status(404).json({ success: false, message: "Invalid token" });
      }
      
      // Render unsubscribe confirmation page
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
      
      res.setHeader('Content-Type', 'text/html');
      res.send(html);
    } catch (error) {
      console.error("Error processing unsubscribe:", error);
      res.status(500).json({ success: false, message: "Failed to process unsubscribe" });
    }
  });

  // API endpoint to handle unsubscribe (JSON response)
  app.post("/api/reminders/unsubscribe", async (req, res) => {
    try {
      const { email, phone, optOutType } = req.body;
      
      if (!email && !phone) {
        return res.status(400).json({ success: false, message: "Email or phone required" });
      }
      
      const token = require('uuid').v4();
      
      await storage.createReminderOptOut({
        email,
        phone,
        optOutType: optOutType || 'all',
        token,
      });
      
      res.json({ success: true, message: "Successfully unsubscribed", token });
    } catch (error) {
      console.error("Error creating opt-out:", error);
      res.status(500).json({ success: false, message: "Failed to unsubscribe" });
    }
  });

  // ==========================================
  // Route Optimization API (SC-ROUTE-001)
  // ==========================================

  // Helper: Geocode address using Google Geocoding API
  async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
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

      if (data.status === 'OK' && data.results.length > 0) {
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

  // Helper: Get or create geocache entry
  async function getOrCreateGeocache(address: string): Promise<{ lat: number; lng: number; cached: boolean }> {
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
        source: 'google',
      });
      return { ...coords, cached: false };
    }

    return { lat: 0, lng: 0, cached: false };
  }

  // Helper: Call Google Routes API to optimize route
  async function optimizeRouteWithGoogle(
    origin: string,
    destination: string,
    waypoints: Array<{ address: string; jobLogId: number; customerName: string }>,
    startTime?: string
  ): Promise<{ stops: RouteStop[]; totalDistanceMeters: number; totalDurationSeconds: number; googleMapsUrl: string } | null> {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.error("Google Maps API key not configured");
      return null;
    }

    if (waypoints.length === 0) {
      return null;
    }

    // Build the request for Google Routes API
    const requestBody: any = {
      origin: { address: origin },
      destination: { address: destination },
      intermediates: waypoints.map(wp => ({ address: wp.address })),
      travelMode: "DRIVE",
      optimizeWaypointOrder: true,
      departureTime: startTime || new Date().toISOString(),
      routingPreference: "TRAFFIC_AWARE",
    };

    try {
      const response = await fetch(
        `https://routes.googleapis.com/v2:computeRoutes?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters,routes.legs,routes.optimizedIntermediateWaypointIndexOrder',
          },
          body: JSON.stringify(requestBody),
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

      // Extract optimized waypoint order
      const optimizedOrder = route.optimizedIntermediateWaypointIndexOrder || [];
      
      // Helper to parse duration string like "3600s" to seconds
      const parseDuration = (duration: string | undefined): number => {
        if (!duration) return 0;
        const match = duration.match(/^(\d+)s$/);
        return match ? parseInt(match[1], 10) : 0;
      };
      
      // Build stops in optimized order
      const stops: RouteStop[] = [];
      let cumulativeDuration = 0;

      // First leg is from origin to first waypoint
      const legs = route.legs || [];
      
      for (let i = 0; i < waypoints.length; i++) {
        const waypointIndex = optimizedOrder[i];
        const waypoint = waypoints[waypointIndex];
        const leg = legs[i];
        
        if (!leg || !waypoint) continue;

        // Parse duration from string format (e.g., "3600s")
        const legDurationSeconds = parseDuration(leg.duration);
        cumulativeDuration += legDurationSeconds;
        
        // Estimate arrival time
        const arrivalTime = startTime 
          ? new Date(new Date(startTime).getTime() + cumulativeDuration * 1000).toISOString()
          : null;

        stops.push({
          sequence: i + 1,
          jobLogId: waypoint.jobLogId,
          customerName: waypoint.customerName,
          address: waypoint.address,
          estimatedArrival: arrivalTime,
          driveDurationSeconds: legDurationSeconds,
          lat: leg.endLocation?.latLng?.latitude || 0,
          lng: leg.endLocation?.latLng?.longitude || 0,
        });
      }

      // Build Google Maps URL using optimized stop order (stops, not waypoints)
      const stopsForUrl = stops.slice(0, -1); // Exclude last stop as it's the return to start
      const waypointStr = stopsForUrl.map(s => encodeURIComponent(s.address)).join('|');
      const mapsUrl = waypointStr 
        ? `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&waypoints=${waypointStr}&travelmode=driving`
        : `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&travelmode=driving`;

      // Parse total duration from string format (e.g., "3600s")
      const totalDurationSeconds = parseDuration(route.duration);

      return {
        stops,
        totalDistanceMeters: route.distanceMeters || 0,
        totalDurationSeconds,
        googleMapsUrl: mapsUrl,
      };
    } catch (error) {
      console.error("Error calling Google Routes API:", error);
      return null;
    }
  }

  // GET /api/admin/routes/jobs - Get qualifying job logs for route
  app.get("/api/admin/routes/jobs", requireAdmin, async (req, res) => {
    try {
      const employeeId = parseInt(req.query.employeeId as string);
      const dateStr = req.query.date as string;

      if (!employeeId || !dateStr) {
        return res.status(400).json({ success: false, message: "employeeId and date required" });
      }

      const routeDate = new Date(dateStr);
      const jobLogs = await storage.getJobLogsForRoute(employeeId, routeDate);

      // Get geocode status for each job
      const jobsWithGeocode = await Promise.all(
        jobLogs.map(async (job) => {
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
            lng: geocodeData?.lng || null,
          };
        })
      );

      res.json({ success: true, jobs: jobsWithGeocode });
    } catch (error) {
      console.error("Error fetching jobs for route:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });

  // POST /api/admin/routes/optimize - Generate optimized route
  app.post("/api/admin/routes/optimize", requireAdmin, async (req, res) => {
    try {
      const { employeeId, date, startAddress, jobIds } = req.body;

      if (!employeeId || !date || !startAddress) {
        return res.status(400).json({ success: false, message: "employeeId, date, and startAddress required" });
      }

      const routeDate = new Date(date);
      let jobLogs = await storage.getJobLogsForRoute(employeeId, routeDate);

      // Filter by jobIds if provided
      if (jobIds && Array.isArray(jobIds) && jobIds.length > 0) {
        jobLogs = jobLogs.filter(job => jobIds.includes(job.id));
      }

      // Filter jobs that have geocodable addresses
      const geocodableJobs = jobLogs.filter(job => job.siteAddress);
      
      if (geocodableJobs.length === 0) {
        return res.status(400).json({ success: false, message: "No jobs with geocodable addresses found" });
      }

      // Get geocodes for all addresses
      const waypoints: Array<{ address: string; jobLogId: number; customerName: string }> = [];
      for (const job of geocodableJobs) {
        if (!job.siteAddress) continue;
        const geocodeData = await getOrCreateGeocache(job.siteAddress);
        if (geocodeData && geocodeData.lat && geocodeData.lng) {
          waypoints.push({
            address: job.siteAddress,
            jobLogId: job.id,
            customerName: job.customerName,
          });
        }
      }

      if (waypoints.length === 0) {
        return res.status(400).json({ success: false, message: "No jobs could be geocoded" });
      }

      // Determine destination (last stop goes back to start for pest control routes)
      const destination = startAddress;

      // Optimize route with Google Routes API
      const optimized = await optimizeRouteWithGoogle(startAddress, destination, waypoints);
      
      if (!optimized) {
        return res.status(500).json({ success: false, message: "Failed to optimize route with Google" });
      }

      // Save the route
      const route = await storage.createOrUpdateDailyRoute({
        employeeId,
        routeDate: routeDate.toISOString().split('T')[0],
        startAddress,
        optimizedStopOrder: optimized.stops,
        googleMapsUrl: optimized.googleMapsUrl,
        totalDistanceMeters: optimized.totalDistanceMeters,
        totalDurationSeconds: optimized.totalDurationSeconds,
        generatedBy: req.session.userId,
      });

      res.json({ 
        success: true, 
        route: {
          ...route,
          optimizedStopOrder: JSON.parse(JSON.stringify(route.optimizedStopOrder)),
        },
        googleMapsUrl: optimized.googleMapsUrl,
      });
    } catch (error) {
      console.error("Error optimizing route:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });

  // GET /api/admin/routes/saved - Get saved route
  app.get("/api/admin/routes/saved", requireAdmin, async (req, res) => {
    try {
      const employeeId = parseInt(req.query.employeeId as string);
      const dateStr = req.query.date as string;

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
          optimizedStopOrder: JSON.parse(JSON.stringify(route.optimizedStopOrder)),
        },
      });
    } catch (error) {
      console.error("Error fetching saved route:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });

  // PUT /api/admin/routes/saved/:id - Update saved route (manual reorder)
  app.put("/api/admin/routes/saved/:id", requireAdmin, async (req, res) => {
    try {
      const routeId = parseInt(req.params.id);
      const { optimizedStopOrder, googleMapsUrl } = req.body;

      if (!optimizedStopOrder) {
        return res.status(400).json({ success: false, message: "optimizedStopOrder required" });
      }

      // Get existing route
      const [existing] = await db
        .select()
        .from(dailyRoutes)
        .where(eq(dailyRoutes.id, routeId));

      if (!existing) {
        return res.status(404).json({ success: false, message: "Route not found" });
      }

      // Update the route
      const [updated] = await db
        .update(dailyRoutes)
        .set({
          optimizedStopOrder,
          googleMapsUrl: googleMapsUrl || existing.googleMapsUrl,
          generatedAt: new Date(),
        })
        .where(eq(dailyRoutes.id, routeId))
        .returning();

      res.json({ 
        success: true, 
        route: {
          ...updated,
          optimizedStopOrder: JSON.parse(JSON.stringify(updated.optimizedStopOrder)),
        },
      });
    } catch (error) {
      console.error("Error updating saved route:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });

  // GET /api/field/route/today - Get today's route for field tech
  app.get("/api/field/route/today", requireFieldAuth, async (req, res) => {
    try {
      const employeeId = req.session.fieldEmployeeId!;
      const today = new Date();

      const route = await storage.getDailyRoute(employeeId, today);

      if (!route) {
        return res.json({ success: true, route: null, message: "No route generated for today" });
      }

      res.json({ 
        success: true, 
        route: {
          ...route,
          optimizedStopOrder: JSON.parse(JSON.stringify(route.optimizedStopOrder)),
        },
      });
    } catch (error) {
      console.error("Error fetching today's route:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });

  // ==========================================
  // Customer Portal Routes (SC-PORT-001)
  // ==========================================

  // Portal middleware - ensure user is not admin
  const requirePortalUser = async (req: any, res: any, next: any) => {
    if (!req.session.userId) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }
    
    try {
      const user = await storage.getUser(req.session.userId);
      if (!user || user.role === 'admin') {
        return res.status(403).json({ success: false, message: "Customer portal access required" });
      }
      next();
    } catch (error) {
      console.error("Error checking portal access:", error);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  };

  // GET /api/portal/summary - Dashboard summary for customer
  app.get("/api/portal/summary", requirePortalUser, async (req, res) => {
    try {
      const userId = req.session.userId!;
      
      // Get user's service requests and inspections
      const serviceRequests = await storage.getServiceRequestsByUser(userId);
      const inspections = await storage.getInspectionSchedulesByUser(userId);
      
      // Get upcoming appointments (scheduled but not completed)
      const upcomingAppointments = [
        ...serviceRequests.filter(sr => sr.status === 'scheduled' || sr.status === 'in-progress'),
        ...inspections.filter(ins => ins.status === 'scheduled' || ins.status === 'pending')
      ];
      
      // Get completed this year
      const startOfYear = new Date(new Date().getFullYear(), 0, 1);
      const completedThisYear = [
        ...serviceRequests.filter(sr => sr.status === 'completed' && sr.completedDate && new Date(sr.completedDate) >= startOfYear),
        ...inspections.filter(ins => ins.status === 'completed' && ins.createdAt >= startOfYear)
      ];
      
      // Open requests
      const openRequests = serviceRequests.filter(sr => sr.status === 'pending');
      
      // Get invoices for this user via their linked client
      const user = await storage.getUser(userId);
      let outstandingBalance = "0.00";
      let hasOverdue = false;
      
      if (user) {
        const clients = await storage.getClients();
        const client = clients.find(c => c.userId === userId);
        if (client) {
          const allInvoices = await storage.listInvoices({ clientId: client.id });
          const unpaidInvoices = allInvoices.filter(inv => 
            inv.status === 'sent' || inv.status === 'viewed' || inv.status === 'overdue'
          );
          outstandingBalance = unpaidInvoices.reduce((sum, inv) => sum + parseFloat(String(inv.total)), 0).toFixed(2);
          hasOverdue = unpaidInvoices.some(inv => inv.status === 'overdue');
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

  // GET /api/portal/appointments - All appointments (inspections + service requests)
  app.get("/api/portal/appointments", requirePortalUser, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const { status, type, search } = req.query;
      
      const [inspections, serviceRequests] = await Promise.all([
        storage.getInspectionSchedulesByUser(userId),
        storage.getServiceRequestsByUser(userId)
      ]);
      
      // Transform into unified appointment format
      let appointments = [
        ...inspections.map(ins => ({
          id: ins.id,
          type: 'inspection' as const,
          serviceType: ins.serviceType,
          address: ins.address,
          city: ins.city,
          date: ins.preferredDate,
          time: ins.preferredTime,
          status: ins.status,
          urgency: ins.urgency,
          description: ins.message || '',
          createdAt: ins.createdAt,
          scheduledDate: null,
          completedDate: null,
          estimatedCost: null,
          finalCost: null,
          technicianNotes: null
        })),
        ...serviceRequests.map(sr => ({
          id: sr.id,
          type: 'service' as const,
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
      
      // Filter by status
      if (status) {
        appointments = appointments.filter(apt => apt.status === status);
      }
      
      // Filter by type
      if (type) {
        appointments = appointments.filter(apt => apt.type === type);
      }
      
      // Filter by search (address or service type)
      if (search) {
        const searchLower = (search as string).toLowerCase();
        appointments = appointments.filter(apt => 
          apt.address.toLowerCase().includes(searchLower) ||
          apt.serviceType.toLowerCase().includes(searchLower)
        );
      }
      
      // Sort by date descending (most recent first)
      appointments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      res.json({ success: true, appointments });
    } catch (error) {
      console.error("Error fetching portal appointments:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });

  // GET /api/portal/appointments/:id - Single appointment detail
  app.get("/api/portal/appointments/:id", requirePortalUser, async (req, res) => {
    try {
      const { id } = req.params;
      const { type } = req.query; // 'inspection' or 'service'
      const userId = req.session.userId!;
      
      if (!type || (type !== 'inspection' && type !== 'service')) {
        return res.status(400).json({ success: false, message: "Invalid or missing type parameter" });
      }
      
      let appointment;
      
      if (type === 'inspection') {
        const inspections = await storage.getInspectionSchedulesByUser(userId);
        appointment = inspections.find(ins => ins.id === parseInt(id));
        if (appointment) {
          appointment = { ...appointment, appointmentType: 'inspection' };
        }
      } else {
        const serviceRequests = await storage.getServiceRequestsByUser(userId);
        appointment = serviceRequests.find(sr => sr.id === parseInt(id));
        if (appointment) {
          appointment = { ...appointment, appointmentType: 'service' };
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

  // POST /api/portal/appointments - Create new inspection/appointment request
  app.post("/api/portal/appointments", requirePortalUser, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
      
      const { serviceType, preferredDate, preferredTime, urgency, address, city, message } = req.body;
      
      // Validate required fields
      if (!serviceType || !preferredDate || !preferredTime || !urgency || !address || !city) {
        return res.status(400).json({ success: false, message: "Missing required fields" });
      }
      
      // Validate date is not in the past (at least tomorrow)
      const requestedDate = new Date(preferredDate);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      if (requestedDate < tomorrow) {
        return res.status(400).json({ success: false, message: "Appointments must be scheduled at least 1 day in advance" });
      }
      
      // Create inspection schedule
      const inspection = await storage.createInspectionSchedule({
        userId,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone || '',
        email: user.email,
        address,
        city,
        serviceType,
        preferredDate: requestedDate,
        preferredTime,
        urgency,
        message: message || null
      });
      
      // Send email confirmation to customer
      await sendInspectionScheduleEmail({
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone || '',
        email: user.email,
        address,
        city,
        serviceType,
        preferredDate: requestedDate,
        preferredTime,
        urgency,
        message: message || ""
      });
      
      // Also create/update prospect for admin
      try {
        await storage.createOrUpdateProspect({
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          phone: user.phone || undefined,
          address,
          notes: `Inspection Request (Portal) - Service: ${serviceType}\nPreferred: ${requestedDate.toLocaleDateString()} ${preferredTime}\nUrgency: ${urgency}`,
          serviceType,
        });
      } catch (prospectError) {
        console.error("Failed to create/update prospect:", prospectError);
      }
      
      res.json({
        success: true,
        message: "Appointment scheduled successfully",
        appointment: { ...inspection, type: 'inspection' }
      });
    } catch (error) {
      console.error("Error creating portal appointment:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });

  // GET /api/portal/service-requests - List service requests
  app.get("/api/portal/service-requests", requirePortalUser, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const serviceRequests = await storage.getServiceRequestsByUser(userId);
      res.json({ success: true, serviceRequests });
    } catch (error) {
      console.error("Error fetching portal service requests:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });

  // POST /api/portal/service-requests - Create new service request
  app.post("/api/portal/service-requests", requirePortalUser, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
      
      const { serviceType, description, address, city, priority } = req.body;
      
      // Validate required fields
      if (!serviceType || !description || !address || !city || !priority) {
        return res.status(400).json({ success: false, message: "Missing required fields" });
      }
      
      // Check for duplicate open request of same type at same address
      const existingRequests = await storage.getServiceRequestsByUser(userId);
      const duplicate = existingRequests.find(req => 
        req.serviceType === serviceType && 
        req.address.toLowerCase() === address.toLowerCase() &&
        (req.status === 'pending' || req.status === 'scheduled')
      );
      
      // Create service request
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
      
      // Send email notification
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
      
      // Also create/update prospect
      try {
        await storage.createOrUpdateProspect({
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          phone: user.phone || undefined,
          address,
          notes: `Service Request (Portal) - Service: ${serviceType}\nPriority: ${priority}\nDescription: ${description}`,
          serviceType,
        });
      } catch (prospectError) {
        console.error("Failed to create/update prospect:", prospectError);
      }
      
      res.json({
        success: true,
        message: duplicate 
          ? "Service request submitted. Note: You have an existing open request for this service at this address."
          : "Service request submitted successfully",
        serviceRequest,
        duplicateWarning: duplicate ? true : false
      });
    } catch (error) {
      console.error("Error creating portal service request:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });

  // GET /api/portal/profile - Get current user profile
  app.get("/api/portal/profile", requirePortalUser, async (req, res) => {
    try {
      const userId = req.session.userId!;
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

  // PUT /api/portal/profile - Update user profile
  app.put("/api/portal/profile", requirePortalUser, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const { firstName, lastName, phone, address } = req.body;
      
      const updates: any = {};
      if (firstName) updates.firstName = firstName;
      if (lastName) updates.lastName = lastName;
      if (phone !== undefined) updates.phone = phone;
      if (address !== undefined) updates.address = address;
      
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

  // ==========================================
  // Invoice Portal Routes (Phase 2 - stub for now)
  // ==========================================
  
  // GET /api/portal/invoices - List invoices for the customer
  app.get("/api/portal/invoices", requirePortalUser, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
      
      // Find client linked to this user
      const clients = await storage.getClients();
      const client = clients.find(c => c.userId === userId);
      
      if (!client) {
        return res.json({ success: true, invoices: [] });
      }
      
      // Get invoices for this client (exclude draft and void)
      const allInvoices = await storage.listInvoices({ clientId: client.id });
      const visibleInvoices = allInvoices.filter(inv => 
        inv.status !== 'draft' && inv.status !== 'void'
      );
      
      // Sort: overdue first, then pending by due date, then paid (most recent)
      visibleInvoices.sort((a, b) => {
        if (a.status === 'overdue' && b.status !== 'overdue') return -1;
        if (b.status === 'overdue' && a.status !== 'overdue') return 1;
        if (a.status === 'paid' && b.status !== 'paid') return 1;
        if (b.status === 'paid' && a.status !== 'paid') return -1;
        if (a.status !== 'paid' && b.status !== 'paid') {
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

  // GET /api/portal/invoices/:id - Get invoice detail
  app.get("/api/portal/invoices/:id", requirePortalUser, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.session.userId!;
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
      
      // Verify user has access to this invoice
      const clients = await storage.getClients();
      const client = clients.find(c => c.userId === userId);
      
      if (!client) {
        return res.status(403).json({ success: false, message: "No client account linked" });
      }
      
      const invoice = await storage.getInvoice(parseInt(id));
      
      if (!invoice || invoice.clientId !== client.id) {
        return res.status(404).json({ success: false, message: "Invoice not found" });
      }
      
      // If invoice is 'sent', mark as 'viewed'
      if (invoice.status === 'sent') {
        await storage.updateInvoiceStatus(invoice.id, 'viewed', 'customer', 'Customer viewed in portal');
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

  // GET /api/portal/invoices/:id/pdf - Download invoice PDF
  app.get("/api/portal/invoices/:id/pdf", requirePortalUser, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.session.userId!;
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
      
      const clients = await storage.getClients();
      const client = clients.find(c => c.userId === userId);
      
      if (!client) {
        return res.status(403).json({ success: false, message: "No client account linked" });
      }
      
      const invoice = await storage.getInvoice(parseInt(id));
      
      if (!invoice || invoice.clientId !== client.id) {
        return res.status(404).json({ success: false, message: "Invoice not found" });
      }
      
      // Check if PDF exists
      if (!invoice.pdfUrl) {
        return res.status(404).json({ success: false, message: "PDF not available" });
      }
      
      // Redirect to PDF URL
      res.redirect(invoice.pdfUrl);
    } catch (error) {
      console.error("Error downloading portal invoice PDF:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });

  // ==========================================
  // Admin Job Scheduling Routes (SC-SCHEDULING-001)
  // ==========================================

  // GET /api/admin/scheduled-jobs - List scheduled jobs (admin)
  app.get("/api/admin/scheduled-jobs", requireAdmin, async (req, res) => {
    try {
      const filters: any = {};
      if (req.query.employeeId) filters.employeeId = parseInt(req.query.employeeId as string);
      if (req.query.dateFrom) filters.dateFrom = new Date(req.query.dateFrom as string);
      if (req.query.dateTo) filters.dateTo = new Date(req.query.dateTo as string);
      if (req.query.status) filters.status = req.query.status as string;

      const jobs = await storage.getScheduledJobs(filters);
      
      // Fetch employee names for each job
      const employeeIds = [...new Set(jobs.map(j => j.employeeId))];
      const employees = await storage.getFieldEmployees();
      const employeeMap = new Map(employees.map(e => [e.id, e.name]));

      // Fetch client propertyType for each job that has a clientId
      const allClients = await storage.getClients();
      const clientPropertyMap = new Map(allClients.map(c => [c.id, c.propertyType ?? "residential"]));

      const jobsWithEmployees = jobs.map(job => ({
        ...job,
        employeeName: job.employeeId ? (employeeMap.get(job.employeeId) || "Unknown") : "Unassigned",
        propertyType: job.clientId ? (clientPropertyMap.get(job.clientId) ?? "residential") : "residential",
      }));

      res.json({ success: true, scheduledJobs: jobsWithEmployees });
    } catch (error) {
      console.error("Error fetching scheduled jobs:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });

  // GET /api/admin/scheduled-jobs/:id - Get single scheduled job with logs
  app.get("/api/admin/scheduled-jobs/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const job = await storage.getJobLog(id);
      
      if (!job) {
        return res.status(404).json({ success: false, message: "Job not found" });
      }

      const employees = await storage.getFieldEmployees();
      const employeeMap = new Map(employees.map(e => [e.id, e.name]));
      
      const scheduleLogs = await storage.getJobScheduleLogs(id);

      res.json({ 
        success: true, 
        job: {
          ...job,
          employeeName: job.employeeId ? (employeeMap.get(job.employeeId) || "Unknown") : "Unassigned",
        },
        scheduleLogs 
      });
    } catch (error) {
      console.error("Error fetching scheduled job:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });

  // POST /api/admin/scheduled-jobs - Create new scheduled job
  app.post("/api/admin/scheduled-jobs", requireAdmin, async (req, res) => {
    try {
      const { customerName, clientId, siteLocation, siteAddress, servicedArea, workPerformed, jobDate, employeeId, priority, adminNotes, scheduledEndTime, propertyType } = req.body;

      // employeeId is optional - if not provided or null, job will be unassigned
      if (!customerName || !siteLocation || !servicedArea || !jobDate) {
        return res.status(400).json({ success: false, message: "Missing required fields: customerName, siteLocation, servicedArea, jobDate" });
      }

      // If new customer (no clientId) and propertyType was given, create a client record
      let resolvedClientId = clientId || null;
      if (!clientId && propertyType && customerName) {
        try {
          const newClient = await storage.createClient({ name: customerName, propertyType, clientType: "prospect", status: "active" });
          resolvedClientId = newClient.id;
        } catch { /* non-fatal */ }
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
        scheduledBy: req.session.userId!,
        scheduledEndTime: scheduledEndTime ? new Date(scheduledEndTime) : null,
      });

      res.json({ success: true, message: "Scheduled job created", job });
    } catch (error) {
      console.error("Error creating scheduled job:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });

  // PATCH /api/admin/scheduled-jobs/:id - Update scheduled job (priority, notes, etc)
  app.patch("/api/admin/scheduled-jobs/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { priority, adminNotes, scheduledEndTime, employeeId, jobDate } = req.body;

      const updates: any = {};
      if (priority !== undefined) updates.priority = priority;
      if (adminNotes !== undefined) updates.adminNotes = adminNotes;
      if (scheduledEndTime !== undefined) updates.scheduledEndTime = scheduledEndTime ? new Date(scheduledEndTime) : null;
      if (employeeId !== undefined) updates.employeeId = employeeId;
      if (jobDate !== undefined) updates.jobDate = new Date(jobDate);

      const job = await storage.updateJobScheduling(id, updates, req.session.userId!);
      res.json({ success: true, message: "Job updated", job });
    } catch (error) {
      console.error("Error updating scheduled job:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });

  // POST /api/admin/scheduled-jobs/:id/assign - Assign job to different tech
  app.post("/api/admin/scheduled-jobs/:id/assign", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);

      // null = unassign, number = assign. Must explicitly pass the key.
      if (!req.body.hasOwnProperty('employeeId')) {
        return res.status(400).json({ success: false, message: 'employeeId is required (use null to unassign)' });
      }
      const assignTo = req.body.employeeId !== undefined ? (req.body.employeeId || null) : null;
      const job = await storage.assignJobToTech(id, assignTo, req.session.userId!);

      res.json({ success: true, message: assignTo === null ? "Job unassigned" : "Job assigned to tech", job });
    } catch (error) {
      console.error("Error assigning job:", error);
      if (error instanceof Error) {
        return res.status(400).json({ success: false, message: error.message });
      }
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });

  // POST /api/admin/scheduled-jobs/:id/reschedule - Reschedule job
  app.post("/api/admin/scheduled-jobs/:id/reschedule", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { jobDate, scheduledEndTime } = req.body;

      if (!jobDate) {
        return res.status(400).json({ success: false, message: "jobDate is required" });
      }

      const job = await storage.rescheduleJob(id, new Date(jobDate), req.session.userId!);
      
      // Also update scheduledEndTime if provided
      if (scheduledEndTime) {
        await storage.updateJobScheduling(id, { scheduledEndTime: new Date(scheduledEndTime) }, req.session.userId!);
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

  // POST /api/admin/scheduled-jobs/:id/cancel - Cancel scheduled job
  app.post("/api/admin/scheduled-jobs/:id/cancel", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { reason } = req.body;

      const existingJob = await storage.getJobLogById(id);
      const oldStatus = existingJob?.status || "scheduled";
      const job = await storage.cancelScheduledJob(id, req.session.userId!, reason);
      notifyJobStatusChange(job, oldStatus, "cancelled").catch(err => {
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

  // GET /api/admin/scheduled-jobs/:id/logs - Get schedule audit logs
  app.get("/api/admin/scheduled-jobs/:id/logs", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const logs = await storage.getJobScheduleLogs(id);
      res.json({ success: true, logs });
    } catch (error) {
      console.error("Error fetching schedule logs:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });

  // ==========================================
  // Field Service - Scheduled Jobs Routes (SC-SCHEDULING-001)
  // ==========================================

  // GET /api/field/scheduled-jobs - Get today's scheduled jobs for field tech
  app.get("/api/field/scheduled-jobs", requireFieldAuth, async (req, res) => {
    try {
      const employeeId = req.session.fieldEmployeeId!;
      const jobs = await storage.getTodaysScheduledJobs(employeeId);
      res.json({ success: true, scheduledJobs: jobs });
    } catch (error) {
      console.error("Error fetching today's scheduled jobs:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });

  // POST /api/field/scheduled-jobs/:id/start - Start a scheduled job
  app.post("/api/field/scheduled-jobs/:id/start", requireFieldAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const employeeId = req.session.fieldEmployeeId!;

      const existingJob = await storage.getJobLogById(id);
      const oldStatus = existingJob?.status || "scheduled";
      const job = await storage.startScheduledJob(id, employeeId);
      notifyJobStatusChange(job, oldStatus, "in_progress").catch(err => {
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

  // POST /api/field/scheduled-jobs/:id/complete - Complete a scheduled job
  app.post("/api/field/scheduled-jobs/:id/complete", requireFieldAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const employeeId = req.session.fieldEmployeeId!;
      const { workPerformed } = req.body;

      if (!workPerformed) {
        return res.status(400).json({ success: false, message: "workPerformed is required" });
      }

      const existingJob = await storage.getJobLogById(id);
      const oldStatus = existingJob?.status || "in_progress";
      const job = await storage.completeScheduledJob(id, employeeId, workPerformed);
      notifyJobStatusChange(job, oldStatus, "completed").catch(err => {
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

  // GET /api/field/jobs/unassigned - Get unassigned scheduled jobs
  app.get("/api/field/jobs/unassigned", requireFieldAuth, async (req, res) => {
    try {
      const filters: any = {};
      if (req.query.dateFrom) filters.dateFrom = new Date(req.query.dateFrom as string);
      if (req.query.dateTo) filters.dateTo = new Date(req.query.dateTo as string);
      if (req.query.status) filters.status = req.query.status as string;

      const jobs = await storage.getUnassignedScheduledJobs(filters);
      res.json({ success: true, jobs });
    } catch (error) {
      console.error("Error fetching unassigned jobs:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });

  // POST /api/field/jobs/:id/claim - Claim an unassigned scheduled job
  app.post("/api/field/jobs/:id/claim", requireFieldAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const employeeId = req.session.fieldEmployeeId!;

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

  // ==========================================
  // Offline Mode Routes (SC-OFFLINE-001)
  // ==========================================

  // Heartbeat endpoint - no auth required
  app.get("/api/ping", (req, res) => {
    res.json({ ok: true, timestamp: new Date().toISOString() });
  });

  // Batch sync endpoint for offline job logs
  app.post("/api/field/sync", requireFieldAuth, async (req, res) => {
    try {
      const { jobLogs, clientTimestamp } = req.body;
      const employeeId = req.session.fieldEmployeeId!;

      if (!Array.isArray(jobLogs) || jobLogs.length === 0) {
        return res.status(400).json({ success: false, message: "No job logs provided" });
      }

      const results = [];
      const now = new Date();

      for (const log of jobLogs) {
        try {
          // Check for duplicate by localId
          const existingLogs = await storage.getJobLogs({ employeeId });
          const existing = existingLogs.find((l) => (l as any).localId === log.localId);

          if (existing) {
            // Duplicate - return existing server ID
            results.push({
              localId: log.localId,
              serverId: existing.id,
              status: "already_synced"
            });
            continue;
          }

          // Parse client timestamp for clock skew check
          const clientCreatedAt = log.clientCreatedAt ? new Date(log.clientCreatedAt) : now;
          const hoursDiff = Math.abs(now.getTime() - clientCreatedAt.getTime()) / (1000 * 60 * 60);
          const needsAdminReview = hoursDiff > 48;

          let resolvedClientId = log.clientId || null;
          if (!resolvedClientId && log.customerName) {
            const existingClients = await storage.getClients();
            const match = existingClients.find(
              (c: any) => c.name.toLowerCase().trim() === log.customerName.toLowerCase().trim()
            );
            if (match) {
              resolvedClientId = match.id;
            } else {
              try {
                const newClient = await storage.createClient({
                  name: log.customerName,
                  address: log.siteAddress || null,
                  propertyType: log.propertyType || "residential",
                  clientType: "prospect",
                  status: "pending",
                });
                resolvedClientId = newClient.id;
              } catch (e) {
                console.error("Error auto-creating client from sync:", e);
              }
            }
          }

          const newLog = await storage.createJobLog({
            employeeId,
            customerName: log.customerName,
            clientId: resolvedClientId,
            siteLocation: log.siteLocation,
            siteAddress: log.siteAddress || "",
            servicedArea: log.servicedArea,
            workPerformed: log.workPerformed,
            jobDate: log.jobDate,
            status: log.status || "completed",
            customFields: log.customFields,
            materials: log.materials || null,
            clientCreatedAt: log.clientCreatedAt,
            serverReceivedAt: now,
            needsAdminReview
          });

          // Store the localId for duplicate detection
          if (newLog && (newLog as any).id) {
            await storage.updateJobLog((newLog as any).id, { localId: log.localId });
          }

          results.push({
            localId: log.localId,
            serverId: (newLog as any)?.id,
            status: "accepted"
          });
        } catch (logError) {
          console.error("Error syncing job log:", logError);
          results.push({
            localId: log.localId,
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

  // ==========================================
  // Marketing Dashboard Routes
  // ==========================================

  const MARKETING_DATA_DIR = path.join(process.cwd(), 'data', 'marketing');
  if (!fs.existsSync(MARKETING_DATA_DIR)) {
    fs.mkdirSync(MARKETING_DATA_DIR, { recursive: true });
  }

  const findLatestDataFile = (prefix: string): string | null => {
    try {
      const files = fs.readdirSync(MARKETING_DATA_DIR)
        .filter(f => f.startsWith(prefix) && f.endsWith('.json'))
        .sort()
        .reverse();
      return files.length > 0 ? path.join(MARKETING_DATA_DIR, files[0]) : null;
    } catch {
      return null;
    }
  };

  const saveMarketingData = (prefix: string, data: any) => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filePath = path.join(MARKETING_DATA_DIR, `${prefix}${timestamp}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    const files = fs.readdirSync(MARKETING_DATA_DIR)
      .filter(f => f.startsWith(prefix) && f.endsWith('.json'))
      .sort()
      .reverse();
    files.slice(5).forEach(f => {
      try { fs.unlinkSync(path.join(MARKETING_DATA_DIR, f)); } catch {}
    });
  };

  function getFBToken(): string | undefined {
    try {
      const content = fs.readFileSync('/tmp/fb_token.txt', 'utf8').trim();
      if (content) return content;
    } catch {}
    try {
      const envContent = fs.readFileSync('/run/secrets/FB_PAGE_ACCESS_TOKEN', 'utf8').trim();
      if (envContent) return envContent;
    } catch {}
    return process.env.FB_PAGE_ACCESS_TOKEN;
  }

  async function fetchFacebookData(): Promise<any> {
    const pageId = process.env.FB_PAGE_ID;
    const token = getFBToken();
    if (!pageId || !token) return null;

    try {
      const pageRes = await fetch(
        `https://graph.facebook.com/v19.0/${pageId}?fields=name,category,fan_count,followers_count&access_token=${token}`
      );
      const pageData = await pageRes.json();
      if (pageData.error) {
        console.error('Facebook API error (page):', pageData.error.message);
        return null;
      }

      let engagement = {
        post_count_7d: 0, total_likes: 0, total_comments: 0, total_shares: 0,
        page_impressions_unique: 0, page_post_engagements: 0, page_fan_adds_unique: 0,
      };
      try {
        const insightsRes = await fetch(
          `https://graph.facebook.com/v19.0/${pageId}/insights?metric=page_impressions_unique,page_post_engagements,page_fan_adds_unique&period=week&access_token=${token}`
        );
        const insightsData = await insightsRes.json();
        if (insightsData.data) {
          for (const metric of insightsData.data) {
            const val = metric.values?.[metric.values.length - 1]?.value || 0;
            if (metric.name === 'page_impressions_unique') engagement.page_impressions_unique = val;
            if (metric.name === 'page_post_engagements') engagement.page_post_engagements = val;
            if (metric.name === 'page_fan_adds_unique') engagement.page_fan_adds_unique = val;
          }
        }
      } catch (e) {
        console.error('Facebook insights fetch error:', e);
      }

      const postsRes = await fetch(
        `https://graph.facebook.com/v19.0/${pageId}/posts?fields=message,created_time,likes.summary(true),comments.summary(true),shares&limit=10&access_token=${token}`
      );
      const postsData = await postsRes.json();
      const recentPosts = (postsData.data || []).map((p: any) => {
        const likes = p.likes?.summary?.total_count || 0;
        const comments = p.comments?.summary?.total_count || 0;
        const shares = p.shares?.count || 0;
        engagement.total_likes += likes;
        engagement.total_comments += comments;
        engagement.total_shares += shares;
        return {
          message: p.message || '(No text)',
          created_at: p.created_time,
          likes, comments, shares,
        };
      });

      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      engagement.post_count_7d = recentPosts.filter((p: any) => new Date(p.created_at) >= sevenDaysAgo).length;

      const result = {
        fetched_at: new Date().toISOString(),
        platform: 'facebook',
        page_id: pageId,
        status: 'live',
        account_metrics: {
          page_name: pageData.name || 'Absolute Pest Services',
          category: pageData.category || 'Pest Control Service',
          fan_count: pageData.fan_count || 0,
          followers_count: pageData.followers_count || 0,
        },
        engagement_7d: engagement,
        recent_posts: recentPosts,
      };

      saveMarketingData('facebook_metrics_', result);
      return result;
    } catch (error) {
      console.error('Facebook fetch error:', error);
      return null;
    }
  }

  async function fetchInstagramData(): Promise<any> {
    const pageId = process.env.FB_PAGE_ID;
    const token = getFBToken();
    if (!pageId || !token) return null;

    try {
      const igAccountRes = await fetch(
        `https://graph.facebook.com/v19.0/${pageId}?fields=instagram_business_account&access_token=${token}`
      );
      const igAccountData = await igAccountRes.json();
      const igId = igAccountData.instagram_business_account?.id;
      if (!igId) {
        console.log('No Instagram business account linked to this Facebook page');
        return null;
      }

      const profileRes = await fetch(
        `https://graph.facebook.com/v19.0/${igId}?fields=username,name,followers_count,media_count&access_token=${token}`
      );
      const profile = await profileRes.json();
      if (profile.error) {
        console.error('Instagram API error:', profile.error.message);
        return null;
      }

      let engagement = { impressions: 0, reach: 0, profile_views: 0 };
      try {
        const insightsRes = await fetch(
          `https://graph.facebook.com/v19.0/${igId}/insights?metric=impressions,reach,profile_views&period=day&metric_type=total_value&access_token=${token}`
        );
        const insightsData = await insightsRes.json();
        if (insightsData.data) {
          for (const metric of insightsData.data) {
            const val = metric.total_value?.value || metric.values?.[metric.values.length - 1]?.value || 0;
            if (metric.name === 'impressions') engagement.impressions = val;
            if (metric.name === 'reach') engagement.reach = val;
            if (metric.name === 'profile_views') engagement.profile_views = val;
          }
        }
      } catch (e) {
        console.error('Instagram insights fetch error:', e);
      }

      const mediaRes = await fetch(
        `https://graph.facebook.com/v19.0/${igId}/media?fields=caption,timestamp,like_count,comments_count,media_type,permalink&limit=10&access_token=${token}`
      );
      const mediaData = await mediaRes.json();
      const recentPosts = (mediaData.data || []).map((m: any) => ({
        caption: m.caption || '',
        timestamp: m.timestamp,
        like_count: m.like_count || 0,
        comment_count: m.comments_count || 0,
        media_type: m.media_type || 'IMAGE',
        permalink: m.permalink || '',
      }));

      const result = {
        fetched_at: new Date().toISOString(),
        platform: 'instagram',
        status: 'live',
        account_metrics: {
          username: profile.username || '',
          name: profile.name || '',
          followers_count: profile.followers_count || 0,
          media_count: profile.media_count || 0,
        },
        engagement_7d: engagement,
        recent_posts: recentPosts,
      };

      saveMarketingData('instagram_metrics_', result);
      return result;
    } catch (error) {
      console.error('Instagram fetch error:', error);
      return null;
    }
  }

  const GA4_PROPERTY_ID = '507471089';
  const MATON_GATEWAY = 'https://gateway.maton.ai';

  async function fetchGA4Data(): Promise<any> {
    const apiKey = process.env.MATON_API_KEY;
    if (!apiKey) return null;

    try {
      const headers = { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' };
      const baseUrl = `${MATON_GATEWAY}/google-analytics-data/v1beta/properties/${GA4_PROPERTY_ID}:runReport`;

      const [totalsRes, pagesRes, sourcesRes] = await Promise.all([
        fetch(baseUrl, {
          method: 'POST', headers,
          body: JSON.stringify({
            dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
            metrics: [{ name: 'sessions' }, { name: 'totalUsers' }, { name: 'screenPageViews' }],
          }),
        }),
        fetch(baseUrl, {
          method: 'POST', headers,
          body: JSON.stringify({
            dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
            dimensions: [{ name: 'pagePath' }],
            metrics: [{ name: 'screenPageViews' }],
            orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
            limit: 20,
          }),
        }),
        fetch(baseUrl, {
          method: 'POST', headers,
          body: JSON.stringify({
            dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
            dimensions: [{ name: 'sessionDefaultChannelGroup' }],
            metrics: [{ name: 'sessions' }, { name: 'totalUsers' }, { name: 'screenPageViews' }],
          }),
        }),
      ]);

      const [totalsData, pagesData, sourcesData] = await Promise.all([
        totalsRes.json(), pagesRes.json(), sourcesRes.json(),
      ]);

      const totals = {
        sessions: parseInt(totalsData.rows?.[0]?.metricValues?.[0]?.value || '0'),
        users: parseInt(totalsData.rows?.[0]?.metricValues?.[1]?.value || '0'),
        pageviews: parseInt(totalsData.rows?.[0]?.metricValues?.[2]?.value || '0'),
      };

      const top_pages = (pagesData.rows || []).map((row: any) => ({
        page_path: row.dimensionValues[0].value,
        pageviews: parseInt(row.metricValues[0].value),
      }));

      const traffic_sources: Record<string, any> = {};
      for (const row of (sourcesData.rows || [])) {
        const channel = row.dimensionValues[0].value;
        const key = channel.toLowerCase().replace(/[\s-]+/g, '_');
        traffic_sources[key] = {
          sessions: parseInt(row.metricValues[0].value),
          users: parseInt(row.metricValues[1].value),
          pageviews: parseInt(row.metricValues[2].value),
        };
      }

      const result = {
        fetched_at: new Date().toISOString(),
        property_id: GA4_PROPERTY_ID,
        date_range: 'last_7_days',
        totals,
        top_pages,
        traffic_sources,
        row_count: pagesData.rowCount || top_pages.length,
      };

      saveMarketingData('ga4_overview_', result);
      return result;
    } catch (error) {
      console.error('GA4 fetch error:', error);
      return null;
    }
  }

  const GOOGLE_ADS_CUSTOMER_ID = '6800190976';
  const GOOGLE_ADS_API_VERSION = 'v23';

  async function fetchGoogleAdsData(): Promise<any> {
    const apiKey = process.env.MATON_API_KEY;
    if (!apiKey) return null;

    try {
      const headers = { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' };
      const searchUrl = `${MATON_GATEWAY}/google-ads/${GOOGLE_ADS_API_VERSION}/customers/${GOOGLE_ADS_CUSTOMER_ID}/googleAds:search`;

      const campaignRes = await fetch(searchUrl, {
        method: 'POST', headers,
        body: JSON.stringify({
          query: `SELECT campaign.name, campaign.status, metrics.cost_micros, metrics.clicks, metrics.impressions, metrics.conversions FROM campaign WHERE segments.date DURING LAST_7_DAYS ORDER BY metrics.cost_micros DESC`,
        }),
      });

      if (!campaignRes.ok) {
        console.error(`Google Ads API error: ${campaignRes.status}`);
        return null;
      }

      const campaignData = await campaignRes.json();
      if (campaignData.error) {
        console.error('Google Ads API error:', campaignData.error);
        return null;
      }

      const campaigns = (campaignData.results || [])
        .map((r: any) => ({
          campaign_name: r.campaign?.name || 'Unknown',
          campaign_status: r.campaign?.status || 'UNKNOWN',
          cost_micros: parseInt(r.metrics?.costMicros || '0'),
          spend_usd: parseInt(r.metrics?.costMicros || '0') / 1_000_000,
          clicks: parseInt(r.metrics?.clicks || '0'),
          impressions: parseInt(r.metrics?.impressions || '0'),
          conversions: parseFloat(r.metrics?.conversions || '0'),
        }))
        .filter((c) => c.campaign_status !== 'REMOVED');

      const result = {
        fetched_at: new Date().toISOString(),
        customer_id: GOOGLE_ADS_CUSTOMER_ID,
        campaign_count: campaigns.length,
        campaigns,
      };
      saveMarketingData('ads_campaigns_', result);

      try {
        const termsRes = await fetch(searchUrl, {
          method: 'POST', headers,
          body: JSON.stringify({
            query: `SELECT search_term_view.search_term, metrics.clicks, metrics.impressions, metrics.cost_micros, metrics.conversions FROM search_term_view WHERE segments.date DURING LAST_7_DAYS ORDER BY metrics.clicks DESC LIMIT 50`,
          }),
        });
        if (termsRes.ok) {
          const termsData = await termsRes.json();
          const search_terms = (termsData.results || []).map((r: any) => ({
            search_term: r.searchTermView?.searchTerm || '',
            clicks: parseInt(r.metrics?.clicks || '0'),
            impressions: parseInt(r.metrics?.impressions || '0'),
            cost_micros: parseInt(r.metrics?.costMicros || '0'),
            spend_usd: parseInt(r.metrics?.costMicros || '0') / 1_000_000,
            conversions: parseFloat(r.metrics?.conversions || '0'),
          }));
          const termsResult = {
            fetched_at: new Date().toISOString(),
            customer_id: GOOGLE_ADS_CUSTOMER_ID,
            campaign_id: 'all',
            term_count: search_terms.length,
            search_terms,
          };
          saveMarketingData('ads_search_terms_', termsResult);
        }
      } catch (e) {
        console.error('Google Ads search terms fetch error:', e);
      }

      return result;
    } catch (error) {
      console.error('Google Ads fetch error:', error);
      return null;
    }
  }

  app.get('/api/admin/marketing/ads-campaigns', requireAdmin, async (req, res) => {
    const filePath = findLatestDataFile('ads_campaigns_');
    if (filePath) {
      try {
        const raw = fs.readFileSync(filePath, 'utf-8');
        const data = JSON.parse(raw);
        const fetchedAt = new Date(data.fetched_at).getTime();
        if (Date.now() - fetchedAt < 60 * 60 * 1000) {
          return res.json({ success: true, data, lastFetched: data.fetched_at });
        }
      } catch {}
    }
    try {
      const data = await fetchGoogleAdsData();
      res.json({ success: true, data: data || null, lastFetched: data?.fetched_at || null });
    } catch (err) {
      console.error('Ads campaigns endpoint error:', err);
      res.status(500).json({ success: false, message: 'Failed to fetch ads data' });
    }
  });

  app.get('/api/admin/marketing/ads-search-terms', requireAdmin, async (req, res) => {
    const filePath = findLatestDataFile('ads_search_terms_');
    if (filePath) {
      try {
        const raw = fs.readFileSync(filePath, 'utf-8');
        const data = JSON.parse(raw);
        const fetchedAt = new Date(data.fetched_at).getTime();
        if (Date.now() - fetchedAt < 60 * 60 * 1000) {
          return res.json({ success: true, data, lastFetched: data.fetched_at });
        }
      } catch {}
    }
    try {
      await fetchGoogleAdsData();
      const filePath2 = findLatestDataFile('ads_search_terms_');
      if (filePath2) {
        const raw = fs.readFileSync(filePath2, 'utf-8');
        const data = JSON.parse(raw);
        return res.json({ success: true, data, lastFetched: data.fetched_at });
      }
      res.json({ success: true, data: null, lastFetched: null });
    } catch (err) {
      console.error('Ads search terms endpoint error:', err);
      res.status(500).json({ success: false, message: 'Failed to fetch search terms data' });
    }
  });

  app.get('/api/admin/marketing/ga4-overview', requireAdmin, async (req, res) => {
    const filePath = findLatestDataFile('ga4_overview_');
    if (filePath) {
      try {
        const raw = fs.readFileSync(filePath, 'utf-8');
        const data = JSON.parse(raw);
        const fetchedAt = new Date(data.fetched_at).getTime();
        if (Date.now() - fetchedAt < 60 * 60 * 1000) {
          return res.json({ success: true, data, lastFetched: data.fetched_at });
        }
      } catch {}
    }
    try {
      const data = await fetchGA4Data();
      if (data) {
        res.json({ success: true, data, lastFetched: data.fetched_at });
      } else {
        res.json({ success: true, data: null, lastFetched: null });
      }
    } catch (err) {
      console.error('GA4 overview endpoint error:', err);
      res.status(500).json({ success: false, message: 'Failed to fetch GA4 data' });
    }
  });

  app.get('/api/admin/marketing/facebook', requireAdmin, async (req, res) => {
    const filePath = findLatestDataFile('facebook_metrics_');
    if (filePath) {
      try {
        const raw = fs.readFileSync(filePath, 'utf-8');
        const data = JSON.parse(raw);
        const fetchedAt = new Date(data.fetched_at).getTime();
        if (Date.now() - fetchedAt < 60 * 60 * 1000) {
          return res.json({ success: true, data, lastFetched: data.fetched_at });
        }
      } catch {}
    }
    try {
      const data = await fetchFacebookData();
      if (data) {
        res.json({ success: true, data, lastFetched: data.fetched_at });
      } else {
        res.json({ success: true, data: null, lastFetched: null });
      }
    } catch (err) {
      console.error('Facebook marketing endpoint error:', err);
      res.status(500).json({ success: false, message: 'Failed to fetch Facebook data' });
    }
  });

  app.get('/api/admin/marketing/instagram', requireAdmin, async (req, res) => {
    const filePath = findLatestDataFile('instagram_metrics_');
    if (filePath) {
      try {
        const raw = fs.readFileSync(filePath, 'utf-8');
        const data = JSON.parse(raw);
        const fetchedAt = new Date(data.fetched_at).getTime();
        if (Date.now() - fetchedAt < 60 * 60 * 1000) {
          return res.json({ success: true, data, lastFetched: data.fetched_at });
        }
      } catch {}
    }
    try {
      const data = await fetchInstagramData();
      if (data) {
        res.json({ success: true, data, lastFetched: data.fetched_at });
      } else {
        res.json({ success: true, data: null, lastFetched: null });
      }
    } catch (err) {
      console.error('Instagram marketing endpoint error:', err);
      res.status(500).json({ success: false, message: 'Failed to fetch Instagram data' });
    }
  });

  app.post('/api/admin/marketing/connect-social', requireAdmin, async (req, res) => {
    try {
      if (req.body?.token) {
        try { fs.writeFileSync('/tmp/fb_token.txt', req.body.token.trim()); } catch {}
      }
      const [fb, ig] = await Promise.all([fetchFacebookData(), fetchInstagramData()]);
      res.json({
        success: true,
        message: fb ? 'Facebook connected successfully' : 'Facebook connection failed — check FB_PAGE_ACCESS_TOKEN and FB_PAGE_ID secrets',
        facebook: fb ? 'connected' : 'unavailable',
        instagram: ig ? 'connected' : 'unavailable',
      });
    } catch (err) {
      console.error('Social connect error:', err);
      res.status(500).json({ success: false, message: 'Failed to connect social accounts' });
    }
  });

  app.post('/api/admin/marketing/refresh-social', requireAdmin, async (req, res) => {
    try {
      const [fb, ig] = await Promise.all([fetchFacebookData(), fetchInstagramData()]);
      res.json({
        success: true,
        message: 'Social data refreshed',
        facebook: fb ? 'updated' : 'unavailable',
        instagram: ig ? 'updated' : 'unavailable',
      });
    } catch (err) {
      console.error('Social refresh error:', err);
      res.status(500).json({ success: false, message: 'Failed to refresh social data' });
    }
  });

  app.post('/api/admin/marketing/refresh-all', requireAdmin, async (req, res) => {
    try {
      const [ga4, ads, fb, ig] = await Promise.all([
        fetchGA4Data(), fetchGoogleAdsData(), fetchFacebookData(), fetchInstagramData(),
      ]);
      res.json({
        success: true,
        message: 'All marketing data refreshed',
        ga4: ga4 ? 'updated' : 'unavailable',
        google_ads: ads ? 'updated' : 'unavailable',
        facebook: fb ? 'updated' : 'unavailable',
        instagram: ig ? 'updated' : 'unavailable',
      });
    } catch (err) {
      console.error('Marketing refresh error:', err);
      res.status(500).json({ success: false, message: 'Failed to refresh marketing data' });
    }
  });

  seedAdminUser();
  seedFieldMaterials();
  seedServiceRates();

  const httpServer = createServer(app);
  return httpServer;
}

async function seedFieldMaterials() {
  try {
    const existing = await storage.getFieldMaterials();
    if (existing.length > 0) return;
    const products = [
      "Termidor SC", "Termidor HE", "Termidor Foam", "Phantom II",
      "Alpine WSG", "Alpine Foam", "Temprid FX", "Temprid SC",
      "Demand CS", "Suspend Polyzone", "Suspend SC", "Talstar P",
      "Bifen I/T", "Cy-Kick CS", "Cy-Kick Aerosol", "Demon WP", "Demon Max",
      "Advion Cockroach Gel", "Advion Ant Gel", "Advion WDG",
      "Vendetta Plus Gel", "InVict Gold Gel",
      "Maxforce FC Magnum", "Maxforce Quantum", "Maxforce Complete",
      "Avert Dry Flowable", "Gentrol IGR", "Gentrol Point Source",
      "NyGuard IGR", "Precor IGR", "Tekko Pro IGR",
      "Crossfire Concentrate", "Crossfire Aerosol", "Bedlam Plus",
      "Transport Mikron", "Cimexa Dust", "Delta Dust", "Drione Dust",
      "Tempo 1% Dust", "D-Fense Dust", "Taurus SC",
      "Sentricon Bait", "Advance Termite Bait",
      "Contrac Blox", "Final Blox", "Fastrac Blox",
      "Generation Mini Block", "Ditrac All-Weather", "Rozol Tracking Powder",
      "Zenprox EC", "PT 221L Residual", "PT Alpine Flea & Bed Bug",
      "Stryker Wasp & Hornet", "Wasp-Freeze",
      "EcoVia EC", "Essentria IC3", "Nisus DSV",
      "BorActin Dust", "Boracare", "Tim-Bor",
      "Altriset", "Arilon", "Fuse Insecticide",
      "Optigard Ant Gel", "Optigard Flex", "Tandem",
      "Trelona ATBS", "Master Line Bifenthrin",
    ];
    const supplies = [
      "Glue Board (Small)", "Glue Board (Large)", "Snap Trap",
      "Rodent Bait Station", "Tamper-Resistant Bait Station",
      "Termite Bait Station", "Insect Bait Station",
      "Pheromone Trap", "Fly Paper / Strip", "Fly Light Trap",
      "Mosquito Trap", "Catch-All Trap", "Tick Tube",
      "Bed Bug Monitor", "Aerosol Applicator Tip",
      "Duster", "Granule Spreader",
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
      { name: "Initial Inspection", description: "Full property inspection and assessment", defaultRate: "125.00", isActive: true, sortOrder: 13 },
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
          role: "admin",
        });
        console.log("Admin user seeded: rob@absolutepestservices.com");
      }
    }
  } catch (error) {
    console.error("Error seeding admin user:", error);
  }
}
