import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WeChatService } from './wechat.service';

@Module({
  imports: [ConfigModule],
  providers: [WeChatService],
  exports: [WeChatService],
})
export class WeChatModule {}
