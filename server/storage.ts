import { users, contactSubmissions, inspectionSchedules, serviceRequests, payments, clients, projects, milestones, dashboards, blogPosts, fieldEmployees, jobLogs, jobLogCustomFields, fieldCustomers, siteLocations, servicedAreas, serviceContracts, jobLogPhotos, invoices, invoiceLineItems, invoiceStatusLogs, reminderLogs, reminderOptOuts, systemSettings, DEFAULT_REMINDER_SETTINGS, reviewSettings, reviewRequestLogs, DEFAULT_REVIEW_SETTINGS, shifts, shiftTimeBlocks, shiftBreaks, timeEntryAuditLog, geocache, dailyRoutes, jobScheduleLogs, type User, type InsertUser, type ContactSubmission, type InsertContact, type InspectionSchedule, type InsertInspection, type ServiceRequest, type InsertServiceRequest, type Payment, type InsertPayment, type Client, type InsertClient, type Project, type InsertProject, type Milestone, type InsertMilestone, type Dashboard, type InsertDashboard, type BlogPost, type InsertBlogPost, type FieldEmployee, type InsertFieldEmployee, type JobLog, type InsertJobLog, type JobLogCustomField, type InsertJobLogCustomField, type FieldCustomer, type InsertFieldCustomer, type SiteLocation, type InsertSiteLocation, type ServicedArea, type InsertServicedArea, type ServiceContract, type InsertServiceContract, type JobLogPhoto, type InsertJobLogPhoto, type Invoice, type InsertInvoice, type InvoiceLineItem, type InsertInvoiceLineItem, type InvoiceStatusLog, type InsertInvoiceStatusLog, type InvoiceStatus, type InvoiceStats, type InvoiceWithDetails, type InsertReminderLog, type ReminderLog, type InsertReminderOptOut, type ReminderOptOut, type InsertSystemSetting, type SystemSetting, type ReminderSettings, type ReminderType, type AppointmentType, type ReminderChannel, type ReviewSettings, type ReviewRequestLog, type InsertReviewRequestLog, type InsertGeocache, type GeocacheEntry, type InsertDailyRoute, type DailyRoute, type RouteStop, type DailyRouteWithDetails, type JobScheduleLog, type InsertJobScheduleLog } from "@shared/schema";
import { db } from "./db";
import { eq, and, or, desc, gte, lte, lt, ilike, sql, sum } from "drizzle-orm";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { sendInvoiceOverdueEmail } from "./email";

// Calendar event type with customer name joined from clients table
export interface ContractCalendarEvent extends Omit<ServiceContract, "customerId"> {
  customerName: string;
}

// ==========================================
// Analytics Types
// ==========================================

export interface AnalyticsOverview {
  jobsThisMonth: number;
  jobsThisWeek: number;
  activeClients: number;
  activeContracts: number;
  openServiceRequests: number;
  overdueInvoices: number;
  outstandingRevenue: number;
}

export interface JobsOverTimeData {
  month: string;
  count: number;
}

export interface JobsByAreaData {
  area: string;
  count: number;
}

export interface JobsByStatusData {
  status: string;
  count: number;
}

export interface EmployeeProductivityData {
  employeeId: number;
  name: string;
  jobsThisPeriod: number;
  jobsAllTime: number;
  lastJobDate: Date | null;
  isActive: boolean;
}

export interface ContractsSummaryData {
  totalActive: number;
  dueThisWeek: number;
  overdue: number;
  byFrequency: { frequency: string; count: number }[];
}

export interface UpcomingItem {
  type: 'job' | 'inspection' | 'request';
  id: number;
  date: Date;
  customerName: string;
  serviceType: string;
  assignedEmployee?: string;
}

export interface UpcomingItemsData {
  scheduledJobs: UpcomingItem[];
  pendingInspections: UpcomingItem[];
  pendingRequests: UpcomingItem[];
}

export interface TopClientData {
  clientId: number;
  clientName: string;
  totalJobs: number;
  lastJobDate: Date | null;
  hasActiveContract: boolean;
}

export interface ContactSubmissionSummary {
  count: number;
  recent: { id: number; firstName: string; lastName: string; serviceType: string; city: string; createdAt: Date }[];
}

