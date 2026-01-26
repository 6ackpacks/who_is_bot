import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  try {
    console.log('Starting application...');
    console.log('Environment:', {
      NODE_ENV: process.env.NODE_ENV,
      DB_HOST: process.env.DB_HOST || 'not set',
      DB_PORT: process.env.DB_PORT || 'not set',
      DB_NAME: process.env.DB_NAME || 'not set',
    });

    const app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log'],
    });

    console.log('Application created successfully');

    // Enable CORS for frontend
    app.enableCors({
      origin: true,
      credentials: true,
    });

    // Enable validation
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      transform: true,
    }));

    // Listen on port 80
    await app.listen(80);
    console.log(`Application is running on: http://localhost:80`);
  } catch (error) {
    console.error('Failed to start application:', error);
    process.exit(1);
  }
}
bootstrap();
