import { pgTable, text, serial, integer, boolean, timestamp, decimal, varchar, jsonb } from "drizzle-orm/pg-core";
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
  city: text("city").notNull(),
  serviceType: text("service_type").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const inspectionSchedules = pgTable("inspection_schedules", {
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
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const serviceRequests = pgTable("service_requests", {
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

export const blogPosts = pgTable("blog_posts", {
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
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  password: true,
  firstName: true,
  lastName: true,
  phone: true,
  address: true,
  role: true,
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
  budget: true,
  actualCost: true,
  startDate: true,
  endDate: true,
  completedDate: true,
}).extend({
  budget: z.union([z.string(), z.number()]).transform(val => String(val)).optional().nullable(),
  actualCost: z.union([z.string(), z.number()]).transform(val => String(val)).optional().nullable(),
  startDate: z.union([z.date(), z.string()]).transform(val => typeof val === 'string' ? new Date(val) : val).optional().nullable(),
  endDate: z.union([z.date(), z.string()]).transform(val => typeof val === 'string' ? new Date(val) : val).optional().nullable(),
  completedDate: z.union([z.date(), z.string()]).transform(val => typeof val === 'string' ? new Date(val) : val).optional().nullable(),
});

export const insertMilestoneSchema = createInsertSchema(milestones).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  dueDate: true,
  completedDate: true,
}).extend({
  dueDate: z.union([z.date(), z.string()]).transform(val => typeof val === 'string' ? new Date(val) : val).optional().nullable(),
  completedDate: z.union([z.date(), z.string()]).transform(val => typeof val === 'string' ? new Date(val) : val).optional().nullable(),
});

export const insertDashboardSchema = createInsertSchema(dashboards).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBlogPostSchema = createInsertSchema(blogPosts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  publishedAt: true,
});

export const fieldEmployees = pgTable("field_employees", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  pin: text("pin").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  canManageEmployees: boolean("can_manage_employees").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const jobLogs = pgTable("job_logs", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").notNull().references(() => fieldEmployees.id),
  customerName: text("customer_name").notNull(),
  clientId: integer("client_id").references(() => clients.id),
  siteLocation: text("site_location").notNull(),
  servicedArea: text("serviced_area").notNull(),
  workPerformed: text("work_performed").notNull(),
  jobDate: timestamp("job_date").notNull(),
  status: text("status").notNull().default("completed"), // scheduled, in_progress, completed, invoiced, paid
  customFields: jsonb("custom_fields"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const jobLogCustomFields = pgTable("job_log_custom_fields", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  label: text("label").notNull(),
  fieldType: text("field_type").notNull().default("text"),
  required: boolean("required").default(false).notNull(),
  options: text("options"),
  displayOrder: integer("display_order").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const fieldCustomers = pgTable("field_customers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address"),
  phone: text("phone"),
  email: text("email"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const siteLocations = pgTable("site_locations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  customerId: integer("customer_id").references(() => clients.id),
  customerName: text("customer_name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Job Log Photos ───────────────────────────────────────────────────────────
export const jobLogPhotos = pgTable("job_log_photos", {
  id: serial("id").primaryKey(),
  jobLogId: integer("job_log_id")
    .notNull()
    .references(() => jobLogs.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  caption: text("caption"),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});

export const servicedAreas = pgTable("serviced_areas", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  siteLocationId: integer("site_location_id").references(() => siteLocations.id),
  siteLocationName: text("site_location_name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertFieldEmployeeSchema = createInsertSchema(fieldEmployees).omit({
  id: true,
  createdAt: true,
});

export const insertJobLogSchema = createInsertSchema(jobLogs).omit({
  id: true,
  createdAt: true,
});

export const insertFieldCustomerSchema = createInsertSchema(fieldCustomers).omit({
  id: true,
  createdAt: true,
});

export const insertJobLogCustomFieldSchema = createInsertSchema(jobLogCustomFields).omit({
  id: true,
  createdAt: true,
});

export const insertSiteLocationSchema = createInsertSchema(siteLocations).omit({
  id: true,
  createdAt: true,
});

export const insertServicedAreaSchema = createInsertSchema(servicedAreas).omit({
  id: true,
  createdAt: true,
});

export const insertJobLogPhotoSchema = createInsertSchema(jobLogPhotos).omit({
  id: true,
  uploadedAt: true,
}).extend({
  url: z.string().url(),
  caption: z.string().max(200).optional().nullable(),
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
export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;
export type BlogPost = typeof blogPosts.$inferSelect;

// Field Service Types
export type InsertFieldEmployee = z.infer<typeof insertFieldEmployeeSchema>;
export type FieldEmployee = typeof fieldEmployees.$inferSelect;
export type InsertJobLog = z.infer<typeof insertJobLogSchema>;
export type JobLog = typeof jobLogs.$inferSelect;
export type InsertFieldCustomer = z.infer<typeof insertFieldCustomerSchema>;
export type FieldCustomer = typeof fieldCustomers.$inferSelect;
export type InsertJobLogCustomField = z.infer<typeof insertJobLogCustomFieldSchema>;
export type JobLogCustomField = typeof jobLogCustomFields.$inferSelect;
export type InsertSiteLocation = z.infer<typeof insertSiteLocationSchema>;
export type SiteLocation = typeof siteLocations.$inferSelect;
export type InsertServicedArea = z.infer<typeof insertServicedAreaSchema>;
export type ServicedArea = typeof servicedAreas.$inferSelect;
export type InsertJobLogPhoto = z.infer<typeof insertJobLogPhotoSchema>;
export type JobLogPhoto = typeof jobLogPhotos.$inferSelect;
