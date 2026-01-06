import { Module } from '@nestjs/common';
import { IngestionBddService } from './ingestion-bdd.service';
import { CassandraService } from 'src/cassandra/cassandra.service';

@Module({
  providers: [CassandraService],
  controllers: [IngestionBddService]
})
export class IngestionBddModule {}
