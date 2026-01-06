import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';

@Injectable()
export class KafkaProducerService implements OnModuleInit {
  constructor(@Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka) {}

  async onModuleInit() {
    await this.kafkaClient.connect();
  }

  async sendMessage(topic: string, message: any) {
    console.log(`Envoi du message sur ${topic}:`, message);
    return this.kafkaClient.emit(topic, message);
  }
}
