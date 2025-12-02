import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SensorController } from './sensor.controller';
import { SensorService } from './sensor.service';
import { Sensor } from './sensor.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Sensor])],
  controllers: [SensorController],
  providers: [SensorService]
})
export class SensorModule {}
