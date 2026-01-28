import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JudgmentController } from './judgment.controller';
import { JudgmentService } from './judgment.service';
import { Judgment } from './judgment.entity';
import { Content } from '../content/content.entity';
import { User } from '../user/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Judgment, Content, User])],
  controllers: [JudgmentController],
  providers: [JudgmentService],
  exports: [JudgmentService],
})
export class JudgmentModule {}
