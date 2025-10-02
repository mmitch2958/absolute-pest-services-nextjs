import { pgTable, text, serial, integer, boolean, timestamp, decimal, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  phone: text("phone"),
  address: text("address"),
  role: text("role").notNull().default("user"), // user, admin
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const contactSubmissions = pgTable("contact_submissions", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  serviceType: text("service_type").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const inspectionSchedules = pgTable("inspection_schedules", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  address: text("address").notNull(),
  serviceType: text("service_type").notNull(),
  preferredDate: timestamp("preferred_date").notNull(),
  preferredTime: text("preferred_time").notNull(),
  urgency: text("urgency").notNull(),
  message: text("message"),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const serviceRequests = pgTable("service_requests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  serviceType: text("service_type").notNull(),
  description: text("description").notNull(),
  address: text("address").notNull(),
  priority: text("priority").notNull().default("medium"),
  status: text("status").notNull().default("pending"),
  scheduledDate: timestamp("scheduled_date"),
  completedDate: timestamp("completed_date"),
  estimatedCost: decimal("estimated_cost", { precision: 10, scale: 2 }),
  finalCost: decimal("final_cost", { precision: 10, scale: 2 }),
  technicianNotes: text("technician_notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  serviceRequestId: integer("service_request_id").references(() => serviceRequests.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"),
  paymentMethod: text("payment_method"),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Admin Portal Entities
export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  address: text("address"),
  contactPerson: text("contact_person"),
  clientType: text("client_type").notNull().default("prospect"), // prospect, client
  status: text("status").notNull().default("active"), // active, inactive
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").notNull().references(() => clients.id),
  name: text("name").notNull(),
  description: text("description"),
  status: text("status").notNull().default("planning"), // planning, active, completed, cancelled
  budget: decimal("budget", { precision: 10, scale: 2 }),
  actualCost: decimal("actual_cost", { precision: 10, scale: 2 }),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  completedDate: timestamp("completed_date"),
  priority: text("priority").notNull().default("medium"), // low, medium, high, urgent
  assignedTo: integer("assigned_to").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const milestones = pgTable("milestones", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").notNull().default("pending"), // pending, in_progress, completed, cancelled
  dueDate: timestamp("due_date"),
  completedDate: timestamp("completed_date"),
  progress: integer("progress").default(0), // 0-100 percentage
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const dashboards = pgTable("dashboards", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id),
  title: text("title").notNull(),
  type: text("type").notNull().default("project"), // project, client, overview
  config: text("config"), // JSON config for dashboard layout and widgets
  isPublic: boolean("is_public").default(false).notNull(),
  createdBy: integer("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  password: true,
  firstName: true,
  lastName: true,
  phone: true,
  address: true,
});

export const insertContactSchema = createInsertSchema(contactSubmissions).omit({
  id: true,
  createdAt: true,
});

export const insertInspectionSchema = createInsertSchema(inspectionSchedules).omit({
  id: true,
  createdAt: true,
  status: true,
});

export const insertServiceRequestSchema = createInsertSchema(serviceRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  status: true,
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
  paidAt: true,
});

// Admin Portal Schemas
export const insertClientSchema = createInsertSchema(clients).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  budget: z.union([z.string(), z.number()]).transform(val => String(val)).optional(),
  actualCost: z.union([z.string(), z.number()]).transform(val => String(val)).optional(),
  startDate: z.union([z.date(), z.string()]).transform(val => typeof val === 'string' ? new Date(val) : val).optional(),
  endDate: z.union([z.date(), z.string()]).transform(val => typeof val === 'string' ? new Date(val) : val).optional(),
  completedDate: z.union([z.date(), z.string()]).transform(val => typeof val === 'string' ? new Date(val) : val).optional(),
});

export const insertMilestoneSchema = createInsertSchema(milestones).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDashboardSchema = createInsertSchema(dashboards).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const registerSchema = insertUserSchema.extend({
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertContact = z.infer<typeof insertContactSchema>;
export type ContactSubmission = typeof contactSubmissions.$inferSelect;
export type InsertInspection = z.infer<typeof insertInspectionSchema>;
export type InspectionSchedule = typeof inspectionSchedules.$inferSelect;
export type InsertServiceRequest = z.infer<typeof insertServiceRequestSchema>;
export type ServiceRequest = typeof serviceRequests.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof payments.$inferSelect;
export type LoginData = z.infer<typeof loginSchema>;
export type RegisterData = z.infer<typeof registerSchema>;

// Admin Portal Types
export type InsertClient = z.infer<typeof insertClientSchema>;
export type Client = typeof clients.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;
export type InsertMilestone = z.infer<typeof insertMilestoneSchema>;
export type Milestone = typeof milestones.$inferSelect;
export type InsertDashboard = z.infer<typeof insertDashboardSchema>;
export type Dashboard = typeof dashboards.$inferSelect;
