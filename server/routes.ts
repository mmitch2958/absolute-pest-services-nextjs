import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertContactSchema, insertInspectionSchema, insertServiceRequestSchema, loginSchema, registerSchema, insertClientSchema, insertProjectSchema, insertMilestoneSchema, insertDashboardSchema, insertBlogPostSchema } from "@shared/schema";
import { z } from "zod";
import session from "express-session";
import { sendContactFormEmail, sendInspectionScheduleEmail, sendServiceRequestEmail, sendServiceRequestStatusUpdate } from "./email";
import Parser from "rss-parser";

// Extend session type to include userId
declare module 'express-session' {
  interface SessionData {
    userId: number;
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
            name: `${user.firstName} ${user.lastName}`,
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
          serviceType: validatedData.serviceType,
          description: validatedData.description,
          address: validatedData.address,
          priority: validatedData.priority || "medium",
          customerName: `${user.firstName} ${user.lastName}`,
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
      
      // Set publishedAt when publishing
      if (validatedData.isPublished && !validatedData.publishedAt) {
        validatedData.publishedAt = new Date();
      }
      
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

          // Create blog post
          await storage.createBlogPost({
            title: item.title || 'Untitled',
            slug,
            content: contentHtml,
            excerpt: item.contentSnippet || excerpt,
            author: item.creator || item.author || 'Guest Author',
            featuredImage,
            category,
            tags,
            metaTitle: item.title || 'Untitled',
            metaDescription: (item.contentSnippet || excerpt).substring(0, 160),
            isPublished: true,
            publishedAt: item.pubDate ? new Date(item.pubDate) : new Date()
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

  const httpServer = createServer(app);
  return httpServer;
}
