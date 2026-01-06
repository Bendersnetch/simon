import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
/*
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.connectMicroservice<MicroserviceOptions>({
      transport: Transport.KAFKA,
      options: {
        client: { brokers: ['kafka:9092'] },
        consumer: { groupId: 'test-1234' },
      },
  });

  await app.startAllMicroservices();
  await app.listen(process.env.PORT ?? 3004);
} */

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: ['kafka:9092'],
      },
      consumer: {
        groupId: `consumer-debug-${Date.now()}`,
        allowAutoTopicCreation: true,
      },
      subscribe: { topic: 'ping-topic', fromBeginning: true },
    },  
  });
  
  await app.listen();
}
bootstrap();
