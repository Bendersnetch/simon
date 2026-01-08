import { Module } from '@nestjs/common';
import { SensorGatewayController } from './sensor-gateway.controller';
import { SensorGatewayService } from './sensor-gateway.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [SensorGatewayController],
  providers: [SensorGatewayService]
})
export class SensorGatewayModule {}
