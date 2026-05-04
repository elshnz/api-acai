import { Body, Controller, Post, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBody } from '@nestjs/swagger';
import { EmailService } from './email.service';
import { ContactFormDto } from './dto/contact-form.dto';
import { SendEmailDto } from './dto/send-email.dto';
import { HireEmailDto } from './dto/hire-email.dto';

@ApiTags('Email')
@Controller('acaiApi/email')
export class EmailController {
  constructor(private readonly emailService: EmailService) { }

  @Post('send')
  @ApiOperation({ summary: 'Send an email' })
  @ApiQuery({ name: 'toEmail', required: true, description: 'Comma-separated recipient emails' })
  @ApiQuery({ name: 'subject', required: true })
  @ApiQuery({ name: 'content', required: true, description: 'HTML email content' })
  async sendEmail(@Query() dto: SendEmailDto) {
    return this.emailService.sendEmail(dto.toEmail, dto.subject, dto.content);
  }

  @Post('contact')
  @ApiOperation({ summary: 'Send contact form to admin' })
  @ApiBody({ type: ContactFormDto })
  async sendContactForm(@Body() dto: ContactFormDto) {
    return this.emailService.sendContactForm(dto.name, dto.email, dto.message, dto.recaptchaToken);
  }

  @Post('hire')
  @ApiOperation({ summary: 'Send hire request to admin' })
  @ApiBody({ type: HireEmailDto })
  async sendHireEmail(@Body() dto: HireEmailDto) {
    return this.emailService.sendHireEmail(dto);
  }
}