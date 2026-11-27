import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import type { NextFunction, Request, Response } from 'express';
import { join, resolve } from 'node:path';
import { AppModule } from './app.module.js';
import { configureApp } from './app.setup.js';

const app = await NestFactory.create<NestExpressApplication>(AppModule);
configureApp(app);
app.enableShutdownHooks();

// In Docker, the API also serves the built Angular app, so everything runs on one port.
// WEB_DIR is the Angular build folder (frontend/dist/frontend/browser).
// Not set during development, where `ng serve` serves the app instead.
const webDir = process.env.WEB_DIR;
if (webDir) {
  const indexHtml = join(resolve(webDir), 'index.html');
  app.useStaticAssets(webDir);
  // Any other page address (not /api) gets the Angular app, which handles its own routes.
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      res.sendFile(indexHtml);
    } else {
      next();
    }
  });
}

const port = Number(process.env.PORT ?? 3000);
await app.listen(port);
Logger.log(
  `Titans Bank API listening on http://localhost:${port}/api`,
  'Bootstrap',
);
