import { Module } from '@nestjs/common';
import { IngestionService } from './ingestion.service';
import { IngestionController } from './ingestion.controller';
import { CassandraModule } from 'src/cassandra/cassandra.module';
import { SensorClientModule } from 'src/sensor-client/sensor-client.module';
import { IngestionGuard } from './ingestion.guard';

@Module({
  imports: [CassandraModule, SensorClientModule],
  providers: [IngestionService, IngestionGuard],
  controllers: [IngestionController]
})
export class IngestionModule {}
