import { Module } from '@nestjs/common';
import { ConfigModule } from '@sharedModule/config/config.module';
import { EmailSenderService } from './service/email-sender.service';

@Module({
  imports: [ConfigModule.forRoot()],
  providers: [EmailSenderService],
  exports: [EmailSenderService],
})
export class NotificationModule {}
