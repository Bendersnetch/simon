// Dans src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  // On crée une application standard, pas un microservice
  const app = await NestFactory.create(AppModule);
  await app.listen(3004); // Le service écoute sur un port, mais sa tâche principale sera la boucle de consommation.
}
bootstrap();
