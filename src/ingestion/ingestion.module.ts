import { Module } from '@nestjs/common';
import { IngestionService } from './ingestion.service';
import { IngestionController } from './ingestion.controller';
import { SensorClientModule } from 'src/sensor-client/sensor-client.module';
import { IngestionGuard } from './ingestion.guard';
import { KafkaModule } from 'src/kafka/kafka.module';

@Module({
  imports: [
    SensorClientModule,
    KafkaModule
  ],
  providers: [IngestionService, IngestionGuard],
  controllers: [IngestionController]
})
export class IngestionModule {}
