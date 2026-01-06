import { Module } from '@nestjs/common';
import { SensorDataController } from './sensor-data.controller';
import { SensorDataService } from './sensor-data.service';
import { CassandraService } from 'src/cassandra/cassandra.service';

@Module({
  controllers: [SensorDataController],
  providers: [SensorDataService, CassandraService]
})
export class SensorDataModule {}
