import { Module } from '@nestjs/common';
import { IngestionModule } from './ingestion/ingestion.module';
import { RedisModule } from './redis/redis.module';
import { SensorClientModule } from './sensor-client/sensor-client.module';

@Module({
  imports: [IngestionModule, RedisModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
