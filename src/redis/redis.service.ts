// Dans src/redis/redis.service.ts
import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisProducerService implements OnModuleDestroy {
  private readonly redisClient: Redis;

  constructor() {
    // Initialise la connexion. Utilise des variables d'environnement pour la flexibilité.
    this.redisClient = new Redis({
      host: process.env.REDIS_HOST || 'redis',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
    });
    console.log('Redis client for producer connected.');
  }

  onModuleDestroy() {
    this.redisClient.quit();
  }

  // Méthode pour ajouter un message à un stream
  async addToStream(streamName: string, data: object) {
    // Sérialiser les valeurs qui sont des tableaux ou objets en JSON
    const serializedData: Record<string, string> = {};
    for (const [key, value] of Object.entries(data)) {
      serializedData[key] = typeof value === 'object' ? JSON.stringify(value) : String(value);
    }
    const message: string[] = Object.entries(serializedData).flat();
    await this.redisClient.xadd(streamName, '*', ...message);
  }
}
