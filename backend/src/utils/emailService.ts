import nodemailer from 'nodemailer';
import {
  orderConfirmationTemplate,
  orderShippedTemplate,
  orderDeliveredTemplate,
  orderStatusUpdateTemplate,
  passwordResetTemplate,
  welcomeEmailTemplate,
  OrderEmailData,
} from '../templates/emailTemplates';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  cc?: string;
  bcc?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private isConfigured: boolean = false;

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const smtpHost = process.env.SMTP_HOST;
    const smtpUser = process.env.SMTP_USER || process.env.EMAIL_USER;
    const smtpPass = process.env.SMTP_PASS || process.env.EMAIL_PASS;

    // Check if SMTP is configured
    if (!smtpHost || !smtpUser || !smtpPass) {
      console.warn('⚠️  SMTP not configured. Email sending will be disabled.');
      console.warn('   Set SMTP_HOST, SMTP_USER, and SMTP_PASS environment variables to enable emails.');
      this.isConfigured = false;
      return;
    }

    try {
      // Support for different SMTP providers
      const config: any = {
        host: smtpHost,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      };

      // Gmail OAuth2 support
      if (process.env.SMTP_SERVICE === 'gmail' && process.env.SMTP_CLIENT_ID) {
        config.service = 'gmail';
        config.auth = {
          type: 'OAuth2',
          user: smtpUser,
          clientId: process.env.SMTP_CLIENT_ID,
          clientSecret: process.env.SMTP_CLIENT_SECRET,
          refreshToken: process.env.SMTP_REFRESH_TOKEN,
        };
      }

      // SendGrid support
      if (process.env.SMTP_SERVICE === 'sendgrid') {
        config.service = 'SendGrid';
      }

      // AWS SES support
      if (process.env.SMTP_SERVICE === 'ses') {
        config.host = `email-smtp.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com`;
        config.port = 587;
        config.secure = false;
      }

      this.transporter = nodemailer.createTransport(config);
      this.isConfigured = true;
      console.log('✅ Email service configured successfully');
    } catch (error) {
      console.error('❌ Failed to configure email service:', error);
      this.isConfigured = false;
    }
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.isConfigured || !this.transporter) {
      console.warn('Email not sent - SMTP not configured:', options.subject);
      return false;
    }

    try {
      const fromEmail = process.env.SMTP_USER || process.env.EMAIL_USER || 'noreply@zyntherraa.com';
      const fromName = process.env.EMAIL_FROM_NAME || 'Zyntherraa';

      const mailOptions = {
        from: `"${fromName}" <${fromEmail}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        cc: options.cc,
        bcc: options.bcc,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email sent successfully:', info.messageId, 'to:', options.to);
      return true;
    } catch (error: any) {
      console.error('❌ Error sending email:', error.message);
      // Don't throw - fail gracefully
      return false;
    }
  }

  // Send order confirmation email
  async sendOrderConfirmation(data: OrderEmailData): Promise<boolean> {
    const html = orderConfirmationTemplate(data);
    return this.sendEmail({
      to: data.customerEmail,
      subject: `Order Confirmation - ${data.orderNumber}`,
      html,
    });
  }

  // Send order shipped email
  async sendOrderShipped(data: OrderEmailData): Promise<boolean> {
    const html = orderShippedTemplate(data);
    return this.sendEmail({
      to: data.customerEmail,
      subject: `Your Order Has Shipped - ${data.orderNumber}`,
      html,
    });
  }

  // Send order delivered email
  async sendOrderDelivered(data: OrderEmailData): Promise<boolean> {
    const html = orderDeliveredTemplate(data);
    return this.sendEmail({
      to: data.customerEmail,
      subject: `Your Order Has Been Delivered - ${data.orderNumber}`,
      html,
    });
  }

  // Send order status update email
  async sendOrderStatusUpdate(data: OrderEmailData): Promise<boolean> {
    const html = orderStatusUpdateTemplate(data);
    return this.sendEmail({
      to: data.customerEmail,
      subject: `Order Status Update - ${data.orderNumber}`,
      html,
    });
  }

  // Send password reset email
  async sendPasswordReset(data: { email: string; name: string; resetLink: string; expiryHours?: number }): Promise<boolean> {
    const html = passwordResetTemplate({
      name: data.name,
      resetLink: data.resetLink,
      expiryHours: data.expiryHours || 1,
    });
    return this.sendEmail({
      to: data.email,
      subject: 'Reset Your Zyntherraa Password',
      html,
    });
  }

  // Send welcome email (after email verification)
  async sendWelcomeEmail(data: { email: string; name: string }): Promise<boolean> {
    const html = welcomeEmailTemplate({ name: data.name });
    return this.sendEmail({
      to: data.email,
      subject: 'Welcome to Zyntherraa!',
      html,
    });
  }

  async sendOTP(email: string, otp: string, purpose: 'registration' | 'login' | 'password-reset'): Promise<boolean> {
    let subject = '';
    let message = '';

    switch (purpose) {
      case 'registration':
        subject = 'Verify Your Zyntherraa Account';
        message = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #1a1a1a;">Welcome to Zyntherraa!</h2>
            <p>Thank you for registering. Please verify your email address using the OTP below:</p>
            <div style="background-color: #f8f9fa; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
              <h1 style="color: #1a1a1a; font-size: 32px; letter-spacing: 8px; margin: 0;">${otp}</h1>
            </div>
            <p>This OTP will expire in 10 minutes.</p>
            <p style="color: #666; font-size: 12px;">If you didn't create an account, please ignore this email.</p>
          </div>
        `;
        break;
      case 'login':
        subject = 'Your Zyntherraa Login OTP';
        message = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #1a1a1a;">Login Verification</h2>
            <p>You requested to login to your Zyntherraa account. Use the OTP below to complete your login:</p>
            <div style="background-color: #f8f9fa; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
              <h1 style="color: #1a1a1a; font-size: 32px; letter-spacing: 8px; margin: 0;">${otp}</h1>
            </div>
            <p>This OTP will expire in 10 minutes.</p>
            <p style="color: #666; font-size: 12px;">If you didn't request this, please secure your account immediately.</p>
          </div>
        `;
        break;
      case 'password-reset':
        subject = 'Reset Your Zyntherraa Password';
        message = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #1a1a1a;">Password Reset Request</h2>
            <p>You requested to reset your password. Use the OTP below to verify your identity:</p>
            <div style="background-color: #f8f9fa; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
              <h1 style="color: #1a1a1a; font-size: 32px; letter-spacing: 8px; margin: 0;">${otp}</h1>
            </div>
            <p>This OTP will expire in 10 minutes.</p>
            <p style="color: #666; font-size: 12px;">If you didn't request a password reset, please ignore this email.</p>
          </div>
        `;
        break;
    }

    return this.sendEmail({
      to: email,
      subject,
      html: message,
    });
  }
}

export default new EmailService();

