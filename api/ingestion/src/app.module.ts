import { Module } from '@nestjs/common';
import { IngestionModule } from './ingestion/ingestion.module';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [
    IngestionModule,
    RedisModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
