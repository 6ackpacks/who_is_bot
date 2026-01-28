import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JudgmentController } from './judgment.controller';
import { JudgmentService } from './judgment.service';
import { Judgment } from './judgment.entity';
import { Content } from '../content/content.entity';
import { User } from '../user/user.entity';
import { AchievementModule } from '../achievement/achievement.module';
import { RateLimitService } from '../common/rate-limit.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Judgment, Content, User]),
    forwardRef(() => AchievementModule),
  ],
  controllers: [JudgmentController],
  providers: [JudgmentService, RateLimitService],
  exports: [JudgmentService],
})
export class JudgmentModule {}
