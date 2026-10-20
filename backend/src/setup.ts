import { INestApplication, ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';

export function configureApp(app: INestApplication, corsOrigins: string[]): void {
  (app as NestExpressApplication).useBodyParser('json', { limit: '10kb' });
  app.use(helmet());
  app.enableCors({ origin: corsOrigins });
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );
}
