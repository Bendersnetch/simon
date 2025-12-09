import { Inject, Injectable } from '@nestjs/common';
import { CassandraService } from 'src/cassandra/cassandra.service';
import { IngestionTempDto } from './ingestionTempDto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class IngestionService {
    constructor(private readonly cassandraService: CassandraService,
        @Inject(CACHE_MANAGER) private cache: Cache) {}

    private CACHE_TTL = 60;

    async addSensorData(ingestionTempDto: IngestionTempDto) {
        const query = "INSERT INTO test (id, value) VALUES (?, ?)";

        await this.cassandraService.execute(query, [ingestionTempDto.id, "test"]);
    }
}
