import { 
  type User, 
  type InsertUser, 
  type ChatMessage, 
  type InsertChatMessage,
  type ContactSubmission,
  type InsertContactSubmission,
  type UnknownQuestion,
  type InsertUnknownQuestion,
  type EmailFollowUp,
  type InsertEmailFollowUp,
  users,
  chatMessages,
  contactSubmissions,
  unknownQuestions,
  emailFollowUps
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, lte } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  getChatMessagesBySession(sessionId: string): Promise<ChatMessage[]>;
  
  createContactSubmission(submission: InsertContactSubmission): Promise<ContactSubmission>;
  getContactSubmissions(): Promise<ContactSubmission[]>;
  
  createUnknownQuestion(question: InsertUnknownQuestion): Promise<UnknownQuestion>;
  getUnknownQuestions(): Promise<UnknownQuestion[]>;
  
  createEmailFollowUp(followUp: InsertEmailFollowUp): Promise<EmailFollowUp>;
  getPendingEmailFollowUps(): Promise<EmailFollowUp[]>;
  markEmailFollowUpSent(id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
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

  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const [message] = await db
      .insert(chatMessages)
      .values(insertMessage)
      .returning();
    return message;
  }

  async getChatMessagesBySession(sessionId: string): Promise<ChatMessage[]> {
    return await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.sessionId, sessionId))
      .orderBy(chatMessages.timestamp);
  }

  async createContactSubmission(insertSubmission: InsertContactSubmission): Promise<ContactSubmission> {
    const [submission] = await db
      .insert(contactSubmissions)
      .values(insertSubmission)
      .returning();
    return submission;
  }

  async getContactSubmissions(): Promise<ContactSubmission[]> {
    return await db
      .select()
      .from(contactSubmissions)
      .orderBy(desc(contactSubmissions.timestamp));
  }

  async createUnknownQuestion(insertQuestion: InsertUnknownQuestion): Promise<UnknownQuestion> {
    const [question] = await db
      .insert(unknownQuestions)
      .values(insertQuestion)
      .returning();
    return question;
  }

  async getUnknownQuestions(): Promise<UnknownQuestion[]> {
    return await db
      .select()
      .from(unknownQuestions)
      .orderBy(desc(unknownQuestions.timestamp));
  }

  async createEmailFollowUp(insertFollowUp: InsertEmailFollowUp): Promise<EmailFollowUp> {
    const [followUp] = await db
      .insert(emailFollowUps)
      .values(insertFollowUp)
      .returning();
    return followUp;
  }

  async getPendingEmailFollowUps(): Promise<EmailFollowUp[]> {
    const now = new Date();
    return await db
      .select()
      .from(emailFollowUps)
      .where(
        and(
          eq(emailFollowUps.emailSent, false),
          lte(emailFollowUps.scheduledFor, now)
        )
      )
      .orderBy(emailFollowUps.scheduledFor);
  }

  async markEmailFollowUpSent(id: string): Promise<void> {
    await db
      .update(emailFollowUps)
      .set({ 
        emailSent: true, 
        sentAt: new Date() 
      })
      .where(eq(emailFollowUps.id, id));
  }
}

export const storage = new DatabaseStorage();