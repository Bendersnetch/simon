import { Injectable } from '@nestjs/common';
import { Ingestion } from './ingestion.entity';
import { KafkaProducerService } from 'src/kafka/kafka.service';

@Injectable()
export class IngestionService {
    constructor(private readonly kafkaService: KafkaProducerService) {}

    async addSensorData(ingestion: Ingestion) {
        await this.kafkaService.sendMessage('ingestion-topic', ingestion);
    }
}   
