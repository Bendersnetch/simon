import { Module } from '@nestjs/common';
import { IngestionService } from './ingestion.service';
import { IngestionController } from './ingestion.controller';
import { SensorClientModule } from 'src/sensor-client/sensor-client.module';
import { IngestionGuard } from './ingestion.guard';
import { RedisModule } from 'src/redis/redis.module';

@Module({
  imports: [
    SensorClientModule,
    RedisModule
  ],
  providers: [IngestionService, IngestionGuard],
  controllers: [IngestionController]
})
export class IngestionModule {}
