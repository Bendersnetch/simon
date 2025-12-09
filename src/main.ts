import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Validation automatique des données entrées dans l'API
  app.useGlobalPipes(new ValidationPipe());

  app.setGlobalPrefix("api/v1");

  // Config swagger
  const config = new DocumentBuilder()
  .setTitle("API Capteur")
  .setDescription("Documentation de l'API gérant les capteurs")
  .setVersion("1.0")
  .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("swagger", app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
