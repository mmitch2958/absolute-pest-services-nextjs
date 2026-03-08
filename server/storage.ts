import { users, contactSubmissions, inspectionSchedules, serviceRequests, payments, clients, projects, milestones, dashboards, blogPosts, fieldEmployees, jobLogs, jobLogCustomFields, fieldCustomers, siteLocations, servicedAreas, jobLogPhotos, type User, type InsertUser, type ContactSubmission, type InsertContact, type InspectionSchedule, type InsertInspection, type ServiceRequest, type InsertServiceRequest, type Payment, type InsertPayment, type Client, type InsertClient, type Project, type InsertProject, type Milestone, type InsertMilestone, type Dashboard, type InsertDashboard, type BlogPost, type InsertBlogPost, type FieldEmployee, type InsertFieldEmployee, type JobLog, type InsertJobLog, type JobLogCustomField, type InsertJobLogCustomField, type FieldCustomer, type InsertFieldCustomer, type SiteLocation, type InsertSiteLocation, type ServicedArea, type InsertServicedArea, type JobLogPhoto, type InsertJobLogPhoto } from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, gte, lte, ilike } from "drizzle-orm";
import bcrypt from "bcrypt";

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
  getJobLogs(filters?: { employeeId?: number; customerName?: string; clientId?: number; dateFrom?: Date; dateTo?: Date; siteLocation?: string; servicedArea?: string; status?: string }): Promise<JobLog[]>;
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

  // Job Log Photo operations
  createJobLogPhoto(data: InsertJobLogPhoto): Promise<JobLogPhoto>;
  getJobLogPhotos(jobLogId: number): Promise<JobLogPhoto[]>;
  deleteJobLogPhoto(id: number, jobLogId: number): Promise<void>;
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

  async getJobLogs(filters?: { employeeId?: number; customerName?: string; clientId?: number; dateFrom?: Date; dateTo?: Date; siteLocation?: string; servicedArea?: string; status?: string }): Promise<JobLog[]> {
    const conditions = [];
    if (filters?.employeeId) conditions.push(eq(jobLogs.employeeId, filters.employeeId));
    if (filters?.customerName) conditions.push(eq(jobLogs.customerName, filters.customerName));
    if (filters?.clientId) conditions.push(eq(jobLogs.clientId, filters.clientId));
    if (filters?.dateFrom) conditions.push(gte(jobLogs.jobDate, filters.dateFrom));
    if (filters?.dateTo) conditions.push(lte(jobLogs.jobDate, filters.dateTo));
    if (filters?.siteLocation) conditions.push(eq(jobLogs.siteLocation, filters.siteLocation));
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
}

export const storage = new DatabaseStorage();
