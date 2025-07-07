import { users, contactSubmissions, inspectionSchedules, type User, type InsertUser, type ContactSubmission, type InsertContact, type InspectionSchedule, type InsertInspection } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createContactSubmission(contact: InsertContact): Promise<ContactSubmission>;
  getContactSubmissions(): Promise<ContactSubmission[]>;
  createInspectionSchedule(inspection: InsertInspection): Promise<InspectionSchedule>;
  getInspectionSchedules(): Promise<InspectionSchedule[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private contactSubmissions: Map<number, ContactSubmission>;
  private inspectionSchedules: Map<number, InspectionSchedule>;
  private currentUserId: number;
  private currentContactId: number;
  private currentInspectionId: number;

  constructor() {
    this.users = new Map();
    this.contactSubmissions = new Map();
    this.inspectionSchedules = new Map();
    this.currentUserId = 1;
    this.currentContactId = 1;
    this.currentInspectionId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createContactSubmission(insertContact: InsertContact): Promise<ContactSubmission> {
    const id = this.currentContactId++;
    const contact: ContactSubmission = {
      ...insertContact,
      id,
      createdAt: new Date(),
    };
    this.contactSubmissions.set(id, contact);
    return contact;
  }

  async getContactSubmissions(): Promise<ContactSubmission[]> {
    return Array.from(this.contactSubmissions.values());
  }

  async createInspectionSchedule(insertInspection: InsertInspection): Promise<InspectionSchedule> {
    const id = this.currentInspectionId++;
    const inspection: InspectionSchedule = {
      ...insertInspection,
      id,
      status: "pending",
      createdAt: new Date(),
      message: insertInspection.message || null,
    };
    this.inspectionSchedules.set(id, inspection);
    return inspection;
  }

  async getInspectionSchedules(): Promise<InspectionSchedule[]> {
    return Array.from(this.inspectionSchedules.values());
  }
}

export const storage = new MemStorage();
