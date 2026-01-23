import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContentModule } from './content/content.module';
import { LeaderboardModule } from './leaderboard/leaderboard.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 5432,
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_DATABASE || 'who_is_the_bot',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true, // Set to false in production
    }),
    ContentModule,
    LeaderboardModule,
    UserModule,
  ],
})
export class AppModule {}
