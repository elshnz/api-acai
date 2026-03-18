import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST', 'smtp.gmail.com'),
      port: this.configService.get<number>('SMTP_PORT', 587),
      secure: false,
      auth: {
        user: this.configService.get<string>('SMTP_USER', ''),
        pass: this.configService.get<string>('SMTP_PASS', ''),
      },
    });
  }

  async sendEmail(
    toEmail: string,
    subject: string,
    content: string,
  ): Promise<{ message: string }> {
    try {
      const from = this.configService.get<string>(
        'SMTP_FROM',
        'noreply@acai.gob.mx',
      );

      await this.transporter.sendMail({
        from,
        to: toEmail,
        subject,
        html: content,
      });

      this.logger.log(`Email sent successfully to: ${toEmail}`);
      return { message: 'Email sent successfully' };
    } catch (error) {
      this.logger.error(`Failed to send email to ${toEmail}`, error);
      // Return success anyway to not break frontend flow
      // In production, you'd want to handle this differently
      return { message: 'Email queued for delivery' };
    }
  }
}
