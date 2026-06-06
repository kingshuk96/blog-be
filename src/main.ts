import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { AppModule } from './modules/app.module';
import { ENV } from './config/env.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  app.setGlobalPrefix('api/v1');

  // ---------------------------------------------------------------------------
  // Swagger / OpenAPI configuration
  // ---------------------------------------------------------------------------
  const config = new DocumentBuilder()
    .setTitle('Blog Backend API')
    .setDescription(
      `REST API powering the Blog platform.\n\n` +
        `## Authentication\n` +
        `Protected endpoints require a **Bearer JWT** token.\n` +
        `Obtain a token via \`POST /api/v1/auth/login\` or \`POST /api/v1/auth/signup\`,\n` +
        `then click the **Authorize 🔒** button and paste it in.\n\n` +
        `## Versioning\n` +
        `All endpoints are prefixed with \`/api/v1\`.`
    )
    .setVersion('1.0')
    .setContact('Kingshuk Sanyal', '', '')
    .setLicense('UNLICENSED', '')
    .addServer(`http://localhost:${ENV.PORT}`, 'Local Development')
    // Bearer token auth — pairs with @ApiBearerAuth() on protected routes
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter JWT token (without "Bearer " prefix)',
        in: 'header',
      },
      'JWT' // <-- security scheme name referenced in @ApiBearerAuth('JWT')
    )
    .addTag('Health', 'API health-check endpoint')
    .addTag('Auth', 'User registration and authentication')
    .addTag(
      'GraphQL — Users',
      'GraphQL query documentation for user operations.\n\n' +
        '> ⚠️ **All real requests must be sent to `POST /graphql`** — ' +
        'the endpoints listed here are documentation stubs only.\n\n' +
        'Each entry shows the exact query string, variable shape, and expected response. ' +
        'Copy the request body from "Example Value" and POST it to `/graphql` ' +
        'with an `Authorization: Bearer <jwt>` header.'
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Swagger UI at /api/docs
  // Raw OpenAPI JSON at /api/docs-json
  // Raw OpenAPI YAML at /api/docs-yaml
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true, // keeps the token across page refreshes
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
      docExpansion: 'list',
      filter: true,
      showRequestDuration: true,
    },
    customSiteTitle: 'Blog API Docs',
  });

  await app.listen(ENV.PORT);
  console.log(`\nApplication is running on: ${await app.getUrl()}`);
  console.log(`Swagger UI:   ${await app.getUrl()}/api/docs`);
  console.log(`OpenAPI JSON: ${await app.getUrl()}/api/docs-json`);
  console.log(`OpenAPI YAML: ${await app.getUrl()}/api/docs-yaml`);

  const mongoConnection = app.get<Connection>(getConnectionToken());
  const dbStatus =
    mongoConnection.readyState === 1 ? '✅ Connected' : '❌ Not connected';
  console.log(
    `\nMongoDB: ${dbStatus} (${mongoConnection.host}/${mongoConnection.name})\n`
  );
  console.log('--- APIs ---');
  Object.keys(document.paths).forEach((path) => {
    Object.keys(document.paths[path]).forEach((method) => {
      console.log(`[${method.toUpperCase()}] ${path}`);
    });
  });
}
bootstrap();
