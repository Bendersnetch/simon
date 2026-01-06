import { Module } from '@nestjs/common';
import { IngestionBddService } from './ingestion-bdd.service';
import { CassandraService } from 'src/cassandra/cassandra.service';
import { KafkaConsumerService } from './kafka-consumer.service';

@Module({
  providers: [/*KafkaConsumerService, */CassandraService],
  controllers: [IngestionBddService]
})
export class IngestionBddModule {}
