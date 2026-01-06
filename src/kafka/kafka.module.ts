import { Module } from '@nestjs/common';
import { KafkaProducerService } from './kafka.service';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
    imports: [
        ClientsModule.register([
            {
                name: 'KAFKA_SERVICE',
                transport: Transport.KAFKA,
                options: {
                    client: {
                        brokers: ['kafka:9092'],
                    },
                    retryAttempts: 10,
                    retryDelay: 3000,
                },
            },
        ]),
    ],
    providers: [KafkaProducerService],
    exports: [KafkaProducerService],
})
export class KafkaModule {}
