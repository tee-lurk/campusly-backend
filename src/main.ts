import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security headers
  app.use(helmet({ crossOriginResourcePolicy: false }));

  // Global input validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,        // strip unknown props
      forbidNonWhitelisted: true,
      transform: true,        // auto-transform payloads to DTO classes
    }),
  );

  // CORS for frontend (allows localhost, Vercel apps, and production origins)
  app.enableCors({
    origin: true,
    credentials: true,
  });

  const port = process.env.PORT ?? 3002;
  await app.listen(port);
  console.log(`🚀 Campusly API running on http://localhost:${port}`);
}

bootstrap();
