import { users, contactSubmissions, inspectionSchedules, serviceRequests, payments, clients, projects, milestones, dashboards, blogPosts, fieldEmployees, jobLogs, jobLogCustomFields, fieldCustomers, siteLocations, servicedAreas, serviceContracts, jobLogPhotos, invoices, invoiceLineItems, invoiceStatusLogs, type User, type InsertUser, type ContactSubmission, type InsertContact, type InspectionSchedule, type InsertInspection, type ServiceRequest, type InsertServiceRequest, type Payment, type InsertPayment, type Client, type InsertClient, type Project, type InsertProject, type Milestone, type InsertMilestone, type Dashboard, type InsertDashboard, type BlogPost, type InsertBlogPost, type FieldEmployee, type InsertFieldEmployee, type JobLog, type InsertJobLog, type JobLogCustomField, type InsertJobLogCustomField, type FieldCustomer, type InsertFieldCustomer, type SiteLocation, type InsertSiteLocation, type ServicedArea, type InsertServicedArea, type ServiceContract, type InsertServiceContract, type JobLogPhoto, type InsertJobLogPhoto, type Invoice, type InsertInvoice, type InvoiceLineItem, type InsertInvoiceLineItem, type InvoiceStatusLog, type InsertInvoiceStatusLog, type InvoiceStatus, type InvoiceStats, type InvoiceWithDetails } from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, gte, lte, lt, ilike, sql, sum } from "drizzle-orm";
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
}

export const storage = new DatabaseStorage();
