import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { LeaderboardController } from './leaderboard.controller';
import { UserService } from './user.service';
import { User } from './user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UserController, LeaderboardController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
