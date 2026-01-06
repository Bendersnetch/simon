import { Controller } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { CassandraService } from 'src/cassandra/cassandra.service';
import { Ingestion } from './ingestion.entity';

@Controller()
export class IngestionBddService {
    constructor(private readonly cassandraService: CassandraService) {
        console.log("bdd fait");
    }

    @MessagePattern('ping-topic')
    async testPing(@Payload() message: any) {
        const payload = JSON.parse(message.value.toString());
        console.log('Message ping reçu :', payload);
    }

    @MessagePattern('ingestion-topic')
    async addSensorData(@Payload() message: Ingestion) {
        console.log("Message d'ingestion reçu");

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
