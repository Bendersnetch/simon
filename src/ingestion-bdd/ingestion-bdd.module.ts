import { Module } from '@nestjs/common';
import { IngestionBddService } from './ingestion-bdd.service';
import { CassandraService } from 'src/cassandra/cassandra.service';

@Module({
  providers: [IngestionBddService, CassandraService]
})
export class IngestionBddModule {}
