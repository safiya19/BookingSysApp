import { type INestApplication, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';

/** Settings shared by the real server (main.ts) and the tests. */
export function configureApp(app: INestApplication): void {
  app.setGlobalPrefix('api');
  app.use(helmet());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // ignore fields the DTO doesn't declare…
      forbidNonWhitelisted: true, // …and reject requests that send them
      transform: true,
    }),
  );

  const docs = new DocumentBuilder()
    .setTitle('Titans Bank Appointments API')
    .setVersion('1.0')
    .build();
  SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, docs));
}
