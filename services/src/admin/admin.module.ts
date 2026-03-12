import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { Admin } from './entities/admin.entity';
import { User } from '../user/user.entity';
import { Content } from '../content/content.entity';
import { Comment } from '../comment/comment.entity';
import { Judgment } from '../judgment/judgment.entity';
import { UserAchievement } from '../achievement/user-achievement.entity';
import { AdminAuthController } from './admin-auth.controller';
import { AdminAuthService } from './admin-auth.service';
import { AdminUserController } from './admin-user.controller';
import { AdminUserService } from './admin-user.service';
import { AdminContentController } from './admin-content.controller';
import { AdminContentService } from './admin-content.service';
import { AdminCommentController } from './admin-comment.controller';
import { AdminCommentService } from './admin-comment.service';
import { AdminStatsController } from './admin-stats.controller';
import { AdminStatsService } from './admin-stats.service';
import { AdminGuard } from './guards/admin.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Admin,
      User,
      Content,
      Comment,
      Judgment,
      UserAchievement,
    ]),
    JwtModule.register({}),
    ConfigModule,
  ],
  controllers: [
    AdminAuthController,
    AdminUserController,
    AdminContentController,
    AdminCommentController,
    AdminStatsController,
  ],
  providers: [
    AdminAuthService,
    AdminUserService,
    AdminContentService,
    AdminCommentService,
    AdminStatsService,
    AdminGuard,
  ],
  exports: [
    AdminAuthService,
    AdminGuard,
    JwtModule,
    TypeOrmModule.forFeature([Admin]),
  ],
})
export class AdminModule {}
