import { Module } from '@nestjs/common';
import { IngestionBddService } from './ingestion-bdd.service';
import { StreamConsumerService } from './stream-consumer.service';
import { CassandraService } from 'src/cassandra/cassandra.service';

@Module({
  providers: [CassandraService, IngestionBddService, StreamConsumerService],
  controllers: []
})
export class IngestionBddModule {}
