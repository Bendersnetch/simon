import { Injectable } from '@nestjs/common';
import { CassandraService } from 'src/cassandra/cassandra.service';

@Injectable()
export class SensorDataService {
    constructor(private readonly cassandraService: CassandraService) {}

    async getRecent() {
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

        const query = `
        SELECT * FROM ingestion_data
        WHERE timestamp >= ?
        ALLOW FILTERING
        `;

        const result = await this.cassandraService.query(query, [fiveMinutesAgo]);
        return result.rows;
    }
}
