import { Injectable } from '@nestjs/common';
import { CassandraService } from 'src/cassandra/cassandra.service';
import { IngestionTempDto } from './ingestionTempDto';

@Injectable()
export class IngestionService {
    constructor(private readonly cassandraService: CassandraService) {}

    async addSensorData(ingestionTempDto: IngestionTempDto) {
        // TODO
        const query = "INSERT INTO test (id, value) VALUES (?, ?)";

        await this.cassandraService.execute(query, [ingestionTempDto.id, "test"]);
    }
}
