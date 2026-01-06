import { Module } from '@nestjs/common';
import { SensorDataModule } from './sensor-data/sensor-data.module';

@Module({
  imports: [SensorDataModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
