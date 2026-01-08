import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import { IngestionBddService } from './ingestion-bdd.service';

const STREAM_NAME = 'ingestion-stream';
const GROUP_NAME = 'ingestion-group';

@Injectable()
export class StreamConsumerService implements OnModuleInit, OnModuleDestroy {
  private readonly redisClient: Redis;
  private readonly logger = new Logger(StreamConsumerService.name);
  private readonly consumerName: string = `consumer-${process.pid}`;
  private isAlive = true;

  constructor(private readonly ingestionBddService: IngestionBddService) {
    this.redisClient = new Redis({ host: process.env.REDIS_HOST || 'redis' });
  }

  async onModuleInit() {
    this.logger.log('Initializing Redis Stream consumer...');
    try {
      await this.redisClient.xgroup('CREATE', STREAM_NAME, GROUP_NAME, '0', 'MKSTREAM');
      this.logger.log(`Consumer group '${GROUP_NAME}' created for stream '${STREAM_NAME}'.`);
    } catch (error) {
      if (error.message.includes('BUSYGROUP')) {
        this.logger.warn(`Consumer group '${GROUP_NAME}' already exists.`);
      } else {
        // En production, il faudrait gérer le cas où le stream n'existe pas encore.
        // Pour l'instant, on suppose qu'il sera créé par le producteur.
        this.logger.error('Could not create consumer group', error);
      }
    }
    this.consume();
  }

  onModuleDestroy() {
    this.isAlive = false;
    this.redisClient.disconnect();
  }

  private async consume() {
    while (this.isAlive) {
      try {
        const result: any = await this.redisClient.xreadgroup(
          'GROUP',
          GROUP_NAME,
          this.consumerName,
          'COUNT',
          '1',
          'BLOCK',
          '5000',
          'STREAMS',
          STREAM_NAME,
          '>',
        );

        if (result && result.length > 0) {
          const [streamName, messages] = result[0];

          if (messages && messages.length > 0) {
            const [messageId, data] = messages[0];

            // Convertir les données Redis ['key1', 'val1'] en objet { key1: 'val1' }
            const messageObject: any = {};
            for (let i = 0; i < data.length; i += 2) {
              const key = data[i];
              const value = data[i + 1];
              // Tenter de parser le JSON pour les tableaux/objets
              try {
                messageObject[key] = JSON.parse(value);
              } catch {
                // Si ce n'est pas du JSON, garder la valeur telle quelle
                messageObject[key] = value;
              }
            }

            try {
              await this.ingestionBddService.processIngestionEvent(messageObject);
              await this.redisClient.xack(STREAM_NAME, GROUP_NAME, messageId);
            } catch (err) {
              this.logger.error(`Error processing message ${messageId}:`, err);
              // Ici, il faudrait une stratégie pour les messages échoués (dead-letter queue)
            }
          }
        }
      } catch (err) {
        if (this.isAlive) {
          this.logger.error('Error in consume loop:', err);
          // Attendre un peu avant de réessayer en cas d'erreur
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }
  }
}
