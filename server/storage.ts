import { users, contactSubmissions, inspectionSchedules, serviceRequests, payments, type User, type InsertUser, type ContactSubmission, type InsertContact, type InspectionSchedule, type InsertInspection, type ServiceRequest, type InsertServiceRequest, type Payment, type InsertPayment } from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";
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
  
  // Service request operations
  createServiceRequest(serviceRequest: InsertServiceRequest): Promise<ServiceRequest>;
  getServiceRequestsByUser(userId: number): Promise<ServiceRequest[]>;
  updateServiceRequestStatus(id: number, status: string, updates?: Partial<ServiceRequest>): Promise<ServiceRequest>;
  
  // Payment operations
  createPayment(payment: InsertPayment): Promise<Payment>;
  getPaymentsByUser(userId: number): Promise<Payment[]>;
  updatePaymentStatus(id: number, status: string): Promise<Payment>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
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

  // Service request operations
  async createServiceRequest(insertServiceRequest: InsertServiceRequest): Promise<ServiceRequest> {
    const [serviceRequest] = await db
      .insert(serviceRequests)
      .values(insertServiceRequest)
      .returning();
    return serviceRequest;
  }

  async getServiceRequestsByUser(userId: number): Promise<ServiceRequest[]> {
    return await db.select().from(serviceRequests).where(eq(serviceRequests.userId, userId));
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
}

export const storage = new DatabaseStorage();
