import { MailService } from '@sendgrid/mail';

if (!process.env.SENDGRID_API_KEY) {
  throw new Error("SENDGRID_API_KEY environment variable must be set");
}

const mailService = new MailService();
mailService.setApiKey(process.env.SENDGRID_API_KEY);

interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  try {
    await mailService.send({
      to: params.to,
      from: params.from,
      subject: params.subject,
      text: params.text,
      html: params.html,
    });
    console.log(`Email sent successfully to ${params.to}`);
    return true;
  } catch (error) {
    console.error('SendGrid email error:', error);
    return false;
  }
}

// Email service for Sam Sepassi's portfolio notifications
export class EmailNotificationService {
  private static FROM_EMAIL = 'noreply@samsepassi.com'; // This should be a verified SendGrid email
  private static SAM_EMAIL = 'samsepassi2@gmail.com';

  static async notifyContactSubmission(name: string, email: string, message?: string | null): Promise<boolean> {
    const subject = `New Contact Submission from ${name}`;
    const text = `
New contact submission on your portfolio website:

Name: ${name}
Email: ${email}
Message: ${message || 'No message provided'}

Reply to this email to respond directly to the visitor.
`;

    const html = `
<h2>New Contact Submission</h2>
<p>Someone has submitted a contact form on your portfolio website:</p>
<ul>
<li><strong>Name:</strong> ${name}</li>
<li><strong>Email:</strong> <a href="mailto:${email}">${email}</a></li>
<li><strong>Message:</strong> ${message || 'No message provided'}</li>
</ul>
<p>Reply to this email to respond directly to the visitor.</p>
`;

    return await sendEmail({
      to: this.SAM_EMAIL,
      from: this.FROM_EMAIL,
      subject,
      text,
      html
    });
  }

  static async notifyUnknownQuestion(question: string): Promise<boolean> {
    const subject = `AI Assistant - Unknown Question Recorded`;
    const text = `
Your AI assistant encountered a question it couldn't answer:

Question: "${question}"

Consider adding this information to your resume or training data to improve future responses.
`;

    const html = `
<h2>Unknown Question Recorded</h2>
<p>Your AI assistant encountered a question it couldn't answer:</p>
<blockquote style="background: #f5f5f5; padding: 10px; border-left: 3px solid #007bff;">
"${question}"
</blockquote>
<p>Consider adding this information to your resume or training data to improve future responses.</p>
`;

    return await sendEmail({
      to: this.SAM_EMAIL,
      from: this.FROM_EMAIL,
      subject,
      text,
      html
    });
  }
}