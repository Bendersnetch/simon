import { Module } from '@nestjs/common';
import { SensorClientService } from './sensor-client.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [SensorClientService],
  exports: [SensorClientService]
})
export class SensorClientModule {}
