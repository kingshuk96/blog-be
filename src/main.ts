import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { AppModule } from './modules/app.module';
import { ENV } from './config/env.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/v1');

  const config = new DocumentBuilder()
    .setTitle('Blog Backend API')
    .setDescription('The blog backend API documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(ENV.PORT);
  console.log(`\nApplication is running on: ${await app.getUrl()}`);

  const mongoConnection = app.get<Connection>(getConnectionToken());
  const dbStatus =
    mongoConnection.readyState === 1 ? '✅ Connected' : '❌ Not connected';
  console.log(
    `MongoDB: ${dbStatus} (${mongoConnection.host}/${mongoConnection.name})\n`
  );
  console.log('\n--- APIs ---');
  Object.keys(document.paths).forEach((path) => {
    Object.keys(document.paths[path]).forEach((method) => {
      console.log(`[${method.toUpperCase()}] ${path}`);
    });
  });
}
bootstrap();
