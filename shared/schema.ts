import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, json, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull(),
  content: text("content").notNull(),
  sender: varchar("sender").notNull(), // 'user' | 'ai'
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const contactSubmissions = pgTable("contact_submissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name"),
  email: text("email").notNull(),
  message: text("message"),
  notes: text("notes"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  notified: boolean("notified").default(false),
});

export const unknownQuestions = pgTable("unknown_questions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  question: text("question").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  notified: boolean("notified").default(false),
});

export const emailFollowUps = pgTable("email_follow_ups", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  contactId: varchar("contact_id").references(() => contactSubmissions.id).notNull(),
  emailType: varchar("email_type").notNull(), // 'welcome', 'follow_up_3_days', 'follow_up_7_days'
  emailSent: boolean("email_sent").default(false),
  sentAt: timestamp("sent_at"),
  scheduledFor: timestamp("scheduled_for").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  timestamp: true,
});

export const insertContactSubmissionSchema = createInsertSchema(contactSubmissions).omit({
  id: true,
  timestamp: true,
  notified: true,
});

export const insertUnknownQuestionSchema = createInsertSchema(unknownQuestions).omit({
  id: true,
  timestamp: true,
  notified: true,
});

export const insertEmailFollowUpSchema = createInsertSchema(emailFollowUps).omit({
  id: true,
  timestamp: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;

export type ContactSubmission = typeof contactSubmissions.$inferSelect;
export type InsertContactSubmission = z.infer<typeof insertContactSubmissionSchema>;

export type UnknownQuestion = typeof unknownQuestions.$inferSelect;
export type InsertUnknownQuestion = z.infer<typeof insertUnknownQuestionSchema>;

export type EmailFollowUp = typeof emailFollowUps.$inferSelect;
export type InsertEmailFollowUp = z.infer<typeof insertEmailFollowUpSchema>;
