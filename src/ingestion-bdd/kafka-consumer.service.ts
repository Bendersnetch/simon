import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Kafka } from 'kafkajs';

@Injectable()
export class KafkaConsumerService implements OnModuleInit, OnModuleDestroy {
  private kafka = new Kafka({ brokers: ['kafka:9092'], clientId: 'consumer-direct' });
  private consumer = this.kafka.consumer({ groupId: `consumer-debug-${Date.now()}` });

  async onModuleInit() {
    await this.consumer.connect();
    await this.consumer.subscribe({ topic: 'ping-topic', fromBeginning: true });

    await this.consumer.run({
      eachMessage: async ({ message }) => {
        if (!message.value) return; // ignore les tombstones

        const raw = message.value.toString();

        try {
          const payload = JSON.parse(raw);
          console.log('Message ping reçu (direct KafkaJS):', payload);
        } catch (err) {
          console.warn('Message non-JSON reçu, ignoré :', raw);
        }
      },
    });
  }

  async onModuleDestroy() {
    await this.consumer.disconnect();
  }
}
