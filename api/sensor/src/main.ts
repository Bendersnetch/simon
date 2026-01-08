import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Validation automatique des données entrées dans l'API
  app.useGlobalPipes(new ValidationPipe());

  app.setGlobalPrefix("api/v1");

  const config = new DocumentBuilder()
  .setTitle("API Sensor Data")
  .setDescription("Documentation de l'API s'occupant de fournir les données des capteurs aux utilisateurs")
  .setVersion("1.0")
  .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("swagger", app, document);

  await app.listen(process.env.PORT ?? 3006, '0.0.0.0');
}
bootstrap();
