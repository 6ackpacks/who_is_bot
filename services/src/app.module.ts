import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContentModule } from './content/content.module';
import { UserModule } from './user/user.module';
import { JudgmentModule } from './judgment/judgment.module';
import { HealthController } from './health.controller';
import { ProxyController } from './proxy.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get('DB_PORT', 3306),
        username: configService.get('DB_USER', 'root'),
        password: configService.get('DB_PASS', 'root'),
        database: configService.get('DB_NAME', 'who_is_the_bot'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: process.env.NODE_ENV !== 'production',
        autoLoadEntities: true,
        retryAttempts: 3,
        retryDelay: 3000,
      }),
    }),
    ContentModule,
    UserModule,
    JudgmentModule,
  ],
  controllers: [HealthController, ProxyController],
})
export class AppModule {}
