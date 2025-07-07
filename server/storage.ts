import { users, contactSubmissions, inspectionSchedules, type User, type InsertUser, type ContactSubmission, type InsertContact, type InspectionSchedule, type InsertInspection } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createContactSubmission(contact: InsertContact): Promise<ContactSubmission>;
  getContactSubmissions(): Promise<ContactSubmission[]>;
  createInspectionSchedule(inspection: InsertInspection): Promise<InspectionSchedule>;
  getInspectionSchedules(): Promise<InspectionSchedule[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

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
}

export const storage = new DatabaseStorage();
