import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module.js';
import type { AppConfig } from './config/env.validation.js';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.enableShutdownHooks();

  const port = app
    .get(ConfigService<AppConfig, true>)
    .get('PORT', { infer: true });
  await app.listen(port);
  Logger.log(`Titans Bank API listening on port ${port}`, 'Bootstrap');
}

await bootstrap();
