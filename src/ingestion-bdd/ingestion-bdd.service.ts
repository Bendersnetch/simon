import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CassandraService } from 'src/cassandra/cassandra.service';
import { Ingestion } from './ingestion.entity';

@Controller()
export class IngestionBddService {
    constructor(private readonly cassandraService: CassandraService) {
    }

    @MessagePattern('ping-topic')
    async testPing(@Payload() message: any) {
        if (!message.value) {
            //console.log("message ignoré");
            return; // ignore les tombstones
        }

        const raw = message.value.toString();

        try {
          const payload = JSON.parse(raw);
          //console.log('Message ping reçu (MessagePattern):', payload);
        } catch (err) {
          //console.warn('Message non-JSON reçu, ignoré (MessagePattern):', raw);
        }
    }

    @MessagePattern('ingestion-topic')
    async addSensorData(@Payload() message: Ingestion) {
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
