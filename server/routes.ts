import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertChatMessageSchema, insertContactSubmissionSchema, insertUnknownQuestionSchema } from "@shared/schema";
import { AIService } from "./services/openai";
import { ResumeParser } from "./services/resume-parser";

// Initialize AI service with Sam's data
const aiService = new AIService(
  ResumeParser.getSamSummary(),
  ResumeParser.getSamLinkedInProfile()
);

// Notification function (can be replaced with actual notification service)
async function sendNotification(message: string) {
  console.log(`NOTIFICATION: ${message}`);
  // TODO: Implement actual notification service (Pushover, email, etc.)
}

export async function registerRoutes(app: Express): Promise<Server> {
  
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
            await storage.createContactSubmission({
              email: args.email,
              name: args.name || "Name not provided",
              notes: args.notes || "Provided during chat interaction"
            });
            
            await sendNotification(`New contact from chat: ${args.name || 'Unknown'} - ${args.email}`);
          } else if (toolCall.function.name === "record_unknown_question") {
            await storage.createUnknownQuestion({
              question: args.question
            });
            
            await sendNotification(`Unknown question recorded: ${args.question}`);
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
      
      await sendNotification(
        `New contact submission: ${submission.name || 'Unknown'} - ${submission.email}${submission.message ? ` - Message: ${submission.message}` : ''}`
      );
      
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

  const httpServer = createServer(app);
  return httpServer;
}
