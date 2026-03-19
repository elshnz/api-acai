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
      const from = this.configService.get<string>('SMTP_FROM', 'elias.hernandez@acai.gob.mx');

      const info = await this.transporter.sendMail({
        from,
        to: toEmail,
        subject,
        html: content,
      });

      this.logger.log(`Email sent to: ${toEmail}`);
      this.logger.log(`Server response: ${info.response}`);  // 👈 respuesta real del SMTP
      this.logger.log(`Message ID: ${info.messageId}`);

      return { message: 'Email sent successfully' };
    } catch (error) {
      // 👇 Ahora muestra el error real
      this.logger.error(`SMTP Error: ${error.message}`);
      throw error;  // 👈 lo verás en Postman también
    }
  }
  // ─── Formulario de contacto ──────────────────────────────────────────────────
  async sendContactForm(
    name: string,
    email: string,
    message: string,
  ): Promise<{ message: string }> {
    const adminEmail = this.configService.get<string>('MAIL_ADMIN', 'elias.hernandez@acai.gob.mx');
    this.logger.log(`SMTP_HOST: ${this.configService.get('SMTP_HOST')}`);
    this.logger.log(`SMTP_USER: ${this.configService.get('SMTP_USER')}`);
    this.logger.log(`Enviando a: ${adminEmail}`);
    const subject = `📩 Nuevo mensaje de contacto — ${name}`;

    const receivedAt = new Date().toLocaleString('es-MX', {
      dateStyle: 'long',
      timeStyle: 'short',
      timeZone: 'America/Mexico_City',
    });

    const content = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8"/>
        <style>
          body { margin:0; padding:0; background:#f4f6f9; font-family:Arial,sans-serif; }
          .wrapper { max-width:600px; margin:40px auto; background:#fff; border-radius:8px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,.08); }
          .header { background:#4f46e5; padding:28px 40px; text-align:center; }
          .header h1 { margin:0; color:#fff; font-size:22px; }
          .body { padding:36px 40px; color:#374151; font-size:15px; line-height:1.6; }
          .meta { font-size:12px; color:#9ca3af; margin-bottom:24px; }
          table { width:100%; border-collapse:collapse; }
          td { padding:12px 16px; }
          .label { background:#f3f4f6; font-weight:bold; color:#374151; width:110px; }
          .value { background:#f9fafb; }
          .divider { border-top:1px solid #e5e7eb; }
          .btn { display:inline-block; margin-top:24px; padding:13px 28px; background:#4f46e5; color:#fff!important; text-decoration:none; border-radius:6px; font-weight:bold; font-size:14px; }
          .footer { background:#f9fafb; padding:20px 40px; text-align:center; font-size:12px; color:#9ca3af; }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="header"><h1>Formulario de Contacto</h1></div>
          <div class="body">
            <p class="meta">Recibido el ${receivedAt}</p>
            <table>
              <tr>
                <td class="label">Nombre</td>
                <td class="value">${name}</td>
              </tr>
              <tr class="divider">
                <td class="label">Email</td>
                <td class="value">
                  <a href="mailto:${email}" style="color:#4f46e5;">${email}</a>
                </td>
              </tr>
              <tr class="divider">
                <td class="label" style="vertical-align:top;">Mensaje</td>
                <td class="value" style="white-space:pre-wrap;">${message}</td>
              </tr>
            </table>
            <a href="mailto:${email}" class="btn">Responder a ${name}</a>
          </div>
          <div class="footer">ACAI · acai.gob.mx</div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail(adminEmail, subject, content);
  }
}
