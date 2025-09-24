import { storage } from '../storage';
import { EmailNotificationService } from './email';
import type { InsertEmailFollowUp, ContactSubmission } from '@shared/schema';

export class EmailSchedulerService {
  private processingInterval: NodeJS.Timeout | null = null;
  private isInitialized = false;
  
  constructor() {
    // Don't start processing immediately - wait for explicit initialization
  }

  // Initialize after server startup to avoid blocking
  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    console.log('Initializing email scheduler service...');
    
    // Start processing in background without awaiting to not block startup
    this.startProcessing();
    this.isInitialized = true;
  }

  // Schedule email follow-up sequence for a new contact
  async scheduleFollowUpSequence(contact: ContactSubmission): Promise<void> {
    const now = new Date();
    
    // Schedule welcome email (immediate)
    const welcomeEmail: InsertEmailFollowUp = {
      contactId: contact.id,
      emailType: 'welcome',
      emailSent: false,
      sentAt: null,
      scheduledFor: now
    };
    
    // Schedule 3-day follow-up email
    const threeDayFollowUp: InsertEmailFollowUp = {
      contactId: contact.id,
      emailType: 'follow_up_3_days',
      emailSent: false,
      sentAt: null,
      scheduledFor: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000) // 3 days from now
    };
    
    // Schedule 7-day follow-up email
    const sevenDayFollowUp: InsertEmailFollowUp = {
      contactId: contact.id,
      emailType: 'follow_up_7_days',
      emailSent: false,
      sentAt: null,
      scheduledFor: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
    };

    try {
      await Promise.all([
        storage.createEmailFollowUp(welcomeEmail),
        storage.createEmailFollowUp(threeDayFollowUp),
        storage.createEmailFollowUp(sevenDayFollowUp)
      ]);
      
      console.log(`Scheduled email follow-up sequence for contact: ${contact.email}`);
      
      // Process immediately to send welcome email right away
      await this.processPendingEmails();
    } catch (error) {
      console.error('Error scheduling email follow-up sequence:', error);
    }
  }

  // Process all pending emails
  async processPendingEmails(): Promise<void> {
    try {
      const pendingEmails = await storage.getPendingEmailFollowUps();
      
      if (pendingEmails.length === 0) {
        return;
      }

      console.log(`Processing ${pendingEmails.length} pending email(s)`);
      
      for (const followUp of pendingEmails) {
        await this.sendFollowUpEmail(followUp);
      }
    } catch (error) {
      console.error('Error processing pending emails:', error);
    }
  }

  // Send a specific follow-up email
  private async sendFollowUpEmail(followUp: any): Promise<void> {
    try {
      // Get the contact details (we'll need to join with contacts table)
      const contacts = await storage.getContactSubmissions();
      const contact = contacts.find(c => c.id === followUp.contactId);
      
      if (!contact) {
        console.error(`Contact not found for follow-up: ${followUp.contactId}`);
        return;
      }

      let emailSent = false;
      
      // Ensure we have valid email and name
      if (!contact.email) {
        console.error(`No email address for contact: ${followUp.contactId}`);
        return;
      }
      
      const contactName = contact.name || 'there';

      switch (followUp.emailType) {
        case 'welcome':
          emailSent = await EmailNotificationService.sendWelcomeEmail(contact.email, contactName);
          console.log(`Welcome email sent to ${contact.email}: ${emailSent}`);
          break;
          
        case 'follow_up_3_days':
          emailSent = await EmailNotificationService.sendFollowUpEmail(contact.email, contactName, 3);
          console.log(`3-day follow-up email sent to ${contact.email}: ${emailSent}`);
          break;
          
        case 'follow_up_7_days':
          emailSent = await EmailNotificationService.sendFollowUpEmail(contact.email, contactName, 7);
          console.log(`7-day follow-up email sent to ${contact.email}: ${emailSent}`);
          break;
          
        default:
          console.error(`Unknown email type: ${followUp.emailType}`);
          return;
      }
      
      // Only mark as sent if the email was actually successful
      if (emailSent) {
        await storage.markEmailFollowUpSent(followUp.id);
        console.log(`Successfully sent ${followUp.emailType} email to ${contact.email}`);
      } else {
        // Leave as pending for retry on next processing cycle
        console.error(`Failed to send ${followUp.emailType} email to ${contact.email} - will retry later`);
      }
      
    } catch (error) {
      console.error(`Error sending follow-up email ${followUp.id}:`, error);
      // Leave as pending for retry - do not mark as sent on error
      // In production, you might want to add retry count tracking and eventual failure handling
    }
  }

  // Start the email processing interval
  private startProcessing(): void {
    // Process after a short delay to not block startup
    setTimeout(() => {
      this.processPendingEmails();
    }, 2000); // 2 second delay
    
    // Then process every 5 minutes
    this.processingInterval = setInterval(() => {
      this.processPendingEmails();
    }, 5 * 60 * 1000); // 5 minutes
    
    console.log('Email scheduler service started - processing every 5 minutes');
  }

  // Stop the email processing interval
  stop(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
      console.log('Email scheduler service stopped');
    }
  }
}

// Create singleton instance (but don't auto-start)
export const emailScheduler = new EmailSchedulerService();

// Note: Graceful shutdown is now handled in server/index.ts