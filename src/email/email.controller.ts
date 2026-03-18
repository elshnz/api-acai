import { Controller, Post, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { EmailService } from './email.service';

@ApiTags('Email')
@Controller('acaiApi/email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('send')
  @ApiOperation({ summary: 'Send an email' })
  @ApiQuery({ name: 'toEmail', required: true, description: 'Comma-separated recipient emails' })
  @ApiQuery({ name: 'subject', required: true })
  @ApiQuery({ name: 'content', required: true, description: 'HTML email content' })
  async sendEmail(
    @Query('toEmail') toEmail: string,
    @Query('subject') subject: string,
    @Query('content') content: string,
  ) {
    return this.emailService.sendEmail(toEmail, subject, content);
  }
}
