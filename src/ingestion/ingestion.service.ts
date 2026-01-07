import { Injectable } from '@nestjs/common';
import { Ingestion } from './ingestion.entity';
import { RedisProducerService } from 'src/redis/redis.service';

@Injectable()
export class IngestionService {
    constructor(private readonly redisService: RedisProducerService) {}

    async addSensorData(ingestion: Ingestion) {
        await this.redisService.addToStream('ingestion-stream', ingestion);
    }
}   