function advanceNextScheduledDate(current: Date, frequency: string): Date {
  const next = new Date(current);
  switch (frequency) {
    case "weekly":    next.setDate(next.getDate() + 7); break;
    case "monthly":   next.setMonth(next.getMonth() + 1); break;
    case "quarterly": next.setMonth(next.getMonth() + 3); break;
    case "bi-annual": next.setMonth(next.getMonth() + 6); break;
    case "annual":    next.setFullYear(next.getFullYear() + 1); break;
    default:          next.setMonth(next.getMonth() + 1);
  }
  return next;
}

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User>;
  authenticateUser(email: string, password: string): Promise<User | null>;
  
  // Contact operations
  createContactSubmission(contact: InsertContact): Promise<ContactSubmission>;
  getContactSubmissions(): Promise<ContactSubmission[]>;
  
  // Inspection operations
  createInspectionSchedule(inspection: InsertInspection): Promise<InspectionSchedule>;
  getInspectionSchedules(): Promise<InspectionSchedule[]>;
  getInspectionSchedulesByUser(userId: number): Promise<InspectionSchedule[]>;
  updateInspectionSchedule(id: number, updates: Partial<InspectionSchedule>): Promise<InspectionSchedule>;
  
  // Service request operations
  createServiceRequest(serviceRequest: InsertServiceRequest): Promise<ServiceRequest>;
  getServiceRequests(): Promise<ServiceRequest[]>;
  getServiceRequestsByUser(userId: number): Promise<ServiceRequest[]>;
  updateServiceRequest(id: number, updates: Partial<ServiceRequest>): Promise<ServiceRequest>;
  updateServiceRequestStatus(id: number, status: string, updates?: Partial<ServiceRequest>): Promise<ServiceRequest>;
  
  // Payment operations
  createPayment(payment: InsertPayment): Promise<Payment>;
  getPaymentsByUser(userId: number): Promise<Payment[]>;
  updatePaymentStatus(id: number, status: string): Promise<Payment>;
  
  // Client operations
  createClient(client: InsertClient): Promise<Client>;
  getClients(): Promise<Client[]>;
  getClient(id: number): Promise<Client | undefined>;
  getClientByEmail(email: string): Promise<Client | undefined>;
  updateClient(id: number, updates: Partial<InsertClient>): Promise<Client>;
  deleteClient(id: number): Promise<void>;
  createOrUpdateProspect(data: { name: string; email: string; phone?: string; address?: string; serviceType?: string; notes?: string }): Promise<Client>;
  
  // Project operations
  createProject(project: InsertProject): Promise<Project>;
  getProjects(): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  getProjectsByClient(clientId: number): Promise<Project[]>;
  updateProject(id: number, updates: Partial<InsertProject>): Promise<Project>;
  deleteProject(id: number): Promise<void>;
  
  // Milestone operations
  createMilestone(milestone: InsertMilestone): Promise<Milestone>;
  getMilestones(): Promise<Milestone[]>;
  getMilestone(id: number): Promise<Milestone | undefined>;
  getMilestonesByProject(projectId: number): Promise<Milestone[]>;
  updateMilestone(id: number, updates: Partial<InsertMilestone>): Promise<Milestone>;
  deleteMilestone(id: number): Promise<void>;
  
  // Dashboard operations
  createDashboard(dashboard: InsertDashboard): Promise<Dashboard>;
  getDashboards(): Promise<Dashboard[]>;
  getDashboard(id: number): Promise<Dashboard | undefined>;
  getDashboardsByProject(projectId: number): Promise<Dashboard[]>;
  updateDashboard(id: number, updates: Partial<InsertDashboard>): Promise<Dashboard>;
  deleteDashboard(id: number): Promise<void>;
  
  // Blog operations
  createBlogPost(blogPost: InsertBlogPost): Promise<BlogPost>;
  getBlogPosts(): Promise<BlogPost[]>;
  getPublishedBlogPosts(): Promise<BlogPost[]>;
  getBlogPost(id: number): Promise<BlogPost | undefined>;
  getBlogPostBySlug(slug: string): Promise<BlogPost | undefined>;
  updateBlogPost(id: number, updates: Partial<InsertBlogPost>): Promise<BlogPost>;
  deleteBlogPost(id: number): Promise<void>;

  // Field Employee operations
  createFieldEmployee(employee: InsertFieldEmployee): Promise<FieldEmployee>;
  getFieldEmployees(): Promise<FieldEmployee[]>;
  getFieldEmployee(id: number): Promise<FieldEmployee | undefined>;
  getFieldEmployeeByPin(pin: string): Promise<FieldEmployee | undefined>;
  updateFieldEmployee(id: number, updates: Partial<InsertFieldEmployee>): Promise<FieldEmployee>;
  deleteFieldEmployee(id: number): Promise<void>;

  // Job Log operations
  createJobLog(jobLog: InsertJobLog): Promise<JobLog>;
  getJobLogs(filters?: { employeeId?: number; customerName?: string; clientId?: number; dateFrom?: Date; dateTo?: Date; siteLocation?: string; siteAddress?: string; servicedArea?: string; status?: string }): Promise<JobLog[]>;
  getJobLog(id: number): Promise<JobLog | undefined>;
  updateJobLog(id: number, updates: Partial<InsertJobLog>): Promise<JobLog>;
  deleteJobLog(id: number): Promise<void>;

  // Custom Field operations
  getJobLogCustomFields(): Promise<JobLogCustomField[]>;
  createJobLogCustomField(field: InsertJobLogCustomField): Promise<JobLogCustomField>;
  updateJobLogCustomField(id: number, updates: Partial<InsertJobLogCustomField>): Promise<JobLogCustomField>;
  deleteJobLogCustomField(id: number): Promise<void>;

  // Field Customer operations
  getFieldCustomers(): Promise<FieldCustomer[]>;
  createFieldCustomer(customer: InsertFieldCustomer): Promise<FieldCustomer>;
  updateFieldCustomer(id: number, updates: Partial<InsertFieldCustomer>): Promise<FieldCustomer>;
  deleteFieldCustomer(id: number): Promise<void>;

  // Site Location operations
  getSiteLocations(): Promise<SiteLocation[]>;
  createSiteLocation(location: InsertSiteLocation): Promise<SiteLocation>;
  updateSiteLocation(id: number, updates: Partial<InsertSiteLocation>): Promise<SiteLocation>;
  deleteSiteLocation(id: number): Promise<void>;

  // Serviced Area operations
  getServicedAreas(): Promise<ServicedArea[]>;
  createServicedArea(area: InsertServicedArea): Promise<ServicedArea>;
  updateServicedArea(id: number, updates: Partial<InsertServicedArea>): Promise<ServicedArea>;
  deleteServicedArea(id: number): Promise<void>;

  // Service Contract operations
  createServiceContract(contract: InsertServiceContract): Promise<ServiceContract>;
  getServiceContracts(filters?: { customerId?: number; isActive?: boolean; assignedEmployeeId?: number }): Promise<ServiceContract[]>;
  getServiceContract(id: number): Promise<ServiceContract | undefined>;
  updateServiceContract(id: number, updates: Partial<InsertServiceContract>): Promise<ServiceContract>;
  deleteServiceContract(id: number): Promise<void>;
  getServiceContractsInDateRange(from: Date, to: Date): Promise<ContractCalendarEvent[]>;
  getServiceContractsByDateRange(from: Date, to: Date): Promise<ContractCalendarEvent[]>;
  generateJobFromContract(contractId: number): Promise<{ jobLog: JobLog; updatedContract: ServiceContract }>;

  // Job Log Photo operations
  createJobLogPhoto(data: InsertJobLogPhoto): Promise<JobLogPhoto>;
  getJobLogPhotos(jobLogId: number): Promise<JobLogPhoto[]>;
  deleteJobLogPhoto(id: number, jobLogId: number): Promise<void>;

  // Invoice operations
  createInvoice(data: InsertInvoice): Promise<Invoice>;
  getInvoice(id: number): Promise<Invoice | undefined>;
  getInvoiceByToken(token: string): Promise<Invoice | undefined>;
  getInvoiceByNumber(invoiceNumber: string): Promise<Invoice | undefined>;
  listInvoices(filters?: { clientId?: number; status?: InvoiceStatus; fromDate?: Date; toDate?: Date; page?: number; limit?: number }): Promise<InvoiceWithDetails[]>;
  updateInvoice(id: number, data: Partial<Invoice>): Promise<Invoice>;
  getInvoiceStats(): Promise<InvoiceStats>;

  // Line Item operations
  createLineItem(data: InsertInvoiceLineItem): Promise<InvoiceLineItem>;
  updateLineItem(id: number, data: Partial<InvoiceLineItem>): Promise<InvoiceLineItem>;
  deleteLineItem(id: number): Promise<void>;
  getLineItemsByInvoice(invoiceId: number): Promise<InvoiceLineItem[]>;

  // Status Log operations
  logInvoiceStatusChange(data: InsertInvoiceStatusLog): Promise<InvoiceStatusLog>;
  getInvoiceStatusLog(invoiceId: number): Promise<InvoiceStatusLog[]>;

  // Invoice status transitions
  updateInvoiceStatus(id: number, toStatus: InvoiceStatus, actor: string, note?: string): Promise<Invoice>;
  markInvoicesOverdue(): Promise<number>;

  // Invoice from job log
  createInvoiceFromJobLog(jobLogId: number, dueDate: Date, createdBy: number): Promise<Invoice>;

  // Reminder operations (SC-REMINDERS-001)
  getReminderLogs(appointmentType?: AppointmentType, appointmentId?: number, limit?: number): Promise<ReminderLog[]>;
  createReminderLog(log: InsertReminderLog): Promise<ReminderLog>;
  getReminderLogByAppointment(appointmentType: AppointmentType, appointmentId: number, reminderType: ReminderType, channel: ReminderChannel): Promise<ReminderLog | undefined>;
  deleteReminderLog(id: number): Promise<void>;
  
  // Opt-out operations
  getReminderOptOuts(): Promise<ReminderOptOut[]>;
  getReminderOptOutByToken(token: string): Promise<ReminderOptOut | undefined>;
  getReminderOptOutByEmail(email: string): Promise<ReminderOptOut | undefined>;
  getReminderOptOutByPhone(phone: string): Promise<ReminderOptOut | undefined>;
  createReminderOptOut(optOut: InsertReminderOptOut & { token: string }): Promise<ReminderOptOut>;
  deleteReminderOptOut(id: number): Promise<void>;
  
  // System settings operations
  getSystemSetting(key: string): Promise<string | undefined>;
  getAllReminderSettings(): Promise<ReminderSettings>;
  setSystemSetting(key: string, value: string, updatedBy?: number): Promise<SystemSetting>;
  setReminderSettings(settings: Partial<ReminderSettings>, updatedBy?: number): Promise<ReminderSettings>;
  
  // Reminder query operations - get appointments needing reminders
  getInspectionsFor24hReminder(): Promise<InspectionSchedule[]>;
  getInspectionsForSameDayReminder(): Promise<InspectionSchedule[]>;
  getServiceRequestsFor24hReminder(): Promise<ServiceRequest[]>;
  getServiceRequestsForSameDayReminder(): Promise<ServiceRequest[]>;
  getJobLogsFor24hReminder(): Promise<JobLog[]>;
  getJobLogsForSameDayReminder(): Promise<JobLog[]>;

  // Review request operations (SC-REVIEWS-001)
  getReviewSettings(): Promise<ReviewSettings>;
  updateReviewSettings(settings: Partial<ReviewSettings>): Promise<ReviewSettings>;
  createReviewRequestLog(log: InsertReviewRequestLog): Promise<ReviewRequestLog>;
  getReviewRequestLogByJobLogId(jobLogId: number): Promise<ReviewRequestLog | undefined>;
  getReviewRequestLogByInvoiceId(invoiceId: number): Promise<ReviewRequestLog | undefined>;
  getPendingReviewRequests(): Promise<ReviewRequestLog[]>;
  updateReviewRequestLog(id: number, updates: Partial<ReviewRequestLog>): Promise<ReviewRequestLog>;
  getReviewRequestLogs(options?: { limit?: number; offset?: number; status?: string; clientId?: number }): Promise<{ logs: ReviewRequestLog[]; total: number }>;
  deleteReviewRequestLog(id: number): Promise<void>;
  getClientById(id: number): Promise<Client | undefined>;
  getJobLogById(id: number): Promise<JobLog | undefined>;
  getInvoiceById(id: number): Promise<Invoice | undefined>;
  updateClient(id: number, updates: Partial<Client>): Promise<Client>;
  hasRecentReviewRequest(clientId: number, days: number): Promise<boolean>;
  countReviewRequestsSentThisYear(clientId: number): Promise<number>;

  // Analytics operations
  getAnalyticsOverview(from: Date, to: Date): Promise<AnalyticsOverview>;
  getJobsOverTime(from: Date, to: Date, groupBy?: 'month' | 'week'): Promise<JobsOverTimeData[]>;
  getJobsByArea(from: Date, to: Date): Promise<JobsByAreaData[]>;
  getJobsByStatus(from: Date, to: Date): Promise<JobsByStatusData[]>;
  getEmployeeProductivity(from: Date, to: Date): Promise<EmployeeProductivityData[]>;
  getContractsSummary(): Promise<ContractsSummaryData>;
  getUpcomingItems(): Promise<UpcomingItemsData>;
  getTopClients(from: Date, to: Date, limit?: number): Promise<TopClientData[]>;
  getContactSubmissionsSummary(from: Date, to: Date): Promise<ContactSubmissionSummary>;

  // Route optimization operations (SC-ROUTE-001)
  getGeocache(address: string): Promise<GeocacheEntry | undefined>;
  setGeocache(entry: InsertGeocache): Promise<GeocacheEntry>;
  getDailyRoute(employeeId: number, routeDate: Date): Promise<DailyRoute | undefined>;
  createOrUpdateDailyRoute(route: InsertDailyRoute): Promise<DailyRoute>;
  getJobLogsForRoute(employeeId: number, routeDate: Date): Promise<JobLog[]>;

  // Admin Job Scheduling operations (SC-SCHEDULING-001)
  // Create a new scheduled job (admin)
  createScheduledJob(jobData: InsertJobLog & { scheduledBy: number; priority?: string }): Promise<JobLog>;
  // Update job with scheduling fields (admin)
  updateJobScheduling(id: number, updates: { priority?: string; adminNotes?: string; scheduledEndTime?: Date; employeeId?: number; jobDate?: Date }, performedBy: number): Promise<JobLog>;
  // Assign job to different tech (admin)
  assignJobToTech(jobLogId: number, employeeId: number, performedBy: number): Promise<JobLog>;
  // Reschedule a job (admin)
  rescheduleJob(jobLogId: number, newJobDate: Date, performedBy: number): Promise<JobLog>;
  // Cancel a scheduled job (admin)
  cancelScheduledJob(jobLogId: number, performedBy: number, reason?: string): Promise<JobLog>;
  // Get scheduled jobs (admin view)
  getScheduledJobs(filters?: { employeeId?: number; dateFrom?: Date; dateTo?: Date; status?: string }): Promise<JobLog[]>;
  
  // Field operations for scheduled jobs
  // Start a scheduled job (field tech)
  startScheduledJob(jobLogId: number, employeeId: number): Promise<JobLog>;
  // Complete a scheduled job (field tech)
  completeScheduledJob(jobLogId: number, employeeId: number, workPerformed: string): Promise<JobLog>;
  // Get jobs for field tech to start today
  getTodaysScheduledJobs(employeeId: number): Promise<JobLog[]>;
  
  // Schedule audit log operations
  createJobScheduleLog(log: InsertJobScheduleLog): Promise<JobScheduleLog>;
  getJobScheduleLogs(jobLogId: number): Promise<JobScheduleLog[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(ilike(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        password: hashedPassword,
      })
      .returning();
    return user;
  }

  async authenticateUser(email: string, password: string): Promise<User | null> {
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

  async updateUser(id: number, updates: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Contact operations
  async createContactSubmission(insertContact: InsertContact): Promise<ContactSubmission> {
    const [contact] = await db
      .insert(contactSubmissions)
      .values(insertContact)
      .returning();
    return contact;
  }

  async getContactSubmissions(): Promise<ContactSubmission[]> {
    return await db.select().from(contactSubmissions);
  }

  // Inspection operations
  async createInspectionSchedule(insertInspection: InsertInspection): Promise<InspectionSchedule> {
    const [inspection] = await db
      .insert(inspectionSchedules)
      .values(insertInspection)
      .returning();
    return inspection;
  }

  async getInspectionSchedules(): Promise<InspectionSchedule[]> {
    return await db.select().from(inspectionSchedules);
  }

  async getInspectionSchedulesByUser(userId: number): Promise<InspectionSchedule[]> {
    return await db.select().from(inspectionSchedules).where(eq(inspectionSchedules.userId, userId));
  }

  async updateInspectionSchedule(id: number, updates: Partial<InspectionSchedule>): Promise<InspectionSchedule> {
    const [inspection] = await db
      .update(inspectionSchedules)
      .set(updates)
      .where(eq(inspectionSchedules.id, id))
      .returning();
    return inspection;
  }

  // Service request operations
  async createServiceRequest(insertServiceRequest: InsertServiceRequest): Promise<ServiceRequest> {
    const [serviceRequest] = await db
      .insert(serviceRequests)
      .values(insertServiceRequest)
      .returning();
    return serviceRequest;
  }

  async getServiceRequests(): Promise<ServiceRequest[]> {
    return await db.select().from(serviceRequests);
  }

  async getServiceRequestsByUser(userId: number): Promise<ServiceRequest[]> {
    return await db.select().from(serviceRequests).where(eq(serviceRequests.userId, userId));
  }

  async updateServiceRequest(id: number, updates: Partial<ServiceRequest>): Promise<ServiceRequest> {
    const [serviceRequest] = await db
      .update(serviceRequests)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(serviceRequests.id, id))
      .returning();
    return serviceRequest;
  }

  async updateServiceRequestStatus(id: number, status: string, updates?: Partial<ServiceRequest>): Promise<ServiceRequest> {
    const [serviceRequest] = await db
      .update(serviceRequests)
      .set({
        status,
        updatedAt: new Date(),
        ...updates,
      })
      .where(eq(serviceRequests.id, id))
      .returning();
    return serviceRequest;
  }

  // Payment operations
  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const [payment] = await db
      .insert(payments)
      .values(insertPayment)
      .returning();
    return payment;
  }

  async getPaymentsByUser(userId: number): Promise<Payment[]> {
    return await db.select().from(payments).where(eq(payments.userId, userId));
  }

  async updatePaymentStatus(id: number, status: string): Promise<Payment> {
    const [payment] = await db
      .update(payments)
      .set({
        status,
        paidAt: status === 'completed' ? new Date() : null,
      })
      .where(eq(payments.id, id))
      .returning();
    return payment;
  }

  // Client operations
  async createClient(insertClient: InsertClient): Promise<Client> {
    const [client] = await db
      .insert(clients)
      .values(insertClient)
      .returning();
    return client;
  }

  async getClients(): Promise<Client[]> {
    return await db.select().from(clients);
  }

  async getClient(id: number): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.id, id));
    return client || undefined;
  }

  async updateClient(id: number, updates: Partial<InsertClient>): Promise<Client> {
    const [client] = await db
      .update(clients)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(clients.id, id))
      .returning();
    return client;
  }

  async deleteClient(id: number): Promise<void> {
    await db.delete(clients).where(eq(clients.id, id));
  }

  async getClientByEmail(email: string): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.email, email));
    return client || undefined;
  }

  async createOrUpdateProspect(data: { name: string; email: string; phone?: string; address?: string; serviceType?: string; notes?: string }): Promise<Client> {
    const existing = await this.getClientByEmail(data.email);
    
    if (existing) {
      // Update existing prospect with new information
      const updatedNotes = data.notes 
        ? `${existing.notes || ''}\n\n[${new Date().toLocaleDateString()}] ${data.notes}`.trim()
        : existing.notes;
      
      return await this.updateClient(existing.id, {
        phone: data.phone || existing.phone,
        address: data.address || existing.address,
        notes: updatedNotes,
      });
    }
    
    // Create new prospect
    return await this.createClient({
      name: data.name,
      email: data.email,
      phone: data.phone,
      address: data.address,
      clientType: "prospect",
      status: "active",
      notes: data.notes,
    });
  }

  // Project operations
  async createProject(insertProject: InsertProject): Promise<Project> {
    const [project] = await db
      .insert(projects)
      .values(insertProject)
      .returning();
    return project;
  }

  async getProjects(): Promise<Project[]> {
    return await db.select().from(projects);
  }

  async getProject(id: number): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project || undefined;
  }

  async getProjectsByClient(clientId: number): Promise<Project[]> {
    return await db.select().from(projects).where(eq(projects.clientId, clientId));
  }

  async updateProject(id: number, updates: Partial<InsertProject>): Promise<Project> {
    const [project] = await db
      .update(projects)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(projects.id, id))
      .returning();
    return project;
  }

  async deleteProject(id: number): Promise<void> {
    await db.delete(projects).where(eq(projects.id, id));
  }

  // Milestone operations
  async createMilestone(insertMilestone: InsertMilestone): Promise<Milestone> {
    const [milestone] = await db
      .insert(milestones)
      .values(insertMilestone)
      .returning();
    return milestone;
  }

  async getMilestones(): Promise<Milestone[]> {
    return await db.select().from(milestones);
  }

  async getMilestone(id: number): Promise<Milestone | undefined> {
    const [milestone] = await db.select().from(milestones).where(eq(milestones.id, id));
    return milestone || undefined;
  }

  async getMilestonesByProject(projectId: number): Promise<Milestone[]> {
    return await db.select().from(milestones).where(eq(milestones.projectId, projectId));
  }

  async updateMilestone(id: number, updates: Partial<InsertMilestone>): Promise<Milestone> {
    const [milestone] = await db
      .update(milestones)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(milestones.id, id))
      .returning();
    return milestone;
  }

  async deleteMilestone(id: number): Promise<void> {
    await db.delete(milestones).where(eq(milestones.id, id));
  }

  // Dashboard operations
  async createDashboard(insertDashboard: InsertDashboard): Promise<Dashboard> {
    const [dashboard] = await db
      .insert(dashboards)
      .values(insertDashboard)
      .returning();
    return dashboard;
  }

  async getDashboards(): Promise<Dashboard[]> {
    return await db.select().from(dashboards);
  }

  async getDashboard(id: number): Promise<Dashboard | undefined> {
    const [dashboard] = await db.select().from(dashboards).where(eq(dashboards.id, id));
    return dashboard || undefined;
  }

  async getDashboardsByProject(projectId: number): Promise<Dashboard[]> {
    return await db.select().from(dashboards).where(eq(dashboards.projectId, projectId));
  }

  async updateDashboard(id: number, updates: Partial<InsertDashboard>): Promise<Dashboard> {
    const [dashboard] = await db
      .update(dashboards)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(dashboards.id, id))
      .returning();
    return dashboard;
  }

  async deleteDashboard(id: number): Promise<void> {
    await db.delete(dashboards).where(eq(dashboards.id, id));
  }

  // Blog operations
  async createBlogPost(insertBlogPost: InsertBlogPost): Promise<BlogPost> {
    const [blogPost] = await db
      .insert(blogPosts)
      .values(insertBlogPost)
      .returning();
    return blogPost;
  }

  async getBlogPosts(): Promise<BlogPost[]> {
    return await db.select().from(blogPosts).orderBy(desc(blogPosts.createdAt));
  }

  async getPublishedBlogPosts(): Promise<BlogPost[]> {
    return await db.select().from(blogPosts).where(eq(blogPosts.isPublished, true)).orderBy(desc(blogPosts.createdAt));
  }

  async getBlogPost(id: number): Promise<BlogPost | undefined> {
    const [blogPost] = await db.select().from(blogPosts).where(eq(blogPosts.id, id));
    return blogPost || undefined;
  }

  async getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
    const [blogPost] = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug));
    return blogPost || undefined;
  }

  async updateBlogPost(id: number, updates: Partial<InsertBlogPost>): Promise<BlogPost> {
    const [blogPost] = await db
      .update(blogPosts)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(blogPosts.id, id))
      .returning();
    return blogPost;
  }

  async deleteBlogPost(id: number): Promise<void> {
    await db.delete(blogPosts).where(eq(blogPosts.id, id));
  }

  // Field Employee operations
  async createFieldEmployee(insertEmployee: InsertFieldEmployee): Promise<FieldEmployee> {
    const [employee] = await db
      .insert(fieldEmployees)
      .values(insertEmployee)
      .returning();
    return employee;
  }

  async getFieldEmployees(): Promise<FieldEmployee[]> {
    return await db.select().from(fieldEmployees).orderBy(fieldEmployees.name);
  }

  async getFieldEmployee(id: number): Promise<FieldEmployee | undefined> {
    const [employee] = await db.select().from(fieldEmployees).where(eq(fieldEmployees.id, id));
    return employee || undefined;
  }

  async getFieldEmployeeByPin(pin: string): Promise<FieldEmployee | undefined> {
    const [employee] = await db.select().from(fieldEmployees).where(and(eq(fieldEmployees.pin, pin), eq(fieldEmployees.isActive, true)));
    return employee || undefined;
  }

  async updateFieldEmployee(id: number, updates: Partial<InsertFieldEmployee>): Promise<FieldEmployee> {
    const [employee] = await db
      .update(fieldEmployees)
      .set(updates)
      .where(eq(fieldEmployees.id, id))
      .returning();
    return employee;
  }

  async deleteFieldEmployee(id: number): Promise<void> {
    await db.delete(fieldEmployees).where(eq(fieldEmployees.id, id));
  }

  // Job Log operations
  async createJobLog(insertJobLog: InsertJobLog): Promise<JobLog> {
    const [jobLog] = await db
      .insert(jobLogs)
      .values(insertJobLog)
      .returning();
    return jobLog;
  }

  async getJobLogs(filters?: { employeeId?: number; customerName?: string; clientId?: number; dateFrom?: Date; dateTo?: Date; siteLocation?: string; siteAddress?: string; servicedArea?: string; status?: string }): Promise<JobLog[]> {
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

  async getJobLog(id: number): Promise<JobLog | undefined> {
    const [jobLog] = await db.select().from(jobLogs).where(eq(jobLogs.id, id));
    return jobLog || undefined;
  }

  async updateJobLog(id: number, updates: Partial<InsertJobLog>): Promise<JobLog> {
    const [jobLog] = await db
      .update(jobLogs)
      .set(updates)
      .where(eq(jobLogs.id, id))
      .returning();
    return jobLog;
  }

  async deleteJobLog(id: number): Promise<void> {
    await db.delete(jobLogs).where(eq(jobLogs.id, id));
  }

  async getJobLogCustomFields(): Promise<JobLogCustomField[]> {
    return await db.select().from(jobLogCustomFields).orderBy(jobLogCustomFields.displayOrder);
  }

  async createJobLogCustomField(field: InsertJobLogCustomField): Promise<JobLogCustomField> {
    const [f] = await db.insert(jobLogCustomFields).values(field).returning();
    return f;
  }

  async updateJobLogCustomField(id: number, updates: Partial<InsertJobLogCustomField>): Promise<JobLogCustomField> {
    const [f] = await db.update(jobLogCustomFields).set(updates).where(eq(jobLogCustomFields.id, id)).returning();
    return f;
  }

  async deleteJobLogCustomField(id: number): Promise<void> {
    await db.delete(jobLogCustomFields).where(eq(jobLogCustomFields.id, id));
  }

  async getFieldCustomers(): Promise<FieldCustomer[]> {
    return await db.select().from(fieldCustomers).orderBy(fieldCustomers.name);
  }

  async createFieldCustomer(customer: InsertFieldCustomer): Promise<FieldCustomer> {
    const [c] = await db.insert(fieldCustomers).values(customer).returning();
    return c;
  }

  async updateFieldCustomer(id: number, updates: Partial<InsertFieldCustomer>): Promise<FieldCustomer> {
    const [c] = await db.update(fieldCustomers).set(updates).where(eq(fieldCustomers.id, id)).returning();
    return c;
  }

  async deleteFieldCustomer(id: number): Promise<void> {
    await db.delete(fieldCustomers).where(eq(fieldCustomers.id, id));
  }

  async getSiteLocations(): Promise<SiteLocation[]> {
    return await db.select().from(siteLocations).orderBy(siteLocations.name);
  }

  async createSiteLocation(location: InsertSiteLocation): Promise<SiteLocation> {
    const [loc] = await db.insert(siteLocations).values(location).returning();
    return loc;
  }

  async updateSiteLocation(id: number, updates: Partial<InsertSiteLocation>): Promise<SiteLocation> {
    const [loc] = await db.update(siteLocations).set(updates).where(eq(siteLocations.id, id)).returning();
    return loc;
  }

  async deleteSiteLocation(id: number): Promise<void> {
    await db.delete(siteLocations).where(eq(siteLocations.id, id));
  }

  async getServicedAreas(): Promise<ServicedArea[]> {
    return await db.select().from(servicedAreas).orderBy(servicedAreas.name);
  }

  async createServicedArea(area: InsertServicedArea): Promise<ServicedArea> {
    const [a] = await db.insert(servicedAreas).values(area).returning();
    return a;
  }

  async updateServicedArea(id: number, updates: Partial<InsertServicedArea>): Promise<ServicedArea> {
    const [a] = await db.update(servicedAreas).set(updates).where(eq(servicedAreas.id, id)).returning();
    return a;
  }

  async deleteServicedArea(id: number): Promise<void> {
    await db.delete(servicedAreas).where(eq(servicedAreas.id, id));
  }

  // Service Contract operations
  async createServiceContract(insertContract: InsertServiceContract): Promise<ServiceContract> {
    if (!insertContract.nextScheduledDate) {
      throw new Error("nextScheduledDate is required");
    }
    const [contract] = await db
      .insert(serviceContracts)
      .values(insertContract as typeof insertContract & { nextScheduledDate: Date })
      .returning();
    return contract;
  }

  async getServiceContracts(filters?: { customerId?: number; isActive?: boolean; assignedEmployeeId?: number }): Promise<ServiceContract[]> {
    const conditions = [];
    if (filters?.customerId) conditions.push(eq(serviceContracts.customerId, filters.customerId));
    if (filters?.isActive !== undefined) conditions.push(eq(serviceContracts.isActive, filters.isActive));
    if (filters?.assignedEmployeeId) conditions.push(eq(serviceContracts.assignedEmployeeId, filters.assignedEmployeeId));
    
    if (conditions.length > 0) {
      return await db.select().from(serviceContracts).where(and(...conditions)).orderBy(serviceContracts.nextScheduledDate);
    }
    return await db.select().from(serviceContracts).orderBy(serviceContracts.nextScheduledDate);
  }

  async getServiceContract(id: number): Promise<ServiceContract | undefined> {
    const [contract] = await db.select().from(serviceContracts).where(eq(serviceContracts.id, id));
    return contract || undefined;
  }

  async getServiceContractsInDateRange(from: Date, to: Date): Promise<ContractCalendarEvent[]> {
    const results = await db
      .select({
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
        customerName: clients.name,
      })
      .from(serviceContracts)
      .innerJoin(clients, eq(serviceContracts.customerId, clients.id))
      .where(
        and(
          gte(serviceContracts.nextScheduledDate, from),
          lte(serviceContracts.nextScheduledDate, to)
        )
      )
      .orderBy(serviceContracts.nextScheduledDate);
    
    return results;
  }

  async getServiceContractsByDateRange(from: Date, to: Date): Promise<ContractCalendarEvent[]> {
    const results = await db
      .select({
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
        customerName: clients.name,
      })
      .from(serviceContracts)
      .innerJoin(clients, eq(serviceContracts.customerId, clients.id))
      .where(
        and(
          gte(serviceContracts.startDate, from),
          lte(serviceContracts.endDate, to)
        )
      )
      .orderBy(serviceContracts.startDate);
    
    return results;
  }

  async generateJobFromContract(contractId: number): Promise<{ jobLog: JobLog; updatedContract: ServiceContract }> {
    const [contract] = await db
      .select()
      .from(serviceContracts)
      .where(eq(serviceContracts.id, contractId));
    
    if (!contract) {
      throw new Error("Service contract not found");
    }

    const jobLog = await db
      .insert(jobLogs)
      .values({
        employeeId: contract.assignedEmployeeId!,
        customerName: await this.getCustomerName(contract.customerId),
        clientId: contract.customerId,
        siteLocation: contract.siteLocation,
        siteAddress: "",
        servicedArea: contract.servicedArea,
        workPerformed: contract.defaultWorkTemplate || "Scheduled service",
        jobDate: contract.nextScheduledDate,
        status: "scheduled",
        createdAt: new Date(),
      })
      .returning();

    // Advance nextScheduledDate by frequency interval
    const nextDate = advanceNextScheduledDate(contract.nextScheduledDate, contract.frequency);

    const updatedContract = await db
      .update(serviceContracts)
      .set({
        lastGeneratedJobDate: new Date(),
        nextScheduledDate: nextDate,
        updatedAt: new Date(),
      })
      .where(eq(serviceContracts.id, contractId))
      .returning();

    return { jobLog: jobLog[0], updatedContract: updatedContract[0] };
  }

  async getCustomerName(clientId: number): Promise<string> {
    const client = await this.getClient(clientId);
    return client?.name || "Unknown Customer";
  }

  async updateServiceContract(id: number, updates: Partial<InsertServiceContract>): Promise<ServiceContract> {
    // Strip null nextScheduledDate to avoid overwriting with null on a notNull column
    const { nextScheduledDate, ...rest } = updates;
    const setValues: Record<string, unknown> = { ...rest, updatedAt: new Date() };
    if (nextScheduledDate != null) {
      setValues.nextScheduledDate = nextScheduledDate;
    }
    const [contract] = await db
      .update(serviceContracts)
      .set(setValues as Parameters<typeof db.update>[0] extends infer T ? any : never)
      .where(eq(serviceContracts.id, id))
      .returning();
    return contract;
  }

  async deleteServiceContract(id: number): Promise<void> {
    await db.delete(serviceContracts).where(eq(serviceContracts.id, id));
  }

  // Job Log Photo operations
  async createJobLogPhoto(data: InsertJobLogPhoto): Promise<JobLogPhoto> {
    // Enforce 5-photo limit before insert
    const existing = await db
      .select()
      .from(jobLogPhotos)
      .where(eq(jobLogPhotos.jobLogId, data.jobLogId));
    if (existing.length >= 5) {
      throw new Error("MAX_PHOTOS_EXCEEDED");
    }
    const [photo] = await db.insert(jobLogPhotos).values(data).returning();
    return photo;
  }

  async getJobLogPhotos(jobLogId: number): Promise<JobLogPhoto[]> {
    return db
      .select()
      .from(jobLogPhotos)
      .where(eq(jobLogPhotos.jobLogId, jobLogId))
      .orderBy(jobLogPhotos.uploadedAt);
  }

  async deleteJobLogPhoto(id: number, jobLogId: number): Promise<void> {
    // jobLogId scoping prevents cross-log deletion
    await db
      .delete(jobLogPhotos)
      .where(and(eq(jobLogPhotos.id, id), eq(jobLogPhotos.jobLogId, jobLogId)));
  }

  // ============================================
  // Invoice Operations (SC-INV-001)
  // ============================================

  private async generateInvoiceNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const seqName = `invoice_seq_${year}`;
    
    // Create sequence if it doesn't exist (using raw SQL)
    await db.execute(sql`CREATE SEQUENCE IF NOT EXISTS ${sql.identifier(seqName)} START 1`);
    
    // Get next value
    const result = await db.execute(sql`SELECT nextval(${sql.identifier(seqName)}) as n`);
    const n = String(result.rows[0].n).padStart(4, '0');
    return `INV-${year}-${n}`;
  }

  async createInvoice(insertInvoice: InsertInvoice): Promise<Invoice> {
    const invoiceNumber = await this.generateInvoiceNumber();
    const viewToken = uuidv4();
    
    const [invoice] = await db
      .insert(invoices)
      .values({
        ...insertInvoice,
        invoiceNumber,
        viewToken,
        status: 'draft',
        subtotal: String(insertInvoice.subtotal),
        taxTotal: String(insertInvoice.taxTotal || '0'),
        total: String(insertInvoice.total),
      } as any)
      .returning();
    
    // Log initial creation
    await this.logInvoiceStatusChange({
      invoiceId: invoice.id,
      fromStatus: null,
      toStatus: 'draft',
      actor: insertInvoice.createdBy ? `admin:${insertInvoice.createdBy}` : 'system',
      note: 'Invoice created',
    });
    
    return invoice;
  }

  async getInvoice(id: number): Promise<Invoice | undefined> {
    const [invoice] = await db.select().from(invoices).where(eq(invoices.id, id));
    return invoice || undefined;
  }

  async getInvoiceByToken(token: string): Promise<Invoice | undefined> {
    const [invoice] = await db.select().from(invoices).where(eq(invoices.viewToken, token));
    return invoice || undefined;
  }

  async getInvoiceByNumber(invoiceNumber: string): Promise<Invoice | undefined> {
    const [invoice] = await db.select().from(invoices).where(eq(invoices.invoiceNumber, invoiceNumber));
    return invoice || undefined;
  }

  async listInvoices(filters?: { clientId?: number; status?: InvoiceStatus; fromDate?: Date; toDate?: Date; page?: number; limit?: number }): Promise<InvoiceWithDetails[]> {
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
      query = db.select().from(invoices).where(and(...conditions)) as any;
    }

    const results = await query
      .orderBy(desc(invoices.createdAt))
      .limit(limit)
      .offset(offset);

    // Fetch related data for each invoice
    const invoicesWithDetails: InvoiceWithDetails[] = await Promise.all(
      results.map(async (invoice) => {
        const client = await this.getClient(invoice.clientId);
        const lineItems = await this.getLineItemsByInvoice(invoice.id);
        const statusLogs = await this.getInvoiceStatusLog(invoice.id);
        return {
          ...invoice,
          client,
          lineItems,
          statusLogs,
        };
      })
    );

    return invoicesWithDetails;
  }

  async updateInvoice(id: number, updates: Partial<Invoice>): Promise<Invoice> {
    const [invoice] = await db
      .update(invoices)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(invoices.id, id))
      .returning();
    return invoice;
  }

  async getInvoiceStats(): Promise<InvoiceStats> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Get all non-void, non-paid invoices (outstanding)
    const outstandingResult = await db
      .select({ total: sum(sql`${invoices.total}::numeric`) })
      .from(invoices)
      .where(and(
        sql`${invoices.status} IN ('draft', 'sent', 'viewed', 'overdue')`
      ));
    
    // Get overdue invoices
    const overdueResult = await db
      .select({ total: sum(sql`${invoices.total}::numeric`) })
      .from(invoices)
      .where(eq(invoices.status, 'overdue'));
    
    // Get paid this month
    const paidThisMonthResult = await db
      .select({ total: sum(sql`${invoices.total}::numeric`) })
      .from(invoices)
      .where(and(
        eq(invoices.status, 'paid'),
        gte(invoices.paidAt, startOfMonth)
      ));
    
    // Get paid all time
    const paidAllTimeResult = await db
      .select({ total: sum(sql`${invoices.total}::numeric`) })
      .from(invoices)
      .where(eq(invoices.status, 'paid'));
    
    // Get count by status
    const statusCounts = await db
      .select({ status: invoices.status, count: sql`count(*)::int` })
      .from(invoices)
      .groupBy(invoices.status);

    const countByStatus: Record<InvoiceStatus, number> = {
      draft: 0,
      sent: 0,
      viewed: 0,
      paid: 0,
      overdue: 0,
      void: 0,
    };

    for (const row of statusCounts) {
      if (row.status && row.status in countByStatus) {
        countByStatus[row.status as InvoiceStatus] = Number(row.count) || 0;
      }
    }

    return {
      totalOutstanding: outstandingResult[0]?.total?.toString() || '0.00',
      totalOverdue: overdueResult[0]?.total?.toString() || '0.00',
      totalPaidThisMonth: paidThisMonthResult[0]?.total?.toString() || '0.00',
      totalPaidAllTime: paidAllTimeResult[0]?.total?.toString() || '0.00',
      countByStatus,
    };
  }

  // Line Item operations
  async createLineItem(data: InsertInvoiceLineItem): Promise<InvoiceLineItem> {
    // Calculate line totals
    const quantity = parseFloat(String(data.quantity || 1));
    const unitRate = parseFloat(String(data.unitRate));
    const taxRate = parseFloat(String(data.taxRate || 0));
    const lineTotal = quantity * unitRate;
    const lineTax = lineTotal * (taxRate / 100);

    const [lineItem] = await db
      .insert(invoiceLineItems)
      .values({
        ...data,
        quantity: String(data.quantity || 1),
        unitRate: String(data.unitRate),
        taxRate: String(data.taxRate || 0),
        lineTotal: lineTotal.toFixed(2),
        lineTax: lineTax.toFixed(2),
      } as any)
      .returning();
    return lineItem;
  }

  async updateLineItem(id: number, updates: Partial<InvoiceLineItem>): Promise<InvoiceLineItem> {
    const [lineItem] = await db
      .update(invoiceLineItems)
      .set(updates as any)
      .where(eq(invoiceLineItems.id, id))
      .returning();
    return lineItem;
  }

  async deleteLineItem(id: number): Promise<void> {
    await db.delete(invoiceLineItems).where(eq(invoiceLineItems.id, id));
  }

  async getLineItemsByInvoice(invoiceId: number): Promise<InvoiceLineItem[]> {
    return await db
      .select()
      .from(invoiceLineItems)
      .where(eq(invoiceLineItems.invoiceId, invoiceId))
      .orderBy(invoiceLineItems.sortOrder);
  }

  // Status Log operations
  async logInvoiceStatusChange(data: InsertInvoiceStatusLog): Promise<InvoiceStatusLog> {
    const [log] = await db
      .insert(invoiceStatusLogs)
      .values(data)
      .returning();
    return log;
  }

  async getInvoiceStatusLog(invoiceId: number): Promise<InvoiceStatusLog[]> {
    return await db
      .select()
      .from(invoiceStatusLogs)
      .where(eq(invoiceStatusLogs.invoiceId, invoiceId))
      .orderBy(invoiceStatusLogs.createdAt);
  }

  // Invoice status transitions
  async updateInvoiceStatus(id: number, toStatus: InvoiceStatus, actor: string, note?: string): Promise<Invoice> {
    const invoice = await this.getInvoice(id);
    if (!invoice) {
      throw new Error("Invoice not found");
    }

    const fromStatus = invoice.status;

    // Update the invoice
    const updates: Partial<Invoice> = {
      status: toStatus,
      updatedAt: new Date(),
    };

    // Set timestamps based on status
    if (toStatus === 'sent' && !invoice.sentAt) {
      (updates as any).sentAt = new Date();
    }
    if (toStatus === 'viewed' && !invoice.viewedAt) {
      (updates as any).viewedAt = new Date();
    }
    if (toStatus === 'paid') {
      (updates as any).paidAt = new Date();
    }

    const updatedInvoice = await this.updateInvoice(id, updates);

    // Log the status change
    await this.logInvoiceStatusChange({
      invoiceId: id,
      fromStatus,
      toStatus,
      actor,
      note,
    });

    // Sync jobLog status if applicable
    if (invoice.jobLogId) {
      if (toStatus === 'sent' || toStatus === 'viewed') {
        await this.updateJobLog(invoice.jobLogId, { status: 'invoiced' });
      } else if (toStatus === 'paid') {
        await this.updateJobLog(invoice.jobLogId, { status: 'paid' });
      } else if (toStatus === 'void') {
        await this.updateJobLog(invoice.jobLogId, { status: 'completed' });
      }
    }

    return updatedInvoice;
  }

  async markInvoicesOverdue(): Promise<number> {
    const now = new Date();
    
    // Find invoices that are sent or viewed, past due date, and not already overdue
    const overdueInvoices = await db
      .select()
      .from(invoices)
      .where(and(
        sql`${invoices.status} IN ('sent', 'viewed')`,
        sql`${invoices.dueDate} < ${now}`
      ));

    let updatedCount = 0;
    for (const invoice of overdueInvoices) {
      await this.updateInvoiceStatus(invoice.id, 'overdue', 'system', 'Auto-marked overdue by cron');
      updatedCount++;
      
      // Send overdue email (BUG-002 fix)
      try {
        const client = await this.getClient(invoice.clientId);
        if (client && client.email) {
          await sendInvoiceOverdueEmail({
            clientEmail: client.email,
            clientName: client.name,
            invoiceNumber: invoice.invoiceNumber,
            dueDate: new Date(invoice.dueDate),
            total: String(invoice.total),
            viewToken: invoice.viewToken!,
          });
          console.log(`Sent overdue email for invoice ${invoice.invoiceNumber}`);
        }
      } catch (emailError) {
        console.error(`Failed to send overdue email for invoice ${invoice.invoiceNumber}:`, emailError);
      }
    }

    return updatedCount;
  }

  async createInvoiceFromJobLog(jobLogId: number, dueDate: Date, createdBy: number): Promise<Invoice> {
    const jobLog = await this.getJobLog(jobLogId);
    if (!jobLog) {
      throw new Error("Job log not found");
    }

    if (!jobLog.clientId) {
      throw new Error("Job log has no associated client");
    }

    // Get client info
    const client = await this.getClient(jobLog.clientId);
    if (!client) {
      throw new Error("Client not found");
    }

    // Create invoice with line item from job log
    const invoice = await this.createInvoice({
      clientId: jobLog.clientId,
      jobLogId,
      dueDate,
      subtotal: '0', // Will be calculated from line items
      taxTotal: '0',
      total: '0',
      createdBy,
    });

    // Create line item from job log - use default rate since jobLog doesn't have cost fields
    const unitRate = '0'; // Job log doesn't have finalCost/estimatedCost
    const quantity = '1';
    const taxRate = '6'; // PA sales tax default

    await this.createLineItem({
      invoiceId: invoice.id,
      description: jobLog.workPerformed,
      quantity,
      unitRate,
      taxRate,
    });

    // Recalculate totals
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
      total: (subtotal + taxTotal).toFixed(2),
    });

    return (await this.getInvoice(invoice.id))!;
  }

  // ==========================================
  // Reminder Implementations (SC-REMINDERS-001)
  // ==========================================

  async getReminderLogs(appointmentType?: AppointmentType, appointmentId?: number, limit = 50): Promise<ReminderLog[]> {
    let query = db.select().from(reminderLogs).orderBy(desc(reminderLogs.sentAt)).limit(limit);
    
    if (appointmentType && appointmentId) {
      return await db.select().from(reminderLogs)
        .where(and(
          eq(reminderLogs.appointmentType, appointmentType),
          eq(reminderLogs.appointmentId, appointmentId)
        ))
        .orderBy(desc(reminderLogs.sentAt))
        .limit(limit);
    } else if (appointmentType) {
      return await db.select().from(reminderLogs)
        .where(eq(reminderLogs.appointmentType, appointmentType))
        .orderBy(desc(reminderLogs.sentAt))
        .limit(limit);
    }
    
    return await query;
  }

  async createReminderLog(log: InsertReminderLog): Promise<ReminderLog> {
    const [created] = await db.insert(reminderLogs).values(log).returning();
    return created;
  }

  async getReminderLogByAppointment(appointmentType: AppointmentType, appointmentId: number, reminderType: ReminderType, channel: ReminderChannel): Promise<ReminderLog | undefined> {
    const [log] = await db.select().from(reminderLogs).where(and(
      eq(reminderLogs.appointmentType, appointmentType),
      eq(reminderLogs.appointmentId, appointmentId),
      eq(reminderLogs.reminderType, reminderType),
      eq(reminderLogs.channel, channel)
    ));
    return log || undefined;
  }

  async deleteReminderLog(id: number): Promise<void> {
    await db.delete(reminderLogs).where(eq(reminderLogs.id, id));
  }

  // Opt-out operations
  async getReminderOptOuts(): Promise<ReminderOptOut[]> {
    return await db.select().from(reminderOptOuts).orderBy(desc(reminderOptOuts.optedOutAt));
  }

  async getReminderOptOutByToken(token: string): Promise<ReminderOptOut | undefined> {
    const [optOut] = await db.select().from(reminderOptOuts).where(eq(reminderOptOuts.token, token));
    return optOut || undefined;
  }

  async getReminderOptOutByEmail(email: string): Promise<ReminderOptOut | undefined> {
    const [optOut] = await db.select().from(reminderOptOuts).where(eq(reminderOptOuts.email, email.toLowerCase()));
    return optOut || undefined;
  }

  async getReminderOptOutByPhone(phone: string): Promise<ReminderOptOut | undefined> {
    const [optOut] = await db.select().from(reminderOptOuts).where(eq(reminderOptOuts.phone, phone));
    return optOut || undefined;
  }

  async createReminderOptOut(optOut: InsertReminderOptOut & { token: string }): Promise<ReminderOptOut> {
    const [created] = await db.insert(reminderOptOuts).values({
      ...optOut,
      email: optOut.email?.toLowerCase(),
      phone: optOut.phone,
    }).returning();
    return created;
  }

  async deleteReminderOptOut(id: number): Promise<void> {
    await db.delete(reminderOptOuts).where(eq(reminderOptOuts.id, id));
  }

  // System settings operations
  async getSystemSetting(key: string): Promise<string | undefined> {
    const [setting] = await db.select().from(systemSettings).where(eq(systemSettings.key, key));
    return setting?.value;
  }

  async getAllReminderSettings(): Promise<ReminderSettings> {
    const settings: ReminderSettings = { ...DEFAULT_REMINDER_SETTINGS };
    
    for (const key of Object.keys(DEFAULT_REMINDER_SETTINGS)) {
      const value = await this.getSystemSetting(key);
      if (value !== undefined) {
        // Parse based on expected type
        if (key === 'reminder_time_hour') {
          settings[key as keyof ReminderSettings] = parseInt(value, 10) as any;
        } else if (key.endsWith('_enabled')) {
          settings[key as keyof ReminderSettings] = (value === 'true') as any;
        } else {
          (settings as any)[key] = value;
        }
      }
    }
    
    return settings;
  }

  async setSystemSetting(key: string, value: string, updatedBy?: number): Promise<SystemSetting> {
    const [setting] = await db.insert(systemSettings)
      .values({ key, value, updatedBy })
      .onConflictDoUpdate({
        target: systemSettings.key,
        set: { value, updatedBy, updatedAt: new Date() }
      })
      .returning();
    return setting;
  }

  async setReminderSettings(settings: Partial<ReminderSettings>, updatedBy?: number): Promise<ReminderSettings> {
    for (const [key, value] of Object.entries(settings)) {
      await this.setSystemSetting(key, String(value), updatedBy);
    }
    return this.getAllReminderSettings();
  }

  // ============================================
  // Review Request Operations (SC-REVIEWS-001)
  // ============================================

  async getReviewSettings(): Promise<ReviewSettings> {
    const settings: ReviewSettings = { ...DEFAULT_REVIEW_SETTINGS, id: 1, updatedAt: new Date() };
    
    const keys = [
      'review_enabled', 'review_delay_hours', 'review_google_link', 
      'review_facebook_link', 'review_cooldown_days', 
      'review_trigger_job_completion', 'review_trigger_invoice_paid',
      'review_custom_message'
    ];
    
    for (const key of keys) {
      const value = await this.getSystemSetting(key);
      if (value !== undefined) {
        const settingKey = key.replace('review_', '').replace('_enabled', 'Enabled');
        switch (settingKey) {
          case 'delayHours':
          case 'cooldownDays':
            (settings as any)[settingKey] = parseInt(value, 10);
            break;
          case 'googleReviewLink':
          case 'facebookReviewLink':
          case 'customMessage':
            (settings as any)[settingKey] = value;
            break;
          case 'enabled':
          case 'triggerJobCompletion':
          case 'triggerInvoicePaid':
            (settings as any)[settingKey] = value === 'true';
            break;
        }
      }
    }
    
    return settings;
  }

  async updateReviewSettings(updates: Partial<ReviewSettings>): Promise<ReviewSettings> {
    const settingMap: Record<string, string> = {
      'enabled': 'review_enabled',
      'delayHours': 'review_delay_hours',
      'googleReviewLink': 'review_google_link',
      'facebookReviewLink': 'review_facebook_link',
      'cooldownDays': 'review_cooldown_days',
      'triggerJobCompletion': 'review_trigger_job_completion',
      'triggerInvoicePaid': 'review_trigger_invoice_paid',
      'customMessage': 'review_custom_message',
    };

    for (const [key, value] of Object.entries(updates)) {
      const settingKey = settingMap[key];
      if (settingKey) {
        await this.setSystemSetting(settingKey, String(value));
      }
    }
    return this.getReviewSettings();
  }

  async createReviewRequestLog(log: InsertReviewRequestLog): Promise<ReviewRequestLog> {
    const [created] = await db.insert(reviewRequestLogs).values(log).returning();
    return created;
  }

  async getReviewRequestLogByJobLogId(jobLogId: number): Promise<ReviewRequestLog | undefined> {
    const [log] = await db.select().from(reviewRequestLogs).where(sql`${reviewRequestLogs.jobLogId} = ${jobLogId}`);
    return log;
  }

  async getReviewRequestLogByInvoiceId(invoiceId: number): Promise<ReviewRequestLog | undefined> {
    const [log] = await db.select().from(reviewRequestLogs).where(sql`${reviewRequestLogs.invoiceId} = ${invoiceId}`);
    return log;
  }

  async getPendingReviewRequests(): Promise<ReviewRequestLog[]> {
    return await db.select().from(reviewRequestLogs).where(and(
      sql`${reviewRequestLogs.status} = 'pending'`,
      sql`${reviewRequestLogs.scheduledSendAt} <= ${new Date()}`
    ));
  }

  async updateReviewRequestLog(id: number, updates: Partial<ReviewRequestLog>): Promise<ReviewRequestLog> {
    const [updated] = await db.update(reviewRequestLogs)
      .set(updates)
      .where(sql`${reviewRequestLogs.id} = ${id}`)
      .returning();
    return updated;
  }

  async getReviewRequestLogs(options?: { limit?: number; offset?: number; status?: string; clientId?: number }): Promise<{ logs: ReviewRequestLog[]; total: number }> {
    const limit = options?.limit || 50;
    const offset = options?.offset || 0;
    
    let whereClause = undefined;
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

    const logs = await db.select().from(reviewRequestLogs)
      .where(whereClause)
      .orderBy(sql`${reviewRequestLogs.createdAt} DESC`)
      .limit(limit)
      .offset(offset);

    // Get total count
    const [{ count }] = await db.select({ count: sql`COUNT(*)` }).from(reviewRequestLogs).where(whereClause);
    
    return { logs, total: Number(count) };
  }

  async deleteReviewRequestLog(id: number): Promise<void> {
    await db.delete(reviewRequestLogs).where(sql`${reviewRequestLogs.id} = ${id}`);
  }

  async getClientById(id: number): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(sql`${clients.id} = ${id}`);
    return client;
  }

  async getJobLogById(id: number): Promise<JobLog | undefined> {
    const [jobLog] = await db.select().from(jobLogs).where(sql`${jobLogs.id} = ${id}`);
    return jobLog;
  }

  async getInvoiceById(id: number): Promise<Invoice | undefined> {
    const [invoice] = await db.select().from(invoices).where(sql`${invoices.id} = ${id}`);
    return invoice;
  }

  async hasRecentReviewRequest(clientId: number, days: number): Promise<boolean> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const [log] = await db.select().from(reviewRequestLogs).where(and(
      sql`${reviewRequestLogs.clientId} = ${clientId}`,
      sql`${reviewRequestLogs.status} = 'sent'`,
      sql`${reviewRequestLogs.sentAt} >= ${cutoffDate}`
    ));
    
    return !!log;
  }

  async countReviewRequestsSentThisYear(clientId: number): Promise<number> {
    const startOfYear = new Date(new Date().getFullYear(), 0, 1);
    
    const [{ count }] = await db.select({ count: sql`COUNT(*)` }).from(reviewRequestLogs).where(and(
      sql`${reviewRequestLogs.clientId} = ${clientId}`,
      sql`${reviewRequestLogs.status} = 'sent'`,
      sql`${reviewRequestLogs.sentAt} >= ${startOfYear}`
    ));
    
    return Number(count);
  }

  // Query appointments for reminders
  async getInspectionsFor24hReminder(): Promise<InspectionSchedule[]> {
    const now = new Date();
    const windowStart = new Date(now.getTime() + 20 * 60 * 60 * 1000); // 20 hours from now
    const windowEnd = new Date(now.getTime() + 44 * 60 * 60 * 1000); // 44 hours from now
    
    return await db.select().from(inspectionSchedules).where(and(
      sql`${inspectionSchedules.preferredDate} BETWEEN ${windowStart} AND ${windowEnd}`,
      sql`${inspectionSchedules.status} != 'cancelled'`
    ));
  }

  async getInspectionsForSameDayReminder(): Promise<InspectionSchedule[]> {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    
    return await db.select().from(inspectionSchedules).where(and(
      sql`${inspectionSchedules.preferredDate} BETWEEN ${todayStart} AND ${todayEnd}`,
      sql`${inspectionSchedules.status} != 'cancelled'`
    ));
  }

  async getServiceRequestsFor24hReminder(): Promise<ServiceRequest[]> {
    const now = new Date();
    const windowStart = new Date(now.getTime() + 20 * 60 * 60 * 1000);
    const windowEnd = new Date(now.getTime() + 44 * 60 * 60 * 1000);
    
    return await db.select().from(serviceRequests).where(and(
      sql`${serviceRequests.scheduledDate} BETWEEN ${windowStart} AND ${windowEnd}`,
      eq(serviceRequests.status, 'scheduled')
    ));
  }

  async getServiceRequestsForSameDayReminder(): Promise<ServiceRequest[]> {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    
    return await db.select().from(serviceRequests).where(and(
      sql`${serviceRequests.scheduledDate} BETWEEN ${todayStart} AND ${todayEnd}`,
      eq(serviceRequests.status, 'scheduled')
    ));
  }

  async getJobLogsFor24hReminder(): Promise<JobLog[]> {
    const now = new Date();
    const windowStart = new Date(now.getTime() + 20 * 60 * 60 * 1000);
    const windowEnd = new Date(now.getTime() + 44 * 60 * 60 * 1000);
    
    return await db.select().from(jobLogs).where(and(
      sql`${jobLogs.jobDate} BETWEEN ${windowStart} AND ${windowEnd}`,
      eq(jobLogs.status, 'scheduled')
    ));
  }

  async getJobLogsForSameDayReminder(): Promise<JobLog[]> {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    
    return await db.select().from(jobLogs).where(and(
      sql`${jobLogs.jobDate} BETWEEN ${todayStart} AND ${todayEnd}`,
      eq(jobLogs.status, 'scheduled')
    ));
  }

  // ==========================================
  // Analytics Implementations
  // ==========================================

  async getAnalyticsOverview(from: Date, to: Date): Promise<AnalyticsOverview> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Start of current week

    // Jobs this month
    const [jobsThisMonthResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(jobLogs)
      .where(gte(jobLogs.jobDate, startOfMonth));
    const jobsThisMonth = jobsThisMonthResult?.count || 0;

    // Jobs this week
    const [jobsThisWeekResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(jobLogs)
      .where(gte(jobLogs.jobDate, startOfWeek));
    const jobsThisWeek = jobsThisWeekResult?.count || 0;

    // Active clients
    const [activeClientsResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(clients)
      .where(eq(clients.status, 'active'));
    const activeClients = activeClientsResult?.count || 0;

    // Active contracts
    const [activeContractsResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(serviceContracts)
      .where(eq(serviceContracts.isActive, true));
    const activeContracts = activeContractsResult?.count || 0;

    // Open service requests (pending or scheduled)
    const [openRequestsResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(serviceRequests)
      .where(sql`${serviceRequests.status} IN ('pending', 'scheduled')`);
    const openServiceRequests = openRequestsResult?.count || 0;

    // Overdue invoices (placeholder until Feature #5)
    const [overdueInvoicesResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(invoices)
      .where(eq(invoices.status, 'overdue'));
    const overdueInvoices = overdueInvoicesResult?.count || 0;

    // Outstanding revenue (sum of unpaid invoices - placeholder until Feature #5)
    const [outstandingResult] = await db
      .select({ total: sql<string>`COALESCE(SUM(${invoices.total}), 0)` })
      .from(invoices)
      .where(sql`${invoices.status} IN ('sent', 'viewed', 'overdue')`);
    const outstandingRevenue = parseFloat(outstandingResult?.total || '0');

    return {
      jobsThisMonth,
      jobsThisWeek,
      activeClients,
      activeContracts,
      openServiceRequests,
      overdueInvoices,
      outstandingRevenue,
    };
  }

  async getJobsOverTime(from: Date, to: Date, groupBy: 'month' | 'week' = 'month'): Promise<JobsOverTimeData[]> {
    const interval = groupBy === 'month' ? 'month' : 'week';
    
    const results = await db
      .select({
        period: sql<string>`DATE_TRUNC('${sql.raw(interval)}', ${jobLogs.jobDate})`,
        count: sql<number>`count(*)`,
      })
      .from(jobLogs)
      .where(and(gte(jobLogs.jobDate, from), lte(jobLogs.jobDate, to)))
      .groupBy(sql`DATE_TRUNC('${sql.raw(interval)}', ${jobLogs.jobDate})`)
      .orderBy(sql`DATE_TRUNC('${sql.raw(interval)}', ${jobLogs.jobDate})`);

    return results.map(r => ({
      month: new Date(r.period).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      count: Number(r.count),
    }));
  }

  async getJobsByArea(from: Date, to: Date): Promise<JobsByAreaData[]> {
    const results = await db
      .select({
        area: jobLogs.servicedArea,
        count: sql<number>`count(*)`,
      })
      .from(jobLogs)
      .where(and(gte(jobLogs.jobDate, from), lte(jobLogs.jobDate, to)))
      .groupBy(jobLogs.servicedArea)
      .orderBy(sql`count(*) DESC`);

    // Get top 6 + "Other"
    const top6 = results.slice(0, 6);
    const otherCount = results.slice(6).reduce((sum, r) => sum + Number(r.count), 0);

    const mapped = top6.map(r => ({
      area: r.area || 'Unknown',
      count: Number(r.count),
    }));

    if (otherCount > 0) {
      mapped.push({ area: 'Other', count: otherCount });
    }

    return mapped;
  }

  async getJobsByStatus(from: Date, to: Date): Promise<JobsByStatusData[]> {
    const results = await db
      .select({
        status: jobLogs.status,
        count: sql<number>`count(*)`,
      })
      .from(jobLogs)
      .where(and(gte(jobLogs.jobDate, from), lte(jobLogs.jobDate, to)))
      .groupBy(jobLogs.status)
      .orderBy(sql`count(*) DESC`);

    return results.map(r => ({
      status: r.status || 'unknown',
      count: Number(r.count),
    }));
  }

  async getEmployeeProductivity(from: Date, to: Date): Promise<EmployeeProductivityData[]> {
    const employees = await this.getFieldEmployees();
    const productivity: EmployeeProductivityData[] = [];

    for (const emp of employees) {
      // Jobs in date range
      const [periodResult] = await db
        .select({ count: sql<number>`count(*)` })
        .from(jobLogs)
        .where(and(eq(jobLogs.employeeId, emp.id), gte(jobLogs.jobDate, from), lte(jobLogs.jobDate, to)));
      
      // All time jobs
      const [allTimeResult] = await db
        .select({ count: sql<number>`count(*)` })
        .from(jobLogs)
        .where(eq(jobLogs.employeeId, emp.id));

      // Last job date
      const [lastJob] = await db
        .select({ jobDate: jobLogs.jobDate })
        .from(jobLogs)
        .where(eq(jobLogs.employeeId, emp.id))
        .orderBy(desc(jobLogs.jobDate))
        .limit(1);

      productivity.push({
        employeeId: emp.id,
        name: emp.name,
        jobsThisPeriod: Number(periodResult?.count || 0),
        jobsAllTime: Number(allTimeResult?.count || 0),
        lastJobDate: lastJob?.jobDate || null,
        isActive: emp.isActive,
      });
    }

    return productivity.sort((a, b) => b.jobsThisPeriod - a.jobsThisPeriod);
  }

  async getContractsSummary(): Promise<ContractsSummaryData> {
    const now = new Date();
    const endOfWeek = new Date(now);
    endOfWeek.setDate(now.getDate() + 7);

    // Total active
    const [totalActiveResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(serviceContracts)
      .where(eq(serviceContracts.isActive, true));
    const totalActive = Number(totalActiveResult?.count || 0);

    // Due this week
    const [dueThisWeekResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(serviceContracts)
      .where(and(
        eq(serviceContracts.isActive, true),
        gte(serviceContracts.nextScheduledDate, now),
        lte(serviceContracts.nextScheduledDate, endOfWeek)
      ));
    const dueThisWeek = Number(dueThisWeekResult?.count || 0);

    // Overdue
    const [overdueResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(serviceContracts)
      .where(and(
        eq(serviceContracts.isActive, true),
        lt(serviceContracts.nextScheduledDate, now)
      ));
    const overdue = Number(overdueResult?.count || 0);

    // By frequency
    const freqResults = await db
      .select({
        frequency: serviceContracts.frequency,
        count: sql<number>`count(*)`,
      })
      .from(serviceContracts)
      .where(eq(serviceContracts.isActive, true))
      .groupBy(serviceContracts.frequency);

    const byFrequency = freqResults.map(r => ({
      frequency: r.frequency || 'monthly',
      count: Number(r.count),
    }));

    return { totalActive, dueThisWeek, overdue, byFrequency };
  }

  async getUpcomingItems(): Promise<UpcomingItemsData> {
    const now = new Date();
    const twoWeeksLater = new Date(now);
    twoWeeksLater.setDate(now.getDate() + 14);

    // Scheduled jobs (next 14 days)
    const scheduledJobsResult = await db
      .select({
        id: jobLogs.id,
        jobDate: jobLogs.jobDate,
        customerName: jobLogs.customerName,
        workPerformed: jobLogs.workPerformed,
      })
      .from(jobLogs)
      .where(and(
        eq(jobLogs.status, 'scheduled'),
        gte(jobLogs.jobDate, now),
        lte(jobLogs.jobDate, twoWeeksLater)
      ))
      .orderBy(jobLogs.jobDate);

    const scheduledJobs: UpcomingItem[] = scheduledJobsResult.map(j => ({
      type: 'job' as const,
      id: Number(j.id),
      date: new Date(j.jobDate),
      customerName: j.customerName || 'Unknown',
      serviceType: j.workPerformed || 'Service',
    }));

    // Pending inspections
    const inspectionsResult = await db
      .select({
        id: inspectionSchedules.id,
        preferredDate: inspectionSchedules.preferredDate,
        firstName: inspectionSchedules.firstName,
        lastName: inspectionSchedules.lastName,
        serviceType: inspectionSchedules.serviceType,
      })
      .from(inspectionSchedules)
      .where(eq(inspectionSchedules.status, 'pending'))
      .orderBy(inspectionSchedules.preferredDate);

    const pendingInspections: UpcomingItem[] = inspectionsResult
      .filter(i => i.preferredDate && new Date(i.preferredDate) <= twoWeeksLater)
      .map(i => ({
        type: 'inspection' as const,
        id: Number(i.id),
        date: new Date(i.preferredDate),
        customerName: `${i.firstName || ''} ${i.lastName || ''}`.trim(),
        serviceType: i.serviceType || 'Inspection',
      }));

    // Pending service requests
    const requestsResult = await db
      .select({
        id: serviceRequests.id,
        scheduledDate: serviceRequests.scheduledDate,
        firstName: serviceRequests.firstName,
        lastName: serviceRequests.lastName,
        serviceType: serviceRequests.serviceType,
      })
      .from(serviceRequests)
      .where(sql`${serviceRequests.status} IN ('pending', 'scheduled')`)
      .orderBy(serviceRequests.scheduledDate);

    const pendingRequests: UpcomingItem[] = requestsResult
      .filter(r => r.scheduledDate && new Date(r.scheduledDate) <= twoWeeksLater)
      .map(r => ({
        type: 'request' as const,
        id: Number(r.id),
        date: new Date(r.scheduledDate),
        customerName: `${r.firstName || ''} ${r.lastName || ''}`.trim(),
        serviceType: r.serviceType || 'Service Request',
      }));

    return { scheduledJobs, pendingInspections, pendingRequests };
  }

  async getTopClients(from: Date, to: Date, limit = 10): Promise<TopClientData[]> {
    const jobWithClients = await db
      .select({
        clientId: jobLogs.clientId,
        clientName: clients.name,
        jobDate: jobLogs.jobDate,
      })
      .from(jobLogs)
      .leftJoin(clients, eq(jobLogs.clientId, clients.id))
      .where(and(gte(jobLogs.jobDate, from), lte(jobLogs.jobDate, to), sql`${jobLogs.clientId} IS NOT NULL`));

    // Group by client
    const clientMap = new Map<number, { name: string; jobs: number; lastJob: Date | null }>();
    
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
          name: job.clientName || 'Unknown',
          jobs: 1,
          lastJob: job.jobDate ? new Date(job.jobDate) : null,
        });
      }
    }

    // Check which clients have active contracts
    const activeContractClients = await db
      .select({ customerId: serviceContracts.customerId })
      .from(serviceContracts)
      .where(eq(serviceContracts.isActive, true));
    const activeClientIds = new Set(activeContractClients.map(c => c.customerId));

    const result: TopClientData[] = [];
    for (const [clientId, data] of clientMap) {
      result.push({
        clientId,
        clientName: data.name,
        totalJobs: data.jobs,
        lastJobDate: data.lastJob,
        hasActiveContract: activeClientIds.has(clientId),
      });
    }

    return result.sort((a, b) => b.totalJobs - a.totalJobs).slice(0, limit);
  }

  async getContactSubmissionsSummary(from: Date, to: Date): Promise<ContactSubmissionSummary> {
    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(contactSubmissions)
      .where(and(gte(contactSubmissions.createdAt, from), lte(contactSubmissions.createdAt, to)));

    const recentResult = await db
      .select({
        id: contactSubmissions.id,
        firstName: contactSubmissions.firstName,
        lastName: contactSubmissions.lastName,
        serviceType: contactSubmissions.serviceType,
        city: contactSubmissions.city,
        createdAt: contactSubmissions.createdAt,
      })
      .from(contactSubmissions)
      .orderBy(desc(contactSubmissions.createdAt))
      .limit(5);

    return {
      count: Number(countResult?.count || 0),
      recent: recentResult.map(r => ({
        id: Number(r.id),
        firstName: r.firstName || '',
        lastName: r.lastName || '',
        serviceType: r.serviceType || '',
        city: r.city || '',
        createdAt: new Date(r.createdAt),
      })),
    };
  }

  // ==========================================
  // Route Optimization (SC-ROUTE-001)
  // ==========================================

  async getGeocache(address: string): Promise<GeocacheEntry | undefined> {
    // Normalize address for lookup
    const normalizedAddress = address.toLowerCase().trim();
    const [result] = await db
      .select()
      .from(geocache)
      .where(eq(geocache.addressText, normalizedAddress));
    return result;
  }

  async setGeocache(entry: InsertGeocache): Promise<GeocacheEntry> {
    // Normalize address for storage
    const normalizedAddress = entry.addressText.toLowerCase().trim();
    const [result] = await db
      .insert(geocache)
      .values({
        ...entry,
        addressText: normalizedAddress,
      })
      .onConflictDoUpdate({
        target: geocache.addressText,
        set: {
          lat: entry.lat,
          lng: entry.lng,
          geocodedAt: new Date(),
          source: entry.source || 'google',
        },
      })
      .returning();
    return result;
  }

  async getDailyRoute(employeeId: number, routeDate: Date): Promise<DailyRoute | undefined> {
    // For DATE type, use the date portion only for comparison
    const dateStr = routeDate.toISOString().split('T')[0];

    const [result] = await db
      .select()
      .from(dailyRoutes)
      .where(
        and(
          eq(dailyRoutes.employeeId, employeeId),
          eq(dailyRoutes.routeDate, dateStr)
        )
      );
    return result;
  }

  async createOrUpdateDailyRoute(route: InsertDailyRoute): Promise<DailyRoute> {
    // For DATE type, use the date portion only
    const dateStr = route.routeDate.toString().split('T')[0];

    // First try to get existing route
    const existing = await this.getDailyRoute(route.employeeId, route.routeDate);

    if (existing) {
      // Update existing route
      const [result] = await db
        .update(dailyRoutes)
        .set({
          startAddress: route.startAddress,
          optimizedStopOrder: route.optimizedStopOrder,
          googleMapsUrl: route.googleMapsUrl,
          totalDistanceMeters: route.totalDistanceMeters,
          totalDurationSeconds: route.totalDurationSeconds,
          generatedAt: new Date(),
          generatedBy: route.generatedBy,
        })
        .where(eq(dailyRoutes.id, existing.id))
        .returning();
      return result;
    } else {
      // Insert new route
      const [result] = await db
        .insert(dailyRoutes)
        .values({
          employeeId: route.employeeId,
          routeDate: route.routeDate,
          startAddress: route.startAddress,
          optimizedStopOrder: route.optimizedStopOrder,
          googleMapsUrl: route.googleMapsUrl,
          totalDistanceMeters: route.totalDistanceMeters,
          totalDurationSeconds: route.totalDurationSeconds,
          generatedBy: route.generatedBy,
        })
        .returning();
      return result;
    }
  }

  async getJobLogsForRoute(employeeId: number, routeDate: Date): Promise<JobLog[]> {
    const dateStart = new Date(routeDate);
    dateStart.setHours(0, 0, 0, 0);
    const dateEnd = new Date(routeDate);
    dateEnd.setHours(23, 59, 59, 999);

    // Get job logs for this employee on this date with status 'scheduled' or 'in_progress'
    // and where siteAddress is NOT NULL (geocodable)
    const result = await db
      .select()
      .from(jobLogs)
      .where(
        and(
          eq(jobLogs.employeeId, employeeId),
          gte(jobLogs.jobDate, dateStart),
          lte(jobLogs.jobDate, dateEnd),
          sql`${jobLogs.siteAddress} IS NOT NULL`,
          sql`${jobLogs.siteAddress} != ''`,
          or(
            eq(jobLogs.status, 'scheduled'),
            eq(jobLogs.status, 'in_progress')
          )
        )
      )
      .orderBy(jobLogs.jobDate);

    return result;
  }

  // ==========================================
  // Admin Job Scheduling Operations (SC-SCHEDULING-001)
  // ==========================================

  async createScheduledJob(jobData: InsertJobLog & { scheduledBy: number; priority?: string }): Promise<JobLog> {
    // Create the job log with scheduling fields
    const [jobLog] = await db
      .insert(jobLogs)
      .values({
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
        scheduledEndTime: jobData.scheduledEndTime || null,
      })
      .returning();

    // Log the creation in schedule audit
    await this.createJobScheduleLog({
      jobLogId: jobLog.id,
      action: "created",
      performedBy: jobData.scheduledBy,
      previousValue: null,
      newValue: {
        employeeId: jobLog.employeeId,
        jobDate: jobLog.jobDate,
        status: "scheduled",
        priority: jobLog.priority || "medium",
      },
    });

    return jobLog;
  }

  async updateJobScheduling(
    id: number,
    updates: { priority?: string; adminNotes?: string; scheduledEndTime?: Date; employeeId?: number; jobDate?: Date },
    performedBy: number
  ): Promise<JobLog> {
    const existing = await this.getJobLog(id);
    if (!existing) {
      throw new Error("Job log not found");
    }

    const updateValues: any = { ...updates };
    
    // Add admin notes if provided
    if (updates.adminNotes !== undefined) {
      updateValues.adminNotes = updates.adminNotes;
    }

    const [updated] = await db
      .update(jobLogs)
      .set(updateValues)
      .where(eq(jobLogs.id, id))
      .returning();

    // Log the update in schedule audit
    const previousValue: any = {};
    const newValue: any = {};

    if (updates.priority !== undefined) {
      previousValue.priority = existing.priority;
      newValue.priority = updates.priority;
    }
    if (updates.adminNotes !== undefined) {
      previousValue.adminNotes = existing.adminNotes;
      newValue.adminNotes = updates.adminNotes;
    }
    if (updates.scheduledEndTime !== undefined) {
      previousValue.scheduledEndTime = existing.scheduledEndTime;
      newValue.scheduledEndTime = updates.scheduledEndTime;
    }
    if (updates.employeeId !== undefined) {
      previousValue.employeeId = existing.employeeId;
      newValue.employeeId = updates.employeeId;
    }
    if (updates.jobDate !== undefined) {
      previousValue.jobDate = existing.jobDate;
      newValue.jobDate = updates.jobDate;
    }

    await this.createJobScheduleLog({
      jobLogId: id,
      action: "updated",
      performedBy,
      previousValue: Object.keys(previousValue).length > 0 ? previousValue : null,
      newValue: Object.keys(newValue).length > 0 ? newValue : null,
    });

    return updated;
  }

  async assignJobToTech(jobLogId: number, employeeId: number, performedBy: number): Promise<JobLog> {
    const existing = await this.getJobLog(jobLogId);
    if (!existing) {
      throw new Error("Job log not found");
    }

    const previousEmployeeId = existing.employeeId;

    const [updated] = await db
      .update(jobLogs)
      .set({ employeeId })
      .where(eq(jobLogs.id, jobLogId))
      .returning();

    // Log the assignment in schedule audit
    await this.createJobScheduleLog({
      jobLogId,
      action: "assigned",
      performedBy,
      previousValue: { employeeId: previousEmployeeId },
      newValue: { employeeId },
    });

    return updated;
  }

  async rescheduleJob(jobLogId: number, newJobDate: Date, performedBy: number): Promise<JobLog> {
    const existing = await this.getJobLog(jobLogId);
    if (!existing) {
      throw new Error("Job log not found");
    }

    const previousJobDate = existing.jobDate;

    const [updated] = await db
      .update(jobLogs)
      .set({ jobDate: newJobDate })
      .where(eq(jobLogs.id, jobLogId))
      .returning();

    // Log the reschedule in schedule audit
    await this.createJobScheduleLog({
      jobLogId,
      action: "rescheduled",
      performedBy,
      previousValue: { jobDate: previousJobDate },
      newValue: { jobDate: newJobDate },
    });

    return updated;
  }

  async cancelScheduledJob(jobLogId: number, performedBy: number, reason?: string): Promise<JobLog> {
    const existing = await this.getJobLog(jobLogId);
    if (!existing) {
      throw new Error("Job log not found");
    }

    if (existing.status === "completed" || existing.status === "paid" || existing.status === "invoiced") {
      throw new Error("Cannot cancel a completed job");
    }

    const [updated] = await db
      .update(jobLogs)
      .set({
        status: "cancelled",
        cancelledAt: new Date(),
        cancelledBy: performedBy,
        adminNotes: reason ? `${existing.adminNotes || ""}\n\nCancellation reason: ${reason}`.trim() : existing.adminNotes,
      })
      .where(eq(jobLogs.id, jobLogId))
      .returning();

    // Log the cancellation in schedule audit
    await this.createJobScheduleLog({
      jobLogId,
      action: "cancelled",
      performedBy,
      previousValue: { status: existing.status },
      newValue: { status: "cancelled", reason },
    });

    return updated;
  }

  async getScheduledJobs(filters?: { employeeId?: number; dateFrom?: Date; dateTo?: Date; status?: string }): Promise<JobLog[]> {
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
    if (filters?.status) {
      conditions.push(eq(jobLogs.status, filters.status));
    } else {
      // Default to showing scheduled/in_progress jobs if no status filter
      conditions.push(or(eq(jobLogs.status, 'scheduled'), eq(jobLogs.status, 'in_progress')));
    }

    if (conditions.length > 0) {
      return await db.select().from(jobLogs).where(and(...conditions)).orderBy(jobLogs.jobDate);
    }
    return await db.select().from(jobLogs).orderBy(jobLogs.jobDate);
  }

  async startScheduledJob(jobLogId: number, employeeId: number): Promise<JobLog> {
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

    const [updated] = await db
      .update(jobLogs)
      .set({ status: "in_progress" })
      .where(eq(jobLogs.id, jobLogId))
      .returning();

    // Log the start in schedule audit
    await this.createJobScheduleLog({
      jobLogId,
      action: "started",
      performedBy: employeeId,
      previousValue: { status: existing.status },
      newValue: { status: "in_progress" },
    });

    return updated;
  }

  async completeScheduledJob(jobLogId: number, employeeId: number, workPerformed: string): Promise<JobLog> {
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

    const [updated] = await db
      .update(jobLogs)
      .set({ 
        status: "completed",
        workPerformed: workPerformed || existing.workPerformed,
      })
      .where(eq(jobLogs.id, jobLogId))
      .returning();

    // Log the completion in schedule audit
    await this.createJobScheduleLog({
      jobLogId,
      action: "completed",
      performedBy: employeeId,
      previousValue: { status: existing.status },
      newValue: { status: "completed", workPerformed },
    });

    return updated;
  }

  async getTodaysScheduledJobs(employeeId: number): Promise<JobLog[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return await db
      .select()
      .from(jobLogs)
      .where(
        and(
          eq(jobLogs.employeeId, employeeId),
          gte(jobLogs.jobDate, today),
          lt(jobLogs.jobDate, tomorrow),
          or(
            eq(jobLogs.status, 'scheduled'),
            eq(jobLogs.status, 'in_progress')
          )
        )
      )
      .orderBy(jobLogs.jobDate);
  }

  // ==========================================
  // Job Schedule Audit Log Operations
  // ==========================================

  async createJobScheduleLog(log: InsertJobScheduleLog): Promise<JobScheduleLog> {
    const [result] = await db
      .insert(jobScheduleLogs)
      .values({
        jobLogId: log.jobLogId,
        action: log.action,
        performedBy: log.performedBy || null,
        previousValue: log.previousValue || null,
        newValue: log.newValue || null,
      })
      .returning();

    return result;
  }

  async getJobScheduleLogs(jobLogId: number): Promise<JobScheduleLog[]> {
    return await db
      .select()
      .from(jobScheduleLogs)
      .where(eq(jobScheduleLogs.jobLogId, jobLogId))
      .orderBy(jobScheduleLogs.createdAt);
  }
}

// Export a singleton instance
export const storage = new DatabaseStorage();
}
export const storage = new DatabaseStorage();
