import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HireEmailDto } from './dto/hire-email.dto';
import * as nodemailer from 'nodemailer';
import { MunicipalityService } from 'src/municipality/municipality.service';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(
    private readonly configService: ConfigService,
    private readonly municipalityService: MunicipalityService) {
    const host = this.configService.get<string>('SMTP_HOST', 'smtp.gmail.com');
    const port = this.configService.get<number>('SMTP_PORT', 587);
    const user = this.configService.get<string>('SMTP_USER', '');
    const pass = this.configService.get<string>('SMTP_PASS', '');

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: false,
      auth: { user, pass },
    });
  }

  // ─── Método base ────────────────────────────────────────────────────────────
  async sendEmail(
    toEmail: string,
    subject: string,
    content: string,
    ccEmails?: string | string[],
  ): Promise<{ message: string }> {
    try {
      const from = this.configService.get<string>('SMTP_FROM', 'gestion-comercial@jalisco.gob.mx');

      const info = await this.transporter.sendMail({
        from,
        to: toEmail,
        cc: ccEmails,
        subject,
        html: content,
      });

      return { message: 'Email sent successfully' };
    } catch (error) {
      this.logger.error(`SMTP Error: ${error.message}`);
      throw error;
    }
  }

  // ─── Formulario de contacto ──────────────────────────────────────────────────
  async sendContactForm(
    name: string,
    email: string,
    message: string,
    recaptchaToken: string,
  ): Promise<{ message: string }> {

    // ── Verificar reCAPTCHA ──────────────────────────────────────────
    const secretKey = this.configService.get<string>('RECAPTCHA_SECRET_KEY');
    const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${recaptchaToken}`;

    const recaptchaRes = await fetch(verifyUrl, { method: 'POST' });
    const recaptchaData = await recaptchaRes.json();

    if (!recaptchaData.success || recaptchaData.score < 0.5) {
      throw new Error('reCAPTCHA inválido o score muy bajo');
    }
    // ────────────────────────────────────────────────────────────────
    const adminEmail = this.configService.get<string>('MAIL_ADMIN', 'elias.hernandez@acai.gob.mx');
    const ccEmails = this.configService.get<string>('MAIL_CC', 'leslie.angulo@acai.gob.mx');

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
               body { margin:0 10px; padding:0; background:#fafafa; font-weight:bold; font-family:Garet, Arial,sans-serif; }
               .wrapper { max-width:600px; margin:40px auto; background:#fff; border-radius:8px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,.08); }
               .header { background:#7357C1; padding:28px 40px; text-align:center; }
               .header h1 { margin:0; color:#fff; font-size:22px; }
               .body { padding:36px 40px; color:#374151; font-size:15px; line-height:1.6; }
               .meta { font-size:12px; color:#9ca3af; margin-bottom:24px; }
               table { width:100%; border-collapse:collapse; }
               td { padding:12px 16px; }
               .label { background:#F1F1F1; font-weight:bold; color:#374151; width:110px; }
               .value { background:#f5f5f5; }
               .divider { border-top:1px solid #e5e7eb; }
               .btn { display:inline-block; margin-top:24px; padding:5px 28px; background:#7357C1; color:#fff!important;
               text-decoration:none; border-radius:50px; font-weight:bold; font-size:14px; background:#583F9C;}
               .footer-table { width:100%; }
               .footer-table td { padding:5px 20px 40px; text-align:center; }
               .footer-table img { margin:0 15px; vertical-align:middle; }

               @media only screen and (max-width: 480px) {
                .footer-table td.logo-cell {
                  display: block !important;
                  width: 100% !important;
                  text-align: center !important;
                  padding: 10px 0 !important;
                }
                .footer-table img {
                  display: block !important;
                  margin: 10px auto !important;
                }
              }
             </style>
           </head>
           <body>
             <div class="wrapper">
               <div class="header"><h1>Nuevo mensaje</h1></div>
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
                 <a href="mailto:${email}" class="btn">Responder</a>
               </div>
              <table role="presentation" class="footer-table" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" class="logo-cell">
                    <img src="https://dev.acai.gob.mx/assets/images/email/logo-red-jalisco.png" alt="Logo red red jalisco">
                  </td>
                  <td align="center" class="logo-cell">
                    <img src="https://dev.acai.gob.mx/assets/images/email/logo-acai.png" alt="Logo acai">
                  </td>
                  <td align="center" class="logo-cell">
                    <img src="https://dev.acai.gob.mx/assets/images/email/logo-jalisco.png" alt="Logo jalisco">
                  </td>
                </tr>
              </table>
             </div>
           </body>
           </html>
    `;

    return this.sendEmail(adminEmail, subject, content, ccEmails);
  }

  // ─── Formulario de contratación ──────────────────────────────────────────────
  async sendHireEmail(dto: HireEmailDto): Promise<{ message: string }> {

    // ── Verificar reCAPTCHA ──────────────────────────────────────────
    const secretKey = this.configService.get<string>('RECAPTCHA_SECRET_KEY');
    const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${dto.token}`;

    const recaptchaRes = await fetch(verifyUrl, { method: 'POST' });
    const recaptchaData = await recaptchaRes.json();

    this.logger.log(`reCAPTCHA score: ${recaptchaData.score}`);

    if (!recaptchaData.success || recaptchaData.score < 0.5) {
      throw new Error('reCAPTCHA inválido o score muy bajo');
    }
    // ────────────────────────────────────────────────────────────────
    let municipalityName = '';
    if (dto.municipality) {
      const municipio = await this.municipalityService.findOne(dto.municipality);
      municipalityName = municipio.name;
    }

    const adminEmail = this.configService.get<string>('MAIL_ADMIN', 'elias.hernandez@acai.gob.mx');
    const ccEmails = this.configService.get<string>('MAIL_CC', 'leslie.angulo@acai.gob.mx');


    let subject = '';
    if (dto.municipality) {
      subject = `📋 Solicitud de consulta`;
    } else {
      subject = `📋 Solicitud de contratación`;
    }

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
          .wrapper { max-width:600px; margin:40px auto; background:#fff; border-radius:8px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,.08); border:1px solid #e5e7eb; }
          .header { background:#7357C1; padding:28px 40px; text-align:center; }
          .header h1 { margin:0; color:#fff; font-size:22px; }
          .subheader { text-align:center; padding:0px 40px 8px; }
          .subheader .tag { color:#7c3aed; font-size:11px; font-weight:bold; letter-spacing:1.5px; text-transform:uppercase; }
          .subheader h1 { margin:6px 0 0; color:#111827; font-size:28px; font-weight:900; }
          .divider-line { border:none; border-top:1px solid #e5e7eb; margin:0 40px; }
          .body { padding:0px 40px; color:#374151; font-size:15px; line-height:1.6; }
          .field { margin-bottom:20px; }
          .field .label { font-size:12px; color:#6b7280; margin-bottom:2px; }
          .field .value { font-size:15px; font-weight:700; color:#111827; }
          .field .value a { color:#7c3aed; text-decoration:none; }
          .field .value.message { font-weight:400; white-space:pre-wrap; }
          .meta { font-size:12px; color:#9ca3af; margin-bottom:0px; }
          .btn { display:inline-block; margin-top:8px; padding:13px 28px; background:#7c3aed; color:#fff!important; text-decoration:none; border-radius:6px; font-weight:bold; font-size:14px; }
          .footer-table { width:100%; }
          .footer-table td { padding:5px 20px 40px; text-align:center; }
          .footer-table img { margin:0 15px; vertical-align:middle; }
          @media only screen and (max-width: 480px) {
            .footer-table td.logo-cell {
              display: block !important;
              width: 100% !important;
              text-align: center !important;
              padding: 10px 0 !important;
            }
            .footer-table img {
              display: block !important;
              margin: 10px auto !important;
            }
          }
        </style>
      </head>
      <body>
       <div class="wrapper">
                <div class="header"><h1>Nuevo mensaje</h1></div>
                <div class="body">
                  <p class="meta">Recibido el ${receivedAt}</p>
          </div>
          <!-- Subtítulo -->
          <div class="subheader">
            ${dto.municipality ? '<h1>Agendar una consulta</h1>' : '<h1>Quiero contratar</h1>'}
          </div>
          <hr class="divider-line"/>
          <!-- Cuerpo -->
          <div class="body">
            <div class="field">
              <div class="label">Nombre</div>
              <div class="value">${dto.name}</div>
            </div>
            <div class="field">
              <div class="label">Teléfono</div>
              <div class="value">${dto.phone}</div>
            </div>
            <div class="field">
              <div class="label">Correo electrónico</div>
              <div class="value"><a href="mailto:${dto.email}">${dto.email}</a></div>
            </div>
            <div class="field">
              <div class="label">Empresa</div>
              <div class="value">${dto.company}</div>
            </div>
            ${dto.service ? `
              <div class="field">
                <div class="label">Servicio de interés</div>
                <div class="value">${dto.service}</div>
              </div>` : ''}
            ${dto.municipality ? `
              <div class="field">
                <div class="label">Municipio</div>
                <div class="value">${municipalityName}</div>
              </div>` : ''}
            <div class="field">
              <div class="label">Mensaje</div>
              <div class="value message">${dto.message}</div>
            </div>
          </div>
          <!-- Footer con logos -->
          <table role="presentation" class="footer-table" cellpadding="0" cellspacing="0">
            <tr>
              <td align="center" class="logo-cell">
                <img src="https://dev.acai.gob.mx/assets/images/email/logo-red-jalisco.png" alt="Logo red red jalisco">
              </td>
              <td align="center" class="logo-cell">
                <img src="https://dev.acai.gob.mx/assets/images/email/logo-acai.png" alt="Logo acai">
              </td>
              <td align="center" class="logo-cell">
                <img src="https://dev.acai.gob.mx/assets/images/email/logo-jalisco.png" alt="Logo jalisco">
              </td>
            </tr>
          </table>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail(adminEmail, subject, content, ccEmails);
  }
}
