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
  private static FROM_EMAIL = 'samsepassi2@gmail.com'; // Verified SendGrid email
  private static SAM_EMAIL = 'samsepassi2@gmail.com';
  private static SAM_DISPLAY_NAME = 'Sam Sepassi';

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

  // Automated follow-up email sequences for interested visitors
  static async sendWelcomeEmail(to: string, name: string): Promise<boolean> {
    const subject = `Thanks for your interest in connecting, ${name}!`;
    const text = `
Hi ${name},

Thank you for reaching out through my portfolio website. I appreciate your interest in connecting!

I specialize in cybersecurity architecture, vulnerability management, and the intersection of AI with security. With experience across financial, federal, and technology sectors, I'm passionate about solving complex security challenges.

Some areas I focus on:
• Secure architecture design (AWS, Azure, on-premises)
• Vulnerability management and risk prioritization
• AI-powered threat detection and automation
• MITRE ATT&CK framework implementation
• Compliance with industry standards (NIST, SOC, etc.)

I'll get back to you soon to discuss how we might work together. In the meantime, feel free to check out my LinkedIn profile for more details about my experience.

Best regards,
Sam Sepassi
AI Interaction Engineer at Tanium

LinkedIn: https://linkedin.com/in/samsepassi1
`;

    const html = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #2c3e50;">Thanks for your interest in connecting, ${name}!</h2>
  
  <p>Thank you for reaching out through my portfolio website. I appreciate your interest in connecting!</p>
  
  <p>I specialize in <strong>cybersecurity architecture</strong>, <strong>vulnerability management</strong>, and the intersection of <strong>AI with security</strong>. With experience across financial, federal, and technology sectors, I'm passionate about solving complex security challenges.</p>
  
  <h3 style="color: #34495e;">Some areas I focus on:</h3>
  <ul style="line-height: 1.6;">
    <li>Secure architecture design (AWS, Azure, on-premises)</li>
    <li>Vulnerability management and risk prioritization</li>
    <li>AI-powered threat detection and automation</li>
    <li>MITRE ATT&CK framework implementation</li>
    <li>Compliance with industry standards (NIST, SOC, etc.)</li>
  </ul>
  
  <p>I'll get back to you soon to discuss how we might work together. In the meantime, feel free to check out my <a href="https://linkedin.com/in/samsepassi1" style="color: #3498db;">LinkedIn profile</a> for more details about my experience.</p>
  
  <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ecf0f1;">
    <p><strong>Sam Sepassi</strong><br>
    AI Interaction Engineer at Tanium</p>
    <p><a href="https://linkedin.com/in/samsepassi1" style="color: #3498db;">LinkedIn Profile</a></p>
  </div>
</div>
`;

    return await sendEmail({
      to,
      from: `${this.SAM_DISPLAY_NAME} <${this.FROM_EMAIL}>`,
      subject,
      text,
      html
    });
  }

  static async sendFollowUpEmail(to: string, name: string, daysSinceContact: number): Promise<boolean> {
    const subject = `Following up on our connection - Sam Sepassi`;
    const text = `
Hi ${name},

I wanted to follow up on your inquiry from ${daysSinceContact} days ago. I hope this message finds you well!

As someone passionate about cybersecurity and AI, I'm always interested in discussing:

• Cybersecurity consulting opportunities
• AI/ML security implementations
• Vulnerability management strategies
• Security architecture reviews
• Speaking engagements or collaboration

If you're still interested in connecting, I'd love to hear more about:
- What specific cybersecurity challenges you're facing
- Any AI security initiatives you're considering
- Opportunities for collaboration or consultation

Feel free to reply to this email or connect with me on LinkedIn. I look forward to hearing from you!

Best regards,
Sam Sepassi
AI Interaction Engineer at Tanium
`;

    const html = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #2c3e50;">Following up on our connection</h2>
  
  <p>Hi ${name},</p>
  
  <p>I wanted to follow up on your inquiry from <strong>${daysSinceContact} days ago</strong>. I hope this message finds you well!</p>
  
  <p>As someone passionate about <strong>cybersecurity and AI</strong>, I'm always interested in discussing:</p>
  
  <ul style="line-height: 1.6;">
    <li>Cybersecurity consulting opportunities</li>
    <li>AI/ML security implementations</li>
    <li>Vulnerability management strategies</li>
    <li>Security architecture reviews</li>
    <li>Speaking engagements or collaboration</li>
  </ul>
  
  <div style="background: #f8f9fa; padding: 15px; border-left: 4px solid #3498db; margin: 20px 0;">
    <p style="margin: 0;"><strong>If you're still interested in connecting, I'd love to hear more about:</strong></p>
    <ul style="margin: 10px 0 0 20px;">
      <li>What specific cybersecurity challenges you're facing</li>
      <li>Any AI security initiatives you're considering</li>
      <li>Opportunities for collaboration or consultation</li>
    </ul>
  </div>
  
  <p>Feel free to reply to this email or connect with me on <a href="https://linkedin.com/in/samsepassi1" style="color: #3498db;">LinkedIn</a>. I look forward to hearing from you!</p>
  
  <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ecf0f1;">
    <p><strong>Sam Sepassi</strong><br>
    AI Interaction Engineer at Tanium</p>
  </div>
</div>
`;

    return await sendEmail({
      to,
      from: `${this.SAM_DISPLAY_NAME} <${this.FROM_EMAIL}>`,
      subject,
      text,
      html
    });
  }
}