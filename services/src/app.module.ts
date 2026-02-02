import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule as NestScheduleModule } from '@nestjs/schedule';
import { ContentModule } from './content/content.module';
import { UserModule } from './user/user.module';
import { JudgmentModule } from './judgment/judgment.module';
import { AchievementModule } from './achievement/achievement.module';
import { ScheduleModule } from './schedule/schedule.module';
import { CommentModule } from './comment/comment.module';
import { AuthModule } from './auth/auth.module';
import { HealthController } from './health.controller';
import { ProxyController } from './proxy.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    NestScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        // 验证必需的环境变量
        const requiredEnvVars = ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASS', 'DB_NAME'];
        const missingVars = requiredEnvVars.filter(varName => !configService.get(varName));

        if (missingVars.length > 0) {
          throw new Error(
            `Missing required environment variables: ${missingVars.join(', ')}. ` +
            'Please check your .env file.'
          );
        }

        return {
          type: 'mysql',
          host: configService.get<string>('DB_HOST'),
          port: configService.get<number>('DB_PORT'),
          username: configService.get<string>('DB_USER'),
          password: configService.get<string>('DB_PASS'),
          database: configService.get<string>('DB_NAME'),
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: false,
          autoLoadEntities: true,

          // 连接池配置
          extra: {
            connectionLimit: configService.get<number>('DB_CONNECTION_LIMIT', 10),
            waitForConnections: true,
            queueLimit: 0,
            // SSL 配置（生产环境推荐启用）
            ssl: configService.get<boolean>('DB_SSL_ENABLED', false)
              ? {
                  rejectUnauthorized: configService.get<boolean>('DB_SSL_REJECT_UNAUTHORIZED', true)
                }
              : undefined,
          },

          // 连接重试配置
          retryAttempts: configService.get<number>('DB_RETRY_ATTEMPTS', 3),
          retryDelay: configService.get<number>('DB_RETRY_DELAY', 3000),

          // 日志配置
          logging: configService.get<boolean>('DB_LOGGING', false),

          // 连接超时配置
          connectTimeout: configService.get<number>('DB_CONNECT_TIMEOUT', 10000),
        };
      },
    }),
    ContentModule,
    UserModule,
    JudgmentModule,
    AchievementModule,
    ScheduleModule,
    CommentModule,
    AuthModule,
  ],
  controllers: [HealthController, ProxyController],
})
export class AppModule {}
