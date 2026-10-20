import { existsSync } from 'fs';
import { join } from 'path';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import type { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';

export function configureApp(app: INestApplication, corsOrigins: string[], staticDir?: string, trustProxy = 0): void {
  if (trustProxy > 0) (app as NestExpressApplication).set('trust proxy', trustProxy);
  (app as NestExpressApplication).useBodyParser('json', { limit: '10kb' });
  app.use(
    helmet({
      contentSecurityPolicy: {
        useDefaults: false,
        directives: {
          'default-src': ["'self'"],
          'script-src': ["'self'"],
          'style-src': ["'self'"],
          'font-src': ["'self'"],
          'script-src-attr': ["'none'"],
          'img-src': ["'self'", 'data:'],
          'connect-src': ["'self'"],
          'object-src': ["'none'"],
          'base-uri': ["'self'"],
          'form-action': ["'self'"],
          'frame-ancestors': ["'none'"],
        },
      },
    }),
  );
  app.enableCors({ origin: corsOrigins, methods: ['GET', 'POST'], maxAge: 600 });
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );
  if (staticDir && existsSync(join(staticDir, 'index.html'))) serveFrontend(app, staticDir);
}

function serveFrontend(app: INestApplication, dir: string): void {
  (app as NestExpressApplication).useStaticAssets(dir);
  app.use((req: Request, res: Response, next: NextFunction) => {
    const isPage = (req.method === 'GET' || req.method === 'HEAD') && req.path !== '/api' && !req.path.startsWith('/api/');
    if (!isPage) return next();
    res.sendFile(join(dir, 'index.html'));
  });
}
