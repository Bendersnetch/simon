import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';
import { createClient } from 'redis';
import { RedisProducerService } from './redis.service';

@Module({
  imports: [
    CacheModule.registerAsync({
      useFactory: async () => {
        const client = createClient({ url: 'redis://redis:6379' });
        await client.connect();

        return {
          store: redisStore,
          host: 'redis',
          port: 6379,
          client,
        };
      },
      isGlobal: true,
    }),
  ],
  providers: [RedisProducerService],
  exports: [RedisProducerService],
})
export class RedisModule {}
