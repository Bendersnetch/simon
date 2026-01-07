import { Injectable } from '@nestjs/common';
import { CassandraService } from 'src/cassandra/cassandra.service';
import { Ingestion } from './ingestion.entity';

@Injectable()
export class IngestionBddService {
    constructor(private readonly cassandraService: CassandraService) {
    }

    public async processIngestionEvent(message: any) {
        //console.log("Message d'ingestion reçu");

        const query = `
            INSERT INTO capteur_data.ingestion_data
            (id, origin, timestamp, uv, temperature, humidite, qair)
            VALUES (uuid(), ?, ?, ?, ?, ?, ?)
        `;

        const params = [
            message.origin,
            message.timestamp,
            message.uv,
            message.temperature,
            message.humidite,
            message.qair,
        ];

        await this.cassandraService.execute(query, params);
    }
}
