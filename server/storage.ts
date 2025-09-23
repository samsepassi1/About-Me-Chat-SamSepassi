import { 
  type User, 
  type InsertUser, 
  type ChatMessage, 
  type InsertChatMessage,
  type ContactSubmission,
  type InsertContactSubmission,
  type UnknownQuestion,
  type InsertUnknownQuestion
} from "@shared/schema";
import { randomUUID } from "crypto";

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
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private chatMessages: Map<string, ChatMessage>;
  private contactSubmissions: Map<string, ContactSubmission>;
  private unknownQuestions: Map<string, UnknownQuestion>;

  constructor() {
    this.users = new Map();
    this.chatMessages = new Map();
    this.contactSubmissions = new Map();
    this.unknownQuestions = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const id = randomUUID();
    const message: ChatMessage = {
      ...insertMessage,
      id,
      timestamp: new Date(),
    };
    this.chatMessages.set(id, message);
    return message;
  }

  async getChatMessagesBySession(sessionId: string): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values())
      .filter(msg => msg.sessionId === sessionId)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  async createContactSubmission(insertSubmission: InsertContactSubmission): Promise<ContactSubmission> {
    const id = randomUUID();
    const submission: ContactSubmission = {
      ...insertSubmission,
      id,
      timestamp: new Date(),
      notified: false,
    };
    this.contactSubmissions.set(id, submission);
    return submission;
  }

  async getContactSubmissions(): Promise<ContactSubmission[]> {
    return Array.from(this.contactSubmissions.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async createUnknownQuestion(insertQuestion: InsertUnknownQuestion): Promise<UnknownQuestion> {
    const id = randomUUID();
    const question: UnknownQuestion = {
      ...insertQuestion,
      id,
      timestamp: new Date(),
      notified: false,
    };
    this.unknownQuestions.set(id, question);
    return question;
  }

  async getUnknownQuestions(): Promise<UnknownQuestion[]> {
    return Array.from(this.unknownQuestions.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }
}

export const storage = new MemStorage();
