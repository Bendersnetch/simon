import { Module } from '@nestjs/common';
import { SensorGatewayController } from './sensor-gateway.controller';
import { SensorGatewayService } from './sensor-gateway.service';

@Module({
  controllers: [SensorGatewayController],
  providers: [SensorGatewayService]
})
export class SensorGatewayModule {}
