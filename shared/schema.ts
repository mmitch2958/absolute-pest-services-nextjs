import { pgTable, text, serial, integer, boolean, timestamp, decimal, varchar, jsonb, date } from "drizzle-orm/pg-core";
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
  // userId links a registered portal user (users.id) to this client record.
  // Nullable — not all clients have portal accounts (cash/walk-in customers).
  // Set by admin via PATCH /api/admin/users/:id/client-link.
  userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  contactPerson: text("contact_person"),
  propertyType: text("property_type").default("residential"), // residential, commercial
  clientType: text("client_type").notNull().default("prospect"), // prospect, client
  status: text("status").notNull().default("active"), // active, inactive
  notes: text("notes"),
  reviewOptOut: boolean("review_opt_out").default(false).notNull(),
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

// Schema for admin linking a user account to a client record
export const linkClientToUserSchema = z.object({
  userId: z.number().int().positive().nullable(),
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
  hourlyRate: decimal("hourly_rate", { precision: 10, scale: 2 }),
  externalPayrollId: text("external_payroll_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const serviceRates = pgTable("service_rates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  defaultRate: decimal("default_rate", { precision: 10, scale: 2 }).notNull().default("200.00"),
  isActive: boolean("is_active").default(true).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const jobLogs = pgTable("job_logs", {
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
  // Admin scheduling fields (SC-SCHEDULING-001)
  priority: text("priority").default("medium"), // low, medium, high, urgent
  adminNotes: text("admin_notes"), // Administrative notes for the job
  scheduledBy: integer("scheduled_by").references(() => users.id), // Admin user who scheduled
  scheduledEndTime: timestamp("scheduled_end_time"), // Expected end time
  cancelledAt: timestamp("cancelled_at"), // When job was cancelled
  cancelledBy: integer("cancelled_by").references(() => users.id), // Admin who cancelled
  // Offline sync fields
  localId: text("local_id"), // Client-generated UUID for duplicate detection
  clientCreatedAt: timestamp("client_created_at"), // Timestamp from client device
  serverReceivedAt: timestamp("server_received_at"), // Server clock when received
  needsAdminReview: boolean("needs_admin_review").default(false), // Clock skew > 48h
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Job Schedule Logs - Audit trail for scheduling actions (SC-SCHEDULING-001)
export const jobScheduleLogs = pgTable("job_schedule_logs", {
  id: serial("id").primaryKey(),
  jobLogId: integer("job_log_id").notNull().references(() => jobLogs.id, { onDelete: "cascade" }),
  action: text("action").notNull(), // created, assigned, rescheduled, started, completed, cancelled, claimed
  performedBy: integer("performed_by"), // Admin user ID or field employee ID (no FK - can be either)
  previousValue: jsonb("previous_value"), // JSON of previous values
  newValue: jsonb("new_value"), // JSON of new values
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
  propertyType: text("property_type").default("residential"), // residential, commercial
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

export const serviceContracts = pgTable("service_contracts", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull().references(() => clients.id),
  frequency: text("frequency").notNull().default("monthly"), // weekly, monthly, quarterly
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
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Customer Portal Messaging ───────────────────────────────────────────────
// One message thread per customer. direction distinguishes who sent the message.
export const customerMessages = pgTable("customer_messages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  direction: text("direction").notNull(), // 'customer_to_admin' | 'admin_to_customer'
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  readAt: timestamp("read_at"),
  sentByAdminId: integer("sent_by_admin_id").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCustomerMessageSchema = createInsertSchema(customerMessages).omit({
  id: true,
  createdAt: true,
  readAt: true,
  isRead: true,
});

export type InsertCustomerMessage = z.infer<typeof insertCustomerMessageSchema>;
export type CustomerMessage = typeof customerMessages.$inferSelect;

export const insertServiceRateSchema = createInsertSchema(serviceRates).omit({
  id: true,
  createdAt: true,
}).extend({
  defaultRate: z.union([z.string(), z.number()]).transform(val => String(val)),
});
export type InsertServiceRate = z.infer<typeof insertServiceRateSchema>;
export type ServiceRate = typeof serviceRates.$inferSelect;

export const insertFieldEmployeeSchema = createInsertSchema(fieldEmployees).omit({
  id: true,
  createdAt: true,
}).extend({
  hourlyRate: z.union([z.string(), z.number()]).transform(val => val === undefined ? undefined : String(val)).optional(),
});

export const insertJobLogSchema = createInsertSchema(jobLogs).omit({
  id: true,
  createdAt: true,
  scheduledBy: true,
  cancelledAt: true,
  cancelledBy: true,
}).extend({
  scheduledBy: z.number().int().positive().optional().nullable(),
  cancelledBy: z.number().int().positive().optional().nullable(),
  jobDate: z.union([z.date(), z.string()]).transform(val => typeof val === 'string' ? new Date(val) : val),
  scheduledEndTime: z.union([z.date(), z.string(), z.null()]).transform(val => val === null ? null : typeof val === 'string' ? new Date(val) : val).optional().nullable(),
  serviceRateId: z.number().int().positive().optional().nullable(),
  amount: z.union([z.string(), z.number()]).transform(val => String(val)).optional(),
});

// Insert schema for job schedule logs (SC-SCHEDULING-001)
export const insertJobScheduleLogSchema = createInsertSchema(jobScheduleLogs).omit({
  id: true,
  createdAt: true,
});
export type JobScheduleLog = typeof jobScheduleLogs.$inferSelect;
export type InsertJobScheduleLog = z.infer<typeof insertJobScheduleLogSchema>;

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

export const insertServiceContractSchema = createInsertSchema(serviceContracts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  isActive: true,
  lastGeneratedJobDate: true,
  assignedEmployeeId: true,
  startDate: true,
  endDate: true,
}).extend({
  nextScheduledDate: z.union([z.date(), z.string()]).transform(val => typeof val === 'string' ? new Date(val) : val).optional().nullable(),
  lastGeneratedJobDate: z.union([z.date(), z.string()]).transform(val => typeof val === 'string' ? new Date(val) : val).optional().nullable(),
  assignedEmployeeId: z.number().int().optional().nullable(),
  startDate: z.union([z.date(), z.string()]).transform(val => typeof val === 'string' ? new Date(val) : val).optional().nullable(),
  endDate: z.union([z.date(), z.string()]).transform(val => typeof val === 'string' ? new Date(val) : val).optional().nullable(),
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
export type InsertServiceContract = z.infer<typeof insertServiceContractSchema>;
export type ServiceContract = typeof serviceContracts.$inferSelect;
export type InsertJobLogPhoto = z.infer<typeof insertJobLogPhotoSchema>;
export type JobLogPhoto = typeof jobLogPhotos.$inferSelect;

// ============================================
// Invoice Tables (SC-INV-001)
// ============================================

export type InvoiceStatus = 'draft' | 'sent' | 'viewed' | 'paid' | 'overdue' | 'void';

export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  invoiceNumber: varchar("invoice_number", { length: 20 }).notNull().unique(),
  clientId: integer("client_id").notNull().references(() => clients.id),
  jobLogId: integer("job_log_id").references(() => jobLogs.id),
  status: text("status").notNull().default("draft"), // draft, sent, viewed, paid, overdue, void
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
  paymentMethod: text("payment_method"), // cash, check, card, stripe, other
  paymentAmount: decimal("payment_amount", { precision: 10, scale: 2 }),
  paymentNote: text("payment_note"),
  voidReason: text("void_reason"),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const invoiceLineItems = pgTable("invoice_line_items", {
  id: serial("id").primaryKey(),
  invoiceId: integer("invoice_id").notNull().references(() => invoices.id, { onDelete: "cascade" }),
  description: text("description").notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 3 }).notNull().default("1"),
  unitRate: decimal("unit_rate", { precision: 10, scale: 2 }).notNull(),
  taxRate: decimal("tax_rate", { precision: 5, scale: 2 }).notNull().default("0"),
  lineTotal: decimal("line_total", { precision: 10, scale: 2 }).notNull(),
  lineTax: decimal("line_tax", { precision: 10, scale: 2 }).notNull().default("0"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const invoiceStatusLogs = pgTable("invoice_status_logs", {
  id: serial("id").primaryKey(),
  invoiceId: integer("invoice_id").notNull().references(() => invoices.id, { onDelete: "cascade" }),
  fromStatus: text("from_status"),
  toStatus: text("to_status").notNull(),
  actor: text("actor").notNull(), // admin:{userId}, system, customer
  note: text("note"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Zod schemas for invoices
export const insertInvoiceSchema = createInsertSchema(invoices).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  invoiceNumber: true,
  viewToken: true,
  sentAt: true,
  viewedAt: true,
  paidAt: true,
}).extend({
  dueDate: z.union([z.date(), z.string()]).transform(val => typeof val === 'string' ? new Date(val) : val),
  issueDate: z.union([z.date(), z.string()]).transform(val => typeof val === 'string' ? new Date(val) : val).optional(),
  subtotal: z.union([z.string(), z.number()]).transform(val => String(val)),
  taxTotal: z.union([z.string(), z.number()]).transform(val => String(val)).optional(),
  total: z.union([z.string(), z.number()]).transform(val => String(val)),
  clientId: z.number().int().positive(),
  jobLogId: z.number().int().positive().optional().nullable(),
});

export const insertInvoiceLineItemSchema = createInsertSchema(invoiceLineItems).omit({
  id: true,
  createdAt: true,
  lineTotal: true,
  lineTax: true,
}).extend({
  quantity: z.union([z.string(), z.number()]).transform(val => String(val)).optional(),
  unitRate: z.union([z.string(), z.number()]).transform(val => String(val)),
  taxRate: z.union([z.string(), z.number()]).transform(val => String(val)).optional(),
});

export const insertInvoiceStatusLogSchema = createInsertSchema(invoiceStatusLogs).omit({
  id: true,
  createdAt: true,
});

// Invoice types
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoiceLineItem = z.infer<typeof insertInvoiceLineItemSchema>;
export type InvoiceLineItem = typeof invoiceLineItems.$inferSelect;
export type InsertInvoiceStatusLog = z.infer<typeof insertInvoiceStatusLogSchema>;
export type InvoiceStatusLog = typeof invoiceStatusLogs.$inferSelect;

// Invoice with relations
export interface InvoiceWithDetails extends Invoice {
  client?: Client;
  lineItems?: InvoiceLineItem[];
  statusLogs?: InvoiceStatusLog[];
}

// Invoice stats
export interface InvoiceStats {
  totalOutstanding: string;
  totalOverdue: string;
  totalPaidThisMonth: string;
  totalPaidAllTime: string;
  countByStatus: Record<InvoiceStatus, number>;
}

// ============================================
// Reminder Tables (SC-REMINDERS-001)
// ============================================

export type ReminderType = '24h' | 'same_day';
export type ReminderChannel = 'email' | 'sms';
export type AppointmentType = 'inspection' | 'service_request' | 'job_log';
export type OptOutType = 'email' | 'sms' | 'all';

export const reminderLogs = pgTable("reminder_logs", {
  id: serial("id").primaryKey(),
  appointmentType: text("appointment_type").notNull(), // 'inspection', 'service_request', 'job_log'
  appointmentId: integer("appointment_id").notNull(),
  reminderType: text("reminder_type").notNull(), // '24h', 'same_day'
  channel: text("channel").notNull(), // 'email', 'sms'
  recipientEmail: text("recipient_email"),
  recipientPhone: text("recipient_phone"),
  sentAt: timestamp("sent_at").defaultNow().notNull(),
  success: boolean("success").notNull().default(true),
  errorMessage: text("error_message"),
});

// Unique constraint: prevent duplicate reminders per appointment + type + channel
export const reminderLogsUniqueConstraint = (table: typeof reminderLogs) => {
  return [table.appointmentType, table.appointmentId, table.reminderType, table.channel];
};

export const reminderOptOuts = pgTable("reminder_opt_outs", {
  id: serial("id").primaryKey(),
  email: text("email"), // indexed; null if SMS-only opt-out
  phone: text("phone"), // indexed; null if email-only opt-out
  token: text("token").notNull().unique(), // UUID v4 used in unsubscribe URL
  optedOutAt: timestamp("opted_out_at").defaultNow().notNull(),
  optOutType: text("opt_out_type").notNull(), // 'email', 'sms', 'all'
});

export const systemSettings = pgTable("system_settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  updatedBy: integer("updated_by").references(() => users.id),
});

// Zod schemas for reminders
export const insertReminderLogSchema = createInsertSchema(reminderLogs).omit({
  id: true,
  sentAt: true,
});

export const insertReminderOptOutSchema = createInsertSchema(reminderOptOuts).omit({
  id: true,
  optedOutAt: true,
  token: true,
});

export const insertSystemSettingSchema = createInsertSchema(systemSettings).omit({
  id: true,
  updatedAt: true,
});

// Reminder types
export type InsertReminderLog = z.infer<typeof insertReminderLogSchema>;
export type ReminderLog = typeof reminderLogs.$inferSelect;
export type InsertReminderOptOut = z.infer<typeof insertReminderOptOutSchema>;
export type ReminderOptOut = typeof reminderOptOuts.$inferSelect;
export type InsertSystemSetting = z.infer<typeof insertSystemSettingSchema>;
export type SystemSetting = typeof systemSettings.$inferSelect;

// Reminder data interfaces
export interface ReminderData {
  appointmentType: AppointmentType;
  appointmentId: number;
  customerName: string;
  email: string;
  phone?: string;
  serviceType: string;
  appointmentDate: Date;
  appointmentTime?: string;
  address: string;
  city: string;
}

export interface ReminderSettings {
  reminders_enabled: boolean;
  reminder_time_hour: number;
  reminder_timezone: string;
  reminder_24h_enabled: boolean;
  reminder_same_day_enabled: boolean;
  reminder_email_enabled: boolean;
  reminder_sms_enabled: boolean;
  reminder_inspection_enabled: boolean;
  reminder_service_request_enabled: boolean;
  reminder_job_log_enabled: boolean;
}

// Default reminder settings
export const DEFAULT_REMINDER_SETTINGS: ReminderSettings = {
  reminders_enabled: true,
  reminder_time_hour: 16, // 4 PM Eastern = 20 UTC (EST) / 21 UTC (EDT)
  reminder_timezone: 'America/New_York',
  reminder_24h_enabled: true,
  reminder_same_day_enabled: true,
  reminder_email_enabled: true,
  reminder_sms_enabled: true,
  reminder_inspection_enabled: true,
  reminder_service_request_enabled: true,
  reminder_job_log_enabled: true,
};

// ============================================
// Review Request Tables (SC-REVIEWS-001)
// ============================================

export type ReviewTriggerType = 'job_completion' | 'invoice_paid' | 'manual';
export type ReviewRequestStatus = 'pending' | 'sent' | 'failed' | 'skipped' | 'cancelled';

export const reviewSettings = pgTable("review_settings", {
  id: serial("id").primaryKey(), // single row, id = 1
  enabled: boolean("enabled").default(true).notNull(),
  delayHours: integer("delay_hours").default(24).notNull(),
  googleReviewLink: text("google_review_link").notNull().default("https://g.page/r/CXh2r5bK1ZCXEBM/review"),
  facebookReviewLink: text("facebook_review_link"),
  cooldownDays: integer("cooldown_days").default(30).notNull(),
  triggerJobCompletion: boolean("trigger_job_completion").default(true).notNull(),
  triggerInvoicePaid: boolean("trigger_invoice_paid").default(false).notNull(),
  customMessage: text("custom_message"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const reviewRequestLogs = pgTable("review_request_logs", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").references(() => clients.id, { onDelete: "set null" }),
  jobLogId: integer("job_log_id").references(() => jobLogs.id, { onDelete: "set null" }),
  invoiceId: integer("invoice_id").references(() => invoices.id, { onDelete: "set null" }),
  recipientEmail: text("recipient_email").notNull(),
  triggerType: text("trigger_type").notNull(), // 'job_completion', 'invoice_paid', 'manual'
  status: text("status").notNull().default("pending"), // 'pending', 'sent', 'failed', 'skipped', 'cancelled'
  scheduledSendAt: timestamp("scheduled_send_at").notNull(),
  sentAt: timestamp("sent_at"),
  attemptCount: integer("attempt_count").default(0).notNull(),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Zod schemas for reviews
export const insertReviewSettingsSchema = createInsertSchema(reviewSettings).omit({
  id: true,
  updatedAt: true,
});

export const insertReviewRequestLogSchema = createInsertSchema(reviewRequestLogs).omit({
  id: true,
  sentAt: true,
  attemptCount: true,
  errorMessage: true,
  createdAt: true,
});

// Review types
export type InsertReviewSettings = z.infer<typeof insertReviewSettingsSchema>;
export type ReviewSettings = typeof reviewSettings.$inferSelect;
export type InsertReviewRequestLog = z.infer<typeof insertReviewRequestLogSchema>;
export type ReviewRequestLog = typeof reviewRequestLogs.$inferSelect;

// Default review settings
export const DEFAULT_REVIEW_SETTINGS: Omit<ReviewSettings, 'id' | 'updatedAt'> = {
  enabled: true,
  delayHours: 24,
  googleReviewLink: "https://g.page/r/CXh2r5bK1ZCXEBM/review",
  facebookReviewLink: "",
  cooldownDays: 30,
  triggerJobCompletion: true,
  triggerInvoicePaid: false,
  customMessage: "",
};

// ============================================
// Time Tracking Tables (SC-TIME-001)
// ============================================

export type ShiftStatus = 'open' | 'closed' | 'flagged';
export type TimeBlockType = 'job' | 'travel' | 'admin';
export type BreakType = 'rest' | 'meal';
export type GpsStatus = 'captured' | 'denied' | 'timeout';

export interface GpsData {
  lat: number;
  lng: number;
  accuracy: number;
  status: GpsStatus;
}

export const shifts = pgTable("shifts", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").notNull().references(() => fieldEmployees.id),
  clockInAt: timestamp("clock_in_at").notNull(),
  clockOutAt: timestamp("clock_out_at"),
  clockInGps: jsonb("clock_in_gps"), // { lat, lng, accuracy, status }
  clockOutGps: jsonb("clock_out_gps"),
  clockInNotes: text("clock_in_notes"),
  clockOutNotes: text("clock_out_notes"),
  totalShiftMinutes: integer("total_shift_minutes"), // computed on clock-out
  status: text("status").notNull().default("open"), // open, closed, flagged
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const shiftTimeBlocks = pgTable("shift_time_blocks", {
  id: serial("id").primaryKey(),
  shiftId: integer("shift_id").notNull().references(() => shifts.id, { onDelete: "cascade" }),
  employeeId: integer("employee_id").notNull().references(() => fieldEmployees.id),
  blockType: text("block_type").notNull(), // job, travel, admin
  jobLogId: integer("job_log_id").references(() => jobLogs.id), // required when blockType = job
  startedAt: timestamp("started_at").notNull(),
  endedAt: timestamp("ended_at"),
  durationMinutes: integer("duration_minutes"), // computed on end
  arrivalGps: jsonb("arrival_gps"),
  departureGps: jsonb("departure_gps"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const shiftBreaks = pgTable("shift_breaks", {
  id: serial("id").primaryKey(),
  shiftId: integer("shift_id").notNull().references(() => shifts.id, { onDelete: "cascade" }),
  employeeId: integer("employee_id").notNull().references(() => fieldEmployees.id),
  breakType: text("break_type").notNull(), // rest, meal
  isPaid: boolean("is_paid").notNull().default(false), // derived from break type at creation
  breakStartAt: timestamp("break_start_at").notNull(),
  breakEndAt: timestamp("break_end_at"),
  breakMinutes: integer("break_minutes"), // computed on end
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const timeEntryAuditLog = pgTable("time_entry_audit_log", {
  id: serial("id").primaryKey(),
  entityType: text("entity_type").notNull(), // shift, shift_time_block, shift_break
  entityId: integer("entity_id").notNull(),
  actorId: integer("actor_id").notNull(), // users.id or field_employees.id
  actorType: text("actor_type").notNull(), // admin, employee, system
  fieldChanged: text("field_changed").notNull(),
  oldValue: text("old_value"),
  newValue: text("new_value"),
  reason: text("reason"),
  correctedAt: timestamp("corrected_at").defaultNow().notNull(),
});

// Zod schemas for time tracking
export const insertShiftSchema = createInsertSchema(shifts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  totalShiftMinutes: true,
}).extend({
  clockInAt: z.union([z.date(), z.string()]).transform(val => typeof val === 'string' ? new Date(val) : val),
  clockOutAt: z.union([z.date(), z.string(), z.null()]).transform(val => val === null ? null : typeof val === 'string' ? new Date(val) : val).optional(),
  clockInGps: z.object({
    lat: z.number(),
    lng: z.number(),
    accuracy: z.number(),
    status: z.enum(['captured', 'denied', 'timeout']),
  }).optional(),
  clockOutGps: z.object({
    lat: z.number(),
    lng: z.number(),
    accuracy: z.number(),
    status: z.enum(['captured', 'denied', 'timeout']),
  }).optional(),
});

export const insertShiftTimeBlockSchema = createInsertSchema(shiftTimeBlocks).omit({
  id: true,
  createdAt: true,
  durationMinutes: true,
}).extend({
  startedAt: z.union([z.date(), z.string()]).transform(val => typeof val === 'string' ? new Date(val) : val),
  endedAt: z.union([z.date(), z.string(), z.null()]).transform(val => val === null ? null : typeof val === 'string' ? new Date(val) : val).optional(),
  arrivalGps: z.object({
    lat: z.number(),
    lng: z.number(),
    accuracy: z.number(),
    status: z.enum(['captured', 'denied', 'timeout']),
  }).optional(),
  departureGps: z.object({
    lat: z.number(),
    lng: z.number(),
    accuracy: z.number(),
    status: z.enum(['captured', 'denied', 'timeout']),
  }).optional(),
});

export const insertShiftBreakSchema = createInsertSchema(shiftBreaks).omit({
  id: true,
  createdAt: true,
  breakMinutes: true,
}).extend({
  breakStartAt: z.union([z.date(), z.string()]).transform(val => typeof val === 'string' ? new Date(val) : val),
  breakEndAt: z.union([z.date(), z.string(), z.null()]).transform(val => val === null ? null : typeof val === 'string' ? new Date(val) : val).optional(),
  isPaid: z.boolean().optional().default(false),
});

export const insertTimeEntryAuditLogSchema = createInsertSchema(timeEntryAuditLog).omit({
  id: true,
  correctedAt: true,
});

// Time tracking types
export type InsertShift = z.infer<typeof insertShiftSchema>;
export type Shift = typeof shifts.$inferSelect;
export type InsertShiftTimeBlock = z.infer<typeof insertShiftTimeBlockSchema>;
export type ShiftTimeBlock = typeof shiftTimeBlocks.$inferSelect;
export type InsertShiftBreak = z.infer<typeof insertShiftBreakSchema>;
export type ShiftBreak = typeof shiftBreaks.$inferSelect;
export type InsertTimeEntryAuditLog = z.infer<typeof insertTimeEntryAuditLogSchema>;
export type TimeEntryAuditLog = typeof timeEntryAuditLog.$inferSelect;

// Shift with relations
export interface ShiftWithDetails extends Shift {
  employee?: { id: number; name: string };
  timeBlocks?: ShiftTimeBlock[];
  breaks?: ShiftBreak[];
}

// ============================================
// Route Optimization Tables (SC-ROUTE-001)
// ============================================

// Geocache to avoid re-geocoding the same address
export const geocache = pgTable("geocache", {
  id: serial("id").primaryKey(),
  addressText: text("address_text").notNull().unique(), // normalized address
  lat: decimal("lat", { precision: 10, scale: 7 }),
  lng: decimal("lng", { precision: 10, scale: 7 }),
  geocodedAt: timestamp("geocoded_at").defaultNow().notNull(),
  source: text("source").notNull().default("google"), // 'google', 'manual'
});

// Store optimized routes per tech per day
export const dailyRoutes = pgTable("daily_routes", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").notNull().references(() => fieldEmployees.id),
  routeDate: date("route_date").notNull(),
  startAddress: text("start_address"), // depot/starting address
  optimizedStopOrder: jsonb("optimized_stop_order").notNull(), 
  // [{jobLogId, sequence, estimatedArrival, driveDurationSeconds, lat, lng, customerName, address}]
  googleMapsUrl: text("google_maps_url"),
  totalDistanceMeters: integer("total_distance_meters"),
  totalDurationSeconds: integer("total_duration_seconds"),
  generatedAt: timestamp("generated_at").defaultNow().notNull(),
  generatedBy: integer("generated_by").references(() => users.id),
});

// Zod schemas for route optimization
export const insertGeocacheSchema = createInsertSchema(geocache).omit({
  id: true,
  geocodedAt: true,
});

export const insertDailyRouteSchema = createInsertSchema(dailyRoutes).omit({
  id: true,
  generatedAt: true,
});

// Route optimization types
export type InsertGeocache = z.infer<typeof insertGeocacheSchema>;
export type GeocacheEntry = typeof geocache.$inferSelect;
export type InsertDailyRoute = z.infer<typeof insertDailyRouteSchema>;
export type DailyRoute = typeof dailyRoutes.$inferSelect;

// Optimized stop order item type
export interface RouteStop {
  sequence: number;
  jobLogId: number;
  customerName: string;
  address: string;
  estimatedArrival: string | null; // ISO timestamp
  driveDurationSeconds: number;
  lat: number;
  lng: number;
}

// Daily route with employee details
export interface DailyRouteWithDetails extends DailyRoute {
  employee?: { id: number; name: string };
}
