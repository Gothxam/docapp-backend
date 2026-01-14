import * as nodemailer from 'nodemailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  private transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  async sendWelcomeMail(to: string) {
    await this.transporter.sendMail({
      from: process.env.MAIL_USER,
      to,
      subject: 'Welcome Admin',
      text: 'Your admin account has been created successfully.',
    });
  }
}
