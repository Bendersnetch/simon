import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-ioredis-yet';

@Module({
  imports: [
    CacheModule.registerAsync({
      useFactory: async () => ({
        store: await redisStore({
          socket: { host: 'localhost', port: 6379 },
        }),
      }),
      isGlobal: true,
    }),
  ],
})
export class RedisModule {}
