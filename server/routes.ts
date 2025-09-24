import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertChatMessageSchema, insertContactSubmissionSchema, insertUnknownQuestionSchema } from "@shared/schema";
import { AIService } from "./services/openai";
import { ResumeParser } from "./services/resume-parser";
import { EmailNotificationService } from "./services/email";
import { emailScheduler } from "./services/emailScheduler";

// Initialize AI service with Sam's data
const aiService = new AIService(
  ResumeParser.getSamSummary(),
  ResumeParser.getSamLinkedInProfile()
);

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Health check endpoints for Cloud Run
  app.get("/health", (req, res) => {
    res.status(200).json({ 
      status: "healthy", 
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  });

  app.get("/ready", (req, res) => {
    res.status(200).json({ 
      status: "ready",
      services: {
        emailScheduler: "ready",
        database: "ready"
      },
      timestamp: new Date().toISOString()
    });
  });
  
  // Chat endpoint
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, sessionId, messageHistory = [] } = req.body;
      
      if (!message || !sessionId) {
        return res.status(400).json({ error: "Message and sessionId are required" });
      }

      // Store user message
      await storage.createChatMessage({
        sessionId,
        content: message,
        sender: "user"
      });

      // Get AI response
      const aiResponse = await aiService.chat(message, messageHistory);

      // Store AI message
      await storage.createChatMessage({
        sessionId,
        content: aiResponse.content,
        sender: "ai"
      });

      // Handle tool calls
      if (aiResponse.toolCalls) {
        for (const toolCall of aiResponse.toolCalls) {
          const args = JSON.parse(toolCall.function.arguments);
          
          if (toolCall.function.name === "record_user_details") {
            const contactSubmission = await storage.createContactSubmission({
              email: args.email,
              name: args.name || "Name not provided",
              notes: args.notes || "Provided during chat interaction"
            });
            
            // Send immediate notification to Sam
            await EmailNotificationService.notifyContactSubmission(
              args.name || 'Name not provided',
              args.email,
              args.notes
            );
            
            // Schedule automated follow-up sequence
            await emailScheduler.scheduleFollowUpSequence(contactSubmission);
          } else if (toolCall.function.name === "record_unknown_question") {
            await storage.createUnknownQuestion({
              question: args.question
            });
            
            await EmailNotificationService.notifyUnknownQuestion(args.question);
          }
        }
      }

      res.json({ 
        response: aiResponse.content,
        success: true 
      });
    } catch (error) {
      console.error("Chat error:", error);
      res.status(500).json({ error: "Failed to process chat message" });
    }
  });

  // Contact form submission
  app.post("/api/contact", async (req, res) => {
    try {
      const validatedData = insertContactSubmissionSchema.parse(req.body);
      
      const submission = await storage.createContactSubmission(validatedData);
      
      // Send immediate notification to Sam
      await EmailNotificationService.notifyContactSubmission(
        submission.name || 'Name not provided',
        submission.email,
        submission.message
      );
      
      // Schedule automated follow-up sequence
      await emailScheduler.scheduleFollowUpSequence(submission);
      
      res.json({ success: true, id: submission.id });
    } catch (error) {
      console.error("Contact submission error:", error);
      res.status(400).json({ error: "Invalid contact data" });
    }
  });

  // Get chat history
  app.get("/api/chat/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const messages = await storage.getChatMessagesBySession(sessionId);
      res.json(messages);
    } catch (error) {
      console.error("Get chat history error:", error);
      res.status(500).json({ error: "Failed to get chat history" });
    }
  });

  // Analytics endpoints
  app.get("/api/analytics/dashboard", async (req, res) => {
    try {
      const contacts = await storage.getContactSubmissions();
      const unknownQuestions = await storage.getUnknownQuestions();
      
      // Get chat statistics
      const totalMessages = await storage.getTotalChatMessages();
      const uniqueSessions = await storage.getUniqueChatSessions();
      
      // Calculate growth metrics (last 7 days vs previous 7 days)
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
      
      const recentContacts = contacts.filter(c => c.timestamp >= sevenDaysAgo);
      const previousContacts = contacts.filter(c => c.timestamp >= fourteenDaysAgo && c.timestamp < sevenDaysAgo);
      
      res.json({
        overview: {
          totalContacts: contacts.length,
          totalChatMessages: totalMessages,
          uniqueChatSessions: uniqueSessions,
          unknownQuestions: unknownQuestions.length
        },
        growth: {
          contactsThisWeek: recentContacts.length,
          contactsLastWeek: previousContacts.length,
          contactGrowth: recentContacts.length - previousContacts.length
        },
        recentActivity: {
          contacts: contacts.slice(0, 5),
          unknownQuestions: unknownQuestions.slice(0, 5)
        }
      });
    } catch (error) {
      console.error("Analytics dashboard error:", error);
      res.status(500).json({ error: "Failed to get analytics data" });
    }
  });

  app.get("/api/analytics/contacts", async (req, res) => {
    try {
      const contacts = await storage.getContactSubmissions();
      
      // Group by day for the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const dailyContacts = new Map();
      
      // Initialize all days with 0
      for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        dailyContacts.set(dateStr, 0);
      }
      
      // Count actual contacts
      contacts
        .filter(c => c.timestamp >= thirtyDaysAgo)
        .forEach(contact => {
          const dateStr = contact.timestamp.toISOString().split('T')[0];
          dailyContacts.set(dateStr, (dailyContacts.get(dateStr) || 0) + 1);
        });
      
      // Convert to array and sort by date
      const timeSeriesData = Array.from(dailyContacts.entries())
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date));
      
      res.json({
        totalContacts: contacts.length,
        timeSeries: timeSeriesData,
        recentContacts: contacts.slice(0, 10)
      });
    } catch (error) {
      console.error("Contact analytics error:", error);
      res.status(500).json({ error: "Failed to get contact analytics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
