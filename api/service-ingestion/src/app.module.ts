import { Module } from '@nestjs/common';
import { IngestionBddModule } from './ingestion-bdd/ingestion-bdd.module';

@Module({
  imports: [IngestionBddModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
