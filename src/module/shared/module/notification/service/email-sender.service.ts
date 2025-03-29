/* eslint-disable import/no-named-as-default-member */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@sharedModule/config/service/config.service';
import nodemailer, { Transporter } from 'nodemailer';

@Injectable()
export class EmailSenderService {
  private transporter: Transporter;
  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('mailer').host,
      port: this.configService.get('mailer').port,
      auth: {
        user: this.configService.get('mailer').auth.user,
        pass: this.configService.get('mailer').auth.pass,
      },
    });
  }
  sendEmail(to: string, subject: string, text: string): Promise<void> {
    return this.transporter.sendMail({
      from: `TrampoFinder <${this.configService.get('mailer').auth.user}>`,
      to,
      subject,
      html: text,
    });
  }
}
