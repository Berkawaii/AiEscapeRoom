import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.enableCors();

  const port = process.env.PORT || 3000;
  await app.listen(port);

  logger.log(`===========================================================`);
  logger.log(`🛸 AI Escape Room Engine Server Running on: http://localhost:${port}`);
  logger.log(`🎮 Dashboard & Concurrency Benchmark: http://localhost:${port}`);
  logger.log(`===========================================================`);
}

bootstrap();
