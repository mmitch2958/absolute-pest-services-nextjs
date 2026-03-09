import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertContactSchema, insertInspectionSchema, insertServiceRequestSchema, loginSchema, registerSchema, insertClientSchema, insertProjectSchema, insertMilestoneSchema, insertDashboardSchema, insertBlogPostSchema, insertFieldEmployeeSchema, insertJobLogSchema, insertJobLogCustomFieldSchema, insertFieldCustomerSchema, insertSiteLocationSchema, insertServicedAreaSchema, insertServiceContractSchema, insertJobLogPhotoSchema, insertInvoiceSchema, insertInvoiceLineItemSchema, type InvoiceStatus } from "@shared/schema";
import { z } from "zod";
import session from "express-session";
import { sendContactFormEmail, sendInspectionScheduleEmail, sendServiceRequestEmail, sendServiceRequestStatusUpdate, sendNewsletterEmail, sendJobLogNotification, sendInvoiceEmail, sendInvoiceOverdueEmail, sendPaymentConfirmationEmail } from "./email";
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
  // Session configuration
  app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true in production with HTTPS
      httpOnly: true,
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

      const feed = await parser.parseURL(feedUrl);
      
      const results = {
        imported: 0,
        skipped: 0,
        errors: 0,
        details: [] as any[]
      };

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
  // Field Service Routes
  // ==========================================

  const requireFieldAuth = (req: any, res: any, next: any) => {
    if (!req.session.fieldEmployeeId) {
      return res.status(401).json({ success: false, message: "Field authentication required" });
    }
    next();
  };

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

      res.json({
        success: true,
        customers: mergedCustomers,
        customerLocations,
        locationAreas,
        clients: [],
      });
    } catch (error) {
      console.error("Error fetching suggestions:", error);
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
      const data = {
        ...req.body,
        employeeId: req.session.fieldEmployeeId,
        jobDate: new Date(req.body.jobDate),
        clientId: req.body.clientId || null,
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
      const jobLog = await storage.updateJobLog(id, updates);
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

  // Scheduled jobs endpoint (for calendar view)
  app.get("/api/admin/scheduled-jobs", requireAdmin, async (req, res) => {
    try {
      const contracts = await storage.getServiceContracts({ isActive: true });
      res.json({ success: true, scheduledJobs: contracts });
    } catch (error) {
      console.error("Error fetching scheduled jobs:", error);
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

      // Update status to sent
      await storage.updateInvoiceStatus(id, 'sent', `admin:${req.session.userId}`, 'Invoice sent to customer');

      // Send email
      await sendInvoiceEmail({
        clientEmail: client.email,
        clientName: client.name,
        invoiceNumber: invoice.invoiceNumber,
        invoiceDate: new Date(invoice.issueDate),
        dueDate: new Date(invoice.dueDate),
        total: String(invoice.total),
        viewToken: invoice.viewToken!,
      });

      const updatedInvoice = await storage.getInvoice(id);
      const lineItems = await storage.getLineItemsByInvoice(id);
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
          client: client ? { name: client.name, email: client.email, address: client.address, phone: client.phone } : undefined,
          lineItems,
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

  seedAdminUser();

  const httpServer = createServer(app);
  return httpServer;
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
