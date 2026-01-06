import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';
import { createClient } from 'redis';

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
})
export class RedisModule {}
