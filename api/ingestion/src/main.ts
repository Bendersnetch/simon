import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { logger: ['error', 'warn', 'debug', 'log'] });

  // Validation automatique des données entrées dans l'API
  app.useGlobalPipes(new ValidationPipe());

  app.setGlobalPrefix("api/v1");

  const config = new DocumentBuilder()
  .setTitle("API Ingestion")
  .setDescription("Documentation de l'API s'occupant de l'ingestion des données provenant des capteurs")
  .setVersion("1.0")
  .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("swagger", app, document);

  await app.listen(process.env.PORT ?? 3003, '0.0.0.0');
}
bootstrap();
