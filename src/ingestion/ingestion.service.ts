import { Inject, Injectable } from '@nestjs/common';
import { CassandraService } from 'src/cassandra/cassandra.service';
import { Ingestion } from './ingestion.entity';

@Injectable()
export class IngestionService {
    constructor(private readonly cassandraService: CassandraService) {}

    async addSensorData(ingestion: Ingestion) {
        const query = `INSERT INTO mesure_capteur 
        (origin, timestamp, uv, temperature, humidite, qair) 
        VALUES (?, ?, ?, ?, ?, ?);`

        await this.cassandraService.execute(query,
            [
                ingestion.origin,
                ingestion.timestamp,
                ingestion.uv,
                ingestion.temperature,
                ingestion.humidite,
                ingestion.qair
            ]);
    }
}   
