import { Module } from '@nestjs/common';
import { SensorDataGatewayController } from './sensor-data-gateway.controller';
import { SensorDataGatewayService } from './sensor-data-gateway.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [SensorDataGatewayController],
  providers: [SensorDataGatewayService]
})
export class SensorDataGatewayModule {}
