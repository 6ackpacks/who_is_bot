import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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
}
bootstrap();
