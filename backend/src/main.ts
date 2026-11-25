import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { configureApp } from './app.setup.js';

const app = await NestFactory.create(AppModule);
configureApp(app);
app.enableShutdownHooks();

const port = Number(process.env.PORT ?? 3000);
await app.listen(port);
Logger.log(
  `Titans Bank API listening on http://localhost:${port}/api`,
  'Bootstrap',
);
