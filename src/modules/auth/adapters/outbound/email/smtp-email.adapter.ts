import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer from 'nodemailer';
import { Env } from '../../../../config/env.schema';
import { EmailPort } from '../../../ports/outbound/email.port';
import { AuthExternalServiceException } from '../../../domain/exceptions/auth-external-service.exception';

@Injectable()
export class SmtpEmailAdapter implements EmailPort {
  private readonly logger = new Logger(SmtpEmailAdapter.name);

  constructor(private readonly config: ConfigService<Env, true>) {}

  async sendVerification(email: string, otp: string, token: string): Promise<void> {
    try {
      const transporter = nodemailer.createTransport({
        host: this.config.get('SMTP_HOST', { infer: true }),
        port: this.config.get('SMTP_PORT', { infer: true }),
        secure: false,
        auth: {
          user: this.config.get('SMTP_USER', { infer: true }),
          pass: this.config.get('SMTP_PASS', { infer: true }),
        },
      });

      await transporter.sendMail({
        from: this.config.get('SMTP_FROM', { infer: true }),
        to: email,
        subject: 'Verify your email address',
        text: `Your verification OTP is ${otp}. Use token ${token}. Both expire soon.`,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to send verification email: ${message}`);
      throw new AuthExternalServiceException('SMTP', 'Failed to send verification email', {
        message,
      });
    }
  }
}
