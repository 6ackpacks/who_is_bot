import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContentModule } from './content/content.module';
import { UserModule } from './user/user.module';
import { HealthController } from './health.controller';
import { ProxyController } from './proxy.controller';

// Check if database is configured
const isDatabaseConfigured = process.env.DB_HOST && process.env.DB_HOST !== 'localhost';

const imports = [
  ConfigModule.forRoot({
    isGlobal: true,
    ignoreEnvFile: true, // Don't try to load .env files in cloud container
    envFilePath: [], // Explicitly set empty array to prevent file system access
  }),
];

// Only add TypeORM if database is configured
if (isDatabaseConfigured) {
  console.log('Database configuration detected, enabling TypeORM');
  imports.push(
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'mysql',
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT) || 3306,
        username: process.env.DB_USER || 'root',
        password: process.env.DB_PASS || 'root',
        database: process.env.DB_NAME || 'who_is_the_bot',
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: process.env.NODE_ENV !== 'production',
        autoLoadEntities: true,
        retryAttempts: 3,
        retryDelay: 3000,
      }),
    }) as any,
    ContentModule as any,
    UserModule as any,
  );
} else {
  console.warn('Database not configured, running without database modules');
}

@Module({
  imports,
  controllers: [HealthController, ProxyController],
})
export class AppModule {}
