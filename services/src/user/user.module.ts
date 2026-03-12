import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { LeaderboardController } from './leaderboard.controller';
import { UserService } from './user.service';
import { LeaderboardService } from './leaderboard.service';
import { User } from './user.entity';
import { Judgment } from '../judgment/judgment.entity';
import { UserAchievement } from '../achievement/user-achievement.entity';
import { Comment } from '../comment/comment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Judgment, UserAchievement, Comment])],
  controllers: [UserController, LeaderboardController],
  providers: [UserService, LeaderboardService],
  exports: [UserService, LeaderboardService],
})
export class UserModule {}
